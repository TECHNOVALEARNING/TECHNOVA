import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/site/shared";
import { ExternalLink, CheckCircle2, Sparkles, Smartphone, Shield, Code, Cpu, Download, MessageSquare } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface AppCard {
  title: string;
  category: string;
  desc: string;
  image: string;
  tags: string[];
  stats: string;
  url: string;
  features: string[];
  buttonText?: string;
  buttonIcon?: "contact" | "download" | "external";
  upcoming?: boolean;
}

const TechnovaApps = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const apps: AppCard[] = [
    {
      title: "TECHNOVA Learning",
      category: lang === "fr" ? "Plateforme Web" : "Web Platform",
      desc:
        lang === "fr"
          ? "Plateforme de cours en ligne avec paiements sécurisés par Mobile Money et accès instantané aux formations."
          : "Online course platform with secure Mobile Money payments and instant access to courses.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      tags: ["React 18", "TypeScript", "Supabase", "Tailwind CSS", "Mobile Money"],
      stats: lang === "fr" ? "+2 000 utilisateurs" : "+2,000 users",
      url: "https://technovalearning.com",
      features: [
        lang === "fr" ? "Streaming vidéo HD" : "HD video streaming",
        lang === "fr" ? "Suivi de progression" : "Progress tracking",
        lang === "fr" ? "Attestations officielles" : "Official Attestations",
      ],
    },
    {
      title: "GestCour by Technova",
      category: lang === "fr" ? "Template Web & Workflow" : "Web & Workflow Template",
      desc:
        lang === "fr"
          ? "Solution web clé en main dédiée à la gestion, au suivi hiérarchique (workflow de visa 5 étapes) et à l'archivage du courrier arrivé et départ pour PME, entreprises et administrations."
          : "Turnkey web solution for incoming/outgoing mail management, 5-step hierarchical visa workflow, and archiving for SMEs, enterprises, and public administrations.",
      image: "/gestcour-mockup.png",
      tags: ["Template Web", "IndexedDB", "React 18", "Workflow Visa", "Audit Log"],
      stats: lang === "fr" ? "Template Clé en Main" : "Turnkey Template",
      url: "https://wa.me/22947883735?text=Bonjour%20TECHNOVA,%20je%20souhaite%20acheter%20le%20template%20GestCour%20by%20Technova.",
      buttonText: lang === "fr" ? "Acheter le Template" : "Purchase Template",
      buttonIcon: "contact",
      features: [
        lang === "fr" ? "Tableau de Bord Analytics 360° & Chart.js" : "360° Analytics Dashboard & Chart.js",
        lang === "fr" ? "Workflow de Visa Hiérarchique 5 Étapes" : "5-Step Hierarchical Visa Workflow",
        lang === "fr" ? "100% Autonome & Hors-ligne (IndexedDB)" : "100% Autonomous & Offline (IndexedDB)",
        lang === "fr" ? "Échéances, Relances & Exports PDF/Excel" : "Deadlines, Reminders & PDF/Excel Exports",
        lang === "fr" ? "License à vie sans base de données: 100 000 FCFA" : "Lifetime License without Database: 100,000 FCFA",
        
      ],
    },
    {
      title: "Mots Mêlés Android",
      category: lang === "fr" ? "Application Android (APK)" : "Android App (APK)",
      desc:
        lang === "fr"
          ? "Jeu captivant de Mots Mêlés stimulant la réflexion, la mémoire et la concentration. Téléchargement direct de l'APK officiel."
          : "Engaging Word Search puzzle game to boost focus, memory, and vocabulary. Direct official APK download.",
      image: "https://i.pinimg.com/736x/f1/07/c4/f107c4f3298db3dcbbd041c22bf51b31.jpg",
      tags: ["Android APK", "Jeu", "Mots Mêlés", "Hors-ligne"],
      stats: lang === "fr" ? "Téléchargement APK" : "APK Download",
      url: "https://github.com/precieuxAyelesso/Mots-m-l-s-/releases/download/v1.0/base.apk",
      features: [
        lang === "fr" ? "Installation APK Android" : "Android APK Installation",
        lang === "fr" ? "Fonctionne 100% Hors-ligne" : "100% Offline Game",
        lang === "fr" ? "Gratuit & Sans abonnement" : "Free & Subscription-free",
      ],
    },
    {
      title: "Technova Humanizer",
      category: lang === "fr" ? "Intelligence Artificielle" : "Artificial Intelligence",
      desc:
        lang === "fr"
          ? "Outil d'intelligence artificielle conçu pour humaniser les textes générés par IA afin d'éviter la détection automatique."
          : "AI tool designed to humanize AI-generated text to bypass automated detection algorithms.",
      image: "https://images.unsplash.com/photo-1675557009875-436f0978cf2a?w=800&q=80",
      tags: ["React 18", "TypeScript", "Supabase", "Tailwind CSS", "Mobile Money", "Technova Humanizer"],
      stats: lang === "fr" ? "0.8s temps de charge" : "0.8s load time",
      url: "https://humanizerai.space",
      features: [
        lang === "fr" ? "Haute précision sémantique" : "High semantic accuracy",
        lang === "fr" ? "Zéro plagiat" : "Zero plagiarism",
        lang === "fr" ? "Multi-langues" : "Multi-language support",
      ],
    },
    {
      title: "Viral IA Agent",
      category: lang === "fr" ? "Automatisation & IA" : "Automation & AI",
      desc:
        lang === "fr"
          ? "Agent conversationnel IA de viralisation et d'optimisation de contenu pour les réseaux sociaux."
          : "AI conversational agent for viralization and optimization of social media content.",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
      tags: ["A venir"],
      stats: lang === "fr" ? "En développement" : "In development",
      url: "#",
      upcoming: true,
      features: [
        lang === "fr" ? "Analyse de viralité" : "Virality analysis",
        lang === "fr" ? "Génération de scripts" : "Script generation",
      ],
    },
    {
      title: "Sonorya by Technova",
      category: lang === "fr" ? "IA & Création Musicale Sur Mesure" : "AI & Custom Music Creation",
      desc:
        lang === "fr"
          ? "Plateforme intelligente de création de chansons personnalisées uniques pour vos événements spéciaux (anniversaires, mariages, déclarations)."
          : "Smart platform for generating unique custom songs for special events (birthdays, weddings, romantic declarations).",
      image: "/sonorya_cover.jpeg",
      tags: ["Cloudflare D1", "React", "IA Générative", "Mobile Money"],
      stats: lang === "fr" ? "Chansons Sur Mesure" : "Custom Songs",
      url: "https://www.sonorya.co",
      features: [
        lang === "fr" ? "Génération musicale personnalisée" : "Custom AI music generation",
        lang === "fr" ? "Paroles & histoire sur mesure" : "Custom lyrics & story",
        lang === "fr" ? "Paiements Mobile Money & CB" : "Mobile Money & Card payments",
      ],
    },
    {
      title: "TECHNOVA QCM",
      category: lang === "fr" ? "Plateforme de Jeu & QCM" : "Quiz & Trivia Platform",
      desc:
        lang === "fr"
          ? "Plateforme de jeu de QCM interactive pour tester ses connaissances, relever des défis et s'entraîner en ligne."
          : "Interactive quiz and trivia platform to test knowledge, take challenges, and practice online.",
      image: "/qcm-cover.jpg",
      tags: ["React", "QCM", "Quiz Interactif", "Vercel"],
      stats: lang === "fr" ? "Quiz Interactifs" : "Interactive Quizzes",
      url: "https://technovaqcm.vercel.app",
      features: [
        lang === "fr" ? "Jeu de QCM interactif" : "Interactive quiz gaming",
        lang === "fr" ? "Suivi des scores & résultats" : "Score & results tracking",
        lang === "fr" ? "Multiples catégories de test" : "Multiple test categories",
      ],
    },
    {
      title: "GAME EARN",
      category: lang === "fr" ? "Gaming & Récompenses" : "Gaming & Rewards",
      desc:
        lang === "fr"
          ? "Plateforme de gaming permettant de jouer et de gagner des récompenses exclusives."
          : "Gaming platform allowing players to play and earn exclusive rewards.",
      image: "/game-earn-cover.jpg",
      tags: ["A venir"],
      stats: lang === "fr" ? "En développement" : "In development",
      url: "#",
      upcoming: true,
      features: [
        lang === "fr" ? "Jouez & Gagnez des récompenses" : "Play & Earn rewards",
        lang === "fr" ? "Tournois & Défis en ligne" : "Online tournaments & challenges",
        lang === "fr" ? "Système de points & gains" : "Points & earnings system",
      ],
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{
        background: "var(--bg, #f2f2f7)",
        color: "var(--text, #1d1d1f)",
        fontFamily: "'Manrope', -apple-system, sans-serif",
      }}
    >
      <SEOHead
        canonicalPath="/apps"
        title={
          lang === "fr"
            ? "Technova Apps · Applications & Outils Digitaux"
            : "Technova Apps · Applications & Digital Tools"
        }
        description={
          lang === "fr"
            ? "Découvrez l'écosystème d'applications et de solutions logicielles créées par TECHNOVA pour accélérer votre transition digitale."
            : "Discover the ecosystem of applications and software solutions built by TECHNOVA to accelerate your digital transition."
        }
      />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text)] leading-[1.15] mb-6"
            >
              {lang === "fr" ? (
                <>
                  Notre Écosystème d'
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Applications
                  </span>
                </>
              ) : (
                <>
                  Our Ecosystem of{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Applications
                  </span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
              {lang === "fr"
                ? "Explorez les applications innovantes et plateformes web conçues par TECHNOVA pour transformer vos activités digitales et booster votre productivité."
                : "Explore innovative applications and web platforms built by TECHNOVA to transform your digital activities and boost your productivity."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Apps Showcase Grid */}
      <section className="py-10 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden h-full"
              >
                <div>
                  {/* High Prominence Image Header */}
                  <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={app.image}
                      alt={app.title}
                      className={`w-full h-full ${
                        app.image.includes("sonorya")
                          ? "object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                          : "object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (app.image.includes("sonorya")) {
                          target.src = "/sonorya-logo.png";
                        } else {
                          target.src =
                            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80";
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm z-10">
                      {app.category}
                    </span>
                  </div>

                  {/* Compact Card Body */}
                  <div className="p-5">
                    <h3 className="font-extrabold text-lg text-foreground mb-2 group-hover:text-primary transition-colors font-display truncate">
                      {app.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {app.desc}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-4 bg-muted/40 p-3 rounded-xl border border-border/40">
                      {app.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium truncate">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="p-5 pt-0 mt-auto">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {app.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {app.stats}
                    </span>
                    {app.upcoming || app.url === "#" || app.tags.includes("A venir") ? (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-muted text-muted-foreground opacity-60 cursor-not-allowed shadow-none shrink-0 border border-border/50"
                      >
                        <span>{lang === "fr" ? "Bientôt disponible" : "Coming soon"}</span>
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      </button>
                    ) : (
                      <a
                        href={app.url}
                        target={app.url.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        download={app.url.endsWith(".apk") ? "mots-meles-technova.apk" : undefined}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white transition-all duration-200 shadow-sm shrink-0 ${
                          app.buttonIcon === "contact"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-primary hover:bg-primary/95"
                        }`}
                      >
                        {app.buttonText
                          ? app.buttonText
                          : app.url.endsWith(".apk")
                            ? lang === "fr"
                              ? "Télécharger l'APK"
                              : "Download APK"
                            : lang === "fr"
                              ? "Ouvrir l'application"
                              : "Open Application"}
                        {app.buttonIcon === "contact" ? (
                          <MessageSquare className="h-3.5 w-3.5" />
                        ) : app.url.endsWith(".apk") ? (
                          <Download className="h-3.5 w-3.5" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TechnovaApps;
