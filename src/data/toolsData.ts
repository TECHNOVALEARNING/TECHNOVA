export type ToolCategory =
  | "Intelligence Artificielle"
  | "E-commerce"
  | "CMS & Création de site"
  | "Graphisme & Design"
  | "Productivité & Automatisation"
  | "Marketing & SEO"
  | "Fintech & Banques";

export interface Tool {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  categories: ToolCategory[];
  logoUrl: string;
  isFeatured?: boolean;
  promoCode?: string;
  discount?: string;
}

export const toolsCategories: { id: ToolCategory; label: string }[] = [
  { id: "Intelligence Artificielle", label: "Intelligence Artificielle" },
  { id: "E-commerce", label: "E-commerce" },
  { id: "CMS & Création de site", label: "CMS & Création de site" },
  { id: "Graphisme & Design", label: "Graphisme & Design" },
  { id: "Productivité & Automatisation", label: "Productivité & Automatisation" },
  { id: "Marketing & SEO", label: "Marketing & SEO" },
  { id: "Fintech & Banques", label: "Fintech & Banques" },
];

export const toolsData: Tool[] = [
  // --- INTELLIGENCE ARTIFICIELLE ---
  {
    id: "antigravity",
    name: "Antigravity AI",
    description:
      "L'assistant IA de codage agentique le plus avancé par Google DeepMind. Développez et déployez à la vitesse de la lumière.",
    websiteUrl: "https://deepmind.google",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "/antigravity.svg",
    isFeatured: true,
  },
  {
    id: "v0",
    name: "v0 (Vercel)",
    description:
      "Générez des interfaces utilisateurs React et Tailwind CSS de haute qualité simplement en les décrivant.",
    websiteUrl: "https://v0.dev",
    categories: ["Intelligence Artificielle", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=v0.dev",
    isFeatured: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    description:
      "Le constructeur de logiciels IA. Générez des applications web complètes et modernes en quelques prompts.",
    websiteUrl: "https://lovable.dev",
    categories: ["Intelligence Artificielle", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=lovable.dev",
    isFeatured: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description:
      "L'assistant IA de référence pour rédiger, coder et analyser vos données en quelques secondes.",
    websiteUrl: "https://chatgpt.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=chatgpt.com",
    isFeatured: true,
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description:
      "Une IA puissante pour l'écriture, la synthèse de documents et le code. Très naturel sur de longs textes.",
    websiteUrl: "https://claude.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=claude.ai",
    isFeatured: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description:
      "Le modèle d'IA multimodal de Google, parfait pour la recherche, la rédaction et l'analyse.",
    websiteUrl: "https://gemini.google.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=gemini.google.com",
    isFeatured: true,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description:
      "Le moteur de recherche dopé à l'IA. Posez une question, obtenez une réponse sourcée et fiable.",
    websiteUrl: "https://www.perplexity.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=perplexity.ai",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description:
      "Générez des images époustouflantes et ultra-réalistes à partir de simples descriptions textuelles.",
    websiteUrl: "https://midjourney.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=midjourney.com",
    isFeatured: true,
  },
  {
    id: "leonardo-ai",
    name: "Leonardo.ai",
    description:
      "Créez des assets de production et des images conceptuelles pour vos projets avec une IA générative avancée.",
    websiteUrl: "https://leonardo.ai",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=leonardo.ai",
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    description:
      "Générateur d'images IA intégré à ChatGPT. Comprend de manière ultra-précise les requêtes textuelles complexes.",
    websiteUrl: "https://openai.com/dall-e-3",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=openai.com",
  },
  {
    id: "suno",
    name: "Suno AI",
    description:
      "Créez des chansons complètes (paroles, voix et musique) dans n'importe quel style à partir d'un prompt.",
    websiteUrl: "https://suno.com",
    categories: ["Intelligence Artificielle"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=suno.com",
  },
  {
    id: "synthesia",
    name: "Synthesia",
    description:
      "Plateforme de création vidéo IA de référence. Transformez votre texte en vidéos avec des avatars professionnels.",
    websiteUrl: "https://www.synthesia.io",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=synthesia.io",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description:
      "Le meilleur générateur de voix par IA. Clonez votre voix ou utilisez des voix ultra-réalistes pour vos vidéos.",
    websiteUrl: "https://elevenlabs.io",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=elevenlabs.io",
  },
  {
    id: "heygen",
    name: "HeyGen",
    description:
      "Créez des vidéos avec des avatars IA ultra-réalistes qui parlent avec votre voix dans plusieurs langues.",
    websiteUrl: "https://heygen.com",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=heygen.com",
  },
  {
    id: "runwayml",
    name: "Runway",
    description:
      "Suite d'outils magiques dopés à l'IA pour générer et éditer des vidéos (Gen-2, Gen-3 Alpha).",
    websiteUrl: "https://runwayml.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=runwayml.com",
  },
  {
    id: "gamma",
    name: "Gamma",
    description:
      "Créez des présentations, des documents et des pages web époustouflants en quelques secondes grâce à l'IA.",
    websiteUrl: "https://gamma.app",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=gamma.app",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description:
      "La communauté open-source et plateforme de référence pour découvrir et héberger des modèles d'IA.",
    websiteUrl: "https://huggingface.co",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=huggingface.co",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description:
      "Le copilote IA pour les développeurs. Autocomplétion intelligente de code directement dans votre éditeur.",
    websiteUrl: "https://github.com/features/copilot",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=github.com",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "Un éditeur de code dopé à l'IA, conçu pour programmer infiniment plus vite.",
    websiteUrl: "https://cursor.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=cursor.com",
  },
  {
    id: "jasper",
    name: "Jasper",
    description:
      "L'IA conçue pour les équipes marketing. Rédigez des articles, pubs et e-mails conformes à votre image de marque.",
    websiteUrl: "https://jasper.ai",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=jasper.ai",
  },
  {
    id: "copyai",
    name: "Copy.ai",
    description:
      "Générez des textes marketing, des articles de blog et des argumentaires de vente qui convertissent en un clic.",
    websiteUrl: "https://www.copy.ai",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=copy.ai",
  },

  // --- E-COMMERCE & CMS ---
  {
    id: "shopify",
    name: "Shopify",
    description:
      "La plateforme e-commerce leader pour créer et gérer votre boutique en ligne facilement.",
    websiteUrl: "https://shopify.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=shopify.com",
    isFeatured: true,
  },
  {
    id: "wordpress",
    name: "WordPress",
    description:
      "Le CMS le plus utilisé au monde pour créer des blogs, vitrines et sites professionnels.",
    websiteUrl: "https://wordpress.org",
    categories: ["CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=wordpress.org",
    isFeatured: true,
  },
  {
    id: "framer",
    name: "Framer",
    description:
      "Concevez et publiez des sites web interactifs et incroyablement rapides directement depuis un canevas visuel.",
    websiteUrl: "https://www.framer.com",
    categories: ["CMS & Création de site", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=framer.com",
    isFeatured: true,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Transformez n'importe quel site WordPress en une puissante boutique e-commerce.",
    websiteUrl: "https://woocommerce.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=woocommerce.com",
  },
  {
    id: "webflow",
    name: "Webflow",
    description:
      "Créez des sites web professionnels, responsives et animés visuellement, sans coder.",
    websiteUrl: "https://webflow.com",
    categories: ["CMS & Création de site", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=webflow.com",
    isFeatured: true,
  },
  {
    id: "wix",
    name: "Wix",
    description:
      "Créateur de sites web intuitif en glisser-déposer, idéal pour les petites entreprises et portefeuilles.",
    websiteUrl: "https://www.wix.com",
    categories: ["CMS & Création de site", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=wix.com",
  },
  {
    id: "gumroad",
    name: "Gumroad",
    description:
      "La plateforme de commerce électronique la plus simple pour permettre aux créateurs de vendre des produits digitaux.",
    websiteUrl: "https://gumroad.com",
    categories: ["E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=gumroad.com",
  },

  // --- GRAPHISME & DESIGN ---
  {
    id: "canva",
    name: "Canva",
    description:
      "Outil de création graphique intuitif pour vos visuels réseaux sociaux, présentations et logos.",
    websiteUrl: "https://canva.com",
    categories: ["Graphisme & Design", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=canva.com",
    isFeatured: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "L'outil collaboratif de conception d'interfaces UI/UX leader sur le marché.",
    websiteUrl: "https://figma.com",
    categories: ["Graphisme & Design", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=figma.com",
    isFeatured: true,
  },
  {
    id: "adobe-creative-cloud",
    name: "Adobe Creative Cloud",
    description:
      "La suite ultime (Photoshop, Illustrator, Premiere Pro) pour la création professionnelle.",
    websiteUrl: "https://adobe.com",
    categories: ["Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=adobe.com",
  },
  {
    id: "spline",
    name: "Spline",
    description:
      "Un outil de conception 3D facile à utiliser pour créer des scènes interactives directement dans le navigateur.",
    websiteUrl: "https://spline.design",
    categories: ["Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=spline.design",
  },
  {
    id: "lottiefiles",
    name: "LottieFiles",
    description:
      "Créez, éditez, testez et affichez des animations Lottie légères et évolutives sur tous vos appareils.",
    websiteUrl: "https://lottiefiles.com",
    categories: ["Graphisme & Design", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=lottiefiles.com",
  },

  // --- PRODUCTIVITE & AUTOMATISATION ---
  {
    id: "make",
    name: "Make",
    description:
      "Automatisez vos tâches quotidiennes en connectant vos applications sans écrire une seule ligne de code.",
    websiteUrl: "https://make.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=make.com",
    promoCode: "TECHNOVA",
    discount: "1 Mois Pro Offert",
  },
  {
    id: "zapier",
    name: "Zapier",
    description:
      "Connectez plus de 5000 applications ensemble pour créer des workflows automatisés puissants.",
    websiteUrl: "https://zapier.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=zapier.com",
    isFeatured: true,
  },
  {
    id: "n8n",
    name: "n8n",
    description:
      "Outil d'automatisation des workflows équitable, avec l'approche open source, vous donnant un contrôle total.",
    websiteUrl: "https://n8n.io",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=n8n.io",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Espace de travail tout-en-un pour gérer projets, documents, wikis et bases de données avec l'IA.",
    websiteUrl: "https://notion.so",
    categories: ["Productivité & Automatisation", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=notion.so",
    isFeatured: true,
  },
  {
    id: "airtable",
    name: "Airtable",
    description:
      "Mi-tableur, mi-base de données. Organisez tout, de vos clients à votre pipeline de produits.",
    websiteUrl: "https://airtable.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=airtable.com",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Plateforme de messagerie d'entreprise conçue pour rendre la collaboration plus fluide.",
    websiteUrl: "https://slack.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=slack.com",
  },
  {
    id: "trello",
    name: "Trello",
    description:
      "Outil de gestion de projet visuel collaboratif qui organise vos projets en tableaux.",
    websiteUrl: "https://trello.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=trello.com",
  },

  // --- MARKETING & SEO ---
  {
    id: "systemeio",
    name: "Systeme.io",
    description:
      "L'outil marketing tout-en-un pour créer des tunnels de vente, gérer vos emails et vendre vos formations.",
    websiteUrl: "https://systeme.io",
    categories: ["Marketing & SEO", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=systeme.io",
    promoCode: "FREE",
    discount: "Compte Gratuit à Vie",
    isFeatured: true,
  },
  {
    id: "semrush",
    name: "Semrush",
    description:
      "Outil complet pour le référencement (SEO), la recherche de mots-clés et l'analyse de la concurrence.",
    websiteUrl: "https://semrush.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=semrush.com",
    isFeatured: true,
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    description:
      "Un ensemble d'outils SEO puissant pour auditer des sites, explorer des mots-clés et analyser des backlinks.",
    websiteUrl: "https://ahrefs.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=ahrefs.com",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Plateforme CRM complète avec tous les logiciels dont vous avez besoin pour le marketing et les ventes.",
    websiteUrl: "https://www.hubspot.com",
    categories: ["Marketing & SEO", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=hubspot.com",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Plateforme d'emailing et d'automatisation marketing pour créer des campagnes de newsletters.",
    websiteUrl: "https://mailchimp.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=mailchimp.com",
  },
  {
    id: "brevo",
    name: "Brevo",
    description:
      "CRM et plateforme marketing multi-canal (Email, SMS, Chat). (Anciennement Sendinblue).",
    websiteUrl: "https://brevo.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=brevo.com",
  },
  {
    id: "typeform",
    name: "Typeform",
    description:
      "Créez des formulaires, enquêtes et quiz conversationnels et engageants qui obtiennent plus de réponses.",
    websiteUrl: "https://www.typeform.com",
    categories: ["Marketing & SEO", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=typeform.com",
  },

  // --- NOUVEAUTÉS & FINTECH ---
  {
    id: "anijam",
    name: "Anijam AI",
    description:
      "La plateforme IA tout-en-un pour générer et éditer des vidéos d'animation complètes à partir de texte.",
    websiteUrl: "https://www.anijam.ai/?via=isidore",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=anijam.ai",
    isFeatured: true,
  },
  {
    id: "paystack",
    name: "Paystack",
    description:
      "Une passerelle de paiement leader. Acceptez des paiements sécurisés de partout dans le monde.",
    websiteUrl: "https://paystack.com",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=paystack.com",
    isFeatured: true,
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description:
      "Infrastructures de paiement sécurisées. Vendez en ligne, traitez les paiements et développez votre activité.",
    websiteUrl: "https://flutterwave.com",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=flutterwave.com",
  },
  {
    id: "grey",
    name: "Grey",
    description:
      "Banque digitale idéale pour les freelances et créateurs de contenu. Obtenez des comptes en USD, EUR et GBP pour recevoir vos paiements.",
    websiteUrl: "https://greyapp.page.link/jixhVD5wH6mdykEY7",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=grey.co",
    isFeatured: true,
  },
  {
    id: "accrue",
    name: "Accrue",
    description:
      "Épargnez et investissez facilement en dollars ou en crypto, et effectuez des paiements transfrontaliers sécurisés.",
    websiteUrl: "https://useaccrue.com/join?ref=XSZHWV43",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=useaccrue.com",
    isFeatured: true,
  },
  {
    id: "moneco",
    name: "Moneco",
    description:
      "La néo-banque mondiale pour les transferts et la gestion d'argent. Compte multidevises et transferts facilités sans frais cachés.",
    websiteUrl: "https://www.moneco.app",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=moneco.app",
  },
  {
    id: "stripe",
    name: "Stripe",
    description:
      "L'infrastructure de paiement en ligne pour internet. Acceptez les cartes et paiements mondiaux.",
    websiteUrl: "https://stripe.com",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=stripe.com",
  },
  {
    id: "wise",
    name: "Wise",
    description:
      "La façon la moins chère et la plus rapide d'envoyer de l'argent à l'international avec les vrais taux de change.",
    websiteUrl: "https://wise.com",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=wise.com",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    description:
      "Recevez des paiements de clients et marketplaces mondiales directement sur votre compte.",
    websiteUrl: "https://www.payoneer.com",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=payoneer.com",
  },
  {
    id: "binance",
    name: "Binance",
    description:
      "La plus grande plateforme d'échange de cryptomonnaies au monde. Idéal pour investir et trader.",
    websiteUrl: "https://www.binance.com",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=binance.com",
    isFeatured: true,
  },
  // --- NOUVEAUX OUTILS AJOUTÉS (IA, Marketing, Fintech, Design) ---
  {
    id: "writesonic",
    name: "Writesonic",
    description:
      "Générateur de texte et d'images IA conçu spécifiquement pour créer du contenu optimisé SEO pour les blogs et publicités.",
    websiteUrl: "https://writesonic.com",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=writesonic.com",
  },
  {
    id: "krea-ai",
    name: "Krea AI",
    description:
      "Génération et amélioration d'images en temps réel avec l'IA. Un outil révolutionnaire pour les designers et créatifs.",
    websiteUrl: "https://www.krea.ai",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=krea.ai",
  },
  {
    id: "luma-dream-machine",
    name: "Luma Dream Machine",
    description:
      "Générateur de vidéos IA ultra-réalistes et rapides à partir de texte ou d'images.",
    websiteUrl: "https://lumalabs.ai/dream-machine",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=lumalabs.ai",
  },
  {
    id: "mistral-ai",
    name: "Mistral AI",
    description:
      "Le fleuron français de l'Intelligence Artificielle. Modèles open-source extrêmement performants et rapides (Le Chat).",
    websiteUrl: "https://mistral.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=mistral.ai",
    isFeatured: true,
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    description:
      "L'outil de référence mondial et gratuit pour suivre et analyser le trafic et le comportement de vos utilisateurs.",
    websiteUrl: "https://analytics.google.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=analytics.google.com",
  },
  {
    id: "meta-ads",
    name: "Meta Ads Manager",
    description:
      "La plateforme publicitaire incontournable pour créer et gérer des campagnes ciblées sur Facebook et Instagram.",
    websiteUrl: "https://business.facebook.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=facebook.com",
  },
  {
    id: "hootsuite",
    name: "Hootsuite",
    description:
      "Gérez tous vos réseaux sociaux (planification, publication, analyse) depuis un seul et même tableau de bord.",
    websiteUrl: "https://hootsuite.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=hootsuite.com",
  },
  {
    id: "ubersuggest",
    name: "Ubersuggest",
    description:
      "Outil SEO abordable de Neil Patel pour trouver des mots-clés, des idées de contenu et analyser la concurrence.",
    websiteUrl: "https://neilpatel.com/ubersuggest/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=neilpatel.com",
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    description:
      "Plateforme puissante d'automatisation de l'expérience client (CXA) combinant email marketing, automatisation et CRM.",
    websiteUrl: "https://www.activecampaign.com",
    categories: ["Marketing & SEO", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=activecampaign.com",
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    description:
      "La famille de modèles d'IA générative créative d'Adobe, conçue pour un usage commercial en toute sécurité.",
    websiteUrl: "https://firefly.adobe.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=adobe.com",
  },
  {
    id: "capcut",
    name: "CapCut",
    description:
      "Éditeur vidéo tout-en-un gratuit de ByteDance (TikTok) très puissant pour PC, Mac et mobile.",
    websiteUrl: "https://www.capcut.com",
    categories: ["Graphisme & Design", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=capcut.com",
    isFeatured: true,
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    description:
      "Le seul logiciel de montage vidéo, étalonnage, effets visuels et post-production audio de qualité hollywoodienne gratuit.",
    websiteUrl: "https://www.blackmagicdesign.com/products/davinciresolve",
    categories: ["Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=blackmagicdesign.com",
  },
  {
    id: "blender",
    name: "Blender",
    description:
      "La suite de création 3D open-source et gratuite. Modélisation, animation, rendu, compositing et montage vidéo.",
    websiteUrl: "https://www.blender.org",
    categories: ["Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=blender.org",
  },
  {
    id: "asana",
    name: "Asana",
    description:
      "Plateforme de gestion de travail pour organiser, suivre et gérer les projets et tâches de votre équipe.",
    websiteUrl: "https://asana.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=asana.com",
  },
  {
    id: "monday",
    name: "Monday.com",
    description:
      "Système d'exploitation de travail visuel (Work OS) permettant aux équipes de créer des flux de travail personnalisés.",
    websiteUrl: "https://monday.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=monday.com",
  },
  {
    id: "clickup",
    name: "ClickUp",
    description:
      "Une seule application pour les remplacer toutes. Tâches, documents, discussions, objectifs et bien plus.",
    websiteUrl: "https://clickup.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=clickup.com",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description:
      "Tous vos outils professionnels familiers (Gmail, Drive, Docs, Meet) centralisés pour les entreprises.",
    websiteUrl: "https://workspace.google.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=workspace.google.com",
  },
  {
    id: "paypal",
    name: "PayPal",
    description:
      "La solution mondiale de paiement en ligne, rapide et sécurisée pour envoyer et recevoir de l'argent.",
    websiteUrl: "https://www.paypal.com",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=paypal.com",
  },
  {
    id: "square",
    name: "Square",
    description:
      "Solutions de paiement en magasin et en ligne, point de vente et outils de gestion d'entreprise.",
    websiteUrl: "https://squareup.com",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=squareup.com",
  },
  {
    id: "skrill",
    name: "Skrill",
    description:
      "Portefeuille numérique mondial permettant de payer en ligne, envoyer de l'argent et acheter des cryptos.",
    websiteUrl: "https://www.skrill.com",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=skrill.com",
  },
  {
    id: "prestashop",
    name: "PrestaShop",
    description:
      "Logiciel e-commerce open-source d'origine française, très puissant et utilisé par des milliers de boutiques.",
    websiteUrl: "https://www.prestashop.com",
    categories: ["CMS & Création de site", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=prestashop.com",
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    description:
      "Plateforme e-commerce cloud très robuste, idéale pour les entreprises en forte croissance (SaaS).",
    websiteUrl: "https://www.bigcommerce.com",
    categories: ["CMS & Création de site", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=bigcommerce.com",
  },
  {
    id: "hostinger",
    name: "Hostinger",
    description:
      "Hébergement web rapide, sécurisé et très abordable. Parfait pour lancer son premier site WordPress.",
    websiteUrl: "https://www.hostinger.com",
    categories: ["CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=hostinger.com",
  },
  {
    id: "calendly",
    name: "Calendly",
    description:
      "Logiciel de planification en ligne gratuit qui vous fait gagner du temps en automatisant la prise de rendez-vous.",
    websiteUrl: "https://calendly.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=calendly.com",
  },
  {
    id: "canva-video",
    name: "Canva Vidéo",
    description:
      "L'éditeur vidéo intégré à Canva, simple et intuitif pour créer des TikToks, Reels et vidéos YouTube.",
    websiteUrl: "https://www.canva.com/video-editor/",
    categories: ["Graphisme & Design", "Intelligence Artificielle"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=canva.com",
  },
];
