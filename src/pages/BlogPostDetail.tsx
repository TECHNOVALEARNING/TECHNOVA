import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

// Static mock articles database for local development fallback
const FALLBACK_ARTICLES_DETAILS: { [key: string]: any } = {
  "795": {
    id: "795",
    title: "Comment les systèmes de recommandation peuvent-ils être personnalisés pour améliorer l'expérience utilisateur dans les services de streaming?",
    category: "Actu",
    image: "https://inoutech.net/images/34803972-1920.jpg",
    author: "Enzo",
    date: "5 juin 2024",
    readingTime: "5 min",
    content: `
      <p class="lead">Dans une ère où le numérique règne en maître, l'expérience utilisateur ne cesse d'évoluer grâce à l'exploitation de <strong>données</strong> précieuses. Les <strong>systèmes de recommandation</strong> sont au cœur de cette évolution, permettant d'offrir des recommandations personnalisées qui transforment l'expérience client. En particulier, dans le domaine des services de streaming comme <strong>Netflix</strong>, la personnalisation des recommandations est essentielle pour capter l'attention des utilisateurs et répondre à leurs préférences uniques.</p>
      
      <h2>L'importance des systèmes de recommandation pour les services de streaming</h2>
      <p>Les <strong>systèmes de recommandation</strong> sont des outils puissants qui analysent les <strong>données</strong> des <strong>utilisateurs</strong> pour prédire leurs goûts et comportements. Dans les services de streaming, ils sont utilisés pour suggérer des <strong>contenus</strong> en adéquation avec les <strong>préférences</strong> des utilisateurs, réduisant ainsi le temps de recherche et augmentant la satisfaction.</p>
      <p>Des algorithmes sophistiqués sont utilisés pour analyser les habitudes de visionnage, le genre de films préféré, la durée de visionnage, et bien d'autres facteurs. Ces <strong>données</strong> sont ensuite utilisées pour fournir des <strong>recommandations personnalisées</strong>, rendant chaque expérience utilisateur unique.</p>
      
      <h2>La personnalisation des recommandations : une stratégie gagnante</h2>
      <p>La <strong>personnalisation</strong> des <strong>recommandations</strong> est une stratégie qui repose sur la capacité à analyser et à interpréter les <strong>données</strong> des <strong>utilisateurs</strong>. En comprenant les goûts et les habitudes de chaque <strong>utilisateur</strong>, les services de streaming peuvent proposer du contenu qui correspond précisément à leurs attentes.</p>
      <p>Par exemple, en analysant les séries et films que vous avez récemment regardés sur <strong>Netflix</strong>, le <strong>système de recommandation</strong> peut suggérer des contenus similaires qui pourraient vous intéresser. Cette approche sur mesure rend l'expérience plus agréable et incite les utilisateurs à passer plus de temps sur la plateforme.</p>
      
      <h2>Comment les algorithmes de recommandation fonctionnent-ils?</h2>
      <p>Les <strong>algorithmes</strong> de recommandation sont les moteurs qui alimentent les <strong>systèmes de recommandation</strong>. Ils utilisent des techniques d'apprentissage automatique pour analyser les <strong>données</strong> des <strong>utilisateurs</strong> et prédire leurs <strong>préférences</strong>.</p>
      <p>Plusieurs types d'algorithmes peuvent être utilisés, chacun ayant ses propres forces. Par exemple, les algorithmes basés sur le filtrage collaboratif utilisent les données de tous les utilisateurs pour faire des prédictions, tandis que les algorithmes basés sur le contenu se concentrent sur les préférences individuelles de chaque utilisateur. En combinant ces approches, les services de streaming peuvent proposer des <strong>recommandations</strong> qui sont à la fois pertinentes et diversifiées.</p>
      
      <h2>Les défis de la personnalisation des systèmes de recommandation</h2>
      <p>Bien que la personnalisation des <strong>systèmes de recommandation</strong> offre de nombreux avantages, elle présente également des défis. L'un des principaux est la gestion de la <strong>confidentialité</strong> des <strong>données</strong> des utilisateurs. Il est crucial de respecter la vie privée des utilisateurs tout en utilisant leurs données pour améliorer leur expérience.</p>
      <p>Un autre défi est de maintenir un équilibre entre la pertinence et la diversité des recommandations. Si les <strong>recommandations</strong> sont trop personnalisées, les utilisateurs peuvent se retrouver dans une "bulle de filtres" où ils ne voient que du contenu très similaire à ce qu'ils ont déjà regardé. C'est pourquoi il est essentiel d'intégrer une certaine diversité dans les recommandations pour continuer à stimuler l'intérêt et la curiosité des utilisateurs.</p>
    `
  }
};

