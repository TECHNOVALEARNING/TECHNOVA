import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CONFIRM_WORD = "SUPPRIMER";

const translations = {
  fr: {
    title: "Fermer mon compte vendeur",
    desc: "Vous ne souhaitez plus vendre sur TECHNOVA ? Vous pouvez fermer votre compte vendeur à tout moment.",
    button: "Fermer mon compte vendeur",
    dialogTitle: "Fermer définitivement votre compte vendeur ?",
    consequences: [
      "Tous vos produits sont retirés de la vente et votre boutique est fermée.",
      "Vous n'aurez plus accès au tableau de bord vendeur.",
      "Vos clients gardent l'accès aux produits qu'ils ont déjà achetés.",
      "Retirez d'abord votre solde : la fermeture est refusée s'il reste de l'argent à retirer.",
    ],
    typeToConfirm: `Pour confirmer, tapez ${CONFIRM_WORD} :`,
    cancel: "Annuler",
    confirm: "Fermer mon compte",
    success: "Votre compte vendeur est fermé.",
    genericError: "La fermeture du compte a échoué. Réessayez ou contactez l'administrateur.",
  },
  en: {
    title: "Close my seller account",
    desc: "No longer want to sell on TECHNOVA? You can close your seller account at any time.",
    button: "Close my seller account",
    dialogTitle: "Permanently close your seller account?",
    consequences: [
      "All your products are taken off sale and your store is closed.",
      "You will no longer have access to the seller dashboard.",
      "Your customers keep access to the products they already bought.",
      "Withdraw your balance first: closing is refused while money remains to be withdrawn.",
    ],
    typeToConfirm: `To confirm, type ${CONFIRM_WORD}:`,
    cancel: "Cancel",
    confirm: "Close my account",
    success: "Your seller account is closed.",
    genericError: "Closing the account failed. Try again or contact the administrator.",
  },
};

/** Carte « zone sensible » du compte vendeur : fermeture du compte par le vendeur lui-même. */
const CloseSellerAccountCard = ({ lang }: { lang: string }) => {
  const t = translations[lang === "en" ? "en" : "fr"];
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_WORD && !closing;

  const handleClose = async () => {
    if (!canConfirm) return;
    setClosing(true);
    setError("");
    const { data, error: fnError } = await supabase.functions.invoke("close-seller-account", {
      body: { confirm: confirmText.trim() },
    });

    if (fnError || !data?.success) {
      let message = data?.error;
      try {
        const ctx = (fnError as { context?: Response } | null)?.context;
        message = message || (await ctx?.json())?.error;
      } catch {
        /* réponse non JSON */
      }
      setError(message || t.genericError);
      setClosing(false);
      return;
    }

    toast.success(t.success);
    setOpen(false);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="rounded-xl border border-destructive/30 bg-card p-6 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground text-left">{t.desc}</p>
      <Button
        variant="outline"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          setConfirmText("");
          setError("");
          setOpen(true);
        }}
      >
        {t.button}
      </Button>

      <AlertDialog open={open} onOpenChange={(o) => !closing && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="list-disc space-y-1.5 pl-4 text-left text-sm">
                {t.consequences.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label htmlFor="close-seller-confirm" className="text-sm font-medium text-foreground">
              {t.typeToConfirm}
            </label>
            <Input
              id="close-seller-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              disabled={closing}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>{t.cancel}</AlertDialogCancel>
            <Button variant="destructive" onClick={handleClose} disabled={!canConfirm}>
              {closing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CloseSellerAccountCard;
