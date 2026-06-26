import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/site/shared";
import { ExternalLink, CheckCircle2, Sparkles, Smartphone, Shield, Code, Cpu } from "lucide-react";
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
}

const TechnovaApps = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const apps: AppCard[] = [
    {
      title: "TECHNOVA Learning",
      category: lang === "fr" ? "Plateforme Web" : "Web Platform",
      desc: lang === "fr"
        ? "Plateforme de cours en ligne avec paiements sécurisés par Mobile Money et accès instantané aux formations."
        : "Online course platform with secure Mobile Money payments and instant access to courses.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      tags: ["React 18", "TypeScript", "Supabase", "Tailwind CSS", "Mobile Money"],
      stats: lang === "fr" ? "+2 000 utilisateurs" : "+2,000 users",
      url: "https://technovalearning.com",
      features: [
        lang === "fr" ? "Streaming vidéo HD" : "HD video streaming",
        lang === "fr" ? "Suivi de progression" : "Progress tracking",
        lang === "fr" ? "Attestations officielles" : "Official Attestations"
      ]
    },
    {
      title: "Technova Humanizer",
      category: lang === "fr" ? "Intelligence Artificielle" : "Artificial Intelligence",
      desc: lang === "fr"
        ? "Outil d'intelligence artificielle conçu pour humaniser les textes générés par IA afin d'éviter la détection automatique."
        : "AI tool designed to humanize AI-generated text to bypass automated detection algorithms.",
      image: "https://images.unsplash.com/photo-1675557009875-436f0978cf2a?w=800&q=80",
      tags: ["React 19", "Express (Node.js)", "Tailwind v4", "Gemini API"],
      stats: lang === "fr" ? "0.8s temps de charge" : "0.8s load time",
      url: "https://humanizer-ai-technova.vercel.app",
      features: [
        lang === "fr" ? "Haute précision sémantique" : "High semantic accuracy",
        lang === "fr" ? "Zéro plagiat" : "Zero plagiarism",
        lang === "fr" ? "Multi-langues" : "Multi-language support"
      ]
    },
    {
      title: "Viral IA Agent",
      category: lang === "fr" ? "Automatisation & IA" : "Automation & AI",
      desc: lang === "fr"
        ? "Agent conversationnel IA de viralisation et d'optimisation de contenu pour les réseaux sociaux."
        : "AI conversational agent for viralization and optimization of social media content.",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
      tags: ["A venir"],
      stats: lang === "fr" ? "92% taux de clic" : "92% CTR rate",
      url: "#",
      features: [
        lang === "fr" ? "Analyse de viralité" : "Virality analysis",
        lang === "fr" ? "Génération de scripts" : "Script generation",
      ]
    },
    {
      title: "Productivity Tools Suite",
      category: lang === "fr" ? "Utilitaires Web" : "Web Utilities",
      desc: lang === "fr"
        ? "Un ensemble d'applications web gratuites et d'outils digitaux pour booster la productivité de vos équipes."
        : "A set of free web applications and digital tools to boost your team's productivity.",
      image: "https://i.pinimg.com/1200x/3b/c0/c5/3bc0c5e5cb3b8b85b448c7869823b35d.jpg",
      tags: ["Applications", "Outils digitaux"],
      stats: lang === "fr" ? "Gratuit à vie" : "Free forever",
      url: "/outils-digitaux",
      features: [
        lang === "fr" ? "CamScanner Pro" : "CamScanner Pro",
        lang === "fr" ? "FL Studio 2022" : "FL Studio 2022",
        lang === "fr" ? "Duolingo Pro" : "Duolingo Pro"
      ]
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        canonicalPath="/apps"
        title={lang === "fr" ? "Technova Apps · Applications & Outils Digitaux" : "Technova Apps · Applications & Digital Tools"}
        description={lang === "fr" 
          ? "Découvrez l'écosystème d'applications et de solutions logicielles créées par TECHNOVA pour accélérer votre transition digitale." 
          : "Discover the ecosystem of applications and software solutions built by TECHNOVA to accelerate your digital transition."}
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

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text)] font-display leading-[1.15] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {lang === "fr" ? (
                <>Notre Écosystème d'<span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Applications</span></>
              ) : (
                <>Our Ecosystem of <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Applications</span></>
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
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {apps.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="course-card flex flex-col justify-between"
              >
                <div>
                  <div className="course-img-wrap h-64 relative overflow-hidden">
                    <img 
                      src={app.image} 
                      alt={app.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80";
                      }}
                    />
                    <span className="course-badge">
                      {app.category}
                    </span>
                  </div>
                  
                  <div className="course-body p-6">
                    <h3 className="font-bold text-xl mb-3 text-[color:var(--text)] font-display" style={{ fontFamily: "'Outfit', sans-serif" }}>{app.title}</h3>
                    <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-6">{app.desc}</p>
                    
                    <div className="space-y-3 mb-6">
                      {app.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[color:var(--divider)]">
                  <div className="flex flex-wrap gap-1.5 mb-5 pt-4">
                    {app.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-lg bg-muted text-[10px] text-muted-foreground font-mono font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-bold tracking-wide">
                      {app.stats}
                    </span>
                    <a
                      href={app.url}
                      target={app.url.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-glow transition-all duration-200"
                    >
                      {lang === "fr" ? "Ouvrir l'application" : "Open Application"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
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
