import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Filter,
  Newspaper,
} from "lucide-react";
import { Link } from "react-router-dom";

// Fallback articles displayed when the NewsData.io API is unavailable (e.g. local dev without Vercel)
const FALLBACK_ARTICLES = [
  {
    id: "ia-generative-transforme-entreprises-francaises",
    title: "L'IA générative transforme les entreprises françaises : bilan et perspectives",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    excerpt:
      "De la rédaction automatique à l'analyse prédictive, l'intelligence artificielle générative s'impose dans tous les secteurs. Les entreprises françaises accélèrent leur adoption avec des résultats concrets...",
    date: "24 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "levees-fonds-tech-europe-record-2026",
    title: "Les levées de fonds tech en Europe atteignent un record historique en 2026",
    category: "Business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    excerpt:
      "L'écosystème tech européen confirme sa montée en puissance avec plus de 45 milliards d'euros levés au premier semestre 2026, porté par l'IA, la cybersécurité et les cleantech...",
    date: "23 juin 2026",
    readingTime: "7 min",
  },
  {
    id: "chatgpt-depasse-2-milliards-utilisateurs",
    title: "ChatGPT franchit le cap des 2 milliards d'utilisateurs actifs mensuels",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
    excerpt:
      "OpenAI annonce que ChatGPT a dépassé les 2 milliards d'utilisateurs actifs mensuels, confirmant l'adoption massive de l'IA conversationnelle dans le quotidien des internautes du monde entier...",
    date: "22 juin 2026",
    readingTime: "5 min",
  },
  {
    id: "ordinateur-quantique-google-avancee-majeure",
    title: "Google dévoile une avancée majeure en informatique quantique",
    category: "Science",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    excerpt:
      "Le nouveau processeur quantique de Google résout en minutes des calculs qui prendraient des milliers d'années aux supercalculateurs classiques. Une étape décisive vers l'informatique quantique pratique...",
    date: "21 juin 2026",
    readingTime: "8 min",
  },
  {
    id: "apple-vision-pro-2-annonce-wwdc",
    title: "Apple annonce le Vision Pro 2 avec un prix enfin accessible",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800&q=80",
    excerpt:
      "Lors de la WWDC 2026, Apple a présenté la deuxième génération de son casque de réalité mixte à un prix divisé par deux. Un pari pour démocratiser le spatial computing...",
    date: "20 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "regulation-ia-mondiale-g7-accord-historique",
    title: "Le G7 signe un accord historique pour la régulation mondiale de l'IA",
    category: "World",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    excerpt:
      "Les dirigeants du G7 ont adopté un cadre commun pour encadrer le développement et l'utilisation de l'intelligence artificielle, avec des principes de transparence et de sécurité...",
    date: "19 juin 2026",
    readingTime: "9 min",
  },
  {
    id: "cybersecurite-attaques-ransomware-hausse-2026",
    title: "Cybersécurité : les attaques ransomware en hausse de 60% en 2026",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    excerpt:
      "Les experts en cybersécurité alertent sur l'explosion des attaques par rançongiciel, de plus en plus sophistiquées grâce à l'IA. Les PME sont particulièrement vulnérables face à cette menace grandissante...",
    date: "18 juin 2026",
    readingTime: "7 min",
  },
  {
    id: "tesla-robot-optimus-production-masse",
    title: "Tesla lance la production de masse de son robot humanoïde Optimus",
    category: "Business",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    excerpt:
      "Elon Musk annonce le début de la production industrielle du robot Optimus, avec un objectif de 10 000 unités d'ici fin 2026. Le robot sera d'abord déployé dans les usines Tesla...",
    date: "17 juin 2026",
    readingTime: "5 min",
  },
  {
    id: "sante-numerique-ia-diagnostic-medical",
    title: "L'IA surpasse les médecins dans le diagnostic de certains cancers",
    category: "Health",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    excerpt:
      "Une étude publiée dans The Lancet démontre que les systèmes d'IA d'imagerie diagnostiquent certains cancers avec une précision de 97%, dépassant les performances des radiologues les plus expérimentés...",
    date: "16 juin 2026",
    readingTime: "6 min",
  },
];

