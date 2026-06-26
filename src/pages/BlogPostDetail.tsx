import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

// Fallback article details for when NewsData.io API is unavailable
const FALLBACK_ARTICLES_DETAILS: { [key: string]: any } = {
  "ia-generative-transforme-entreprises-francaises": {
    id: "ia-generative-transforme-entreprises-francaises",
    title: "L'IA générative transforme les entreprises françaises : bilan et perspectives",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author: "TECHNOVA",
    date: "24 juin 2026",
    readingTime: "6 min",
    content: `
      <p class="lead">L'essor de l'<strong>IA générative</strong> pousse de nombreuses entreprises françaises à investir massivement dans ces technologies. De la rédaction automatique à l'analyse prédictive, les cas d'usage se multiplient avec des résultats concrets.</p>
      
      <h2>Les coûts cachés de l'infrastructure IA</h2>
      <p>Derrière les promesses de productivité, les entreprises découvrent des factures salées. L'entraînement d'un modèle de langage performant nécessite des <strong>GPU de dernière génération</strong> dont le coût unitaire dépasse les 30 000 euros. À cela s'ajoutent les frais de cloud computing, de stockage de données et de bande passante qui explosent avec l'usage.</p>
      <p>Selon une étude récente, <strong>25 % des investissements</strong> consacrés à l'IA en France sont absorbés par la complexité technologique avant même d'atteindre des résultats concrets.</p>
      
      <h2>Formation et compétences : le maillon faible</h2>
      <p>L'un des postes de dépenses les plus sous-estimés reste la <strong>formation des équipes</strong>. Les salariés doivent non seulement apprendre à utiliser les outils IA, mais aussi comprendre leurs limites pour éviter les erreurs coûteuses. Les entreprises qui réussissent sont celles qui investissent autant dans l'humain que dans la technologie.</p>
      
      <blockquote>
        "L'IA n'est pas un remplacement de l'humain, c'est un amplificateur. Mais un amplificateur coûte cher à installer et à maintenir." — Yann LeCun
      </blockquote>

      <h2>Le vrai calcul : TCO vs salaire</h2>
      <p>Quand on compare le <strong>coût total de possession (TCO)</strong> d'une solution IA au salaire chargé d'un employé qualifié, les résultats surprennent :</p>
      <ul>
        <li><strong>Coûts d'abonnement :</strong> Les API des modèles comme GPT-4 ou Claude coûtent entre 20 et 60 dollars par million de tokens.</li>
        <li><strong>Maintenance continue :</strong> Les modèles doivent être régulièrement affinés et mis à jour.</li>
        <li><strong>Risques d'hallucination :</strong> Le coût de la vérification humaine des résultats annule parfois les gains de productivité.</li>
      </ul>

      <h2>Vers un équilibre humain-machine</h2>
      <p>La solution optimale réside dans une approche hybride. Les entreprises les plus performantes utilisent l'IA pour <strong>augmenter les capacités</strong> de leurs employés plutôt que pour les remplacer. Cette stratégie permet de maximiser le retour sur investissement tout en préservant l'expertise humaine indispensable.</p>
    `
  },
  "levees-fonds-tech-europe-record-2026": {
    id: "levees-fonds-tech-europe-record-2026",
    title: "Les levées de fonds tech en Europe atteignent un record historique en 2026",
    category: "Business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    author: "TECHNOVA",
    date: "23 juin 2026",
    readingTime: "7 min",
    content: `
      <p class="lead">L'écosystème tech européen confirme sa montée en puissance avec plus de <strong>45 milliards d'euros levés</strong> au premier semestre 2026, porté par l'IA, la cybersécurité et les cleantech.</p>
      
      <h2>Un écosystème en pleine maturité</h2>
      <p>L'Europe n'est plus le parent pauvre de l'investissement tech. Les fonds de capital-risque européens rivalisent désormais avec leurs homologues américains, avec des tickets moyens en <strong>hausse de 35%</strong> par rapport à 2025.</p>
      
      <h2>Les secteurs porteurs</h2>
      <p>Trois secteurs concentrent l'essentiel des investissements :</p>
      <ul>
        <li><strong>Intelligence artificielle :</strong> 18 milliards d'euros, soit 40% du total. Les startups européennes d'IA attirent des investisseurs du monde entier.</li>
        <li><strong>Cybersécurité :</strong> 8 milliards d'euros, portée par les nouvelles réglementations et la multiplication des cyberattaques.</li>
        <li><strong>Cleantech :</strong> 7 milliards d'euros, soutenue par le Green Deal européen et la demande croissante en solutions durables.</li>
      </ul>

      <blockquote>
        "L'Europe est en train de devenir le continent de référence pour l'innovation technologique responsable." — Commission Européenne
      </blockquote>

      <h2>La France en tête</h2>
      <p>La France confirme sa position de leader avec <strong>12 milliards d'euros levés</strong>, devant l'Allemagne et le Royaume-Uni. Paris s'impose comme le hub incontournable de la tech européenne.</p>
    `
  }
};

