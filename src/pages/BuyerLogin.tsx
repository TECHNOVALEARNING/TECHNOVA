import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const BuyerLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-buyer-otp", {
        body: { email: email.trim().toLowerCase() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      setCustomerName(data?.customerName || "");
      toast.success("Un code à 6 chiffres a été envoyé à votre email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-buyer-otp", {
        body: { email: email.trim().toLowerCase(), code: otp.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      // Establish a real Supabase auth session for buyer-only features
      if (data.session?.access_token && data.session?.refresh_token) {
        const { error: sessErr } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessErr) {
          console.error("setSession error:", sessErr);
        }
      }
      // Store buyer session in sessionStorage (kept for legacy paths)
      sessionStorage.setItem("buyer_session", JSON.stringify({
        email: email.trim().toLowerCase(),
        customerName: data.customer?.name || customerName,
        customerId: data.customer?.id,
        orders: data.orders || [],
        authenticatedAt: Date.now(),
      }));
      toast.success("Connexion réussie !");
      navigate("/mes-achats");
    } catch (err: any) {
      toast.error(err.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-foreground">TECHNOVA</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Mes Achats</h1>
              <p className="text-sm text-muted-foreground">Accédez à tous vos produits achetés</p>
            </div>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Entrez l'adresse email utilisée lors de vos achats pour recevoir un code de connexion.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button className="w-full py-5 text-sm font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi...</> : "Recevoir le code"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full py-5 bg-background text-sm font-semibold"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${window.location.origin}/buyer-auth/callback`,
                      },
                    });
                    if (error) throw error;
                  } catch (err: any) {
                    toast.error(err.message || "Erreur avec Google");
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continuer avec Google
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Un code à 6 chiffres a été envoyé à <strong className="text-foreground">{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Code de vérification</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>
              <Button className="w-full py-5 text-sm font-semibold" disabled={loading || otp.length !== 6}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Vérification...</> : "Se connecter"}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Changer d'email
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(""); handleSendOtp(new Event("submit") as any); }}
                  className="text-sm text-primary hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Vous êtes vendeur ?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Connexion vendeur
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-foreground relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-primary/15 blur-[80px]" />
        <div className="relative text-center px-12">
          <h2 className="text-3xl font-extrabold text-background mb-4">
            Retrouvez tous vos achats
          </h2>
          <p className="text-background/50 text-lg max-w-md">
            Accédez à vos fichiers, formations et licences achetés sur n'importe quelle boutique TECHNOVA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;
