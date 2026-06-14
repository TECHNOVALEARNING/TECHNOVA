import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const user = userData.user;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let bodyPayload: any = {};
    try {
      const text = await req.clone().text();
      if (text) {
        bodyPayload = JSON.parse(text);
      }
    } catch(e) {
      // ignore
    }

    const { data: verification } = await adminClient.from('identity_verifications')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!verification) {
      return new Response(JSON.stringify({ error: 'No verification found for user' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const targetSessionId = bodyPayload.sessionId || verification.didit_session_id;

    if (!targetSessionId) {
      return new Response(JSON.stringify({ error: 'No session ID found' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Didit API to get the session details
    const apiKey = Deno.env.get('DIDIT_API_KEY')!;
    const diditRes = await fetch(`https://verification.didit.me/v3/session/${targetSessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!diditRes.ok) {
        const errText = await diditRes.text();
        console.error('Failed to fetch from Didit:', errText);
        return new Response(JSON.stringify({ error: 'Failed to fetch status from Didit: ' + errText }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const event = await diditRes.json();
    console.log("Didit API response:", JSON.stringify(event));

    const status = event.status; 
    let newStatus = verification.status;
    let rejectionReason: string | null = null;
    
    if (status === 'Approved') newStatus = 'approved';
    else if (status === 'Declined') {
      newStatus = 'rejected';
      rejectionReason = event.decision?.reason || event.reason || 'Vérification refusée par Didit';
    } else if (status === 'In Review') newStatus = 'pending';

    // Extract identity fields if available
    const idv = event.decision?.id_verification ?? event.id_verification ?? {};
    const kyc = event.decision?.kyc ?? {};
    const documentNumber: string | null = idv.document_number || kyc.document_number || null;
    const fullName: string | null = idv.full_name || kyc.full_name || null;
    const country: string | null = idv.issuing_state || idv.nationality || kyc.country || null;
    const docType: string | null = idv.document_type || kyc.document_type || null;

    // Anti-duplicate check
    if (newStatus === 'approved' && documentNumber) {
      const { data: dup } = await adminClient.from('identity_verifications')
        .select('user_id')
        .eq('document_number', documentNumber)
        .eq('status', 'approved')
        .neq('user_id', user.id)
        .maybeSingle();
      if (dup) {
        newStatus = 'rejected';
        rejectionReason = 'Ce document a déjà été utilisé pour vérifier un autre compte TECHNOVA. Une personne ne peut vérifier qu\'un seul compte.';
        console.warn('Duplicate KYC document detected', { documentNumber, attemptedUser: user.id, existingUser: dup.user_id });
      }
    }

    // Only update if status changed or it was pending
    if (newStatus !== verification.status || bodyPayload.sessionId) {
        const updateData: any = {
            status: newStatus,
            didit_decision: event,
            reviewed_at: newStatus !== 'pending' ? new Date().toISOString() : null,
            rejection_reason: rejectionReason,
        };
        if (fullName) updateData.full_name = fullName;
        if (country) updateData.country = country;
        if (docType) updateData.document_type = docType;
        if (documentNumber) updateData.document_number = documentNumber;
        if (bodyPayload.sessionId) updateData.didit_session_id = bodyPayload.sessionId;

        await adminClient.from('identity_verifications')
            .update(updateData)
            .eq('user_id', user.id);

        if (newStatus !== 'pending' && newStatus !== verification.status) {
            await adminClient.from('notifications').insert({
              user_id: user.id,
              title: newStatus === 'approved' ? '✓ Identité vérifiée' : '✗ Vérification refusée',
              message: newStatus === 'approved'
                ? 'Votre identité a été vérifiée. Vous pouvez maintenant effectuer des retraits.'
                : `Votre vérification a été refusée. ${rejectionReason || ''}`,
              type: newStatus === 'approved' ? 'success' : 'error',
            });
        }
    }

    return new Response(JSON.stringify({ 
        ok: true, 
        oldStatus: verification.status, 
        newStatus,
        diditRawStatus: status,
        diditEvent: event
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
