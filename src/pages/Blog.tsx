import React, { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,                
  ArrowRight,
  BookOpen,
  Sparkles,
  Filter,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";

// Fallback articles displayed when the NewsData.io API is unavailable
const BLOG_ARTICLES = [
  {
    "id": "business-en-ligne-comment-se-lancer",
    "title": "Business en ligne : comment se lancer et réussir en 2026",
    "category": "Niches Riches",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "excerpt": "Un business en ligne est une activité économique exercée entièrement sur internet. Il permet de générer des revenus depuis chez vous, sans stock...",
    "date": "17 juin 2026",
    "readingTime": "5 min"
  },
  {
    "id": "vendre-plr-sans-audience",
    "title": "Comment vendre du PLR sans audience : 5 canaux qui fonctionnent vraiment",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/b1/55/af/b155af78b8a4fe1a5361d8332e548296.jpg",
    "excerpt": "Vous débutez sans followers ni réseau social ? Découvrez 5 canaux concrets pour vendre du contenu PLR sans audience et générer vos premières ventes en ligne.",
    "date": "5 juin 2026",
    "readingTime": "6 min"
  },
  {
    "id": "creer-reel-faceless-rapide-plr",
    "title": "Créer un Reel Faceless en 15 Minutes avec des Vidéos PLR",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/1200x/02/38/42/023842c824bc0c4554d6320f578c11ee.jpg",
    "excerpt": "Créer un reel faceless en 15 minutes avec des vidéos PLR prêtes à l'emploi. Tutoriel complet étape par étape — sans caméra, sans visage, sans compétences techniques.",
    "date": "26 mai 2026",
    "readingTime": "7 min"
  },
  {
    "id": "budget-lancer-business-plr-france",
    "title": "Combien faut-il investir pour lancer un business PLR en France ?",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/07/d9/a7/07d9a7b6432c599f444c7c8e2fa82b76.jpg",
    "excerpt": "Combien investir pour lancer un business PLR en France en 2026 ? Découvrez le budget réel, les postes de dépenses et les options gratuites pour démarrer.",
    "date": "4 mai 2026",
    "readingTime": "8 min"
  },
  {
    "id": "comment-fixer-prix-produit-digital",
    "title": "Comment fixer le prix d'un produit digital en 2026 ?",
    "category": "Niches Riches",
    "image": "https://i.pinimg.com/1200x/e9/f9/1a/e9f91a9712c2017c4b56d5591d3cee4e.jpg",
    "excerpt": "Fixer le prix d'un produit digital est une décision stratégique. Découvrez les méthodes, les fourchettes de prix par type de produit et les erreurs à éviter.",
    "date": "1 mai 2026",
    "readingTime": "9 min"
  },
  {
    "id": "job-en-ligne-depuis-chez-soi",
    "title": "Quel job en ligne choisir quand on débute sans expérience ?",
    "category": "Niches Riches",
    "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    "excerpt": "Vous cherchez un job en ligne sans expérience ? Découvrez les meilleures options pour gagner de l'argent sur internet, même avec un petit budget.",
    "date": "30 avril 2026",
    "readingTime": "10 min"
  },
  {
    "id": "lexique-marketing-digital-debutants",
    "title": "Lexique du marketing digital : les 30 termes essentiels pour débutants",
    "category": "Digital PLR",
    "image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    "excerpt": "Les 30 termes du marketing digital expliqués simplement. SEO, funnel, PLR, CTR : le vocabulaire essentiel pour démarrer votre business en ligne in 2026.",
    "date": "29 avril 2026",
    "readingTime": "5 min"
  },
  {
    "id": "teachable-vs-systeme-io-comparatif-2026",
    "title": "Teachable vs Systeme.io : quelle plateforme choisir pour vendre votre formation ?",
    "category": "Tunnels de Vente",
    "image": "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&q=80",
    "excerpt": "Teachable vs Systeme.io : quel outil choisir pour vendre votre formation en ligne en 2026 ? Comparez les prix, tunnels de vente et plans gratuits disponibles.",
    "date": "28 avril 2026",
    "readingTime": "6 min"
  },
  {
    "id": "combien-gagner-produits-plr-revenus-realistes",
    "title": "Combien gagner avec des produits PLR en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/47/98/a2/4798a2dcddda9cce14ba4a6bbbfa1ee0.jpg",
    "excerpt": "Combien peut-on réellement gagner avec des produits PLR ? Découvrez des chiffres réalistes, une stratégie concrète et un plan pour atteindre 500€ par mois.",
    "date": "27 avril 2026",
    "readingTime": "7 min"
  },
  {
    "id": "monetiser-reseaux-sociaux-sans-influenceur",
    "title": "Monétiser ses réseaux sans être influenceur",
    "category": "Marketing",
    "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "excerpt": "Monétiser ses réseaux sans influenceur, c'est possible. Vendez des produits digitaux avec peu d'abonnés et générez des revenus automatiques dès aujourd'hui.",
    "date": "26 avril 2026",
    "readingTime": "8 min"
  },
  {
    "id": "systeme-io-vs-learnybox-comparatif-2026",
    "title": "Systeme.io vs Learnybox : comparatif 2026",
    "category": "Tunnels de Vente",
    "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "excerpt": "Systeme.io ou Learnybox pour vendre vos formations en ligne ? Comparatif complet des fonctionnalités, tarifs et points forts pour faire le bon choix en 2026.",
    "date": "25 avril 2026",
    "readingTime": "9 min"
  },
  {
    "id": "thrivecart-avis-tunnel-de-vente",
    "title": "ThriveCart avis : vendre sans commission",
    "category": "Tunnels de Vente",
    "image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    "excerpt": "ThriveCart est-il le meilleur outil pour vendre vos produits digitaux sans commission ? Découvrez notre avis complet, ses fonctionnalités et comment démarrer.",
    "date": "24 avril 2026",
    "readingTime": "10 min"
  },
  {
    "id": "lemon-squeezy-avis-vendre-produits-digitaux",
    "title": "Lemon Squeezy avis : vendre ses produits",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/736x/ca/6e/82/ca6e826d10df23c7b65dc7f124353559.jpg",
    "excerpt": "Lemon Squeezy est-il la meilleure plateforme pour vendre vos produits digitaux ? Découvrez notre avis complet, les frais, et comment démarrer gratuitement.",
    "date": "23 avril 2026",
    "readingTime": "5 min"
  },
  {
    "id": "meilleures-plateformes-vendre-produits-digitaux-2026",
    "title": "Les 7 meilleures plateformes pour vendre des produits digitaux en 2026",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/736x/aa/db/0d/aadb0d5632986e66fb566453d6ea13a9.jpg",
    "excerpt": "Quelle plateforme choisir pour vendre vos produits digitaux en 2026 ? Shopify, Hotmart, Stan Store… comparatif complet prix, commissions et fonctionnalités.",
    "date": "22 avril 2026",
    "readingTime": "6 min"
  },
  {
    "id": "creer-formation-en-ligne-guide-debutant",
    "title": "Comment créer une formation en ligne : guide complet pour débutants (2026)",
    "category": "Niches Riches",
    "image": "https://i.pinimg.com/736x/9e/d4/b8/9ed4b8e243d1c0d483e357c66089d6df.jpg",
    "excerpt": "Comment créer une formation en ligne en 2026 ? Découvrez les étapes, les outils et les plateformes pour lancer votre première formation digitale rentable.",
    "date": "21 avril 2026",
    "readingTime": "7 min"
  },
  {
    "id": "stan-store-vs-shopify-produits-digitaux",
    "title": "Stan Store vs Shopify : que choisir pour vendre des produits digitaux en 2026 ?",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/736x/13/22/36/13223668e0cf0a868c70cc0706f63533.jpg",
    "excerpt": "Stan Store ou Shopify pour vendre des produits digitaux ? Découvrez le complet comparatif : prix, fonctionnalités et SEO pour choisir la bonne plateforme.",
    "date": "20 avril 2026",
    "readingTime": "8 min"
  },
  {
    "id": "payhip-avis-vendre-produits-numeriques",
    "title": "Payhip avis : vendre des produits numériques",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/1200x/9d/87/48/9d87481db8667d32e3044dad1822e506.jpg",
    "excerpt": "Payhip permet de vendre des produits numériques sans abonnement avec 5% de commission et une affiliation native. Découvrez comment démarrer étape par étape.",
    "date": "19 avril 2026",
    "readingTime": "9 min"
  },
  {
    "id": "gumroad-vendre-produits-digitaux-avis",
    "title": "Gumroad avis : vendre des produits digitaux",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/1200x/f8/0e/39/f80e393d997b9ced8ac8c72c21a53579.jpg",
    "excerpt": "Gumroad permet de vendre des produits digitaux sans abonnement, grâce à un système simple. Découvrez comment publier votre premier produit en ligne.",
    "date": "18 avril 2026",
    "readingTime": "10 min"
  },
  {
    "id": "hotmart-avis-vendre-formation-en-ligne",
    "title": "Hotmart avis : vendre sa formation en ligne",
    "category": "Tunnels de Vente",
    "image": "https://i.pinimg.com/736x/cd/88/15/cd8815b2c0163b21d37feb23ac5db5ea.jpg",
    "excerpt": "Hotmart permet de vendre des formations en ligne sans frais fixes grâce à son système d'affiliation intégré. Découvrez comment démarrer étape par étape.",
    "date": "17 avril 2026",
    "readingTime": "5 min"
  },
  {
    "id": "vendre-sur-pinterest-produits-digitaux",
    "title": "Vendre sur Pinterest ses produits digitaux",
    "category": "Marketing",
    "image": "https://i.pinimg.com/736x/83/76/a5/8376a53d12d18b1b1d9522dcfee27bb3.jpg",
    "excerpt": "Apprenez à vendre sur Pinterest vos produits digitaux et générez un trafic gratuit durable vers votre boutique. Guide complet étape par étape pour débutants.",
    "date": "16 avril 2026",
    "readingTime": "6 min"
  },
  {
    "id": "email-marketing-vendre-plr",
    "title": "Email marketing pour vendre ses produits PLR : stratégie pour débutants",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/fe/60/ef/fe60ef0a2ed02a29075b6fda1bdb5179.jpg",
    "excerpt": "L'email marketing est le levier le plus rentable pour vendre ses produits PLR. Découvrez comment construire une liste et automatiser vos ventes dès 2026.",
    "date": "14 avril 2026",
    "readingTime": "7 min"
  },
  {
    "id": "print-on-demand-vs-plr",
    "title": "Print on demand vs PLR : comparatif complet pour débutants",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/13/a2/07/13a20704fb3e8a2178059e59d623f6b1.jpg",
    "excerpt": "Print on demand ou PLR : marges, livraison, scalabilité — tout est différent. Découvrez pourquoi le PLR numérique est le modèle le plus rentable pour débuter.",
    "date": "13 avril 2026",
    "readingTime": "8 min"
  },
  {
    "id": "canva-plr-personnaliser",
    "title": "Canva et PLR : comment personnaliser un produit PLR avec Canva gratuit",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/02/eb/aa/02ebaaf52e7a28faa3b7e982918fef79.jpg",
    "excerpt": "Personnaliser un produit PLR avec Canva gratuit prend moins d'une heure. Découvrez quels PLR sont compatibles et comment les transformer en produits premium à revendre.",
    "date": "12 avril 2026",
    "readingTime": "9 min"
  },
  {
    "id": "creer-boutique-shopify-produits-digitaux",
    "title": "Créer une boutique Shopify pour vendre des produits digitaux PLR",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/6b/5d/d4/6b5dd46b41c0851b46fca96f6d73e771.jpg",
    "excerpt": "Créer une boutique Shopify pour vendre des produits PLR est le moyen le plus solide de générer des revenus passifs. Découvrez les étapes clés pour lancer en 2026.",
    "date": "11 avril 2026",
    "readingTime": "10 min"
  },
  {
    "id": "plr-affiliation-difference",
    "title": "PLR vs affiliation : lequel choisir pour débuter ?",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/0c/9b/a4/0c9ba4eec55ceeda416b92679a5d159a.jpg",
    "excerpt": "PLR ou affiliation : deux modèles très différents. Découvrez lequel offre les meilleures marges, le plus de contrôle et le meilleur potentiel pour débuter en 2026.",
    "date": "10 avril 2026",
    "readingTime": "5 min"
  },
  {
    "id": "vendre-produits-plr-etsy-guide",
    "title": "Vendre des produits PLR sur Etsy : guide complet pour débutants",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/1200x/7c/b9/4d/7cb94da1e7951564e5bccbea25dcd9f8.jpg",
    "excerpt": "Vendre des produits PLR sur Etsy est le moyen le plus rapide de générer des revenus passifs sans créer de contenu. Découvrez comment démarrer pas à pas.",
    "date": "9 avril 2026",
    "readingTime": "6 min"
  },
  {
    "id": "pack-plr-francais-guide",
    "title": "Pack PLR français : guide complet pour bien choisir",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/9b/f0/3b/9bf03b23c24f217f7933b2e3602efc77.jpg",
    "excerpt": "Un pack PLR français regroupe des ressources digitales prêtes à revendre sous votre nom. Choisissez, personnalisez et monétisez en quelques jours.",
    "date": "5 avril 2026",
    "readingTime": "7 min"
  },
  {
    "id": "vendre-en-ligne-sans-stock",
    "title": "Vendre en ligne sans stock : guide complet pour débutants",
    "category": "Niches Riches",
    "image": "https://i.pinimg.com/736x/60/18/9b/60189b2346fb1678b6ebb96d8cc34274.jpg",
    "excerpt": "Vendre sans stock permet de lancer un e-commerce sans risque. Découvrez les 3 modèles, les marges réelles et les outils pour démarrer dès aujourd'hui.",
    "date": "3 avril 2026",
    "readingTime": "8 min"
  },
  {
    "id": "produit-plr-gratuit",
    "title": "Produit PLR gratuit : définition, où en trouver et comment l'utiliser",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/0e/02/e0/0e02e05759648375816661f2e7c073d3.jpg",
    "excerpt": "Un produit PLR gratuit est une ressource numérique offerte avec des droits de revente. Découvrez comment le trouver, le personnaliser et le rentabiliser dès aujourd'hui.",
    "date": "2 avril 2026",
    "readingTime": "9 min"
  },
  {
    "id": "produits-digitaux-plr-qui-se-vendent",
    "title": "7 produits digitaux PLR qui se vendent le mieux en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/a0/34/07/a03407620aefba0cb40ed79f2693871b.jpg",
    "excerpt": "Découvrez les 7 produits digitaux PLR qui se vendent le mieux en 2026 : ebooks, templates Canva, bundles. Guide complet avec marges et stratégie de revente.",
    "date": "1 avril 2026",
    "readingTime": "10 min"
  },
  {
    "id": "revenu-passif-internet-comparatif",
    "title": "Revenu passif internet en 2026 : PLR, dropshipping ou formation ?",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/42/61/e2/4261e28df24c7244e2d1d368dbd5e12b.jpg",
    "excerpt": "PLR, dropshipping digital ou formation en ligne : découvrez quel modèle de revenu passif internet choisir en 2026 selon votre profil et votre budget.",
    "date": "31 mars 2026",
    "readingTime": "5 min"
  },
  {
    "id": "master-resell-rights-comment-vendre",
    "title": "Master Resell Rights : comment vendre en 2026",
    "category": "Digital PLR",
    "image": "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&q=80",
    "excerpt": "Les Master Resell Rights permettent de vendre un produit digital et de transmettre les droits de revente à vos acheteurs. Voici comment démarrer.",
    "date": "30 mars 2026",
    "readingTime": "6 min"
  },
  {
    "id": "coloriage-kawaii-animaux-plr",
    "title": "Coloriage kawaii animaux : 68 designs PLR",
    "category": "Digital PLR",
    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    "excerpt": "Découvrez notre pack de 68 coloriages kawaii animaux avec licence PLR. Ours, lapin, renard, panda : des designs haute résolution prêts à imprimer et revendre.",
    "date": "30 mars 2026",
    "readingTime": "7 min"
  },
  {
    "id": "coloriage-kawaii-a-imprimer-plr",
    "title": "Coloriage kawaii à imprimer : meilleurs PLR",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/3f/a8/1a/3fa81ac68f922ff758b83c838a927507.jpg",
    "excerpt": "Découvrez où trouver les meilleurs coloriages kawaii à imprimer avec licence PLR. Chats, licornes, animaux : des fichiers haute résolution prêts à revendre.",
    "date": "29 mars 2026",
    "readingTime": "8 min"
  },
  {
    "id": "marketing-digital-vendre-produits-plr",
    "title": "Marketing digital pour vendre ses produits PLR",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/d5/bf/cf/d5bfcfbe3a81ae52264f4e64f705a7e9.jpg",
    "excerpt": "Découvrez les meilleures stratégies de marketing digital pour vendre vos produits PLR en 2026. SEO, Instagram, email : les canaux qui génèrent des ventes passives.",
    "date": "29 mars 2026",
    "readingTime": "9 min"
  },
  {
    "id": "vendre-coloriages-en-ligne-plr",
    "title": "Vendre des coloriages en ligne avec le PLR",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/1200x/77/9c/00/779c0010115d7e6751c43c35448f2aa6.jpg",
    "excerpt": "Découvrez comment vendre des coloriages en ligne grâce aux fichiers PLR kawaii. Lancez votre business digital en une journée, sans compétences graphiques.",
    "date": "28 mars 2026",
    "readingTime": "10 min"
  },
  {
    "id": "ebook-plr-francais",
    "title": "Ebook PLR français : définition, usage et revenus",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/7a/5a/0a/7a5a0aeb7fc7b8beb4166c83adf03669.jpg",
    "excerpt": "Un ebook PLR français vous permet de vendre sans rédiger. Découvrez comment générer des revenus passifs grâce à ces livres numériques avec droits.",
    "date": "28 mars 2026",
    "readingTime": "5 min"
  },
  {
    "id": "revenus-passifs-produits-digitaux-plr",
    "title": "Revenus passifs avec les produits digitaux : guide complet",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/f4/e8/ce/f4e8ceb55dd87982985c5e177a7e2cc1.jpg",
    "excerpt": "Générez des revenus passifs avec des produits digitaux PLR en 2026 : ebooks, templates, formations. Lancez votre système automatisé dès cette semaine.",
    "date": "27 mars 2026",
    "readingTime": "6 min"
  },
  {
    "id": "vendre-formation-en-ligne-guide-debutant",
    "title": "Vendre une formation en ligne : guide complet pour débutants",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/11/14/11/111411c21ad1ee49be0863b75e1f3bd7.jpg",
    "excerpt": "Découvrez comment vendre une formation en ligne en 2026 : niche, contenu PLR, prix et revenus passifs. Lancez votre première formation en moins d'une semaine.",
    "date": "26 mars 2026",
    "readingTime": "7 min"
  },
  {
    "id": "template-plr-comment-choisir-utiliser",
    "title": "Template PLR : comment choisir et utiliser en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/a0/ef/4d/a0ef4db5026636c0512a20ea70c7d3aa.jpg",
    "excerpt": "Découvrez ce qu'est un template PLR, comment le choisir selon votre niche et comment l'utiliser pour générer des revenus passifs en ligne dès 2026.",
    "date": "25 mars 2026",
    "readingTime": "8 min"
  },
  {
    "id": "monetiser-instagram-produits-plr",
    "title": "Monétiser Instagram avec des produits PLR : 7 méthodes en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/f8/f4/44/f8f4440e1fa78c6c9ece4d3bdb8335f9.jpg",
    "excerpt": "Découvrez 7 méthodes concrètes pour monétiser Instagram avec des produits PLR en 2026 : Reels, Stories, Carrousels et lien bio pour générer des revenus passifs.",
    "date": "24 mars 2026",
    "readingTime": "9 min"
  },
  {
    "id": "dropshipping-digital-vs-plr",
    "title": "Dropshipping digital vs PLR : lequel choisir pour votre business en 2026 ?",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/54/ff/0e/54ff0e345dba523b2dbf1f90d5eb3dde.jpg",
    "excerpt": "Dropshipping digital ou produits PLR : quel modèle choisir pour démarrer en 2026 ? Comparatif complet des marges, de la liberté et du potentiel passif.",
    "date": "23 mars 2026",
    "readingTime": "10 min"
  },
  {
    "id": "droits-de-revente-tout-comprendre",
    "title": "Droits de revente : tout ce qu'il faut savoir pour revendre légalement en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/1200x/8d/cb/1a/8dcb1aaf71007ca56cbe472eac4cc8b9.jpg",
    "excerpt": "Tout comprendre sur les droits de revente PLR, MRR et RR : définition, comparatif et étapes pour revendre légalement vos produits digitaux en France.",
    "date": "22 mars 2026",
    "readingTime": "5 min"
  },
  {
    "id": "formation-plr",
    "title": "Formation PLR : lancez votre business digital",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/6a/5e/ad/6a5eada6d6acef157767b422ae2bac1a.jpg",
    "excerpt": "Découvrez comment une formation PLR vous permet de vendre des produits digitaux dès cette semaine. Guide complet pour débutants avec étapes concrètes.",
    "date": "21 mars 2026",
    "readingTime": "6 min"
  },
  {
    "id": "quel-produit-digital-vendre-2026",
    "title": "Quel produit digital vendre en 2026 ?",
    "category": "Niches Riches",
    "image": "https://i.pinimg.com/736x/64/a5/80/64a5804d21bc2695e92a916b60fd9c93.jpg",
    "excerpt": "Découvrez quel produit digital vendre en 2026 pour générer des revenus en ligne. Comparatif complet, conseils débutants et guide pour choisir le bon produit.",
    "date": "21 mars 2026",
    "readingTime": "7 min"
  },
  {
    "id": "plr-signification",
    "title": "PLR signification : que veut vraiment dire Private Label Rights ?",
    "category": "Digital PLR",
    "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "excerpt": "PLR signifie Private Label Rights : une licence qui vous autorise à modifier et revendre un contenu digital sous votre nom. Guide complet pour débutants.",
    "date": "20 mars 2026",
    "readingTime": "8 min"
  },
  {
    "id": "idee-de-business",
    "title": "Idée de business en ligne : les 10 meilleures pour débutants en 2026",
    "category": "Niches Riches",
    "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "excerpt": "Quelle idée de business choisir en 2026 ? Les 10 meilleures idées rentables pour débutants — dont celle qui génère des revenus dès la première semaine.",
    "date": "20 mars 2026",
    "readingTime": "9 min"
  },
  {
    "id": "monetiser-tiktok",
    "title": "Monétiser TikTok en 2026 : la méthode faceless pour débutants",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/26/4f/4d/264f4d6b8ac494af391fca35b4021817.jpg",
    "excerpt": "Comment monétiser TikTok sans se montrer en 2026 ? La méthode faceless avec vidéos PLR pour débutants : tunnel complet et étapes actionnables.",
    "date": "20 mars 2026",
    "readingTime": "10 min"
  },
  {
    "id": "kit-digital-plr",
    "title": "Kit digital PLR : le couteau suisse pour lancer son business en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/1d/af/d8/1dafd86dcd7deec69138a29597755034.jpg",
    "excerpt": "Un kit digital PLR est un ensemble complet de contenus numériques — ebooks, vidéos, templates, planificateurs — livrés avec des droits de revente.",
    "date": "20 mars 2026",
    "readingTime": "5 min"
  },
  {
    "id": "bibliotheque-plr",
    "title": "Bibliothèque PLR : où trouver les meilleurs contenus à revendre en 2026 ?",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/1200x/9f/1b/ba/9f1bbafff3f8b77b5af1d124ad7872ec.jpg",
    "excerpt": "Une bibliothèque PLR est un catalogue centralisé de contenus digitaux accompagnés de droits de revente. Elle vous permet de trouver, télécharger et vendre...",
    "date": "20 mars 2026",
    "readingTime": "6 min"
  },
  {
    "id": "ou-acheter-des-produits-digitaux-a-revendre",
    "title": "Où acheter des produits digitaux à revendre ? Les meilleures sources en 2026",
    "category": "Digital PLR",
    "image": "https://i.pinimg.com/736x/1f/bb/13/1fbb13a0577a593e22546737c7bafafb.jpg",
    "excerpt": "Découvrez les meilleures sources pour acheter des produits digitaux à revendre en 2026. PLR francophones, plateformes fiables et conseils pour débutants.",
    "date": "20 mars 2026",
    "readingTime": "7 min"
  }
];

const CATEGORIES = [
  { slug: "All", fr: "Tout", en: "All", faIcon: "fa-solid fa-layer-group" },
  { slug: "Digital PLR", fr: "Digital PLR", en: "Digital PLR", faIcon: "fa-solid fa-box-open" },
  { slug: "Marketing", fr: "Marketing", en: "Marketing", faIcon: "fa-solid fa-rocket" },
  { slug: "Tunnels de Vente", fr: "Tunnels de Vente", en: "Sales Funnels", faIcon: "fa-solid fa-filter" },
  { slug: "Niches Riches", fr: "Niches Riches", en: "Profitable Niches", faIcon: "fa-solid fa-coins" },
];

export default function Blog() {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans" style={{ fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        title={
          lang === "fr"
            ? "Blog TECHNOVA | Guides, Tutoriels & Compétences Digitales"
            : "TECHNOVA Blog | Digital Skills, Guides & Tutorials"
        }
        description={
          lang === "fr"
            ? "Retrouvez nos guides complets, tutoriels pratiques et astuces de carrière rédigés par les experts de TECHNOVA."
            : "Find our detailed guides, hands-on tutorials, and career tips written by TECHNOVA experts."
        }
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
                      <Link to={`/blog/${featuredArticle.id}`}>{featuredArticle.title}</Link>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div>
                      <Link
                        to={`/blog/${featuredArticle.id}`}
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
                          <Link to={`/blog/${a.id}`}>{a.title}</Link>
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                          {a.excerpt}
                        </p>
                      </div>
                      <div>
                        <Link
                          to={`/blog/${a.id}`}
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
