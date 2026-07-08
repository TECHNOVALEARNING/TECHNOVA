import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function ToolsDirectoryPage() {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans" style={{ fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        title={
          lang === "fr"
            ? "Fonctionne avec TECHNOVA | L'Annuaire des Outils Digitaux"
            : "Works with TECHNOVA | Digital Tools Directory"
        }
        description={
          lang === "fr"
            ? "Découvrez notre annuaire des meilleurs outils digitaux, logiciels IA, e-commerce et création pour développer votre activité."
            : "Discover our directory of the best digital tools, AI software, e-commerce, and design tools to grow your business."
        }
      />
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero Section of the Directory */}
        <section className="relative overflow-hidden border-b border-border pt-20 md:pt-28">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 pb-16 pt-8 md:pb-20 md:pt-12 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
              {lang === "fr" ? "Les Outils Qui " : "Tools That "}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                {lang === "fr" ? "Changent La Donne" : "Change The Game"}
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
              {lang === "fr"
                ? "Boostez votre productivité, créez des visuels époustouflants, lancez votre e-commerce et automatisez votre business grâce à notre sélection des meilleurs outils digitaux."
                : "Boost your productivity, create stunning visuals, launch your e-commerce and automate your business with our selection of the best digital tools."}
            </p>
          </div>
        </section>

        {/* Directory Container */}
        <section className="bg-background">
          <ToolsDirectory />
        </section>
      </main>

      <Footer />
    </div>
  );
}
