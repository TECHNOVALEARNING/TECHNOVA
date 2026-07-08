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
    image: "https://i.pinimg.com/1200x/17/eb/c0/17ebc083f4fc54ee0935eafbee1439aa.jpg",
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
    `,
  },
  "comment-personnaliser-un-ebook-plr": {
    id: "comment-personnaliser-un-ebook-plr",
    title: "5 Étapes pour Transformer un E-book PLR en Best-Seller Unique",
    category: "Marketing",
    image: "https://i.pinimg.com/1200x/a0/17/b0/a017b032751a9466d66cfa3cb549eb42.jpg",
    author: "Captivateur",
    date: "29 juin 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Acquérir un e-book PLR de qualité est une excellente première étape. Mais pour le vendre à un prix premium et vous démarquer de la concurrence, vous devez le transformer en un produit unique.</p>
    <h2>1. Redéfinir l'Angle Marketing</h2>
    <p>Si votre e-book s'appelle "Introduction au Marketing Digital", renommez-le avec un titre axé sur un résultat concret, par exemple : "La Méthode pas-à-pas pour générer vos 1000 premiers euros sur Instagram". Ciblez une sous-niche spécifique pour maximiser l'intérêt.</p>
    <h2>2. Refondre le Design Visuel</h2>
    <p>La première impression fait 80% de la vente. Utilisez un outil comme Canva pour concevoir une couverture 3D irrésistible. Changez la mise en page interne, utilisez les polices modernes et harmonisez les couleurs selon la charte graphique de votre marque.</p>
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
      <li><strong>Page de Vente (Sales Page) :</strong> Présentez immédiatement après une offre irrésistible à bas prix.</li>
      <li><strong>Order Bump :</strong> Proposez une option complémentaire rapide à cocher sur le formulaire de paiement.</li>
    </ol>
    `,
  },
  "niches-rentables-produits-digitaux": {
    id: "niches-rentables-produits-digitaux",
    title: "Top 4 des Niches les plus Rentables pour Vendre des Produits Numériques en 2026",
    category: "Niches Riches",
    image: "https://i.pinimg.com/1200x/4c/3a/97/4c3a97ab3db0f7e5ec5492aed87d65bf.jpg",
    author: "Captivateur",
    date: "24 juin 2026",
    readingTime: "5 min",
    content: `
<p class="lead">Le choix de la thématique est le facteur numéro 1 de réussite dans la vente de produits numériques. Voici les grandes familles de niches qui performent le mieux.</p>
    <h2>1. Le Business en Ligne & Le Web Marketing</h2>
    <p>Tout ce qui aide les entreprises ou particuliers à gagner de l'argent ou à se développer : e-commerce, investissement immobilier, affiliation, publicité en ligne, copywriting.</p>
    <h2>2. Le Développement Personnel</h2>
    <p>La confiance en soi, la productivité, la gestion du stress, la prise de parole en public, ou l'apprentissage de langues.</p>
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
    <p>Système.io a été spécialement conçu pour les infopreneurs. Il intègre nativement l'hébergement de formations, l'envoi d'e-mails de masse automatisés, la création de tunnels de vente en 1 clic.</p>
    <h2>Shopify : La Référence E-commerce</h2>
    <p>Shopify est idéal si vous souhaitez créer un catalogue multi-produits avec une esthétique de marque forte.</p>
    `,
  },
  "strategie-email-marketing-infoproduits": {
    id: "strategie-email-marketing-infoproduits",
    title: "L",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&q=80",
    author: "Captivateur",
    date: "20 juin 2026",
    readingTime: "6 min",
    content: `
<p class="lead">L'e-mail marketing génère en moyenne un retour sur investissement de 40 pour 1. Pour les info-preneurs, c'est l'outil numéro 1 pour vendre des e-books et formations en automatique.</p>
    <h2>1. La Séquence de Bienvenue (Welcome Sequence)</h2>
    <p>Délivrez immédiatement le cadeau gratuit promis sur votre page de capture. Profitez-en pour vous présenter, raconter votre histoire (storytelling) et établir votre crédibilité.</p>
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
    <p>Au lieu de vendre uniquement votre e-book PLR principal, ajoutez 3 ou 4 bonus qui résolvent le problème suivant de votre client.</p>
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
    <p>Les produits numériques ayant des coûts marginaux proches de zéro, vous pouvez vous permettre d'offrir des commissions généreuses (généralement entre 40% et 60%).</p>
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
    <p>Utilisez la table des matières de votre e-book PLR pour définir les modules de votre formation.</p>
    `,
  },
  "gagner-ses-premiers-euros-en-ligne": {
    id: "gagner-ses-premiers-euros-en-ligne",
    title: "Plan d",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    author: "Captivateur",
    date: "10 juin 2026",
    readingTime: "10 min",
    content: `
<p class="lead">Vous souhaitez vous lancer mais ne savez pas par où commencer ? Suivez ce programme d'action rigoureux sur 30 jours pour générer vos premiers gains.</p>
    <h2>Jours 1 à 10 : Recherche & Packaging</h2>
    <p>Choisissez une niche rentable (comme le marketing ou le développement personnel). Achetez 2 ou 3 bons produits PLR sur cette thématique.</p>
    `,
  },
  "copywriting-arme-secrete-plr": {
    id: "copywriting-arme-secrete-plr",
    title: "Pourquoi le Copywriting est l",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    author: "Captivateur",
    date: "08 juin 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Pourquoi le Copywriting est l</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "chatgpt-reecriture-contenus-plr": {
    id: "chatgpt-reecriture-contenus-plr",
    title: "Comment Utiliser ChatGPT pour Réécrire vos Articles et E-books PLR de Façon Unique",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/fe/03/42/fe0342f603ac7837875cf11b89e166cb.jpg",
    author: "Captivateur",
    date: "06 juin 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Utiliser ChatGPT pour Réécrire vos Articles et E-books PLR de Façon Unique</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "videos-faceless-instagram-tiktok": {
    id: "videos-faceless-instagram-tiktok",
    title: "Créer et Vendre des Vidéos Faceless : La Nouvelle Révolution TikTok et Instagram",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    author: "Captivateur",
    date: "04 juin 2026",
    readingTime: "5 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Créer et Vendre des Vidéos Faceless : La Nouvelle Révolution TikTok et Instagram</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "vendre-templates-notion-profit": {
    id: "vendre-templates-notion-profit",
    title: "Le Guide pour Vendre des Templates Notion : Un Business Passif Ultra Rentable",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    author: "Captivateur",
    date: "02 juin 2026",
    readingTime: "8 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Le Guide pour Vendre des Templates Notion : Un Business Passif Ultra Rentable</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "eviter-piege-contenu-duplique-seo": {
    id: "eviter-piege-contenu-duplique-seo",
    title: "Comment Eviter le Piège du Contenu Dupliqué en Vendant des Produits PLR",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    author: "Captivateur",
    date: "31 mai 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Eviter le Piège du Contenu Dupliqué en Vendant des Produits PLR</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "erreurs-communes-selection-plr": {
    id: "erreurs-communes-selection-plr",
    title: "5 Erreurs Communes à Éviter lors du Choix de votre Premier Produit PLR",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/65/96/22/65962258ef0dfb6292cd542258910d93.jpg",
    author: "Captivateur",
    date: "29 mai 2026",
    readingTime: "5 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>5 Erreurs Communes à Éviter lors du Choix de votre Premier Produit PLR</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "lancer-business-plr-petit-budget": {
    id: "lancer-business-plr-petit-budget",
    title: "Comment Lancer un Business PLR avec un Budget de moins de 50€",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    author: "Captivateur",
    date: "27 mai 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Lancer un Business PLR avec un Budget de moins de 50€</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "rediger-pages-capture-qui-convertissent": {
    id: "rediger-pages-capture-qui-convertissent",
    title: "L",
    category: "Tunnels de Vente",
    image: "https://i.pinimg.com/736x/d7/8f/15/d78f15a04f3dd5aa39d2dd8114d0795a.jpg",
    author: "Captivateur",
    date: "25 mai 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>L</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "trafic-pinterest-ebooks-plr": {
    id: "trafic-pinterest-ebooks-plr",
    title: "Pinterest Marketing : Comment Attirer des Visiteurs Gratuits vers vos E-books",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/a7/ef/c4/a7efc418f54a1bb5455c8c78358fc331.jpg",
    author: "Captivateur",
    date: "23 mai 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Pinterest Marketing : Comment Attirer des Visiteurs Gratuits vers vos E-books</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "creer-mockups-sublimes-canva": {
    id: "creer-mockups-sublimes-canva",
    title: "Comment Utiliser Canva pour Créer des Mockups 3D Sublimes pour Vos Produits",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/42/49/34/424934352e063a46ba2ccade988228f9.jpg",
    author: "Captivateur",
    date: "21 mai 2026",
    readingTime: "5 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Utiliser Canva pour Créer des Mockups 3D Sublimes pour Vos Produits</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "puissance-sections-shopify-plr": {
    id: "puissance-sections-shopify-plr",
    title: "La Puissance des Sections Shopify PLR pour Personnaliser sa Boutique sans Code",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/ac/54/60/ac546038809ed3744b574f18019d4777.jpg",
    author: "Captivateur",
    date: "19 mai 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>La Puissance des Sections Shopify PLR pour Personnaliser sa Boutique sans Code</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "niche-developpement-personnel-plr": {
    id: "niche-developpement-personnel-plr",
    title: "Niche Self-Help / Développement Personnel : Pourquoi Elle Ne S",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    author: "Captivateur",
    date: "17 mai 2026",
    readingTime: "8 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Niche Self-Help / Développement Personnel : Pourquoi Elle Ne S</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "order-bump-panier-moyen": {
    id: "order-bump-panier-moyen",
    title: "Comment Configurer un Order Bump pour Augmenter la Valeur de Panier de 35%",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800&q=80",
    author: "Captivateur",
    date: "15 mai 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Configurer un Order Bump pour Augmenter la Valeur de Panier de 35%</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "guide-licence-mrr-vs-plr": {
    id: "guide-licence-mrr-vs-plr",
    title: "Le Guide Ultime de la Licence MRR (Master Resell Rights) vs PLR",
    category: "Digital PLR",
    image: "https://i.pinimg.com/736x/75/ca/1c/75ca1ce2ec37705f8b3254daa4547bac.jpg",
    author: "Captivateur",
    date: "12 mai 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Le Guide Ultime de la Licence MRR (Master Resell Rights) vs PLR</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "vendre-planners-financiers-digitaux": {
    id: "vendre-planners-financiers-digitaux",
    title: "Comment Vendre des Planners Financiers Digitaux : Guide de la Niche Argent",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    author: "Captivateur",
    date: "10 mai 2026",
    readingTime: "8 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Vendre des Planners Financiers Digitaux : Guide de la Niche Argent</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "optimiser-seo-formations-en-ligne": {
    id: "optimiser-seo-formations-en-ligne",
    title: "Optimiser votre SEO pour Vendre des Formations en Ligne en Automatique",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/d7/0b/99/d70b994be61d326e99b196229c07cbe9.jpg",
    author: "Captivateur",
    date: "08 mai 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Optimiser votre SEO pour Vendre des Formations en Ligne en Automatique</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "recuperer-abandon-panier-automatique": {
    id: "recuperer-abandon-panier-automatique",
    title: "Les Secrets de la Séquence d",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
    author: "Captivateur",
    date: "06 mai 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Les Secrets de la Séquence d</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "devenir-libre-financierement-education": {
    id: "devenir-libre-financierement-education",
    title: "Comment Devenir Libre Financièrement en Vendant des Contenus Éducatifs",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    author: "Captivateur",
    date: "04 mai 2026",
    readingTime: "9 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Comment Devenir Libre Financièrement en Vendant des Contenus Éducatifs</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "mobile-money-boost-ventes-afrique": {
    id: "mobile-money-boost-ventes-afrique",
    title: "Pourquoi Proposer le Paiement par Mobile Money Boost vos Ventes de 50% en Afrique",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/0f/fe/19/0ffe1988ad330ed66f1794d659b74e66.jpg",
    author: "Captivateur",
    date: "02 mai 2026",
    readingTime: "6 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Pourquoi Proposer le Paiement par Mobile Money Boost vos Ventes de 50% en Afrique</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
  "creer-communaute-privee-fidelisation": {
    id: "creer-communaute-privee-fidelisation",
    title: "Créer une Communauté Privée (Telegram, Skool) pour Fidéliser vos Clients",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&q=80",
    author: "Captivateur",
    date: "30 avril 2026",
    readingTime: "7 min",
    content: `
<p class="lead">Découvrez comment exploiter au mieux les stratégies liées à : <strong>Créer une Communauté Privée (Telegram, Skool) pour Fidéliser vos Clients</strong>. Cet article présente des conseils pratiques, des méthodologies et des retours d'expérience pour accélérer votre développement digital.</p>
    <h2>Les points essentiels à retenir</h2>
    <p>Pour mettre en place cette stratégie, vous devez vous concentrer sur trois piliers fondamentaux : la pertinence de l'offre, la régularité des actions marketing et la mesure constante des résultats pour optimisation.</p>
    <h2>Mise en pratique étape par étape</h2>
    <p>Commencez par définir vos objectifs à court terme, identifiez les outils requis (comme Canva, Shopify ou ChatGPT), puis implémentez la solution pas-à-pas en sollicitant les retours de vos premiers utilisateurs.</p>
    `,
  },
};

