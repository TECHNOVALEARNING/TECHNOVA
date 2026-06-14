import Navbar from "@/components/Navbar";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { Target, Heart, Globe, Users, Rocket, Lightbulb, ArrowRight, Code, Megaphone, Briefcase, PenTool, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import TrustSection from "@/components/TrustSection";

const topics = [
  { icon: Code, title: "Développement Web", desc: "HTML, CSS, JavaScript, React, Node.js" },
  { icon: Megaphone, title: "Marketing Digital", desc: "SEO, réseaux sociaux, publicité, email" },
  { icon: Briefcase, title: "Business & Entrepreneuriat", desc: "Stratégie, finance, gestion de projet" },
  { icon: PenTool, title: "Design Graphique", desc: "Figma, Adobe, identité visuelle, UI/UX" },
];

const approach = [
  { title: "Apprentissage par la pratique", desc: "Des projets réels à la fin de chaque module pour construire un portfolio." },
  { title: "Formateurs experts", desc: "Des professionnels expérimentés et praticiens dans leur domaine." },
  { title: "Contenu adapté", desc: "Des cours en français, conçus pour les réalités locales et internationales." },
  { title: "Flexibilité totale", desc: "Apprenez à votre rythme, depuis n'importe quel appareil." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <SEOHead 
        title="À propos de TechNova Learning" 
        description="TechNova Learning est une plateforme de formation en ligne dédiée à l'acquisition de compétences numériques. Notre mission : rendre l'éducation de qualité accessible à tous en Afrique francophone." 
        canonicalPath="/about" 
      />
      <Navbar />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-mesh overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary border border-primary/20">
              <Globe className="w-4 h-4" />
              <span>Pour l'Afrique francophone et la diaspora</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">TechNova Learning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme de formation en ligne dédiée à l'acquisition de compétences numériques et professionnelles, accessible à tous.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground">Notre Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Nous croyons que chaque personne mérite d'accéder à une formation de qualité, quel que soit son niveau de revenus, sa localisation géographique ou son parcours scolaire. 
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                <strong className="text-foreground">TechNova Learning</strong> a été conçu pour éliminer les barrières à l'apprentissage numérique, en particulier en Afrique francophone et dans la diaspora.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground">Notre Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                D'ici 2030, notre objectif est de <strong>former 1 million d'apprenants francophones</strong> aux compétences numériques du futur.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Nous voulons être la référence absolue en matière de formation en ligne pour l'Afrique francophone et la diaspora mondiale, en créant le pont entre le talent et les opportunités professionnelles.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ce que nous enseignons */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Ce que nous enseignons</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Des parcours structurés sur les métiers les plus demandés du marché.</p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {topics.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                  <t.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-card-foreground">{t.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approche Pédagogique */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Notre Approche Pédagogique</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nous ne nous contentons pas de vous donner des vidéos à regarder. Nous vous accompagnons pour que vous deveniez opérationnel.
              </p>
              <div className="space-y-6">
                {approach.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">Communauté Active</h4>
                    <p className="text-muted-foreground">Accédez à un forum, du mentorat, et des groupes d'échanges dynamiques.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-[100px] -z-10" />
              
              <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-4">Notre Modèle Freemium</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                TechNova Learning fonctionne sur un modèle freemium : de nombreux cours sont entièrement gratuits, et les apprenants peuvent accéder aux formations certifiantes premium à des tarifs très accessibles.
              </p>
              <p className="text-foreground font-semibold text-lg italic border-l-4 border-primary pl-4">
                "Nous pensons que la première barrière à franchir est celle de l'accès, pas du prix."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid gap-12 md:grid-cols-3 text-center divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
            {[
              { num: "Freemium", label: "Accès gratuit ou à petit prix" },
              { num: "100%", label: "Orienté Pratique & Projets" },
              { num: "24/7", label: "Apprentissage à votre rythme" },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-8 md:pt-0">
                <p className="text-4xl md:text-5xl font-extrabold mb-3">{stat.num}</p>
                <p className="text-primary-foreground/80 font-medium text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">
              Prêt à transformer votre carrière ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Rejoignez des milliers d'apprenants et commencez à acquérir les compétences numériques de demain, dès aujourd'hui.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
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
