import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

// Fallback article details for when NewsData.io API is unavailable
// Fallback article details for when NewsData.io API is unavailable
const FALLBACK_ARTICLES_DETAILS: { [key: string]: any } = {
  "introduction-produits-plr-droits-revente": {
    id: "introduction-produits-plr-droits-revente",
    title: "Le Guide Complet des Produits PLR : Créez et Vendez vos Produits Numériques en 1 Clic",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    author: "Captivateur",
    date: "1 juillet 2026",
    readingTime: "8 min",
    content: `
      <p class="lead">Le Private Label Rights (PLR) ou Droits de Label Privé est l'un des raccourcis les plus puissants pour lancer un business numérique en 2026. Il permet d'acheter un produit existant, d'y apposer sa marque et de le revendre à 100% de profit.</p>
      
      <h2>Qu'est-ce que le PLR exactement ?</h2>
      <p>Contrairement aux droits de revente simples (Master Resell Rights), le PLR vous donne l'autorisation légale de modifier le contenu, d'y ajouter votre nom comme auteur, de le découper en plusieurs articles, de changer le format (par exemple transformer un e-book en formation vidéo) et de fixer votre propre prix.</p>
      
      <h2>Pourquoi utiliser le PLR ?</h2>
      <ul>
        <li><strong>Gain de temps massif :</strong> Pas besoin de passer 3 mois à rédiger 150 pages d'e-book ou à concevoir des templates complexes.</li>
        <li><strong>Économie d'argent :</strong> Recruter un rédacteur professionnel ou un designer coûte des milliers d'euros. Une licence PLR ne coûte qu'une fraction de ce prix.</li>
        <li><strong>Focus sur la vente :</strong> Vous pouvez dédier 95% de votre énergie au marketing, au copywriting et à la création de votre tunnel de vente.</li>
      </ul>
      
      <blockquote>
        "Le secret des infopreneurs à succès n'est pas d'écrire plus de contenu, c'est de mieux packager et mieux distribuer des solutions existantes." — Captivateur
      </blockquote>

      <h2>Comment réussir avec le PLR ?</h2>
      <p>Pour ne pas ressembler à vos concurrents qui revendent le même fichier brut, vous devez absolument personnaliser le produit. Changez le titre pour le rendre accrocheur, concevez une nouvelle couverture moderne en 3D sur Canva, et ajoutez-y votre touche personnelle ou des exemples locaux.</p>
    `,
  },
  "comment-personnaliser-un-ebook-plr": {
    id: "comment-personnaliser-un-ebook-plr",
    title: "5 Étapes pour Transformer un E-book PLR en Best-Seller Unique",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author: "Captivateur",
    date: "29 juin 2026",
    readingTime: "6 min",
    content: `
      <p class="lead">Acquérir un e-book PLR de qualité est une excellente première étape. Mais pour le vendre à un prix premium et vous démarquer de la concurrence, vous devez le transformer en un produit unique.</p>
      
      <h2>1. Redéfinir l'Angle Marketing</h2>
      <p>Si votre e-book s'appelle "Introduction au Marketing Digital", renommez-le avec un titre axé sur un résultat concret, par exemple : "La Méthode pas-à-pas pour générer vos 1000 premiers euros sur Instagram". Ciblez une sous-niche spécifique pour maximiser l'intérêt.</p>
      
      <h2>2. Refondre le Design Visuel</h2>
      <p>La première impression fait 80% de la vente. Utilisez un outil comme Canva pour concevoir une couverture 3D irrésistible. Changez la mise en page interne, utilisez les polices modernes et harmonisez les couleurs selon la charte graphique de votre marque.</p>

      <h2>3. Augmenter la Valeur Perçue avec des Bonus</h2>
      <p>Ajoutez des fiches mémo, des check-lists, des feuilles de calcul ou un court tutoriel vidéo. Packager l'e-book avec ces ressources gratuites augmente drastiquement la conversion et justifie un tarif plus élevé.</p>
    `,
  },
  "tunnel-de-vente-produits-digitaux": {
    id: "tunnel-de-vente-produits-digitaux",
    title: "Comment Construire un Tunnel de Vente qui Convertit pour vos Info-produits",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    author: "Captivateur",
    date: "26 juin 2026",
    readingTime: "7 min",
    content: `
      <p class="lead">Créer un produit ne sert à rien si vous n'avez pas un système automatisé pour le vendre. C'est là qu'interviennent les tunnels de vente.</p>
      
      <h2>L'architecture type d'un tunnel de vente rentable</h2>
      <p>Un bon tunnel de vente guide l'utilisateur pas-à-pas du premier contact jusqu'à l'achat :</p>
      <ol>
        <li><strong>Page de Capture (Landing Page) :</strong> Offrez un cadeau gratuit (lead magnet) en échange de l'adresse e-mail de vos visiteurs.</li>
        <li><strong>Page de Vente (Sales Page) :</strong> Présentez immédiatement après une offre irrésistible à bas prix (Tripwire) entre 7€ et 27€ pour transformer le prospect en client.</li>
        <li><strong>Order Bump :</strong> Proposez une option complémentaire rapide à cocher sur le formulaire de paiement (par exemple un cahier d'exercices pour 4,99€).</li>
        <li><strong>Upsell (Vente Additionnelle) :</strong> Offrez un produit haut de gamme (comme une formation vidéo complète) immédiatement après la validation du premier achat.</li>
      </ol>
      
      <h2>L'automatisation des e-mails</h2>
      <p>Mettez en place une séquence d'e-mails de suivi (email nurture sequence) pour apporter de la valeur à ceux qui n'ont pas acheté le Tripwire au début, et présentez vos autres produits digitaux.</p>
    `,
  },
  "niches-rentables-produits-digitaux": {
    id: "niches-rentables-produits-digitaux",
    title: "Top 4 des Niches les plus Rentables pour Vendre des Produits Numériques en 2026",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    author: "Captivateur",
    date: "24 juin 2026",
    readingTime: "5 min",
    content: `
      <p class="lead">Le choix de la thématique est le facteur numéro 1 de réussite dans la vente de produits numériques. Voici les grandes familles de niches qui performent le mieux.</p>
      
      <h2>1. Le Business en Ligne & Le Web Marketing</h2>
      <p>Tout ce qui aide les entreprises ou particuliers à gagner de l'argent ou à se développer : e-commerce, investissement immobilier, affiliation, publicité en ligne, copywriting. Les clients sont prêts à investir car l'offre a un retour sur investissement direct.</p>
      
      <h2>2. Le Développement Personnel</h2>
      <p>La confiance en soi, la productivité, la gestion du stress, la prise de parole en public, ou l'apprentissage de langues. Ce sont des sujets intemporels (evergreen) qui touchent au bien-être de l'individu.</p>

      <h2>3. La Santé & Le Fitness</h2>
      <p>Les programmes de perte de poids, les recettes saines (keto, vegan), la musculation à la maison, la méditation ou le yoga. C'est une niche passionnelle et à forte récurrence d'achat.</p>
    `,
  },
  "systeme-io-vs-shopify-produits-digitaux": {
    id: "systeme-io-vs-shopify-produits-digitaux",
    title: "Système.io vs Shopify : Quelle Plateforme Choisir pour Vendre vos PLR ?",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    author: "Captivateur",
    date: "22 juin 2026",
    readingTime: "8 min",
    content: `
      <p class="lead">Le choix de l'infrastructure de vente est crucial pour commercialiser vos fichiers et produits numériques PLR. Shopify et Système.io sont les deux géants francophones.</p>
      
      <h2>Système.io : Le Roi des Tunnels de Vente</h2>
      <p>Système.io a été spécialement conçu pour les infopreneurs. Il intègre nativement l'hébergement de formations, l'envoi d'e-mails de masse automatisés, la création de tunnels de vente en 1 clic et la gestion de programmes d'affiliation.</p>
      <p><strong>Avantages :</strong> Tarifs abordables, aucun outil tiers requis, tunnels de vente ultra-rapides et taux de conversion élevés pour les offres uniques.</p>
      
      <h2>Shopify : La Référence E-commerce</h2>
      <p>Shopify est idéal si vous souhaitez créer un catalogue multi-produits avec une esthétique de marque forte. Bien qu'orienté produit physique au départ, il excelle pour vendre des fichiers numériques grâce à ses applications dédiées.</p>
      <p><strong>Avantages :</strong> Personnalisation visuelle totale, catalogue complet de thèmes, gestion des paniers d'achat avancée et écosystème d'applications colossal.</p>
    `,
  },
  "strategie-email-marketing-infoproduits": {
    id: "strategie-email-marketing-infoproduits",
    title:
      "L'E-mail Marketing pour Info-Preneurs : 3 Séquences Automatiques pour Exploser vos Ventes",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80",
    author: "Captivateur",
    date: "20 juin 2026",
    readingTime: "6 min",
    content: `
      <p class="lead">L'e-mail marketing génère en moyenne un retour sur investissement de 40 pour 1. Pour les info-preneurs, c'est l'outil numéro 1 pour vendre des e-books et formations en automatique.</p>
      
      <h2>1. La Séquence de Bienvenue (Welcome Sequence)</h2>
      <p>Délivrez immédiatement le cadeau gratuit promis sur votre page de capture. Profitez-en pour vous présenter, raconter votre histoire (storytelling) et établir votre crédibilité. À la fin du 3ème e-mail, proposez votre offre principale.</p>
      
      <h2>2. La Séquence d'Abandon de Panier</h2>
      <p>Près de 70% des visiteurs ajoutent un produit au panier sans finaliser l'achat. Renvoyez-leur un rappel automatique après 4 heures, puis 24 heures en offrant de répondre à leurs questions ou en ajoutant un bonus de dernière minute.</p>

      <h2>3. La Séquence Promotionnelle Flash</h2>
      <p>Créez des promotions limitées dans le temps (48h à 72h). Utilisez l'urgence et la rareté (fermeture des portes ou hausse de tarif imminente) pour pousser vos prospects tièdes à l'action.</p>
    `,
  },
  "comment-creer-une-offre-irresistible": {
    id: "comment-creer-une-offre-irresistible",
    title: "Comment Packager vos Produits Digitaux pour Créer une Offre Irrésistible",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    author: "Captivateur",
    date: "18 juin 2026",
    readingTime: "7 min",
    content: `
      <p class="lead">Les gens n'achètent pas des fichiers PDF bruts. Ils achètent des résultats et des transformations. Apprenez à transformer un simple produit en une offre que l'on ne peut pas refuser.</p>
      
      <h2>Empilez la Valeur avec des Bonus Stratégiques</h2>
      <p>Au lieu de vendre uniquement votre e-book PLR principal, ajoutez 3 ou 4 bonus qui résolvent le problème suivant de votre client. Par exemple, si l'e-book enseigne la perte de poids, offrez un plan de repas hebdomadaire, un journal de suivi imprimable et un accès à un groupe privé.</p>
      
      <h2>Utilisez l'Urgence et la Rareté</h2>
      <p>Limitez votre offre dans le temps ou en quantité. Proposez un tarif spécial de lancement pour les 100 premiers acheteurs ou pour les prochaines 24 heures.</p>
    `,
  },
  "affiliation-produits-numeriques": {
    id: "affiliation-produits-numeriques",
    title: "Recruter des Affiliés : La Méthode Ultime pour Vendre vos Info-produits Sans Budget",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    author: "Captivateur",
    date: "15 juin 2026",
    readingTime: "6 min",
    content: `
      <p class="lead">L'affiliation consiste à faire la promotion de vos produits par d'autres partenaires en échange d'une commission sur les ventes. C'est le meilleur moyen de scaler vos ventes rapidement.</p>
      
      <h2>Fixez des Commissions Attractives</h2>
      <p>Les produits numériques ayant des coûts marginaux proches de zéro, vous pouvez vous permettre d'offrir des commissions généreuses (généralement entre 40% et 60%). Cela motive fortement les affiliés à pousser votre offre.</p>
      
      <h2>Fournissez un Kit Promotionnel Clé en Main</h2>
      <p>Facilitez le travail de vos affiliés en leur fournissant des bannières publicitaires, des visuels de couverture 3D, des exemples d'e-mails prêts à envoyer et des publications pour les réseaux sociaux.</p>
    `,
  },
  "creer-formation-video-depuis-plr": {
    id: "creer-formation-video-depuis-plr",
    title: "Comment Transformer un E-book PLR en Formation Vidéo à Succès",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    author: "Captivateur",
    date: "12 juin 2026",
    readingTime: "9 min",
    content: `
      <p class="lead">Les e-books se vendent généralement entre 7€ et 27€, tandis que les formations vidéo se vendent facilement entre 97€ et 297€. Transformer votre PLR écrit en vidéo est le meilleur moyen d'augmenter votre panier moyen.</p>
      
      <h2>Étape 1 : Structurer la trame à partir de l'E-book</h2>
      <p>Utilisez la table des matières de votre e-book PLR pour définir les modules de votre formation. Chaque chapitre devient une leçon vidéo d'une durée de 5 à 15 minutes.</p>
      
      <h2>Étape 2 : Préparer des Supports Visuels simples</h2>
      <p>Diapositives claires reprenant les points clés. Pas besoin de lire le texte ; utilisez les diapositives comme guide visuel pour votre explication.</p>
      
      <h2>Étape 3 : Enregistrer l'écran et le micro</h2>
      <p>Utilisez des logiciels gratuits comme OBS Studio ou Loom pour filmer votre écran et votre webcam. Veillez à avoir un son clair : l'audio est plus important que la vidéo dans les produits d'information.</p>
    `,
  },
  "gagner-ses-premiers-euros-en-ligne": {
    id: "gagner-ses-premiers-euros-en-ligne",
    title:
      "Plan d'Action 30 Jours : Gagner ses Premiers 1000€ avec la Vente de Fichiers Numériques",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    author: "Captivateur",
    date: "10 juin 2026",
    readingTime: "10 min",
    content: `
      <p class="lead">Vous souhaitez vous lancer mais ne savez pas par où commencer ? Suivez ce programme d'action rigoureux sur 30 jours pour générer vos premiers gains.</p>
      
      <h2>Jours 1 à 10 : Recherche & Packaging</h2>
      <p>Choisissez une niche rentable (comme le marketing ou le développement personnel). Achetez 2 ou 3 bons produits PLR sur cette thématique, personnalisez-les, regroupez-les et concevez des couvertures 3D professionnelles.</p>
      
      <h2>Jours 11 à 20 : Configuration du Tunnel</h2>
      <p>Créez votre compte sur Système.io ou Shopify. Construisez votre page de capture, votre page de commande simplifiée et configurez la livraison automatique du produit par e-mail.</p>
      
      <h2>Jours 21 à 30 : Trafic & Lancement</h2>
      <p>Créez du contenu court sur TikTok, Instagram ou YouTube Shorts en donnant des conseils gratuits liés à votre e-book, et redirigez les spectateurs vers votre lien en bio. Lancez de petites campagnes promotionnelles pour attirer vos premiers clients.</p>
    `,
  },
};

