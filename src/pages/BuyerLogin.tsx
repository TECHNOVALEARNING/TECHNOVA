import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { buyerSupabase as supabase } from "@/integrations/supabase/buyer-client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";

const BuyerLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();
  const isPortal =
    window.location.hostname.startsWith("portal.") ||
    window.location.hostname.startsWith("client.");
  const dashboardPath = isPortal ? "/dashboard" : "/mes-achats";

  useEffect(() => {
    // Check if user is already logged in or if Supabase just parsed a token
    const checkSession = async (session: any) => {
      if (!session) return;
      try {
        setLoading(true);
        let customerName =
          session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Client";
        let customerEmail = session.user?.email || "";
        let customerId = session.user?.id || "";
        let orders = [];

        const { data, error } = await supabase.functions.invoke("buyer-oauth-check");
        if (!error && !data?.error && data?.customer) {
          customerName = data.customer.name || customerName;
          customerEmail = data.customer.email || customerEmail;
          customerId = data.customer.id || customerId;
          orders = data.orders || [];
        }

        sessionStorage.setItem(
          "buyer_session",
          JSON.stringify({
            email: customerEmail,
            customerName: customerName,
            customerId: customerId,
            orders: orders,
            authenticatedAt: Date.now(),
          }),
        );

        navigate(dashboardPath, { replace: true });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !sessionStorage.getItem("buyer_session")) {
        checkSession(session);
      } else if (session && sessionStorage.getItem("buyer_session")) {
        navigate(dashboardPath, { replace: true });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
      sessionStorage.setItem(
        "buyer_session",
        JSON.stringify({
          email: email.trim().toLowerCase(),
          customerName: data.customer?.name || customerName,
          customerId: data.customer?.id,
          orders: data.orders || [],
          authenticatedAt: Date.now(),
        }),
      );
      toast.success("Connexion réussie !");
      navigate(dashboardPath, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEOHead
        title="Accès à mes Achats de Produits & Formations — TECHNOVA"
        description="Espace de connexion client sécurisé. Connectez-vous pour accéder à vos formations, télécharger vos fichiers numériques et retrouver toutes vos commandes sur la plateforme TECHNOVA."
        keywords="connexion espace client, mes achats, télécharger produit numérique, accès formations en ligne, commandes technova"
      />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <a
            href={isPortal ? "https://technovalearning.com" : "/"}
            className="flex items-center gap-2.5 mb-12"
          >
            <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-foreground">TECHNOVA</span>
          </a>

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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Connectez-vous pour accéder à vos fichiers, formations et licences.
              </p>

              <Button
                type="button"
                variant="outline"
                className="w-full py-5 bg-background text-sm font-semibold"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const redirectUrl = `${window.location.origin}/buyer-auth/callback`;

                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: redirectUrl,
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
                <svg
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou avec votre email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
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
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi...
                    </>
                  ) : (
                    "Recevoir un code par email"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Un code à 6 chiffres a été envoyé à{" "}
                <strong className="text-foreground">{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Code de vérification
                </label>
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
              <Button
                className="w-full py-5 text-sm font-semibold"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Vérification...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> Changer d'email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtp("");
                    handleSendOtp(new Event("submit") as any);
                  }}
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
            Accédez à vos fichiers, formations et licences achetés sur n'importe quelle boutique
            TECHNOVA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;
