import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
  ExternalLink,
  ScanFace,
  RefreshCw,
} from "lucide-react";

interface Verification {
  id: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  full_name: string | null;
  country: string | null;
  city: string | null;
  didit_session_id: string | null;
  didit_session_url: string | null;
}

const translations = {
  fr: {
    statusPending: "En cours de vérification",
    statusApproved: "Identité vérifiée",
    statusRejected: "Vérification refusée",
    account: "Compte",
    email: "Email : ",
    signOut: "Se déconnecter",
    kycTitle: "Vérification d'identité (KYC)",
    kycDesc:
      "La vérification est requise pour effectuer des retraits. Elle est traitée automatiquement par notre partenaire sécurisé Didit (pièce d'identité + selfie + détection de vie).",
    pendingDesc:
      "Vos documents sont en cours d'examen ou vous n'avez pas finalisé la vérification. Vous pouvez en redémarrer une nouvelle ci-dessous si nécessaire.",
    refreshStatus: "Rafraîchir le statut",
    identityConfirmed: "Identité confirmée : ",
    rejectionReason: "Motif : ",
    submittedOn: "Soumis le ",
    step1: "Préparez une pièce d'identité valide (CNI, passeport, permis)",
    step2: "Activez la caméra de votre appareil pour le selfie",
    step3: "La vérification prend moins de 2 minutes",
    btnRestart: "Recommencer la vérification",
    btnStart: "Démarrer la vérification",
    redirectNote:
      "Vous serez redirigé vers la plateforme sécurisée Didit, puis ramené sur votre tableau de bord.",
    toastChecking: "Vérification du statut auprès de Didit...",
    toastSuccessUpdate: "Mise à jour : Vérification approuvée !",
    toastErrorUpdate: "Mise à jour : Vérification refusée.",
    toastPendingUpdate: "Didit indique : En cours de traitement.",
    toastStatusChecked: "Statut vérifié avec succès.",
    toastApprovedRealtime: "✓ Identité vérifiée avec succès !",
    toastRejectedRealtime: "Vérification refusée par Didit.",
    toastCallbackApproved: "Vérification approuvée ! Mise à jour en cours…",
    toastCallbackRejected: "Vérification refusée par Didit.",
    toastCallbackPending: "Vérification reçue, traitement en cours…",
  },
  en: {
    statusPending: "Verification in progress",
    statusApproved: "Identity verified",
    statusRejected: "Verification rejected",
    account: "Account",
    email: "Email: ",
    signOut: "Sign out",
    kycTitle: "Identity Verification (KYC)",
    kycDesc:
      "Verification is required to make withdrawals. It is processed automatically by our secure partner Didit (ID document + selfie + liveness detection).",
    pendingDesc:
      "Your documents are under review or you have not finalized the verification. You can restart a new one below if necessary.",
    refreshStatus: "Refresh status",
    identityConfirmed: "Confirmed identity: ",
    rejectionReason: "Reason: ",
    submittedOn: "Submitted on ",
    step1: "Prepare a valid identity document (ID card, passport, driving license)",
    step2: "Activate your device camera for the selfie",
    step3: "Verification takes less than 2 minutes",
    btnRestart: "Restart verification",
    btnStart: "Start verification",
    redirectNote:
      "You will be redirected to the secure Didit platform, then returned to your dashboard.",
    toastChecking: "Checking status with Didit...",
    toastSuccessUpdate: "Update: Verification approved!",
    toastErrorUpdate: "Update: Verification rejected.",
    toastPendingUpdate: "Didit states: Under review.",
    toastStatusChecked: "Status successfully checked.",
    toastApprovedRealtime: "✓ Identity verified successfully!",
    toastRejectedRealtime: "Verification rejected by Didit.",
    toastCallbackApproved: "Verification approved! Updating...",
    toastCallbackRejected: "Verification rejected by Didit.",
    toastCallbackPending: "Verification received, processing...",
  },
};

const ADMIN_EMAIL = "ancres707@gmail.com";