// Fallback articles list matching Blog.tsx
const MOCK_LIST = [
  {
    id: "introduction-produits-plr-droits-revente",
    title: "Le Guide Complet des Produits PLR : Créez et Vendez vos Produits Numériques en 1 Clic",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    date: "1 juillet 2026",
    readingTime: "8 min",
  },
  {
    id: "comment-personnaliser-un-ebook-plr",
    title: "5 Étapes pour Transformer un E-book PLR en Best-Seller Unique",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    date: "29 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "tunnel-de-vente-produits-digitaux",
    title: "Comment Construire un Tunnel de Vente qui Convertit pour vos Info-produits",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    date: "26 juin 2026",
    readingTime: "7 min",
  },
  {
    id: "niches-rentables-produits-digitaux",
    title: "Top 4 des Niches les plus Rentables pour Vendre des Produits Numériques en 2026",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    date: "24 juin 2026",
    readingTime: "5 min",
  },
  {
    id: "systeme-io-vs-shopify-produits-digitaux",
    title: "Système.io vs Shopify : Quelle Plateforme Choisir pour Vendre vos PLR ?",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    date: "22 juin 2026",
    readingTime: "8 min",
  },
  {
    id: "strategie-email-marketing-infoproduits",
    title:
      "L'E-mail Marketing pour Info-Preneurs : 3 Séquences Automatiques pour Exploser vos Ventes",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80",
    date: "20 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "comment-creer-une-offre-irresistible",
    title: "Comment Packager vos Produits Digitaux pour Créer une Offre Irrésistible",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    date: "18 juin 2026",
    readingTime: "7 min",
  },
  {
    id: "affiliation-produits-numeriques",
    title: "Recruter des Affiliés : La Méthode Ultime pour Vendre vos Info-produits Sans Budget",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    date: "15 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "creer-formation-video-depuis-plr",
    title: "Comment Transformer un E-book PLR en Formation Vidéo à Succès",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    date: "12 juin 2026",
    readingTime: "9 min",
  },
  {
    id: "gagner-ses-premiers-euros-en-ligne",
    title:
      "Plan d'Action 30 Jours : Gagner ses Premiers 1000€ avec la Vente de Fichiers Numériques",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    date: "10 juin 2026",
    readingTime: "10 min",
  },
];

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
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
      const matchedMeta = MOCK_LIST.find((a) => a.id === articleId) || {
        title: "Article Digital & Innovation",
        category: "Technologie",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        date: "25 juin 2026",
        readingTime: "5 min",
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
        `,
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(
        lang === "fr" ? "Lien copié dans le presse-papiers !" : "Link copied to clipboard!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans relative">
      <SEOHead
        title={article ? `${article.title}` : "Chargement de l'article"}
        description={
          article
            ? `${article.title} - Décryptage par TECHNOVA`
            : "Lecture d'un article de blog tech."
        }
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
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Redacteur Tech
                    </div>
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
                    onClick={() =>
                      toast.success(
                        lang === "fr"
                          ? "Article sauvegardé dans vos favoris !"
                          : "Article saved to bookmarks!",
                      )
                    }
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
                    target.src =
                      "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80";
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
                              target.src =
                                "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80";
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
              <Link to="/blog" className="px-4 py-2 rounded-xl bg-primary text-white font-bold">
                Retour au blog
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
