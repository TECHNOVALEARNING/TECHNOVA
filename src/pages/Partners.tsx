import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { Handshake, TrendingUp, Gift, HeadphonesIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";

const benefitsData = [
  { icon: TrendingUp, key: "commissions" },
  { icon: Gift, key: "resources" },
  { icon: Handshake, key: "support" },
  { icon: HeadphonesIcon, key: "dashboard" },
];

const translations = {
  fr: {
    seoTitle: "Devenir partenaire",
    seoDesc:
      "Rejoignez le programme partenaire TECHNOVA. Gagnez jusqu'à 30% de commissions récurrentes en référant des créateurs.",
    heading: (
      <>
        Devenez <span className="text-gradient">partenaire</span> TECHNOVA
      </>
    ),
    subtitle:
      "Rejoignez notre programme partenaire et gagnez des commissions en recommandant la plateforme.",
    btnLabel: "Devenir partenaire",
    commissionsTitle: "Commissions attractives",
    commissionsDesc: "Gagnez jusqu'à 30% de commissions récurrentes sur chaque client référé.",
    resourcesTitle: "Ressources marketing",
    resourcesDesc: "Accédez à des bannières, templates et contenus prêts à l'emploi.",
    supportTitle: "Support dédié",
    supportDesc: "Un manager partenaire dédié pour vous accompagner dans votre croissance.",
    dashboardTitle: "Dashboard partenaire",
    dashboardDesc: "Suivez vos performances, commissions et paiements en temps réel.",
  },
  en: {
    seoTitle: "Become a Partner",
    seoDesc:
      "Join the TECHNOVA partner program. Earn up to 30% recurring commissions by referring creators.",
    heading: (
      <>
        Become a TECHNOVA <span className="text-gradient">Partner</span>
      </>
    ),
    subtitle: "Join our partner program and earn commissions by recommending the platform.",
    btnLabel: "Become a partner",
    commissionsTitle: "Attractive Commissions",
    commissionsDesc: "Earn up to 30% recurring commissions on each referred customer.",
    resourcesTitle: "Marketing Resources",
    resourcesDesc: "Access ready-to-use banners, templates, and content.",
    supportTitle: "Dedicated Support",
    supportDesc: "A dedicated partner manager to assist you in your growth.",
    dashboardTitle: "Partner Dashboard",
    dashboardDesc: "Track your performance, commissions, and payouts in real-time.",
  },
};

const Partners = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/partners" />
      <Header />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              {t.heading}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t.subtitle}</p>
            <Link to="/register">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25"
              >
                {t.btnLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefitsData.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 text-center"
                >
                  <div className="mb-4 mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-card-foreground">
                    {t[`${b.key}Title` as keyof typeof t]}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t[`${b.key}Desc` as keyof typeof t]}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Partners;
