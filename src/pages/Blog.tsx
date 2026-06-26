import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Sparkles, Filter, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

// Pre-populated real articles from siecledigital.fr to act as a fallback and ensure local dev is perfect
const FALLBACK_ARTICLES = [
  {
    id: "intelligence-artificielle-coute-plus-cher-salarie",
    title: "Pourquoi l'intelligence artificielle coûte parfois plus cher qu'un salarié",
    category: "Intelligence Artificielle",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    excerpt: "L'essor de l'IA générative pousse de nombreuses entreprises à investir massivement dans ces technologies, mais les coûts réels d'infrastructure, de formation et de maintenance dépassent souvent les attentes initiales...",
    date: "24 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "fuite-donnees-24-milliards-identifiants-exposes",
    title: "Fuite de données : 24 milliards d'identifiants exposés sur le dark web",
    category: "Cybersécurité",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    excerpt: "Une base de données colossale contenant 24 milliards d'identifiants volés a été découverte sur le dark web. Retour sur l'une des plus grandes fuites de l'histoire numérique et ses conséquences pour les utilisateurs...",
    date: "25 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "francais-preferent-ia-recherches-en-ligne",
    title: "Les Français préfèrent désormais l'IA pour leurs recherches en ligne",
    category: "Intelligence Artificielle",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
    excerpt: "Une étude récente révèle un basculement majeur : plus de la moitié des internautes français déclarent préférer les réponses générées par l'IA aux résultats de recherche classiques de Google...",
    date: "23 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "agents-ia-menacent-relation-marques-clients",
    title: "69% des marketeurs craignent que les agents IA ne s'interposent entre les marques et leurs clients",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    excerpt: "Selon une étude menée auprès de responsables marketing en Europe, une majorité écrasante redoute que les agents IA et les LLM créent une barrière entre les marques et leurs audiences...",
    date: "22 juin 2026",
    readingTime: "8 min"
  },
  {
    id: "tiktok-lance-fonctionnalite-commerce-social",
    title: "TikTok lance une nouvelle fonctionnalité de commerce social qui change la donne",
    category: "Réseaux Sociaux",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    excerpt: "TikTok accélère sa stratégie e-commerce avec une nouvelle fonctionnalité permettant aux créateurs de vendre directement depuis leurs vidéos. Une révolution pour le social commerce en France...",
    date: "21 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "apple-intelligence-disponible-france-wwdc",
    title: "Apple Intelligence enfin disponible en France : ce qu'il faut savoir",
    category: "Technologie",
    image: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800&q=80",
    excerpt: "Lors de la WWDC 2026, Apple a annoncé le déploiement d'Apple Intelligence en français. Siri repensé, résumé automatique, génération d'images — tour d'horizon des fonctionnalités qui arrivent sur iPhone...",
    date: "20 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "startups-francaises-ia-levees-fonds-record",
    title: "Les startups françaises de l'IA battent des records de levées de fonds en 2026",
    category: "Business",
    image: "https://images.unsplash.com/photo-1553729459-uj1xhkap7v0?w=800&q=80",
    excerpt: "L'écosystème français de l'intelligence artificielle connaît une dynamique sans précédent avec plus de 3 milliards d'euros levés au premier semestre 2026. Mistral AI, Hugging Face et les nouveaux champions...",
    date: "19 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "regulation-ia-europe-ai-act-premiers-effets",
    title: "L'AI Act européen entre en vigueur : premiers effets concrets sur les entreprises",
    category: "Société",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    excerpt: "La réglementation européenne sur l'intelligence artificielle commence à produire ses effets. Entre obligations de transparence, classifications de risques et premières amendes, le paysage se redessine...",
    date: "18 juin 2026",
    readingTime: "9 min"
  },
  {
    id: "meta-threads-depasse-twitter-europe",
    title: "Threads dépasse officiellement X (Twitter) en nombre d'utilisateurs actifs en Europe",
    category: "Réseaux Sociaux",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    excerpt: "Pour la première fois, Threads de Meta a dépassé X en nombre d'utilisateurs actifs mensuels sur le continent européen. Un basculement qui redéfinit le paysage des réseaux sociaux textuels...",
    date: "17 juin 2026",
    readingTime: "5 min"
  }
];

const CATEGORIES = [
  { slug: "All", fr: "Tout", en: "All", emoji: "✨" },
  { slug: "intelligence-artificielle", fr: "Intelligence Artificielle", en: "AI", emoji: "🤖" },
  { slug: "marketing", fr: "Marketing", en: "Marketing", emoji: "📈" },
  { slug: "technologie", fr: "Technologie", en: "Technology", emoji: "💻" },
  { slug: "cybersecurite", fr: "Cybersécurité", en: "Cybersecurity", emoji: "🔒" },
  { slug: "reseaux-sociaux", fr: "Réseaux Sociaux", en: "Social Media", emoji: "📱" },
  { slug: "business", fr: "Business", en: "Business", emoji: "💼" },
  { slug: "societe", fr: "Société", en: "Society", emoji: "🌍" }
];

