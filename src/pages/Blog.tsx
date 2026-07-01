import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Sparkles, Filter, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

// Fallback articles displayed when the NewsData.io API is unavailable
const BLOG_ARTICLES = [
  {
    id: "introduction-produits-plr-droits-revente",
    title: "Le Guide Complet des Produits PLR : Créez et Vendez vos Produits Numériques en 1 Clic",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    excerpt: "Qu'est-ce que le PLR (Private Label Rights) et comment l'utiliser pour générer des revenus en ligne passifs ? Découvrez les secrets pour acquérir, personnaliser et revendre des e-books, formations et templates sous votre propre marque...",
    date: "1 juillet 2026",
    readingTime: "8 min"
  },
  {
    id: "comment-personnaliser-un-ebook-plr",
    title: "5 Étapes pour Transformer un E-book PLR en Best-Seller Unique",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    excerpt: "Acheter un produit PLR ne suffit pas, il faut savoir le démarquer de la concurrence. Découvrez nos techniques de personnalisation pour créer une offre irrésistible que vos clients s'arracheront...",
    date: "29 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "tunnel-de-vente-produits-digitaux",
    title: "Comment Construire un Tunnel de Vente qui Convertit pour vos Info-produits",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    excerpt: "Découvrez la structure exacte d'un tunnel de vente optimisé pour vendre vos produits PLR en automatique : de la page de capture à l'upsell, maximisez la valeur moyenne de chaque commande...",
    date: "26 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "niches-rentables-produits-digitaux",
    title: "Top 4 des Niches les plus Rentables pour Vendre des Produits Numériques en 2026",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    excerpt: "Toutes les thématiques ne se valent pas. Découvrez les niches à forte demande (finances, productivité, bien-être) où les clients recherchent activement des e-books et formations à acheter...",
    date: "24 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "systeme-io-vs-shopify-produits-digitaux",
    title: "Système.io vs Shopify : Quelle Plateforme Choisir pour Vendre vos PLR ?",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    excerpt: "Vous hésitez entre Shopify et Système.io pour lancer votre boutique de produits digitaux ? Découvrez notre comparatif complet sur les tarifs, la facilité de création de tunnels de vente...",
    date: "22 juin 2026",
    readingTime: "8 min"
  },
  {
    id: "strategie-email-marketing-infoproduits",
    title: "L'E-mail Marketing pour Info-Preneurs : 3 Séquences Automatiques pour Exploser vos Ventes",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80",
    excerpt: "L'e-mail reste le canal le plus rentable du web. Apprenez à mettre en place des séquences automatisées d'accueil, d'abandon de panier et de relance pour convertir vos leads en acheteurs...",
    date: "20 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "comment-creer-une-offre-irresistible",
    title: "Comment Packager vos Produits Digitaux pour Créer une Offre Irrésistible",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    excerpt: "Un produit ne se vend pas seul, c'est l'offre qui fait la vente. Découvrez comment combiner vos e-books, templates et audio PLR dans un bundle irrésistible qui multiplie la valeur...",
    date: "18 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "affiliation-produits-numeriques",
    title: "Recruter des Affiliés : La Méthode Ultime pour Vendre vos Info-produits Sans Budget",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    excerpt: "Et si d'autres personnes faisaient la promotion de vos produits pour vous ? Découvrez comment mettre en place un programme d'affiliation attractif et recruter vos premiers partenaires...",
    date: "15 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "creer-formation-video-depuis-plr",
    title: "Comment Transformer un E-book PLR en Formation Vidéo à Succès",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    excerpt: "Les formations vidéo se vendent 10 fois plus cher que les e-books. Découvrez notre guide étape par étape pour enregistrer une formation vidéo à partir d'une simple trame d'e-book PLR...",
    date: "12 juin 2026",
    readingTime: "9 min"
  },
  {
    id: "gagner-ses-premiers-euros-en-ligne",
    title: "Plan d'Action 30 Jours : Gagner ses Premiers 1000€ avec la Vente de Fichiers Numériques",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    excerpt: "Vous débutez de zéro ? Suivez ce plan d'action quotidien sur 30 jours pour choisir votre niche, packager votre offre PLR et lancer vos premières campagnes de vente...",
    date: "10 juin 2026",
    readingTime: "10 min"
  }
];

const CATEGORIES = [
  { slug: "All", fr: "Tout", en: "All", emoji: "✨" },
  { slug: "Digital PLR", fr: "Digital PLR", en: "Digital PLR", emoji: "📦" },
  { slug: "Marketing", fr: "Marketing", en: "Marketing", emoji: "🚀" },
  { slug: "Tunnels de Vente", fr: "Tunnels de Vente", en: "Sales Funnels", emoji: "⚡" },
  { slug: "Niches Riches", fr: "Niches Riches", en: "Profitable Niches", emoji: "💰" }
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