// Fallback articles list matching Blog.tsx FALLBACK_ARTICLES
const MOCK_LIST = [
  {
    id: "ia-generative-transforme-entreprises-francaises",
    title: "L'IA générative transforme les entreprises françaises : bilan et perspectives",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    date: "24 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "levees-fonds-tech-europe-record-2026",
    title: "Les levées de fonds tech en Europe atteignent un record historique en 2026",
    category: "Business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    date: "23 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "chatgpt-depasse-2-milliards-utilisateurs",
    title: "ChatGPT franchit le cap des 2 milliards d'utilisateurs actifs mensuels",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
    date: "22 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "ordinateur-quantique-google-avancee-majeure",
    title: "Google dévoile une avancée majeure en informatique quantique",
    category: "Science",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    date: "21 juin 2026",
    readingTime: "8 min"
  },
  {
    id: "apple-vision-pro-2-annonce-wwdc",
    title: "Apple annonce le Vision Pro 2 avec un prix enfin accessible",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=800&q=80",
    date: "20 juin 2026",
    readingTime: "6 min"
  },
  {
    id: "regulation-ia-mondiale-g7-accord-historique",
    title: "Le G7 signe un accord historique pour la régulation mondiale de l'IA",
    category: "World",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    date: "19 juin 2026",
    readingTime: "9 min"
  },
  {
    id: "cybersecurite-attaques-ransomware-hausse-2026",
    title: "Cybersécurité : les attaques ransomware en hausse de 60% en 2026",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    date: "18 juin 2026",
    readingTime: "7 min"
  },
  {
    id: "tesla-robot-optimus-production-masse",
    title: "Tesla lance la production de masse de son robot humanoïde Optimus",
    category: "Business",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    date: "17 juin 2026",
    readingTime: "5 min"
  },
  {
    id: "sante-numerique-ia-diagnostic-medical",
    title: "L'IA surpasse les médecins dans le diagnostic de certains cancers",
    category: "Health",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    date: "16 juin 2026",
    readingTime: "6 min"
  }
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
    // If we have a pre-built article, load it
    if (FALLBACK_ARTICLES_DETAILS[articleId]) {
      setArticle(FALLBACK_ARTICLES_DETAILS[articleId]);
    } else {
      // Generate a nice-looking dynamic article content
      const matchedMeta = MOCK_LIST.find(a => a.id === articleId) || {
        title: "Article Digital & Innovation",
        category: "Technologie",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        date: "25 juin 2026",
        readingTime: "5 min"
      };

      setArticle({
        id: articleId,
        title: matchedMeta.title,
        category: matchedMeta.category,
        image: matchedMeta.image,
        author: "TECHNOVA",
        date: matchedMeta.date,
        readingTime: matchedMeta.readingTime,
        content: `
          <p class="lead">Découvrez les détails et analyses profondes sur ce sujet au cœur de l'actualité digitale. Cet article explore comment les nouvelles technologies et tendances numériques transforment les usages professionnels et personnels.</p>
          
          <h2>Un secteur en pleine mutation</h2>
          <p>Le paysage numérique évolue à une vitesse vertigineuse. De l'<strong>intelligence artificielle</strong> aux <strong>réseaux sociaux</strong>, en passant par la <strong>cybersécurité</strong> et le <strong>marketing digital</strong>, chaque secteur connaît des transformations majeures qui redéfinissent les standards de l'industrie.</p>
          
          <blockquote>
            "Le numérique n'est plus une option, c'est le socle sur lequel se construisent toutes les stratégies d'entreprise modernes." — TECHNOVA
          </blockquote>

          <h2>Les enjeux clés à surveiller</h2>
          <p>Plusieurs tendances se dessinent et méritent une attention particulière :</p>
          <ul>
            <li><strong>IA générative :</strong> L'intégration des modèles de langage dans les processus métier ouvre des perspectives inédites mais soulève des questions éthiques.</li>
            <li><strong>Protection des données :</strong> Le RGPD et l'AI Act européen redessinent le cadre réglementaire pour les entreprises technologiques.</li>
            <li><strong>Social commerce :</strong> Les plateformes sociales deviennent de véritables places de marché, estompant la frontière entre contenu et commerce.</li>
          </ul>

          <h2>Perspectives et recommandations</h2>
          <p>Pour rester compétitif dans cet écosystème en constante évolution, il est essentiel de maintenir une <strong>veille technologique active</strong> et d'investir dans la formation continue des équipes. Les entreprises qui sauront allier innovation technologique et expertise humaine seront celles qui tireront le mieux leur épingle du jeu.</p>
          <p>Retrouvez toutes nos analyses et décryptages sur <strong>TECHNOVA</strong>, votre plateforme de référence pour comprendre les enjeux du numérique.</p>
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80";
                  }}
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
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80";
                            }}
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