export default function Blog() {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
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
        // Build query string depending on category
        const url = selectedCategory === "All" 
          ? "/api/blog" 
          : `/api/blog?category=${selectedCategory}`;

        const res = await fetch(url);
        
        // If serverless is not configured (ex: local vite dev server without vercel dev),
        // it might return index.html content (200 OK but HTML) or 404. Let's verify JSON format.
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
          // Fallback to static articles
          setArticles(FALLBACK_ARTICLES);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamically, using fallback data:", err);
        setArticles(FALLBACK_ARTICLES);
      } finally {
        // Small timeout for premium loading transition
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  // Filter articles locally based on search query
  const filteredArticles = articles.filter(article => {
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <SEOHead 
        title={lang === "fr" ? "Blog TECHNOVA | Actualités, High Tech & Innovation" : "TECHNOVA Blog | News, High Tech & Innovation"}
        description={lang === "fr" ? "Suivez toute l'actualité informatique, les nouveautés high tech, internet, jeux vidéo et marketing digital décryptés par TECHNOVA." : "Follow all computer news, high tech innovations, web trends, video games and digital marketing decrypted by TECHNOVA."}
      />
      <Header />

      <main className="flex-1 bg-background pt-24 pb-16">
        {/* Hero Section */}
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
              {lang === "fr" ? "Le Hub de l'" : "The Hub of "} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-cyan-500">
                {lang === "fr" ? "Innovation" : "Innovation"}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg max-w-2xl mx-auto text-muted-foreground leading-relaxed"
            >
              {lang === "fr" 
                ? "Décryptage des tendances du futur : intelligence artificielle, smartphones, matériel innovant, marketing digital et culture du jeu vidéo."
                : "Decrypting the trends of the future: artificial intelligence, smartphones, innovative hardware, digital marketing and gaming culture."}
            </motion.p>
          </div>
        </section>

        {/* Filters and Search Bar Section */}
        <section className="container mx-auto px-4 my-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-3xl border border-border/80 bg-card/50 backdrop-blur-md shadow-elegant">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher un article..." : "Search articles..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0 scroll-smooth">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0 px-2 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setSearchQuery(""); // Reset search query on category switch
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm hover:scale-102 active:scale-98 ${
                      isActive 
                        ? "bg-primary-gradient text-white shadow-glow" 
                        : "bg-background hover:bg-muted border border-border text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <span>{lang === "fr" ? cat.fr : cat.en}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </section>

        {/* Main Content Section */}
        <section className="container mx-auto px-4 mt-12 min-h-[400px]">
          {loading ? (
            /* Loading Skeleton States */
            <div>
              {/* Featured article skeleton */}
              <div className="grid md:grid-cols-12 gap-8 mb-16 animate-pulse p-4 rounded-3xl border border-border/50 bg-card/20">
                <div className="md:col-span-7 aspect-[16/9] md:aspect-auto md:h-96 rounded-2xl bg-muted" />
                <div className="md:col-span-5 flex flex-col justify-center space-y-4">
                  <div className="h-4 w-24 bg-muted rounded-full" />
                  <div className="h-8 w-full bg-muted rounded-xl" />
                  <div className="h-4 w-3/4 bg-muted rounded-full" />
                  <div className="h-16 w-full bg-muted rounded-xl" />
                  <div className="h-10 w-36 bg-muted rounded-xl" />
                </div>
              </div>

              {/* Grid skeleton */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col space-y-4 border border-border/50 bg-card/20 p-4 rounded-3xl animate-pulse">
                    <div className="aspect-[16/10] bg-muted rounded-2xl" />
                    <div className="h-4 w-20 bg-muted rounded-full" />
                    <div className="h-6 w-full bg-muted rounded-xl" />
                    <div className="h-12 w-full bg-muted rounded-xl" />
                    <div className="h-4 w-1/2 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground shadow-inner">
                <Newspaper className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {lang === "fr" ? "Aucun article trouvé" : "No articles found"}
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {lang === "fr" 
                  ? "Nous n'avons pas trouvé d'articles correspondant à votre recherche. Essayez d'autres mots-clés."
                  : "We couldn't find any articles matching your search criteria. Try using different keywords."}
              </p>
              <button 
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
              >
                {lang === "fr" ? "Réinitialiser les filtres" : "Reset Filters"}
              </button>
            </motion.div>
          ) : (
            /* Render Articles */
            <>
              {/* Featured / Hero Article */}
              {featuredArticle && searchQuery === "" && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="group grid md:grid-cols-12 gap-8 mb-16 p-4 rounded-3xl border border-border/85 bg-card/40 hover:bg-card/70 hover:border-primary/20 backdrop-blur-sm shadow-elegant hover:shadow-elegant-dark transition-all duration-500 overflow-hidden"
                >
                  <div className="md:col-span-7 overflow-hidden rounded-2xl relative aspect-[16/10] md:aspect-auto md:h-96 shadow-soft">
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 pointer-events-none" />
                  </div>

                  <div className="md:col-span-5 flex flex-col justify-center p-2">
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {featuredArticle.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredArticle.readingTime}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
                      <Link to={`/blog/${featuredArticle.id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {featuredArticle.date}
                      </span>
                      <Link 
                        to={`/blog/${featuredArticle.id}`}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/95 shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 transition-all"
                      >
                        <span>{lang === "fr" ? "Lire l'article" : "Read Article"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Grid of Other Articles */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {(searchQuery !== "" ? filteredArticles : gridArticles).map((article, index) => (
                    <motion.article 
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group flex flex-col bg-card/45 backdrop-blur-sm border border-border/80 rounded-3xl shadow-soft hover:shadow-elegant hover:border-primary/20 transition-all duration-300 overflow-hidden"
                    >
                      <Link to={`/blog/${article.id}`} className="aspect-[16/10] overflow-hidden relative block shadow-inner-soft">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-card/90 backdrop-blur-md text-foreground border border-border">
                          {article.category}
                        </span>
                      </Link>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readingTime}
                            </span>
                          </div>

                          <h3 className="font-bold text-lg mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            <Link to={`/blog/${article.id}`}>
                              {article.title}
                            </Link>
                          </h3>

                          <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                          <Link 
                            to={`/blog/${article.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline"
                          >
                            <span>{lang === "fr" ? "En savoir plus" : "Learn more"}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                          
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