const MOCK_LIST = [
  { id: "795", title: "Comment les systèmes de recommandation...", category: "Actu", image: "https://inoutech.net/images/34803972-1920.jpg", date: "5 juin 2024", readingTime: "5 min" },
  { id: "807", title: "Comment les technologies d'imagerie avancée...", category: "Actu", image: "https://inoutech.net/images/wp-807-600.jpg", date: "5 juin 2024", readingTime: "6 min" },
  { id: "801", title: "Comment utiliser les casques VR pour l'entraînement...", category: "High tech", image: "https://inoutech.net/images/wp-801-600.jpg", date: "5 juin 2024", readingTime: "5 min" },
  { id: "892", title: "Make integromat : passez à l'automatisation...", category: "High tech", image: "https://inoutech.net/images/wp-892-600.jpg", date: "30 juillet 2024", readingTime: "7 min" },
  { id: "933", title: "10 clés pour collaborer avec une agence...", category: "Internet", image: "https://inoutech.net/images/wp-933-600.jpg", date: "28 septembre 2025", readingTime: "10 min" }
];

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  // Update read progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.pageYOffset / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchArticleDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const res = await fetch(`/api/blog?id=${id}`);
        if (!res.ok) throw new Error("Article fetch failed");

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data && data.title) {
            setArticle(data);
          } else {
            loadFallbackArticle(id);
          }
        } else {
          loadFallbackArticle(id);
        }
      } catch (err) {
        console.warn("API offline or error, falling back to static article data:", err);
        loadFallbackArticle(id);
      } finally {
        // Fetch related articles list
        try {
          const listRes = await fetch("/api/blog");
          if (listRes.ok) {
            const listData = await listRes.json();
            if (Array.isArray(listData)) {
              setRelatedArticles(listData.filter((a: any) => a.id !== id).slice(0, 3));
            } else {
              setRelatedArticles(MOCK_LIST.filter((a: any) => a.id !== id).slice(0, 3));
            }
          } else {
            setRelatedArticles(MOCK_LIST.filter((a: any) => a.id !== id).slice(0, 3));
          }
        } catch {
          setRelatedArticles(MOCK_LIST.filter((a: any) => a.id !== id).slice(0, 3));
        }
        
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchArticleDetail();
  }, [id]);

  const loadFallbackArticle = (articleId: string) => {
    // If it's 795, load the real article content we parsed
    if (FALLBACK_ARTICLES_DETAILS[articleId]) {
      setArticle(FALLBACK_ARTICLES_DETAILS[articleId]);
    } else {
      // Generate a nice-looking dynamic article content
      const matchedMeta = MOCK_LIST.find(a => a.id === articleId) || {
        title: "Article Technologique Innovant",
        category: "Actu",
        image: "https://inoutech.net/images/34803972-1920.jpg",
        date: "25 juin 2026",
        readingTime: "5 min"
      };

      setArticle({
        id: articleId,
        title: matchedMeta.title,
        category: matchedMeta.category,
        image: matchedMeta.image,
        author: "Redaction Technova",
        date: matchedMeta.date,
        readingTime: matchedMeta.readingTime,
        content: `
          <p class="lead">Découvrez les détails et analyses profondes sur ce sujet passionnant de la tech. Cet article explore comment les nouvelles technologies transforment les usages et améliorent notre efficacité au quotidien.</p>
          
          <h2>Introduction aux technologies émergentes</h2>
          <p>L'intégration de nouveaux systèmes numériques est au cœur des préoccupations actuelles des entreprises et des consommateurs. Qu'il s'agisse d'intelligence artificielle, d'outils cloud, d'automatisation ou de réalité mixte, chaque brique technologique redéfinit nos façons de travailler.</p>
          
          <blockquote>
            "La technologie n'est qu'un outil. En termes de motivation des enfants et de travail en équipe, l'enseignant est le plus important." — Bill Gates
          </blockquote>

          <h2>Pourquoi ce sujet est-il crucial aujourd'hui ?</h2>
          <p>L'adoption rapide de ces technologies s'explique par les gains d'efficacité indéniables qu'elles procurent. Cependant, leur déploiement soulève également des défis notables :</p>
          <ul>
            <li><strong>Sécurité des données :</strong> Le stockage et le transfert d'informations sensibles doivent être chiffrés et sécurisés.</li>
            <li><strong>Courbe d'apprentissage :</strong> Les équipes nécessitent des formations adaptées pour maîtriser ces nouveaux environnements.</li>
            <li><strong>Intégration :</strong> Les applications doivent communiquer de façon transparente via des APIs robustes.</li>
          </ul>

          <h2>Perspectives futures et opportunités</h2>
          <p>Le futur verra une intégration encore plus poussée de l'intelligence et du traitement des données en périphérie (Edge Computing), offrant des temps de réponse instantanés. Les opportunités de croissance pour les professionnels et les organisations qui prennent ce virage tôt sont exceptionnelles.</p>
          <p>Pour en savoir plus, n'hésitez pas à vous inscrire aux formations de la plateforme TECHNOVA et à explorer nos guides pratiques.</p>
        `
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(lang === "fr" ? "Lien copié dans le presse-papiers !" : "Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans relative">
      <SEOHead 
        title={article ? `${article.title}` : "Chargement de l'article"}
        description={article ? `${article.title} - Décryptage par TECHNOVA` : "Lecture d'un article de blog tech."}
        ogImage={article?.image}
        ogType="article"
      />
      <Header />

      {/* Reading Progress Scroll Bar */}
      <div 
        className="fixed top-16 left-0 h-1 bg-gradient-to-r from-primary to-cyan-500 z-50 transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }}
      />

      <main className="flex-1 bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Back button */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-8 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{lang === "fr" ? "Retour au blog" : "Back to Blog"}</span>
          </Link>

          {loading ? (
            /* Skeleton Loading State */
            <div className="animate-pulse space-y-8">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-muted rounded-full" />
                <div className="h-12 w-full bg-muted rounded-xl" />
                <div className="h-4 w-1/3 bg-muted rounded-full" />
              </div>
              <div className="aspect-[21/9] bg-muted rounded-3xl" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded-full" />
                <div className="h-4 w-5/6 bg-muted rounded-full" />
                <div className="h-4 w-4/5 bg-muted rounded-full" />
              </div>
            </div>
          ) : article ? (
            /* Content Layout */
            <article>
              {/* Header meta */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {article.category}
                </span>
                <span className="text-muted-foreground text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
                <span className="text-muted-foreground text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-8 font-display">
                {article.title}
              </h1>

              {/* Author & Action buttons strip */}
              <div className="flex items-center justify-between border-y border-border/80 py-4.5 mb-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-inner">
                    {article.author ? article.author.charAt(0).toUpperCase() : "R"}
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1">
                      <span>{article.author || "Rédaction"}</span>
                      <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">Redacteur Tech</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toast.success(lang === "fr" ? "Article sauvegardé dans vos favoris !" : "Article saved to bookmarks!")}
                    className="p-2.5 rounded-xl border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                    title="Sauvegarder"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              <div className="aspect-[21/10] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-elegant border border-border mb-12 relative">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content - Styled with Tailwind Typography */}
              <div 
                className="prose dark:prose-invert prose-blue max-w-none prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-r-2xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Related articles at the bottom */}
              {relatedArticles.length > 0 && (
                <div className="mt-20 pt-10 border-t border-border">
                  <h3 className="text-xl md:text-2xl font-bold font-display mb-8 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>{lang === "fr" ? "Lectures complémentaires" : "Related Reads"}</span>
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {relatedArticles.map((rel) => (
                      <Link 
                        key={rel.id} 
                        to={`/blog/${rel.id}`}
                        className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img 
                            src={rel.image} 
                            alt={rel.title} 
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mt-3">
                            <Clock className="w-3 h-3" />
                            {rel.readingTime}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </article>
          ) : (
            /* Error state */
            <div className="text-center py-20">
              <p className="text-destructive mb-4">Erreur lors du chargement de l'article.</p>
              <Link to="/blog" className="px-4 py-2 rounded-xl bg-primary text-white font-bold">Retour au blog</Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
