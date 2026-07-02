import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { BookOpen, Code, Rocket, Settings, CreditCard, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";

const sectionsData = [
  { icon: Rocket, key: "quickstart" },
  { icon: BookOpen, key: "guides" },
  { icon: CreditCard, key: "payments" },
  { icon: Settings, key: "customization" },
  { icon: Code, key: "api" },
  { icon: Shield, key: "security" },
];

const translations = {
  fr: {
    seoTitle: "Documentation - TechNova",
    seoDesc:
      "Documentation complète TECHNOVA : démarrage rapide, guides produits, paiements, API, webhooks et personnalisation de boutique.",
    heading: "Documentation",
    subtitle: "Tout ce dont vous avez besoin pour maîtriser TECHNOVA et développer votre business.",
    quickstartTitle: "Démarrage rapide",
    quickstartDesc: "Créez votre compte et publiez votre premier produit en 5 minutes.",
    guidesTitle: "Guide des produits",
    guidesDesc: "Apprenez à créer des fichiers, cours et licences.",
    paymentsTitle: "Paiements",
    paymentsDesc: "Configurez Mobile Money, cartes bancaires et retraits.",
    customizationTitle: "Personnalisation",
    customizationDesc: "Personnalisez votre boutique, domaine et branding.",
    apiTitle: "API & Webhooks",
    apiDesc: "Intégrez TECHNOVA à vos outils avec notre API REST.",
    securityTitle: "Sécurité",
    securityDesc: "Bonnes pratiques de sécurité et protection de vos données.",
  },
  en: {
    seoTitle: "Documentation - TechNova",
    seoDesc:
      "Complete TECHNOVA documentation: quickstart, product guides, payments, API, webhooks, and store customization.",
    heading: "Documentation",
    subtitle: "Everything you need to master TECHNOVA and grow your business.",
    quickstartTitle: "Quickstart",
    quickstartDesc: "Create your account and publish your first product in 5 minutes.",
    guidesTitle: "Product Guides",
    guidesDesc: "Learn how to create files, courses, and licenses.",
    paymentsTitle: "Payments",
    paymentsDesc: "Configure Mobile Money, credit cards, and payouts.",
    customizationTitle: "Customization",
    customizationDesc: "Customize your store, domain, and branding.",
    apiTitle: "API & Webhooks",
    apiDesc: "Integrate TECHNOVA with your tools using our REST API.",
    securityTitle: "Security",
    securityDesc: "Security best practices and data protection guidelines.",
  },
};

const Documentation = () => {
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
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/documentation" />
      <Header />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              <span className="text-gradient">{t.heading}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {sectionsData.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-card-foreground">
                    {t[`${s.key}Title` as keyof typeof t]}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t[`${s.key}Desc` as keyof typeof t]}
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

export default Documentation;