const DashboardAccountTab = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [starting, setStarting] = useState(false);

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending: {
      label: t.statusPending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    approved: {
      label: t.statusApproved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
    },
    rejected: {
      label: t.statusRejected,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/5 border-destructive/20",
    },
  };

  useEffect(() => {
    if (user) loadVerification();
  }, [user]);

  // Fetch and check status manually
  const handleCheckStatus = async () => {
    try {
      const sessionIdFromUrl = searchParams.get("verificationSessionId");
      toast.info(t.toastChecking);

      const { data, error } = await supabase.functions.invoke("didit-check-status", {
        body: sessionIdFromUrl ? { sessionId: sessionIdFromUrl } : {},
      });

      if (error) {
        toast.error("Error: " + error.message);
        console.error(error);
        return;
      }

      if (data?.error) {
        toast.error("Error: " + data.error);
        console.error(data.error);
        return;
      }

      if (data?.newStatus === "approved") {
        toast.success(t.toastSuccessUpdate);
      } else if (data?.newStatus === "rejected") {
        toast.error(t.toastErrorUpdate);
      } else if (data?.newStatus === "pending") {
        toast.info(t.toastPendingUpdate);
      } else {
        toast.success(t.toastStatusChecked);
      }

      await loadVerification();
    } catch (err: any) {
      toast.error("Error: " + (err.message || "Impossible de joindre le serveur"));
      console.error(err);
    }
  };

  // Realtime: update KYC status instantly when Didit webhook updates the row
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`identity_verifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "identity_verifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as Verification | null;
          if (row) {
            setVerification(row);
            if ((payload.new as any)?.status === "approved") {
              toast.success(t.toastApprovedRealtime);
            } else if ((payload.new as any)?.status === "rejected") {
              toast.error(t.toastRejectedRealtime);
            }
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t]);

  // After Didit redirect callback, refresh verification (webhook may take a few seconds)
  useEffect(() => {
    if (!user) return;
    if (searchParams.get("kyc") === "callback") {
      const status = searchParams.get("status");
      if (status === "Approved") {
        toast.success(t.toastCallbackApproved);
      } else if (status === "Declined") {
        toast.error(t.toastCallbackRejected);
      } else {
        toast.info(t.toastCallbackPending);
      }

      // Force checking the status immediately
      handleCheckStatus();

      const interval = setInterval(handleCheckStatus, 5000);
      const timeout = setTimeout(() => clearInterval(interval), 60000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [searchParams, user, t]);

  const loadVerification = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("identity_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setVerification(data as Verification | null);
    setLoadingKyc(false);
  };

  const handleStartDidit = async () => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("didit-create-session", { body: {} });
      if (error) throw error;
      if (!data?.url) throw new Error("Verification URL is missing");
      // Redirect user to Didit hosted flow
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to start verification");
      setStarting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const st = verification ? statusConfig[verification.status] : null;
  const StatusIcon = st?.icon;
  const canRestart =
    !verification || verification.status === "rejected" || verification.status === "pending";

  return (
    <div className="max-w-2xl space-y-8">
      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t.account}</h3>
        <p className="text-sm text-muted-foreground">
          {t.email}
          {user?.email}
        </p>
        <Button variant="destructive" onClick={handleSignOut}>
          {t.signOut}
        </Button>
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t.kycTitle}</h3>
          </div>
          <p className="text-sm text-muted-foreground text-left">{t.kycDesc}</p>

          {loadingKyc ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {verification && st && (
                <div className={`rounded-lg border p-4 ${st.bg}`}>
                  <div className="flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`h-5 w-5 ${st.color}`} />}
                    <span className={`text-sm font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  {verification.status === "pending" && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2 text-left">
                        {t.pendingDesc}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCheckStatus}
                        className="h-8 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        {t.refreshStatus}
                      </Button>
                    </div>
                  )}
                  {verification.status === "approved" && verification.full_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t.identityConfirmed}
                      {verification.full_name}
                      {verification.country ? ` — ${verification.country}` : ""}
                    </p>
                  )}
                  {verification.status === "rejected" && verification.rejection_reason && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {t.rejectionReason}
                        {verification.rejection_reason}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 text-left">
                    {t.submittedOn}
                    {new Date(verification.submitted_at).toLocaleDateString(
                      lang === "en" ? "en-US" : "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              )}

              {canRestart && (
                <div className="space-y-3">
                  <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc text-left">
                    <li>{t.step1}</li>
                    <li>{t.step2}</li>
                    <li>{t.step3}</li>
                  </ul>
                  <Button onClick={handleStartDidit} disabled={starting} className="w-full gap-2">
                    {starting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ScanFace className="h-4 w-4" />
                    )}
                    {verification?.status === "rejected" ? t.btnRestart : t.btnStart}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">{t.redirectNote}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAccountTab;
