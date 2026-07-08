import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/site/shared";
import { Crown, Sparkles, ArrowLeft, Gem, Target, Users, BookOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const translations = {
  fr: {
    seoTitle: "Espace Premium · TECHNOVA",
    seoDesc: "Accédez à l'Espace Premium TECHNOVA. Formations exclusives, mentorat et communauté VIP pour propulser votre carrière tech.",
    badge: "Bientôt Disponible",
    title: "Espace Premium",
    subtitle: "L'excellence TECHNOVA pour votre carrière",
    description: "Nous préparons un espace exclusif conçu pour propulser vos compétences et votre business digital à un niveau supérieur. Restez connectés, le lancement est imminent.",
    btnHome: "Retour à l'accueil",
    featuresTitle: "Ce qui vous attend dans l'Espace Premium :",
    feature1Title: "Formations VIP & Masterclasses",
    feature1Desc: "Accès illimité à des cours avancés sur l'intelligence artificielle, le développement moderne et le growth marketing.",
    feature2Title: "Mentorat & Coaching Live",
    feature2Desc: "Des sessions de questions-réponses en direct avec des experts de l'industrie pour débloquer vos projets.",
    feature3Title: "Communauté Privée",
    feature3Desc: "Un réseau exclusif de créateurs, développeurs et entrepreneurs pour collaborer et partager des opportunités.",
    feature4Title: "Ressources & Templates Pro",
    feature4Desc: "Téléchargez des kits d'UI/UX, des templates de code et des outils prêts à l'emploi pour vos projets.",
  },
  en: {
    seoTitle: "Premium Space · TECHNOVA",
    seoDesc: "Access the TECHNOVA Premium Space. Exclusive courses, mentoring, and VIP community to boost your tech career.",
    badge: "Coming Soon",
    title: "Premium Space",
    subtitle: "TECHNOVA Excellence for Your Career",
    description: "We are building an exclusive environment tailored to take your digital skills and business to the next level. Stay tuned, the launch is imminent.",
    btnHome: "Back to Homepage",
    featuresTitle: "What is coming in the Premium Space:",
    feature1Title: "VIP Courses & Masterclasses",
    feature1Desc: "Unlimited access to advanced modules on artificial intelligence, modern engineering, and growth hacking.",
    feature2Title: "Live Mentoring & Q&A",
    feature2Desc: "Interactive live sessions with industry experts to guide your projects and accelerate your learning.",
    feature3Title: "Private Network",
    feature3Desc: "An exclusive VIP community of tech professionals and entrepreneurs to network and collaborate.",
    feature4Title: "Pro Templates & Assets",
    feature4Desc: "Download premium UI/UX kits, robust codebase skeletons, and plug-and-play productivity assets.",
  }
};

const Premium = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr"
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const features = [
    {
      icon: Gem,
      title: t.feature1Title,
      desc: t.feature1Desc,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: t.feature2Title,
      desc: t.feature2Desc,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: t.feature3Title,
      desc: t.feature3Desc,
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: BookOpen,
      title: t.feature4Title,
      desc: t.feature4Desc,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden flex flex-col justify-between"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'Manrope', -apple-system, sans-serif",
      }}
    >
      <SEOHead
        canonicalPath="/premium"
        title={t.seoTitle}
        description={t.seoDesc}
      />
      <Header />

      <main className="flex-1 relative z-10 flex items-center justify-center py-20 px-6">
        <div className="max-w-5xl w-full mx-auto">
          {/* Main Info Card */}
          <div className="text-center mb-16 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>{t.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
            >
              {t.title}
            </motion.h1>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg sm:text-xl font-semibold text-primary mb-6"
            >
              {t.subtitle}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
            >
              {t.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-4"
            >
              <Link to="/">
                <Button className="rounded-full px-6 py-5 text-sm gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.btnHome}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm flex items-start gap-4 hover:border-primary/20 hover:bg-card transition-all duration-300 group"
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-2 flex items-center gap-1.5">
                      {f.title}
                      {i === 0 && <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Premium;