const MOCK_LIST = [
  {
    id: "introduction-produits-plr-droits-revente",
    title: "Le Guide Complet des Produits PLR : Créez et Vendez vos Produits Numériques en 1 Clic",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/17/eb/c0/17ebc083f4fc54ee0935eafbee1439aa.jpg",
    date: "1 juillet 2026",
    readingTime: "8 min",
  },
  {
    id: "comment-personnaliser-un-ebook-plr",
    title: "5 Étapes pour Transformer un E-book PLR en Best-Seller Unique",
    category: "Marketing",
    image: "https://i.pinimg.com/1200x/a0/17/b0/a017b032751a9466d66cfa3cb549eb42.jpg",
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
    image: "https://i.pinimg.com/1200x/4c/3a/97/4c3a97ab3db0f7e5ec5492aed87d65bf.jpg",
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
    title: "L",
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
    title: "Plan d",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    date: "10 juin 2026",
    readingTime: "10 min",
  },
  {
    id: "copywriting-arme-secrete-plr",
    title: "Pourquoi le Copywriting est l",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    date: "08 juin 2026",
    readingTime: "6 min",
  },
  {
    id: "chatgpt-reecriture-contenus-plr",
    title: "Comment Utiliser ChatGPT pour Réécrire vos Articles et E-books PLR de Façon Unique",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/fe/03/42/fe0342f603ac7837875cf11b89e166cb.jpg",
    date: "06 juin 2026",
    readingTime: "7 min",
  },
  {
    id: "videos-faceless-instagram-tiktok",
    title: "Créer et Vendre des Vidéos Faceless : La Nouvelle Révolution TikTok et Instagram",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    date: "04 juin 2026",
    readingTime: "5 min",
  },
  {
    id: "vendre-templates-notion-profit",
    title: "Le Guide pour Vendre des Templates Notion : Un Business Passif Ultra Rentable",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    date: "02 juin 2026",
    readingTime: "8 min",
  },
  {
    id: "eviter-piege-contenu-duplique-seo",
    title: "Comment Eviter le Piège du Contenu Dupliqué en Vendant des Produits PLR",
    category: "Digital PLR",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    date: "31 mai 2026",
    readingTime: "7 min",
  },
  {
    id: "erreurs-communes-selection-plr",
    title: "5 Erreurs Communes à Éviter lors du Choix de votre Premier Produit PLR",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/65/96/22/65962258ef0dfb6292cd542258910d93.jpg",
    date: "29 mai 2026",
    readingTime: "5 min",
  },
  {
    id: "lancer-business-plr-petit-budget",
    title: "Comment Lancer un Business PLR avec un Budget de moins de 50€",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    date: "27 mai 2026",
    readingTime: "6 min",
  },
  {
    id: "rediger-pages-capture-qui-convertissent",
    title: "L",
    category: "Tunnels de Vente",
    image: "https://i.pinimg.com/736x/d7/8f/15/d78f15a04f3dd5aa39d2dd8114d0795a.jpg",
    date: "25 mai 2026",
    readingTime: "7 min",
  },
  {
    id: "trafic-pinterest-ebooks-plr",
    title: "Pinterest Marketing : Comment Attirer des Visiteurs Gratuits vers vos E-books",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/a7/ef/c4/a7efc418f54a1bb5455c8c78358fc331.jpg",
    date: "23 mai 2026",
    readingTime: "6 min",
  },
  {
    id: "creer-mockups-sublimes-canva",
    title: "Comment Utiliser Canva pour Créer des Mockups 3D Sublimes pour Vos Produits",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/42/49/34/424934352e063a46ba2ccade988228f9.jpg",
    date: "21 mai 2026",
    readingTime: "5 min",
  },
  {
    id: "puissance-sections-shopify-plr",
    title: "La Puissance des Sections Shopify PLR pour Personnaliser sa Boutique sans Code",
    category: "Digital PLR",
    image: "https://i.pinimg.com/1200x/ac/54/60/ac546038809ed3744b574f18019d4777.jpg",
    date: "19 mai 2026",
    readingTime: "7 min",
  },
  {
    id: "niche-developpement-personnel-plr",
    title: "Niche Self-Help / Développement Personnel : Pourquoi Elle Ne S",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    date: "17 mai 2026",
    readingTime: "8 min",
  },
  {
    id: "order-bump-panier-moyen",
    title: "Comment Configurer un Order Bump pour Augmenter la Valeur de Panier de 35%",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800&q=80",
    date: "15 mai 2026",
    readingTime: "6 min",
  },
  {
    id: "guide-licence-mrr-vs-plr",
    title: "Le Guide Ultime de la Licence MRR (Master Resell Rights) vs PLR",
    category: "Digital PLR",
    image: "https://i.pinimg.com/736x/75/ca/1c/75ca1ce2ec37705f8b3254daa4547bac.jpg",
    date: "12 mai 2026",
    readingTime: "7 min",
  },
  {
    id: "vendre-planners-financiers-digitaux",
    title: "Comment Vendre des Planners Financiers Digitaux : Guide de la Niche Argent",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    date: "10 mai 2026",
    readingTime: "8 min",
  },
  {
    id: "optimiser-seo-formations-en-ligne",
    title: "Optimiser votre SEO pour Vendre des Formations en Ligne en Automatique",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/d7/0b/99/d70b994be61d326e99b196229c07cbe9.jpg",
    date: "08 mai 2026",
    readingTime: "7 min",
  },
  {
    id: "recuperer-abandon-panier-automatique",
    title: "Les Secrets de la Séquence d",
    category: "Tunnels de Vente",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
    date: "06 mai 2026",
    readingTime: "6 min",
  },
  {
    id: "devenir-libre-financierement-education",
    title: "Comment Devenir Libre Financièrement en Vendant des Contenus Éducatifs",
    category: "Niches Riches",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    date: "04 mai 2026",
    readingTime: "9 min",
  },
  {
    id: "mobile-money-boost-ventes-afrique",
    title: "Pourquoi Proposer le Paiement par Mobile Money Boost vos Ventes de 50% en Afrique",
    category: "Marketing",
    image: "https://i.pinimg.com/736x/0f/fe/19/0ffe1988ad330ed66f1794d659b74e66.jpg",
    date: "02 mai 2026",
    readingTime: "6 min",
  },
  {
    id: "creer-communaute-privee-fidelisation",
    title: "Créer une Communauté Privée (Telegram, Skool) pour Fidéliser vos Clients",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&q=80",
    date: "30 avril 2026",
    readingTime: "7 min",
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

    if (FALLBACK_ARTICLES_DETAILS[id]) {
      setLoading(true);
      window.scrollTo(0, 0);
      setArticle(FALLBACK_ARTICLES_DETAILS[id]);
      setRelatedArticles(MOCK_LIST.filter((a: any) => a.id !== id).slice(0, 3));
      setLoading(false);
      return;
    }

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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans relative" style={{ fontFamily: "'Manrope', -apple-system, sans-serif" }}>
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
