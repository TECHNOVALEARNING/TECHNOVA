import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Heart, Globe, Users, Rocket, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import TrustSection from "@/components/TrustSection";

const values = [
  { icon: Target, title: "Mission", desc: "Démocratiser la vente de produits digitaux en Afrique et dans le monde entier." },
  { icon: Heart, title: "Passion", desc: "Nous croyons que chaque créateur mérite une plateforme à la hauteur de son talent." },
  { icon: Globe, title: "Accessibilité", desc: "Paiements locaux, interface intuitive, support multilingue pour tous." },
  { icon: Users, title: "Communauté", desc: "Plus de 10 000 créateurs nous font confiance pour vendre leurs produits." },
];

const timeline = [
  { year: "2023", title: "L'idée naît", desc: "AGONAN ISIDORE identifie le besoin d'une plateforme de vente digitale pensée pour l'Afrique." },
  { year: "2024", title: "Lancement officiel", desc: "TECHNOVA ouvre ses portes aux premiers créateurs avec fichiers, cours et licences." },
  { year: "2025", title: "Croissance rapide", desc: "10 000+ créateurs rejoignent la plateforme, paiements Mobile Money intégrés." },
  { year: "2026", title: "L'avenir", desc: "Expansion continentale, affiliation, et nouveaux outils IA pour les créateurs." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="À propos" description="Découvrez TECHNOVA, la plateforme #1 pour vendre des produits digitaux en Afrique. Fondée par AGONAN ISIDORE avec la mission de démocratiser la vente numérique." canonicalPath="/about" />
      <Navbar />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-mesh overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              À propos d'<span className="text-gradient">TECHNOVA</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nous construisons la plateforme de référence pour les créateurs digitaux africains. Découvrez notre histoire, notre mission et la vision de notre fondateur.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Section — spectacular */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            {/* Photo side */}
            <motion.div
              initial={{ opacity: 0, x: -60, rotate: -5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              className="relative flex justify-center"
            >
              {/* Background decorative elements */}
              <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-3xl border-2 border-dashed border-primary/20"
              />

              <div className="relative">
                {/* Floating particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, i % 2 === 0 ? 10 : -10, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute h-2 w-2 rounded-full bg-primary/50"
                    style={{
                      top: `${15 + i * 18}%`,
                      left: i % 2 === 0 ? "-8%" : "108%",
                    }}
                  />
                ))}

                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  src="/images/founder.png"
                  alt="AGONAN ISIDORE — Fondateur & CEO d'TECHNOVA"
                  className="relative z-10 w-72 h-72 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl ring-4 ring-primary/20"
                />

                {/* Badge overlay */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 z-20 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-xl"
                >
                  <Rocket className="h-4 w-4" />
                  <span className="font-bold text-sm">Fondateur & CEO</span>
                </motion.div>

                {/* Vision chip */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.7 }}
                  className="absolute -top-4 -left-4 z-20 flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-2 shadow-lg"
                >
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Visionnaire</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Le Fondateur</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                  AGONAN ISIDORE
                </h2>
                <p className="text-muted-foreground font-medium">Fondateur & CEO — TECHNOVA</p>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Passionné par l'entrepreneuriat digital et convaincu du potentiel immense des créateurs africains, 
                  <strong className="text-foreground"> AGONAN ISIDORE</strong> a fondé TECHNOVA avec une mission claire : 
                  <span className="text-primary font-semibold"> démocratiser la vente digitale en Afrique</span>.
                </p>
                <p>
                  Face au constat que les plateformes existantes ne répondaient pas aux réalités du continent — 
                  paiements Mobile Money, accessibilité, simplicité — il a décidé de créer l'outil qu'il aurait aimé avoir.
                </p>
                <p>
                  Aujourd'hui, TECHNOVA permet à des milliers de créateurs de vendre leurs fichiers, cours en ligne 
                  et licences logicielles en quelques clics, avec des paiements adaptés à l'Afrique.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-primary/5 border border-primary/10 p-5"
              >
                <p className="text-sm font-medium text-foreground italic">
                  « Mon rêve est de voir chaque créateur africain vivre de son talent grâce au numérique. 
                  TECHNOVA est le pont entre le talent et les revenus. »
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Nos valeurs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Ce qui guide chacune de nos décisions.</p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mb-4 mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Notre parcours</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">De l'idée à la plateforme de référence.</p>
          </motion.div>
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-3.5 top-1 h-5 w-5 rounded-full border-2 border-primary bg-background" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.year}</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <TrustSection />

      {/* Stats */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 md:grid-cols-3 text-center">
            {[
              { num: "10K+", label: "Créateurs actifs" },
              { num: "1M$+", label: "Revenus reversés" },
              { num: "40+", label: "Pays supportés" },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{stat.num}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
              Rejoignez l'aventure TECHNOVA
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Commencez à vendre vos produits digitaux dès aujourd'hui.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-10 py-6 text-base font-semibold">
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
