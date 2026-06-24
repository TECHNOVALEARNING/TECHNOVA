import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const translations = {
  fr: {
    seoTitle: "Mot de passe oublié",
    seoDesc: "Réinitialisez votre mot de passe TECHNOVA.",
    heading: "Mot de passe oublié",
    subtitle: "Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    emailLabel: "Email",
    sendBtn: "Envoyer le lien de réinitialisation",
    sending: "Envoi en cours...",
    checkMail: "Vérifiez votre boîte mail",
    sentDesc: "Un e-mail contenant un lien de réinitialisation a été envoyé à ",
    spamNote: "Si vous ne le voyez pas, vérifiez vos spams.",
    backToLogin: "Retour à la connexion",
    errorMsg: "Erreur lors de l'envoi. Vérifiez votre adresse e-mail.",
    successMsg: "E-mail de réinitialisation envoyé !"
  },
  en: {
    seoTitle: "Forgot Password",
    seoDesc: "Reset your TECHNOVA password.",
    heading: "Forgot Password",
    subtitle: "Enter your email address and we will send you a link to reset your password.",
    emailLabel: "Email",
    sendBtn: "Send reset link",
    sending: "Sending...",
    checkMail: "Check your inbox",
    sentDesc: "An email containing a reset link has been sent to ",
    spamNote: "If you don't see it, check your spam folder.",
    backToLogin: "Back to login",
    errorMsg: "Error sending email. Check your email address.",
    successMsg: "Reset email sent!"
  }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error(t.errorMsg);
      return;
    }

    setSent(true);
    toast.success(t.successMsg);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/forgot-password" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground">TECHNOVA</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">{t.heading}</h1>
            <p className="text-sm text-muted-foreground mb-8">
              {t.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t.emailLabel}</label>
                <Input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <Button className="w-full py-5 text-sm font-semibold" disabled={loading}>
                {loading ? t.sending : t.sendBtn}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{t.checkMail}</h1>
            <p className="text-sm text-muted-foreground">
              {t.sentDesc}<strong className="text-foreground">{email}</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              {t.spamNote}
            </p>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.backToLogin}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
