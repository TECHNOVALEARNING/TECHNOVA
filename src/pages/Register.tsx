import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ChevronDown, Search, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/contexts/AuthContext";
import { useGeoPricing } from "@/contexts/GeoPricingContext";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";
import { countries, Country } from "@/data/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const translations = {
  fr: {
    seoTitle: "Devenir Vendeur — Vendez vos Produits Digitaux — TECHNOVA",
    seoDesc:
      "Rejoignez TECHNOVA comme partenaire vendeur. Vendez vos produits digitaux, fixez vos prix, et touchez des clients en Europe, en Amérique et en Afrique.",
    visualHeading: "Lancez votre boutique en 5 minutes",
    visualDesc: "Fichiers, formations et licences — vendez vos produits digitaux avec TECHNOVA.",
    heading: "Créer un compte",
    subtitle: "Commencez à vendre vos produits digitaux dès aujourd'hui.",
    commissionNotice: "Une commission de 5% est appliquée sur les ventes réalisées par les vendeurs.",
    continueGoogle: "Continuer avec Google",
    googleError: "Erreur lors de l'inscription avec Google",
    orEmail: "ou par email",
    lastNameLabel: "Nom",
    firstNameLabel: "Prénom",
    emailLabel: "Email",
    phoneLabel: "Numéro de téléphone",
    searchCountry: "Rechercher un pays...",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Min. 8 caractères",
    createBtn: "Créer mon compte",
    creating: "Création...",
    alreadyAccount: "Déjà un compte ?",
    loginLink: "Se connecter",
    validationPass: "Le mot de passe doit contenir au moins 8 caractères",
    validationName: "Veuillez renseigner votre nom et prénom",
    successCreated: "Compte créé avec succès !",
    verifyEmail: "Vérifiez votre email pour confirmer votre inscription !",
  },
  en: {
    seoTitle: "Become a Seller — Sell your Digital Products — TECHNOVA",
    seoDesc:
      "Join TECHNOVA as a partner seller. Sell your digital products, set your prices, and reach customers in Europe, America, and Africa.",
    visualHeading: "Launch your store in 5 minutes",
    visualDesc: "Files, courses, and licenses — sell your digital products with TECHNOVA.",
    heading: "Create an account",
    subtitle: "Start selling your digital products today.",
    commissionNotice: "A 5% commission is applied to sales made by sellers.",
    continueGoogle: "Continue with Google",
    googleError: "Error registering with Google",
    orEmail: "or by email",
    lastNameLabel: "Last name",
    firstNameLabel: "First name",
    emailLabel: "Email",
    phoneLabel: "Phone number",
    searchCountry: "Search country...",
    passwordLabel: "Password",
    passwordPlaceholder: "Min. 8 characters",
    createBtn: "Create my account",
    creating: "Creating...",
    alreadyAccount: "Already have an account?",
    loginLink: "Log in",
    validationPass: "Password must contain at least 8 characters",
    validationName: "Please fill in your first and last name",
    successCreated: "Account created successfully!",
    verifyEmail: "Check your email to confirm your registration!",
  },
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { countryCode } = useGeoPricing();

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    if (countryCode) {
      const match = countries.find((c) => c.code.toUpperCase() === countryCode.toUpperCase());
      if (match) {
        setSelectedCountry(match);
      }
    }
  }, [countryCode]);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dial.includes(q),
    );
  }, [countrySearch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading) return;

    if (password.length < 8) {
      toast.error(t.validationPass);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t.validationName);
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: `${selectedCountry.dial}${phone}`,
          country_code: selectedCountry.code,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session?.user) {
      toast.success(t.successCreated);
      navigate("/onboarding", { replace: true });
      return;
    }

    toast.success(t.verifyEmail);
    navigate("/login", { replace: true });
  };

  const handleGoogleRegister = async () => {
    if (loading || authLoading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/register`,
      },
    });

    if (error) {
      toast.error(t.googleError);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const isBusy = loading || authLoading;

  return (
    <div className="min-h-screen flex">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/register" />
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-foreground relative overflow-hidden">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-48 w-48 rounded-full bg-primary/15 blur-[80px]" />
        <div className="relative text-center px-12">
          <h2 className="text-3xl font-extrabold text-background mb-4">{t.visualHeading}</h2>
          <p className="text-background/50 text-lg max-w-md">{t.visualDesc}</p>
        </div>
      </div>

      {/* Right - Form */}
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

          <h1 className="text-2xl font-extrabold text-foreground mb-2">{t.heading}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t.subtitle}</p>

          <div className="mb-6 p-3 rounded-xl border border-primary/30 bg-primary/10 text-xs text-foreground font-medium flex items-center gap-2.5 shadow-sm">
            <Percent className="h-4 w-4 text-primary shrink-0 font-bold" />
            {lang === "en" ? (
              <span>
                A <strong className="font-extrabold text-primary text-sm bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30 inline-block mx-0.5">5%</strong> commission is applied to sales made by sellers.
              </span>
            ) : (
              <span>
                Une commission de <strong className="font-extrabold text-primary text-sm bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30 inline-block mx-0.5">5%</strong> est appliquée sur les ventes réalisées par les vendeurs.
              </span>
            )}
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full py-5 text-sm font-medium mb-6"
            onClick={handleGoogleRegister}
            disabled={isBusy}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t.continueGoogle}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">{t.orEmail}</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t.lastNameLabel}
                </label>
                <Input
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t.firstNameLabel}
                </label>
                <Input
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t.emailLabel}
              </label>
              <Input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t.phoneLabel}
              </label>
              <div className="flex gap-2">
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[140px] shrink-0 justify-between px-2 font-normal"
                      type="button"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                        alt={selectedCountry.code}
                        className="h-4 w-6 object-cover rounded-sm mr-1"
                      />
                      <span className="text-xs font-medium text-foreground">
                        {selectedCountry.code}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedCountry.dial}</span>
                      <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[260px] p-2" align="start">
                    <div className="flex items-center gap-2 px-2 pb-2 border-b border-border mb-1">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                        placeholder={t.searchCountry}
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm text-left"
                          onClick={() => {
                            setSelectedCountry(c);
                            setCountryOpen(false);
                            setCountrySearch("");
                          }}
                        >
                          <img
                            src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                            alt={c.code}
                            className="h-4 w-6 object-cover rounded-sm shrink-0"
                          />
                          <span className="text-xs font-medium text-foreground">{c.code}</span>
                          <span className="flex-1 truncate">
                            {c.dial === "+229" && lang === "en" ? "Benin" : c.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Input
                  type="tel"
                  placeholder="97 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  autoComplete="tel"
                  required
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
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

            <Button className="w-full py-5 text-sm font-semibold" disabled={isBusy}>
              {isBusy ? t.creating : t.createBtn}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.alreadyAccount}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t.loginLink}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
