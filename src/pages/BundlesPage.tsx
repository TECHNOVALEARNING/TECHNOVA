import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { Package, Percent, Layers, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const features = [
  { icon: Package, title: "Packs sur mesure", desc: "Combinez fichiers, cours et licences dans des offres groupées attractives." },
  { icon: Percent, title: "Réductions auto", desc: "Appliquez des réductions automatiques sur les achats groupés." },
  { icon: Layers, title: "Multi-produits", desc: "Mélangez tous types de produits dans un seul bundle." },
  { icon: TrendingUp, title: "Augmentez vos ventes", desc: "Les bundles augmentent le panier moyen de 30% en moyenne." },
];

const BundlesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Vendre des bundles" description="Créez des bundles de produits digitaux : combinez fichiers, cours et licences avec réductions automatiques. Augmentez votre panier moyen." canonicalPath="/bundles" keywords="bundle produits digitaux, offre groupée, pack, réduction, vente en ligne" />
      <Header />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              📦 Bundles & Packs
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Créez des <span className="text-gradient">bundles irrésistibles</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Combinez vos produits, appliquez des réductions et boostez votre chiffre d'affaires.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25">
                Créer un bundle <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BundlesPage;
