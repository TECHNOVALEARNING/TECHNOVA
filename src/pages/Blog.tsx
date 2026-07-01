import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Sparkles, Filter, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

// Fallback articles displayed when the NewsData.io API is unavailable
const BLOG_ARTICLES = [
  {
    id: "devenir-developpeur-fullstack-2026",
    title: "Le guide ultime pour devenir Développeur Full-Stack en 2026",
    category: "Développement",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    excerpt: "La demande de développeurs polyvalents ne faiblit pas. Découvrez le parcours d'apprentissage, les langages clés (TypeScript, Next.js) et les compétences indispensables pour vous lancer cette année...",
    date: "30 juin 2026",
    readingTime: "8 min"
  },
  {
    id: "intelligence-artificielle-productivite",
    title: "Comment doubler votre productivité avec l'Intelligence Artificielle au quotidien",
    category: "IA & Data",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    excerpt: "L'IA n'est pas réservée aux experts. Apprenez à intégrer ChatGPT, Claude et Midjourney dans vos flux de travail pour gagner des heures précieuses chaque jour...",
    date: "28 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "securiser-donnees-entreprise",
    title: "Sécuriser ses données en ligne : 5 bonnes pratiques indispensables",
    category: "Cybersécurité",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    excerpt: "À l'ère du travail hybride, la cybersécurité est l'affaire de tous. Protégez votre entreprise et vos données personnelles contre les attaques de phishing et les ransomwares...",
    date: "25 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "reussir-transition-tech",
    title: "Réussir sa transition professionnelle dans le digital : témoignages et conseils",
    category: "Carrière",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    excerpt: "Vous songez à vous reconvertir ? De nombreux professionnels ont sauté le pas vers le design, le code ou le marketing. Découvrez leurs clés de succès et nos formations adaptées...",
    date: "22 juin 2026",
    readingTime: "7 min"
  }
];

const CATEGORIES = [
  { slug: "All", fr: "Tout", en: "All", emoji: "✨" },
  { slug: "Développement", fr: "Développement", en: "Development", emoji: "💻" },
  { slug: "IA & Data", fr: "IA & Data", en: "AI & Data", emoji: "🤖" },
  { slug: "Cybersécurité", fr: "Cybersécurité", en: "Cybersecurity", emoji: "🔒" },
  { slug: "Carrière", fr: "Carrière", en: "Career", emoji: "💼" }
];

export default function Blog() {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <SEOHead 
        title={lang === "fr" ? "Blog TECHNOVA | Guides, Tutoriels & Compétences Digitales" : "TECHNOVA Blog | Digital Skills, Guides & Tutorials"}
        description={lang === "fr" ? "Retrouvez nos guides complets, tutoriels pratiques et astuces de carrière rédigés par les experts de TECHNOVA." : "Find our detailed guides, hands-on tutorials, and career tips written by TECHNOVA experts."}
      />
      <Header />

      <main className="flex-1 bg-background pt-24 pb-16">
        <section className="relative overflow-hidden pt-12 md:pt-16 pb-8">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-6 font-display"
            >
              {lang === "fr" ? "Le Blog " : "The TECHNOVA "} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
                TECHNOVA
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
            >
              {lang === "fr" 
                ? "Développez vos compétences avec nos tutoriels, retours d'expérience et guides pratiques sur la tech, le design et l'IA."
                : "Level up your skills with our tutorials, feedback, and practical guides on tech, design, and AI."}
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
                <span>{c.emoji}</span>
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
              placeholder={lang === "fr" ? "Rechercher un article..." : "Search blog..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-lg font-semibold mb-1">
                {lang === "fr" ? "Aucun article trouvé" : "No articles found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "fr" ? "Essayez une autre recherche ou une autre catégorie." : "Try another search query or a different category."}
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
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featuredArticle.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featuredArticle.readingTime}</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black leading-tight group-hover:text-primary transition-colors font-display">
                      <Link to={`/blog/${featuredArticle.id}`}>{featuredArticle.title}</Link>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div>
                      <Link to={`/blog/${featuredArticle.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        {lang === "fr" ? "Lire l'article" : "Read article"} <ArrowRight className="h-4 w-4" />
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
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{a.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.readingTime}</span>
                        </div>
                        <h3 className="font-extrabold font-display leading-snug text-base group-hover:text-primary transition-colors line-clamp-2">
                          <Link to={`/blog/${a.id}`}>{a.title}</Link>
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                          {a.excerpt}
                        </p>
                      </div>
                      <div>
                        <Link to={`/blog/${a.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all">
                          {lang === "fr" ? "Lire la suite" : "Read more"} <ArrowRight className="h-3.5 w-3.5" />
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
