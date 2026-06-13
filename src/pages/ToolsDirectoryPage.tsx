import React from "react";
import { Header, Footer } from "@/components/site/shared";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead 
        title="Fonctionne avec TECHNOVA | L'Annuaire des Outils Digitaux" 
        description="Découvrez notre annuaire des meilleurs outils digitaux, logiciels IA, e-commerce et création pour développer votre activité."
      />
      <Header />
      
      <main className="flex-1 pt-24 pb-16" style={{ background: "var(--bg)" }}>
        {/* Hero Section of the Directory */}
        <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--divider)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 py-16 md:py-20 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6" style={{ background: "var(--blue-soft)", color: "var(--blue)", border: "1px solid rgba(0,113,227,0.15)" }}>
              <Sparkles className="w-4 h-4" />
              <span>Annuaire Officiel</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "'Outfit',sans-serif", color: "var(--text)" }}>
              Les Outils Qui <span style={{ background: "linear-gradient(135deg,#0071e3,#409cff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Changent La Donne</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Boostez votre productivité, créez des visuels époustouflants, lancez votre e-commerce et automatisez votre business grâce à notre sélection des meilleurs outils digitaux.
            </p>
          </div>
        </section>

        {/* Directory Container */}
        <section style={{ background: "var(--bg)" }}>
          <ToolsDirectory />
        </section>
      </main>

      <Footer />
    </div>
  );
}
