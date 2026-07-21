import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import {
  Target,
  Heart,
  Globe,
  Users,
  Rocket,
  Lightbulb,
  ArrowRight,
  Code,
  Megaphone,
  Briefcase,
  PenTool,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";

const topicsData = [
  { icon: Code, key: "web" },
  { icon: Megaphone, key: "marketing" },
  { icon: Briefcase, key: "business" },
  { icon: PenTool, key: "design" },
];

const translations = {
  fr: {
    seoTitle: "À propos de TechNova Learning",
    seoDesc:
      "TechNova Learning est une plateforme de formation en ligne dédiée à l'acquisition de compétences numériques. Notre mission : rendre l'éducation de qualité accessible à tous dans le monde entier.",
    eyebrow: "NOTRE OBJECTIF",
    heroTitle: (
      <>
        À propos de{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
          TechNova Learning
        </span>
      </>
    ),
    heroDesc:
      "Une plateforme de formation en ligne dédiée à l'accès au savoir, abordable et de qualité, partout dans le monde.",
    missionTitle: "Mission et vision",
    missionDesc1:
      "Our mission is to tear down the barriers to accessing knowledge by providing affordable, accessible, and high-quality educational resources worldwide. We dream of a world where financial means never stand as a barrier to personal growth and success.",
    missionDesc1Real:
      "« Notre mission est de faire tomber les obstacles à l'accès au savoir, en proposant des ressources éducatives abordables, accessibles et de qualité, partout dans le monde. Nous rêvons d'un monde où les moyens financiers ne constituent jamais un frein à l'épanouissement et à la réussite de chacun. »",
    missionDesc2:
      "s'engage chaque jour à éliminer les barrières financières et technologiques pour permettre à chacun d'apprendre et de réussir.",
    visionTitle: "Notre Vision",
    visionDesc1: (
      <>
        D'ici 2030, notre objectif est de{" "}
        <strong>former 1 million d'apprenants francophones et internationaux</strong> aux compétences d'avenir.
      </>
    ),
    visionDesc2:
      "Nous voulons être la référence absolue en matière d'accès universel au savoir de qualité.",
    teachTitle: "Ce que nous enseignons",
    teachDesc: "Des parcours structurés sur les métiers les plus demandés du marché.",
    webTitle: "Développement Web",
    webDesc: "HTML, CSS, JavaScript, React, Node.js",
    marketingTitle: "Marketing Digital",
    marketingDesc: "SEO, réseaux sociaux, publicité, email",
    businessTitle: "Business & Entrepreneuriat",
    businessDesc: "Stratégie, finance, gestion de projet",
    designTitle: "Design Graphique",
    designDesc: "Figma, Adobe, identité visuelle, UI/UX",
    approachTitle: "Notre Approche Pédagogique",
    approachDesc:
      "Nous ne nous contentons pas de vous donner des vidéos à regarder. Nous vous accompagnons pour que vous deveniez opérationnel.",
    approach1Title: "Apprentissage par la pratique",
    approach1Desc: "Des projets réels à la fin de chaque module pour construire un portfolio.",
    approach2Title: "Formateurs experts",
    approach2Desc: "Des professionnels expérimentés et praticiens dans leur domaine.",
    approach3Title: "Contenu adapté",
    approach3Desc: "Des cours en français, conçus pour les réalités locales et internationales.",
    approach4Title: "Flexibilité totale",
    approach4Desc: "Apprenez à votre rythme, depuis n'importe quel appareil.",
    communityTitle: "Communauté Active",
    communityDesc: "Accédez à un forum, du mentorat, et des groupes d'échanges dynamiques.",
    freemiumTitle: "Notre Modèle Freemium",
    freemiumDesc:
      "TechNova Learning fonctionne sur un modèle freemium : de nombreux cours sont entièrement gratuits, et les apprenants peuvent accéder aux formations certifiantes premium à des tarifs très accessibles.",
    freemiumQuote:
      '"Nous pensons que la première barrière à franchir est celle de l\'accès, pas du prix."',
    ctaTitle: "Prêt à transformer votre carrière ?",
    ctaDesc:
      "Rejoignez des milliers d'apprenants et commencez à acquérir les compétences numériques de demain, dès aujourd'hui.",
    ctaBtn: "Commencer gratuitement",
    statFreemium: "Freemium",
    statFreemiumLabel: "Accès gratuit ou à petit prix",
    statPractice: "100%",
    statPracticeLabel: "Orienté Pratique & Projets",
    statFlex: "24/7",
    statFlexLabel: "Apprentissage à votre rythme",
  },
  en: {
    seoTitle: "About TechNova Learning",
    seoDesc:
      "TechNova Learning is an online training platform dedicated to the acquisition of digital skills. Our mission: make quality education accessible to everyone worldwide.",
    eyebrow: "For learners worldwide",
    heroTitle: (
      <>
        About{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
          TechNova Learning
        </span>
      </>
    ),
    heroDesc:
      "An online training platform dedicated to the acquisition of digital and professional skills, accessible to everyone.",
    missionTitle: "Our Mission",
    missionDesc1Real:
      "We believe that everyone deserves access to quality training, regardless of income level, geographical location, or educational background.",
    missionDesc2:
      "TechNova Learning was designed to eliminate barriers to digital learning, for anyone wishing to acquire key skills from anywhere.",
    visionTitle: "Our Vision",
    visionDesc1: (
      <>
        By 2030, our goal is to <strong>train 1 million French-speaking learners</strong> in the
        digital skills of the future.
      </>
    ),
    visionDesc2:
      "We want to be the absolute benchmark for online training globally, bridging the gap between talent and professional opportunities.",
    teachTitle: "What we teach",
    teachDesc: "Structured pathways in the most in-demand fields of the market.",
    webTitle: "Web Development",
    webDesc: "HTML, CSS, JavaScript, React, Node.js",
    marketingTitle: "Digital Marketing",
    marketingDesc: "SEO, social networks, ads, email",
    businessTitle: "Business & Entrepreneurship",
    businessDesc: "Strategy, finance, project management",
    designTitle: "Graphic Design",
    designDesc: "Figma, Adobe, visual identity, UI/UX",
    approachTitle: "Our Pedagogical Approach",
    approachDesc:
      "We don't just give you videos to watch. We support you so that you become operational.",
    approach1Title: "Learning by doing",
    approach1Desc: "Real projects at the end of each module to build a portfolio.",
    approach2Title: "Expert trainers",
    approach2Desc: "Experienced professionals and practitioners in their field.",
    approach3Title: "Adapted content",
    approach3Desc: "Courses in French, designed for local and international realities.",
    approach4Title: "Total flexibility",
    approach4Desc: "Learn at your own pace, from any device.",
    communityTitle: "Active Community",
    communityDesc: "Access a forum, mentoring, and dynamic exchange groups.",
    freemiumTitle: "Our Freemium Model",
    freemiumDesc:
      "TechNova Learning works on a freemium model: many courses are entirely free, and learners can access premium certifying training at very accessible rates.",
    freemiumQuote: '"We believe the first barrier to cross is access, not price."',
    ctaTitle: "Ready to transform your career?",
    ctaDesc:
      "Join thousands of learners and start acquiring the digital skills of tomorrow, today.",
    ctaBtn: "Start for free",
    statFreemium: "Freemium",
    statFreemiumLabel: "Free or low-cost access",
    statPractice: "100%",
    statPracticeLabel: "Practice & Project Oriented",
    statFlex: "24/7",
    statFlexLabel: "Learn at your own pace",
  },
};

const About = () => {
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/about" />
      <Header />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-mesh overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary border border-primary/20">
              <Globe className="w-4 h-4" />
              <span>{t.eyebrow}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t.heroDesc}</p>
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
                <h2 className="text-3xl font-extrabold text-foreground">{t.missionTitle}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">{t.missionDesc1Real}</p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                <strong className="text-foreground">TechNova Learning</strong> {t.missionDesc2}
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
                <h2 className="text-3xl font-extrabold text-foreground">{t.visionTitle}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">{t.visionDesc1}</p>
              <p className="text-muted-foreground leading-relaxed text-lg">{t.visionDesc2}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ce que nous enseignons */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              {t.teachTitle}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.teachDesc}</p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {topicsData.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <motion.div
                  key={topic.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-card-foreground">
                    {t[`${topic.key}Title` as keyof typeof t]}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t[`${topic.key}Desc` as keyof typeof t]}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Approche Pédagogique */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">
                {t.approachTitle}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">{t.approachDesc}</p>
              <div className="space-y-6">
                {[
                  { title: t.approach1Title, desc: t.approach1Desc },
                  { title: t.approach2Title, desc: t.approach2Desc },
                  { title: t.approach3Title, desc: t.approach3Desc },
                  { title: t.approach4Title, desc: t.approach4Desc },
                ].map((item, idx) => (
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
                    <h4 className="font-bold text-lg text-foreground">{t.communityTitle}</h4>
                    <p className="text-muted-foreground">{t.communityDesc}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-[100px] -z-10" />

              <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-4">{t.freemiumTitle}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{t.freemiumDesc}</p>
              <p className="text-foreground font-semibold text-lg italic border-l-4 border-primary pl-4">
                {t.freemiumQuote}
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
              { num: t.statFreemium, label: t.statFreemiumLabel },
              { num: t.statPractice, label: t.statPracticeLabel },
              { num: t.statFlex, label: t.statFlexLabel },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-8 md:pt-0"
              >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">
              {t.ctaTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{t.ctaDesc}</p>
            <Link to="/register">
              <Button
                size="lg"
                className="px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t.ctaBtn}
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
