import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <SEOHead 
        title="Fonctionne avec TECHNOVA | Les Meilleurs Outils IA" 
        description="Découvrez notre annuaire des meilleurs outils d'intelligence artificielle et logiciels pour automatiser votre travail et booster vos ventes."
      />
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section of the Directory */}
        <section className="relative overflow-hidden border-b border-border/40 bg-muted/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 py-16 md:py-20 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Annuaire Officiel</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Les Outils Qui <span className="text-primary">Changent La Donne</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Boostez votre productivité, créez des visuels époustouflants et automatisez votre business grâce à notre sélection des meilleures Intelligences Artificielles.
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
