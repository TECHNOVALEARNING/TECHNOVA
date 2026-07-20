import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Shield,
  Headphones,
  Wallet,
  GraduationCap,
  Sparkles,
  Star,
  Mail,
  MapPin,
  Phone,
  Lock,
  CreditCard,
  ThumbsUp,
  ChevronRight,
  Store,
  ShoppingBag,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import siteLogo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useGeoPricing } from "@/contexts/GeoPricingContext";

/* ---------- Logo ---------- */
export const Logo = ({ className = "" }: { className?: string }) => (
  <a href="/" className={`flex items-center gap-2.5 ${className}`}>
    <img src={siteLogo} alt="Logo" className="h-10 sm:h-12 w-auto object-contain" />
    <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
      TECHNOVA
    </span>
  </a>
);

/* ---------- Header ---------- */
import { useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { buyerSupabase } from "@/integrations/supabase/buyer-client";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_theme") || "light" : "light",
  );
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const [hasBuyerSession, setHasBuyerSession] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const checkBuyer = async () => {
      const {
        data: { session },
      } = await buyerSupabase.auth.getSession();
      const hasSession = !!session || !!sessionStorage.getItem("buyer_session");
      setHasBuyerSession(hasSession);
    };
    checkBuyer();
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("technova_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("technova_lang", lang);
    // Dispath event so other components can re-render if needed
    window.dispatchEvent(new Event("technova_lang_changed"));
  }, [lang]);

  const links = [
    { to: "/", label: lang === "fr" ? "Accueil" : "Home" },
    { to: "/formations", label: lang === "fr" ? "Nos formations" : "Courses" },
    { to: "/#courses", label: lang === "fr" ? "Nos Produits Digitaux" : "Our Digital Products" },
    { to: "/store", label: lang === "fr" ? "Store" : "Store" },
  ];

  const moreDropdownLinks = [
    { to: "/e-services", label: "E-services" },
    { to: "/jobs", label: lang === "fr" ? "Opportunités d'emplois" : "Job Opportunities" },
    {
      to: "/outils-digitaux",
      label: lang === "fr" ? "Outils de Productivité" : "Productivity Tools",
    },
    { to: "/decouvertes", label: lang === "fr" ? "Découvertes" : "Discoveries" },
    { to: "/apps", label: lang === "fr" ? "Technova Apps" : "Technova Apps" },
    { to: "/premium", label: lang === "fr" ? "Technova Premium" : "Technova Premium" },
  ];

  const infoDropdownLinks = [
    { to: "/blog", label: lang === "fr" ? "Blog" : "Blog" },
    { to: "/actualites", label: lang === "fr" ? "Actualités" : "News" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith("/#") && isHome) {
      e.preventDefault();
      const targetId = to.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(to as any);
      }
    } else if (to === "/" && isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8 text-sm font-normal">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={(e) => handleNavClick(e, l.to)}
              className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Dropdown "Informez-vous" */}
          <div className="relative" onMouseLeave={() => setInfoDropdownOpen(false)}>
            <button
              onClick={() => setInfoDropdownOpen(!infoDropdownOpen)}
              onMouseEnter={() => setInfoDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors font-normal text-sm"
            >
              {lang === "fr" ? "Informez-vous" : "Get Informed"}{" "}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${infoDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute top-full left-0 mt-2 w-48 rounded-xl border border-border bg-white dark:bg-[#1c1c1e] p-2 shadow-xl transition-all before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 ${
                infoDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              {infoDropdownLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => {
                    setInfoDropdownOpen(false);
                    handleNavClick(e, l.to);
                  }}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Dropdown "Plus" */}
          <div className="relative" onMouseLeave={() => setDropdownOpen(false)}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors font-normal text-sm"
            >
              {lang === "fr" ? "Plus" : "More"}{" "}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute top-full right-0 mt-2 w-48 rounded-xl border border-border bg-white dark:bg-[#1c1c1e] p-2 shadow-xl transition-all before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 ${
                dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              {moreDropdownLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => {
                    setDropdownOpen(false);
                    handleNavClick(e, l.to);
                  }}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          {/* Toggles */}
          <button
            onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
            className="flex items-center gap-1.5 text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
          >
            <Globe className="h-4 w-4" /> {lang.toUpperCase()}
          </button>
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {hasBuyerSession && (
            <Link
              to="/mes-achats"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-secondary text-foreground hover:bg-secondary/80 h-10 px-3.5 py-2 border border-border"
            >
              {lang === "fr" ? "Mes Achats" : "My Purchases"}
            </Link>
          )}

          {user ? (
            <Link
              to="/dashboard"
              className="ml-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[#0071e3] text-white hover:bg-[#0071e3]/90 h-10 px-4 py-2"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {!hasBuyerSession && (
                <Link
                  to="/buyer-login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  {lang === "fr" ? "Mes Achats" : "My Purchases"}
                </Link>
              )}
              <Link
                to="/register"
                className="ml-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-[#0071e3] text-white hover:bg-[#0071e3]/90 h-10 px-4 py-2"
              >
                {lang === "fr" ? "Devenir vendeur" : "Become a Seller"}
              </Link>
            </>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
            className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity mr-1"
          >
            <Globe className="h-4 w-4" /> {lang.toUpperCase()}
          </button>
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="p-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button onClick={() => setOpen(!open)} className="p-2" aria-label="menu">
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-6 transition-transform ${open && "translate-y-2 rotate-45"}`}
                style={{ background: "currentColor" }}
              />
              <span
                className={`block h-0.5 w-6 transition-opacity ${open && "opacity-0"}`}
                style={{ background: "currentColor" }}
              />
              <span
                className={`block h-0.5 w-6 transition-transform ${open && "-translate-y-2 -rotate-45"}`}
                style={{ background: "currentColor" }}
              />
            </div>
          </button>
        </div>
      </div>
      {open && (
        <div
          className="lg:hidden border-t border-[color:var(--border)] max-h-[calc(100vh-64px)] overflow-y-auto"
          style={{ background: "var(--card)" }}
        >
          <div className="px-4 py-6 flex flex-col gap-4">
            {/* Grille de navigation compacte */}
            <div className="grid grid-cols-2 gap-3">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => {
                    setOpen(false);
                    handleNavClick(e, l.to);
                  }}
                  className="py-3 px-2 font-medium rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 text-[14px] text-center transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="h-px w-full bg-border/50 my-1" />

            {/* Mobile "Informez-vous" section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                {lang === "fr" ? "Informez-vous" : "Get Informed"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {infoDropdownLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={(e) => {
                      setOpen(false);
                      handleNavClick(e, l.to);
                    }}
                    className="py-3 px-2 font-medium rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 text-[14px] text-center transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile "Plus" section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                {lang === "fr" ? "Plus" : "More"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moreDropdownLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={(e) => {
                      setOpen(false);
                      handleNavClick(e, l.to);
                    }}
                    className="py-3 px-2 font-medium rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 text-[14px] text-center transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-border/50 my-2" />

            {/* Actions (Login / Devenir vendeur / Dashboard) */}
            {/* Actions (Login / Devenir vendeur / Dashboard) */}
            <div className="flex flex-col gap-3 pb-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="w-full text-center inline-flex items-center justify-center rounded-xl text-base font-medium bg-[#0071e3] text-white hover:bg-[#0071e3]/90 h-12 px-4 py-2 shadow-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="w-full text-center inline-flex items-center justify-center rounded-xl text-base font-medium border border-[color:var(--border)] hover:bg-muted/50 h-12 px-4 py-2"
                  >
                    {lang === "fr" ? "Déconnexion" : "Sign Out"}
                  </button>
                </>
              ) : hasBuyerSession ? (
                <>
                  <Link
                    to="/mes-achats"
                    onClick={() => setOpen(false)}
                    className="w-full text-center inline-flex items-center justify-center rounded-xl text-base font-medium bg-[#0071e3] text-white hover:bg-[#0071e3]/90 h-12 px-4 py-2 shadow-sm"
                  >
                    {lang === "fr" ? "Mes Achats" : "My Purchases"}
                  </Link>
                  <button
                    onClick={async () => {
                      sessionStorage.removeItem("buyer_session");
                      await buyerSupabase.auth.signOut();
                      setHasBuyerSession(false);
                      await signOut();
                      setOpen(false);
                    }}
                    className="w-full text-center inline-flex items-center justify-center rounded-xl text-base font-medium border border-[color:var(--border)] hover:bg-muted/50 h-12 px-4 py-2"
                  >
                    {lang === "fr" ? "Déconnexion" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="w-full text-center inline-flex items-center justify-center rounded-xl text-base font-medium bg-[#0071e3] text-white hover:bg-[#0071e3]/90 h-12 px-4 py-2 shadow-sm"
                  >
                    <Store className="h-5 w-5 mr-2" />{" "}
                    {lang === "fr" ? "Espace vendeur" : "Seller Space"}
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center inline-flex items-center justify-center rounded-xl text-[14px] font-medium border border-[color:var(--border)] bg-card hover:bg-muted/50 h-12 px-2"
                    >
                      {lang === "fr" ? "Connexion" : "Sign In"}
                    </Link>
                    <Link
                      to="/buyer-login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center inline-flex items-center justify-center rounded-xl text-[14px] font-medium border border-[color:var(--border)] bg-card hover:bg-muted/50 h-12 px-2"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1.5" />{" "}
                      {lang === "fr" ? "Achats" : "Purchases"}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

/* ---------- Footer ---------- */
export const Footer = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  return (
    <footer className="mt-24 sm:mt-32 bg-[#0B1221] text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-16 grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="sm:col-span-2">
          <Logo className="mb-2" />
          <p className="mt-4 text-white/70 max-w-md leading-relaxed text-sm sm:text-base">
            {lang === "fr"
              ? "TECHNOVA Learning : la plateforme de formations & produits numériques. Cybersécurité, IA, marketing, entrepreneuriat — apprenez ce que les entreprises recherchent vraiment."
              : "TECHNOVA Learning: the ultimate platform for digital courses & products at low prices. Cybersecurity, AI, marketing, entrepreneurship — learn what companies are really looking for."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.facebook.com/share/18GYGMg9o8/"
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-[#1877F2] transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/technova.learning?igsh=NGkwbjNocHUwMDE5"
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-[#E4405F] transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-black transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/130533963"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-[#1877F2] transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300"
            >
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-card/10 hover:bg-red-700 transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300"
            >
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Formations */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-white">
            {lang === "fr" ? "Nos Formations" : "Our Courses"}
          </h4>
          <ul className="space-y-2.5 text-white/70 text-sm">
            {[
              {
                label: lang === "fr" ? "Cybersécurité" : "Cybersecurity",
                href: "/store?q=securite",
              },
              {
                label: lang === "fr" ? "IA et Data Science" : "AI and Data Science",
                href: "/store?q=IA",
              },
              {
                label: lang === "fr" ? "Développement web" : "Web Development",
                href: "/store?q=dev",
              },
              {
                label: lang === "fr" ? "Bureautique" : "Office Tools",
                href: "/store?q=bureautique",
              },
              {
                label: lang === "fr" ? "Design et montage" : "Design and editing",
                href: "/store?category=design",
              },
            ].map((lnk) => (
              <li key={lnk.label} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 flex-none text-[color:var(--primary)]" />
                <Link to={lnk.href} className="hover:text-white transition-colors">
                  {lnk.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-white">
            {lang === "fr" ? "Nous Contacter" : "Contact Us"}
          </h4>
          <ul className="space-y-3 text-white/70 text-sm">
            <li className="flex gap-2.5 items-start">
              <Mail className="h-4 w-4 mt-0.5 flex-none text-[color:var(--primary)]" />
              <a
                href="mailto:support@technovalearning.com"
                className="hover:text-white transition-colors break-all"
              >
                support@technovalearning.com
              </a>
            </li>
            <li className="flex gap-2.5 items-start">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 mt-0.5 flex-none text-[#25D366]"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <a href="https://wa.me/33746297360" className="hover:text-white transition-colors">
                +33 7 46 29 73 60
              </a>
            </li>
            <li className="flex gap-2.5 items-start">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 mt-0.5 flex-none text-[#25D366]"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <a href="https://wa.me/22947883735" className="hover:text-white transition-colors">
                +229 47 88 37 35
              </a>
            </li>
            <li className="flex gap-2.5 items-start">
              <MapPin className="h-4 w-4 mt-0.5 flex-none text-[color:var(--primary)]" />
              <span>14 Rue Doré, Melun, France</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-white">
            {lang === "fr" ? "Liens Rapides" : "Quick Links"}
          </h4>
          <ul className="space-y-2.5 text-white/70 text-sm">
            {[
              { label: lang === "fr" ? "Formations" : "Courses", href: "/formations" },
              { label: lang === "fr" ? "À propos" : "About", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "FAQ", href: "/faq" },
              { label: "Devenir formateur", href: "/register" },
            ].map((lnk) => (
              <li key={lnk.label} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 flex-none text-[color:var(--primary)]" />
                <a href={lnk.href} className="hover:text-white transition-colors">
                  {lnk.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50 text-xs">
        <p>
          © {new Date().getFullYear()} TECHNOVA Learning —{" "}
          {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}
        </p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-white transition-colors">
            {lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            {lang === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </footer>
  );
};

/* ---------- Logo Marquee (companies / tech) ---------- */
const TECH_LOGOS = [
  { name: "Google", url: "https://www.vectorlogo.zone/logos/google/google-icon.svg" },
  { name: "Microsoft", url: "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" },
  {
    name: "Meta",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
  },
  {
    name: "AWS",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  },
  { name: "Python", url: "https://www.vectorlogo.zone/logos/python/python-icon.svg" },
];
export const LogoMarquee = () => (
  <section className="py-12 border-y border-[color:var(--border)] bg-card">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
        Technologies & outils enseignés dans nos formations
      </p>
      <div className="flex flex-wrap justify-center gap-10 sm:gap-16 items-center">
        {TECH_LOGOS.map((logo, i) => (
          <img
            key={i}
            src={logo.url}
            alt={logo.name}
            loading="lazy"
            className="h-8 sm:h-10 w-auto object-contain opacity-70 hover:opacity-100 transition grayscale hover:grayscale-0"
          />
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Section Heading ---------- */
export const SectionHead = ({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
}) => (
  <div className="text-center max-w-2xl mx-auto mb-14">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--pastel-blue)] text-[color:var(--primary)] text-xs font-mono-display uppercase tracking-wider">
      <Sparkles className="h-3 w-3" />
      {kicker}
    </div>
    <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
      {title}
    </h2>
    {sub && <p className="mt-4 text-muted-foreground leading-relaxed">{sub}</p>}
  </div>
);

/* ---------- Why Choose Us ---------- */
const WHY = [
  {
    icon: Wallet,
    title: "Formations à petit prix",
    desc: "Accédez à un savoir premium pour le prix d'une pizza. Sans abonnement caché.",
  },
  {
    icon: Headphones,
    title: "Support client ultra-actif",
    desc: "Une équipe qui répond en quelques minutes, 7j/7, sur WhatsApp et email.",
  },
  {
    icon: Check,
    title: "100% pratique",
    desc: "Pas de blabla. Chaque module se termine par un projet concret applicable demain.",
  },
  {
    icon: Shield,
    title: "Paiement local & sécurisé",
    desc: "MTN, Moov, Celtiis, Wave, Carte Visa. Vos transactions sont chiffrées.",
  },
];
export const WhyChoose = () => (
  <section id="pourquoi" className="py-24 bg-[color:var(--sky-soft)]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead
        kicker="Pourquoi TECHNOVA"
        title={
          <>
            La plateforme que <span className="text-gradient">tous les apprenants</span>{" "}
            attendaient.
          </>
        }
        sub="Nous éliminons les obstacles classiques : prix, langue, support, paiement. Vous restez concentré sur ce qui compte : apprendre."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {WHY.map((w, i) => (
          <motion.div
            key={w.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group p-7 rounded-3xl bg-card border border-[color:var(--border)] hover:border-[color:var(--primary)]/30 hover:shadow-elegant transition-all"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary-gradient grid place-items-center text-white mb-5 group-hover:scale-110 transition-transform shadow-glow">
              <w.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{w.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- FAQ ---------- */
const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le paiement ?",
    a: "Vous payez en Mobile Money (MTN, Moov, Celtiis, Wave) ou par carte. Dès validation, vous recevez immédiatement un lien d'accès à votre formation par email.",
  },
  {
    q: "Les formations sont-elles à vie ?",
    a: "Oui. Une fois achetée, une formation vous appartient à vie, avec toutes les mises à jour futures gratuites.",
  },
  {
    q: "Y a-t-il un certificat à la fin ?",
    a: "Oui, chaque formation délivre un certificat de complétion téléchargeable, à ajouter sur LinkedIn ou votre CV.",
  },
  {
    q: "Que se passe-t-il si je n'ai pas internet stable ?",
    a: "Nos vidéos sont téléchargeables. Vous étudiez hors-ligne, à votre rythme, où que vous soyez.",
  },
  {
    q: "Puis-je demander un remboursement ?",
    a: "Oui. Garantie satisfait ou remboursé sous 7 jours, sans question.",
  },
  {
    q: "Comment contacter le support ?",
    a: "WhatsApp, email, Facebook Messenger. Réponse en moins de 30 min en moyenne.",
  },
];
export const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 bg-card">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Questions fréquentes"
          title={
            <>
              On répond à <span className="text-gradient">tout ce que vous vous demandez</span>.
            </>
          }
        />
        <div className="space-y-3">
          {FAQ_ITEMS.map((it, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--sky-soft)] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-display font-semibold text-base sm:text-lg">{it.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-[color:var(--primary)] flex-none transition-transform ${open === i && "rotate-180"}`}
                />
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed"
                >
                  {it.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- Payment / Security ---------- */
export type PaymentLogo = { name: string; logoUrl: string };
const DEFAULT_PAY: PaymentLogo[] = [
  { name: "MTN Mobile Money", logoUrl: "https://www.vectorlogo.zone/logos/mtn/mtn-icon.svg" },
  { name: "Orange Money", logoUrl: "https://www.vectorlogo.zone/logos/orange/orange-icon.svg" },
  { name: "Moov Money", logoUrl: "https://www.vectorlogo.zone/logos/moov/moov-icon.svg" },
  { name: "Airtel Money", logoUrl: "https://www.vectorlogo.zone/logos/airtel/airtel-icon.svg" },
  {
    name: "Vodafone Cash",
    logoUrl: "https://www.vectorlogo.zone/logos/vodafone/vodafone-icon.svg",
  },
  { name: "M-Pesa", logoUrl: "https://www.vectorlogo.zone/logos/safaricom/safaricom-icon.svg" },
  { name: "Visa", logoUrl: "https://www.vectorlogo.zone/logos/visa/visa-icon.svg" },
  {
    name: "Mastercard",
    logoUrl: "https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg",
  },
];
export const PaymentSecurity = ({ logos }: { logos?: PaymentLogo[] }) => {
  const list = logos && logos.length > 0 ? logos : DEFAULT_PAY;
  const loop = [...list, ...list, ...list];
  const trust = [
    { icon: Lock, label: "SSL 256-bit" },
    { icon: Shield, label: "PCI DSS" },
    { icon: Check, label: "RGPD" },
    { icon: CreditCard, label: "Anti-fraude" },
  ];
  return (
    <section className="py-20 sm:py-24 bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--pastel-green)] text-emerald-700 text-xs font-mono-display uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Paiement 100% sécurisé
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            Payez localement. <span className="text-gradient">Soyez livré instantanément.</span>
          </h3>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Mobile Money & cartes bancaires acceptés via PawaPay. Chiffrement SSL 256-bits, conforme
            PCI-DSS. Vos paiements n'ont jamais été aussi simples.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {trust.map((t) => (
              <div
                key={t.label}
                className="px-3.5 py-1.5 rounded-full bg-[color:var(--sky-soft)] border border-[color:var(--border)] text-xs font-semibold inline-flex items-center gap-1.5 text-foreground/80"
              >
                <t.icon className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Logos marquee — propre, fond blanc */}
        <div className="relative overflow-hidden py-2">
          <div className="flex gap-4 sm:gap-5 animate-marquee w-max items-center">
            {loop.map((p, i) => (
              <div
                key={i}
                title={p.name}
                className="group h-20 w-32 sm:h-24 sm:w-40 rounded-2xl bg-card border border-[color:var(--border)] grid place-items-center px-4 shrink-0 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 hover:border-[color:var(--primary)]/30 transition-all"
              >
                <img
                  src={p.logoUrl}
                  alt={p.name}
                  loading="lazy"
                  className="max-h-10 sm:max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector(".fallback-label")) {
                      const span = document.createElement("span");
                      span.className =
                        "fallback-label text-xs font-semibold text-foreground/70 text-center";
                      span.textContent = p.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
};

/* ---------- Testimonials (marquee) ---------- */
const REVIEWS = [
  {
    name: "Aïcha K.",
    role: "Étudiante en marketing",
    text: "Avec 5000F, j'ai eu une formation que je payais 50.000F ailleurs. Le support répond en quelques minutes !",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/93.jpg",
  },
  {
    name: "Yannick D.",
    role: "Développeur junior",
    text: "Très pratique. J'ai pu décrocher mon premier contrat freelance 2 mois après avoir terminé la formation web.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/53.jpg",
  },
  {
    name: "Mireille A.",
    role: "Entrepreneure",
    text: "Le module entrepreneuriat m'a aidée à structurer mon business. Paiement Mobile Money ultra simple.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Karim B.",
    role: "Étudiant IA",
    text: "Contenus à jour, projets concrets, compétences directement applicables. Je recommande à 100%.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    name: "Fatou S.",
    role: "Community Manager",
    text: "Le module marketing digital m'a permis de doubler mes clients en 3 mois. Merci TECHNOVA !",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/46.jpg",
  },
  {
    name: "Eric T.",
    role: "Étudiant cybersécurité",
    text: "Formations claires, pratiques, à un prix imbattable. J'ai adoré la qualité des vidéos.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];
export const Reviews = () => {
  const loop = [...REVIEWS, ...REVIEWS];
  return (
    <section className="py-24 bg-card overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Avis vérifiés"
          title={
            <>
              Ce que nos <span className="text-gradient">2000+ apprenants</span> en pensent.
            </>
          }
        />
      </div>
      <div className="relative">
        <div className="flex gap-5 animate-marquee-slow w-max">
          {loop.map((r, i) => (
            <div
              key={i}
              className="w-[300px] sm:w-[360px] shrink-0 p-6 rounded-3xl bg-[color:var(--sky-soft)] border border-[color:var(--border)] hover:shadow-elegant transition"
            >
              <div className="flex gap-0.5 mb-3 text-[color:var(--accent)]">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-5 italic">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[color:var(--border)]">
                <img
                  src={r.avatar}
                  alt={r.name}
                  loading="lazy"
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-soft"
                />
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
};

/* ---------- Course Card ---------- */
export type Course = {
  slug: string;
  title: string;
  cover: string;
  category: string;
  level: string;
  price: string;
  oldPrice?: string;
  duration: string;
  creatorId?: string;
};

const LABEL_MAP: Record<string, { cls: string; fr: string; en: string }> = {
  bestseller: { cls: "label-bestseller", fr: "Bestseller", en: "Bestseller" },
  nouveau: { cls: "label-nouveau", fr: "Nouveau", en: "New" },
  populaire: { cls: "label-populaire", fr: "Populaire", en: "Popular" },
  promo: { cls: "label-promo", fr: "Promo", en: "Promo" },
  tendance: { cls: "label-tendance", fr: "Tendance", en: "Trending" },
  top: { cls: "label-top", fr: "Top", en: "Top" },
};

export const CourseCard = ({ c, i = 0 }: { c: Course; i?: number }) => {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const { formatPrice, currency } = useGeoPricing();

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  // Parse numerical price to format
  const numericPrice = parseFloat(c.price.replace(/[^\d.]/g, "")) || 0;
  const numericOldPrice = c.oldPrice ? parseFloat(c.oldPrice.replace(/[^\d.]/g, "")) || 0 : null;

  const priceMain =
    numericPrice > 0 ? formatPrice(numericPrice) : lang === "fr" ? "Gratuit" : "Free";

  // Stable hash based on course title to derive a fixed visual mock for stars rating, students count, and badge
  const hash = c.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratings = ["4.5", "4.8", "5.0", "4.6", "4.7"];
  const studentsList = ["2.4k", "1.2k", "3.1k", "1.8k", "2.1k", "4.2k", "3.8k"];
  const labels = ["bestseller", "nouveau", "populaire", "tendance", "top", "promo"];

  const rating = ratings[hash % ratings.length];
  const students = studentsList[hash % studentsList.length];
  const label =
    numericOldPrice && numericOldPrice > numericPrice ? "promo" : labels[hash % labels.length];

  const lb = LABEL_MAP[label] || {};
  const labelTxt = lang === "fr" ? lb.fr : lb.en;
  const buyBtnText = lang === "fr" ? "Acheter" : "Buy";

  const renderStars = (r: string) => {
    const ratingNum = parseFloat(r);
    const full = Math.floor(ratingNum);
    const half = ratingNum % 1 >= 0.5;
    let s = "";
    for (let i = 0; i < full; i++) s += "★";
    if (half) s += "½";
    return <span className="stars-sm">{s}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      className="course-card cursor-pointer"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) return;
        navigate(`/product/${c.slug}`);
      }}
    >
      <div className="course-img-wrap">
        <img src={c.cover} alt={c.title} loading="lazy" />
        <span className="course-badge">{c.category}</span>
        {lb.cls && labelTxt && <span className={`label-badge ${lb.cls}`}>{labelTxt}</span>}
      </div>
      <div className="course-body">
        <div className="course-title">{c.title}</div>
        <div className="course-meta">
          <span className="students">
            <i className="fas fa-users" style={{ fontSize: "0.65rem", marginRight: 4 }}></i>
            {students}
          </span>
          {renderStars(rating)}
        </div>
        <div className="price-row">
          <div>
            <div className="price-main">{priceMain}</div>
          </div>
        </div>
        <Link className="btn-buy" to={`/checkout/${c.slug}`}>
          <i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>
          {buyBtnText}
        </Link>
      </div>
    </motion.div>
  );
};

/* ---------- Benefits Strip ---------- */
const BENEFITS = [
  {
    n: "01",
    t: "Apprentissage à vie",
    d: "Achetez une fois, gardez à jamais avec mises à jour gratuites.",
  },
  {
    n: "02",
    t: "Projets concrets",
    d: "Chaque module se termine par un livrable que vous pouvez vendre.",
  },
  {
    n: "03",
    t: "Communauté privée",
    d: "Rejoignez 2000+ apprenants pour échanger et progresser ensemble.",
  },
  {
    n: "04",
    t: "Certificat reconnu",
    d: "Boostez votre CV avec un certificat partageable sur LinkedIn.",
  },
];
export const Benefits = () => (
  <section className="py-24 bg-[color:var(--sky-soft)]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead
        kicker="Vos bénéfices"
        title={
          <>
            Bien plus qu'une formation. <span className="text-gradient">Un investissement.</span>
          </>
        }
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative p-7 rounded-3xl bg-card border border-[color:var(--border)] overflow-hidden hover:shadow-elegant transition"
          >
            <div className="text-6xl font-display font-extrabold text-[color:var(--primary)]/10 absolute top-3 right-4">
              {b.n}
            </div>
            <CreditCard className="h-8 w-8 text-[color:var(--primary)] mb-4" />
            <h3 className="font-display font-bold text-lg">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
