import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Loader2, CheckCircle2, User, Store, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ContactTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  sellerName?: string;
  sellerId?: string;
  storeSlug?: string;
}

export function ContactTrainerModal({
  isOpen,
  onClose,
  courseTitle,
  sellerName = "l'Instructeur",
  sellerId,
  storeSlug,
}: ContactTrainerModalProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState(`Question : ${courseTitle}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Veuillez saisir votre question ou message.");
      return;
    }

    setSending(true);
    try {
      const studentEmail = user?.email || localStorage.getItem("technova_buyer_email") || "eleve@technova.com";
      const studentName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Élève Technova";
      const studentUserId = user?.id || `buyer_${Date.now()}`;

      // 1. Create support conversation
      const { data: convData, error: convError } = await supabase
        .from("support_conversations")
        .insert({
          user_id: studentUserId,
          user_name: studentName,
          user_email: studentEmail,
          subject: subject.trim(),
          status: "open",
        })
        .select()
        .single();

      if (convError || !convData) {
        throw new Error(convError?.message || "Impossible de créer la discussion");
      }

      // 2. Add first message
      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: convData.id,
          sender_type: "user",
          sender_id: studentUserId,
          content: message.trim(),
        });

      if (msgError) {
        console.warn("Message storage notice:", msgError.message);
      }

      // 3. Invoke support notification function if available
      try {
        const authHeader = (await supabase.auth.getSession()).data.session?.access_token;
        if (authHeader) {
          await supabase.functions.invoke("notify-support-ticket", {
            body: {
              action: "new_ticket",
              userId: studentUserId,
              userName: studentName,
              userEmail: studentEmail,
              subject: `[Formation: ${courseTitle}] ${subject.trim()}`,
              transcript: message.trim(),
              sellerId: sellerId || null,
            },
          });
        }
      } catch (err) {
        console.log("Notification edge function notice:", err);
      }

      setSentSuccess(true);
      toast.success(`Votre question a bien été transmise à ${sellerName} !`);
    } catch (err: any) {
      console.error("Error sending message to trainer:", err);
      toast.error("Erreur lors de l'envoi de votre question. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSentSuccess(false);
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {sentSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Question envoyée !</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Votre message concernant <strong>« {courseTitle} »</strong> a été transmis directement à <strong>{sellerName}</strong>. Vous recevrez une notification par e-mail dès qu'une réponse sera apportée.
              </p>
              <Button
                onClick={handleClose}
                className="rounded-xl px-6 text-xs font-bold"
              >
                Compris, fermer
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Contacter le Formateur</h3>
                  <p className="text-xs text-muted-foreground">
                    Posez votre question directement à <span className="font-semibold text-foreground">{sellerName}</span>
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Sujet de votre demande
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Votre message ou question
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bonjour, j'ai une question sur cette leçon ou ce projet..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Le formateur vous répondra par email et directement sur votre compte.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl text-xs font-bold gap-1.5"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Envoyer au formateur</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
