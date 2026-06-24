import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const translations = {
  fr: {
    seoTitle: "Nouveau mot de passe",
    seoDesc: "Créez un nouveau mot de passe pour votre compte TECHNOVA.",
    loading: "Chargement...",
    heading: "Nouveau mot de passe",
    subtitle: "Créez un nouveau mot de passe pour votre compte.",
    passLabel: "Nouveau mot de passe",
    confirmLabel: "Confirmer le mot de passe",
    updateBtn: "Mettre à jour le mot de passe",
    updating: "Mise à jour...",
    successTitle: "Mot de passe mis à jour !",
    successDesc: "Redirection vers votre tableau de bord...",
    validationLength: "Le mot de passe doit contenir au moins 6 caractères.",
    validationMatch: "Les mots de passe ne correspondent pas.",
    errorUpdate: "Erreur lors de la mise à jour du mot de passe.",
    successMsg: "Mot de passe mis à jour avec succès !"
  },
  en: {
    seoTitle: "New Password",
    seoDesc: "Create a new password for your TECHNOVA account.",
    loading: "Loading...",
    heading: "New Password",
    subtitle: "Create a new password for your account.",
    passLabel: "New password",
    confirmLabel: "Confirm password",
    updateBtn: "Update password",
    updating: "Updating...",
    successTitle: "Password updated!",
    successDesc: "Redirecting to your dashboard...",
    validationLength: "Password must contain at least 6 characters.",
    validationMatch: "Passwords do not match.",
    errorUpdate: "Error updating password.",
    successMsg: "Password updated successfully!"
  }
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      toast.error(t.validationLength);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.validationMatch);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(t.errorUpdate);
      return;
    }

    setSuccess(true);
    toast.success(t.successMsg);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/reset-password" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-12">
          <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground">TECHNOVA</span>
        </div>

        {!success ? (
          <>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">{t.heading}</h1>
            <p className="text-sm text-muted-foreground mb-8">
              {t.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t.passLabel}</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t.confirmLabel}</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button className="w-full py-5 text-sm font-semibold" disabled={loading}>
                {loading ? t.updating : t.updateBtn}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{t.successTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {t.successDesc}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