const CATEGORIES = [
  { slug: "All", fr: "Tout", en: "All", faIcon: "fa-solid fa-layer-group" },
  { slug: "technology", fr: "Technologie", en: "Technology", faIcon: "fa-solid fa-laptop-code" },
  { slug: "business", fr: "Business", en: "Business", faIcon: "fa-solid fa-briefcase" },
  { slug: "science", fr: "Science", en: "Science", faIcon: "fa-solid fa-flask" },
  { slug: "health", fr: "Santé", en: "Health", faIcon: "fa-solid fa-heart-pulse" },
  { slug: "entertainment", fr: "Divertissement", en: "Entertainment", faIcon: "fa-solid fa-clapperboard" },
  { slug: "sports", fr: "Sports", en: "Sports", faIcon: "fa-solid fa-trophy" },
  { slug: "world", fr: "Monde", en: "World", faIcon: "fa-solid fa-globe" },
];

export default function Actualites() {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(false);
      try {
        const url =
          selectedCategory === "All" ? "/api/blog" : `/api/blog?category=${selectedCategory}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("HTTP error");
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setArticles(data.length > 0 ? data : FALLBACK_ARTICLES);
          } else {
            setArticles(FALLBACK_ARTICLES);
          }
        } else {
          setArticles(FALLBACK_ARTICLES);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamically, using fallback data:", err);
        setArticles(FALLBACK_ARTICLES);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      article.title.toLowerCase().includes(query) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
      (article.category && article.category.toLowerCase().includes(query))
    );
  });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans" style={{ fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        title={
          lang === "fr"
            ? "Actualités TECHNOVA | Tech News, Business & Innovation"
            : "TECHNOVA News | Tech News, Business & Innovation"
        }
        description={
          lang === "fr"
            ? "Suivez toute l'actualité informatique, les nouveautés high tech, internet, et business décryptés par TECHNOVA."
            : "Follow all computer news, high tech innovations, web trends and business decrypted by TECHNOVA."
        }
      />
      <Header />

      <main className="flex-1 bg-background pt-24 pb-16">
        <section className="relative overflow-hidden pt-12 md:pt-16 pb-8">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-6 font-display"
            >
              {lang === "fr" ? "Le Fil d'" : "The Feed of "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-cyan-500">
                {lang === "fr" ? "Actualités" : "News"}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
            >
              {lang === "fr"
                ? "Décryptage en temps réel des innovations technologiques, du business international et des tendances de demain."
                : "Real-time analysis of technology innovations, international business, and tomorrow's trends."}
            </motion.p>
          </div>
        </section>

        {/* Categories slider */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar justify-start md:justify-center border-b border-border/50">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === c.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <i className={`${c.faIcon} text-xs`} />
                <span>{lang === "fr" ? c.fr : c.en}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={lang === "fr" ? "Rechercher une actualité..." : "Search news..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
            />
          </div>
        </div>

        {/* Grid and Loading */}
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-10">
              <div className="h-96 rounded-3xl bg-muted/40 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-lg font-semibold mb-1">
                {lang === "fr" ? "Aucune actualité trouvée" : "No news articles found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Essayez une autre recherche ou une autre catégorie."
                  : "Try another search query or a different category."}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured article */}
              {featuredArticle && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-border bg-card/50 overflow-hidden p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="lg:col-span-7 aspect-video lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden relative">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      {featuredArticle.category}
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {featuredArticle.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredArticle.readingTime}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black leading-tight group-hover:text-primary transition-colors font-display">
                      <Link to={`/actualites/${featuredArticle.id}`}>{featuredArticle.title}</Link>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div>
                      <Link
                        to={`/actualites/${featuredArticle.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all"
                      >
                        {lang === "fr" ? "Lire l'article" : "Read article"}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Grid articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(searchQuery ? filteredArticles : gridArticles).map((a, idx) => (
                  <motion.article
                    key={a.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex flex-col rounded-2xl border border-border bg-card/30 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-secondary/95 backdrop-blur-sm text-foreground text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-border">
                        {a.category}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {a.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {a.readingTime}
                          </span>
                        </div>
                        <h3 className="font-extrabold font-display leading-snug text-base group-hover:text-primary transition-colors line-clamp-2">
                          <Link to={`/actualites/${a.id}`}>{a.title}</Link>
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                          {a.excerpt}
                        </p>
                      </div>
                      <div>
                        <Link
                          to={`/actualites/${a.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all"
                        >
                          {lang === "fr" ? "Lire la suite" : "Read more"}{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
