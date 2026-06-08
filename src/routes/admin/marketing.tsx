import { createFileRoute } from '@tanstack/react-router';
import { adminSupabase } from '@/lib/supabase';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Tag, Mail, Plus, Trash2, Check, Copy } from 'lucide-react';

export const Route = createFileRoute('/admin/marketing')({
  component: Marketing,
});

function Marketing() {
  const [activeTab, setActiveTab] = useState<'promos' | 'campaigns'>('promos');
  const [userId, setUserId] = useState<string | null>(null);

  // Data
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Dialogs
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);

  // Promo Form
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [promoScope, setPromoScope] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Campaign Form
  const [campaignSubject, setCampaignSubject] = useState('');
  const [recipientType, setRecipientType] = useState('all_customers');
  const [campaignContent, setCampaignContent] = useState('');

  // Loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    adminSupabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [promosRes, campaignsRes, productsRes] = await Promise.all([
        adminSupabase.from('promo_codes').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
        adminSupabase.from('email_campaigns').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
        adminSupabase.from('products').select('id, title').eq('creator_id', userId)
      ]);
      setPromoCodes(promosRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setPromoCode(code);
  };

  const handleCreatePromo = async () => {
    if (!promoCode || !discountValue) return toast.error('Remplissez les champs obligatoires');
    if (promoScope === 'specific' && selectedProducts.length === 0) return toast.error('Sélectionnez au moins un produit');

    setSaving(true);
    try {
      const { data, error } = await adminSupabase.from('promo_codes').insert({
        code: promoCode,
        discount_percent: discountType === 'percent' ? parseFloat(discountValue) : null,
        discount_amount: discountType === 'amount' ? parseFloat(discountValue) : null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        product_ids: promoScope === 'specific' ? selectedProducts : null,
        creator_id: userId,
        is_active: true
      }).select().single();

      if (error) throw error;
      setPromoCodes([data, ...promoCodes]);
      setShowPromoDialog(false);
      toast.success('Code promo créé !');
      
      // Reset
      setPromoCode('');
      setDiscountValue('');
      setMaxUses('');
      setExpiresAt('');
      setPromoScope('all');
      setSelectedProducts([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePromo = async (id: string, active: boolean) => {
    const { error } = await adminSupabase.from('promo_codes').update({ is_active: active }).eq('id', id);
    if (!error) {
      setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, is_active: active } : p));
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Supprimer ce code ?')) return;
    const { error } = await adminSupabase.from('promo_codes').delete().eq('id', id);
    if (!error) {
      setPromoCodes(promoCodes.filter(p => p.id !== id));
      toast.success('Code supprimé');
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignSubject || !campaignContent) return toast.error('Remplissez le sujet et le contenu');
    
    setSaving(true);
    try {
      const { data, error } = await adminSupabase.from('email_campaigns').insert({
        subject: campaignSubject,
        content: campaignContent,
        recipient_type: recipientType,
        status: 'draft',
        creator_id: userId
      }).select().single();

      if (error) throw error;
      setCampaigns([data, ...campaigns]);
      setShowCampaignDialog(false);
      toast.success('Brouillon enregistré');
      
      setCampaignSubject('');
      setCampaignContent('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    const { error } = await adminSupabase.from('email_campaigns').delete().eq('id', id);
    if (!error) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success('Campagne supprimée');
    }
  };

  const sendCampaign = async (id: string) => {
    toast.info('L\'envoi de campagnes nécessite la configuration du backend (Edge Function).', {
        description: 'Mock d\'envoi effectué.'
    });
    // Update local state temporarily to show it works visually
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'sent', sent_count: 5 } : c));
  };


  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-slate-900">Marketing</h1>
          <p className="text-slate-500 mt-1">Boostez vos ventes avec des codes promo et des campagnes email.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
              activeTab === 'promos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" /> Codes promo
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
              activeTab === 'campaigns' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" /> Campagnes email
          </button>
        </div>

        {/* PROMOS TAB */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-slate-900">Vos codes promo</h2>
              <button
                onClick={() => setShowPromoDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-[14px] font-semibold rounded-xl hover:bg-amber-600"
              >
                <Plus className="w-4 h-4" /> Nouveau code
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Chargement...</div>
            ) : promoCodes.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
                <Tag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-[15px] font-semibold text-slate-900">Aucun code promo</p>
                <p className="text-[14px] text-slate-500 mt-1">Créez votre premier code pour booster vos ventes.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Remise</th>
                      <th className="px-6 py-4">Utilisations</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promoCodes.map(promo => (
                      <tr key={promo.id}>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              setCopiedId(promo.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-lg transition-colors"
                          >
                            {promo.code}
                            {copiedId === promo.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {promo.discount_percent ? `-${promo.discount_percent}%` : `-${promo.discount_amount} FCFA`}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {promo.current_uses || 0} / {promo.max_uses || '∞'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePromo(promo.id, !promo.is_active)}
                            className={`px-3 py-1 text-[12px] font-semibold rounded-full ${
                              promo.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {promo.is_active ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deletePromo(promo.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-slate-900">Vos campagnes email</h2>
              <button
                onClick={() => setShowCampaignDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0F172A]"
              >
                <Plus className="w-4 h-4" /> Nouvelle campagne
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Chargement...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
                <Mail className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-[15px] font-semibold text-slate-900">Aucune campagne</p>
                <p className="text-[14px] text-slate-500 mt-1">Communiquez avec vos clients par email.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{campaign.subject}</h3>
                      <p className="text-[13px] text-slate-500 mt-1">
                        Destinataires : {campaign.recipient_type === 'all_customers' ? 'Tous les clients' : 'Acheteurs récents'}
                        {' • '}
                        <span className={campaign.status === 'sent' ? 'text-green-600' : 'text-amber-500'}>
                          {campaign.status === 'sent' ? `Envoyée à ${campaign.sent_count} personnes` : 'Brouillon'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => sendCampaign(campaign.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-[13px] rounded-lg hover:bg-blue-100"
                        >
                          Envoyer
                        </button>
                      )}
                      <button onClick={() => deleteCampaign(campaign.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL PROMO */}
      {showPromoDialog && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold">Nouveau code promo</h2>
              <button onClick={() => setShowPromoDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Code</label>
                <div className="flex gap-2">
                  <input value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} className="flex-1 h-10 px-3 border border-slate-200 rounded-lg" placeholder="EX: SUMMER24" />
                  <button onClick={generateCode} className="px-3 border border-slate-200 rounded-lg text-[13px] font-medium hover:bg-slate-50">Générer</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Type</label>
                  <select value={discountType} onChange={e=>setDiscountType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg">
                    <option value="percent">Pourcentage (%)</option>
                    <option value="amount">Montant fixe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Valeur</label>
                  <input type="number" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Utilisations max (optionnel)</label>
                  <input type="number" value={maxUses} onChange={e=>setMaxUses(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg" placeholder="Illimité" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Expiration (optionnel)</label>
                  <input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Appliquer à</label>
                <select value={promoScope} onChange={e=>setPromoScope(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg">
                  <option value="all">Tous les produits</option>
                  <option value="specific">Produits spécifiques</option>
                </select>
              </div>

              {promoScope === 'specific' && (
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-[13px]">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProducts([...selectedProducts, p.id]);
                          else setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                        }}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreatePromo}
              disabled={saving}
              className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer le code'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CAMPAIGN */}
      {showCampaignDialog && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold">Nouvelle campagne email</h2>
              <button onClick={() => setShowCampaignDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Objet de l'email</label>
                <input value={campaignSubject} onChange={e=>setCampaignSubject(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg" placeholder="Nouveauté : ..." />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Destinataires</label>
                <select value={recipientType} onChange={e=>setRecipientType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg">
                  <option value="all_customers">Tous mes clients</option>
                  <option value="recent_buyers">Acheteurs récents (30 jours)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Contenu de l'email</label>
                <RichTextEditor value={campaignContent} onChange={setCampaignContent} label="" withAI={false} />
              </div>
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={saving}
              className="w-full py-2.5 bg-[#1E293B] text-white font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le brouillon'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
