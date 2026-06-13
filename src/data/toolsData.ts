export type ToolCategory = 
  | "Intelligence Artificielle" 
  | "E-commerce" 
  | "CMS & Création de site" 
  | "Graphisme & Design" 
  | "Productivité & Automatisation" 
  | "Marketing & SEO";

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
];

export const topTools: Tool[] = [
  // --- INTELLIGENCE ARTIFICIELLE ---
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "L'assistant IA de référence pour rédiger, coder et analyser vos données en quelques secondes.",
    websiteUrl: "https://chatgpt.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    isFeatured: true,
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Une IA puissante pour l'écriture, la synthèse de documents et le code. Très naturel sur de longs textes.",
    websiteUrl: "https://claude.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Anthropic_logo.png",
    isFeatured: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Le modèle d'IA multimodal de Google, parfait pour la recherche, la rédaction et l'analyse.",
    websiteUrl: "https://gemini.google.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    isFeatured: true,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Le moteur de recherche dopé à l'IA. Posez une question, obtenez une réponse sourcée et fiable.",
    websiteUrl: "https://www.perplexity.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Perplexity_AI_logo.svg",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Générez des images époustouflantes et ultra-réalistes à partir de simples descriptions textuelles.",
    websiteUrl: "https://midjourney.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    isFeatured: true,
  },
  {
    id: "leonardo-ai",
    name: "Leonardo.ai",
    description: "Créez des assets de production et des images conceptuelles pour vos projets avec une IA générative avancée.",
    websiteUrl: "https://leonardo.ai",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://framerusercontent.com/images/XwBihv1P2zNtz05j3pL4Fj3i8E.png",
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    description: "Générateur d'images IA intégré à ChatGPT. Comprend de manière ultra-précise les requêtes textuelles complexes.",
    websiteUrl: "https://openai.com/dall-e-3",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/OpenAI_logo.svg",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Le meilleur générateur de voix par IA. Clonez votre voix ou utilisez des voix ultra-réalistes pour vos vidéos.",
    websiteUrl: "https://elevenlabs.io",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/p5nwnnxyrycib1c76b1z",
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "Créez des vidéos avec des avatars IA ultra-réalistes qui parlent avec votre voix dans plusieurs langues.",
    websiteUrl: "https://heygen.com",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://assets-global.website-files.com/63fdcbe48aa020c0a5493507/65668e61eb4d3d19ea73d0a2_heygen_logo_black.svg",
  },
  {
    id: "runwayml",
    name: "Runway",
    description: "Suite d'outils magiques dopés à l'IA pour générer et éditer des vidéos (Gen-2, Gen-3 Alpha).",
    websiteUrl: "https://runwayml.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Runway_ML_Logo.png/1200px-Runway_ML_Logo.png",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "La communauté open-source et plateforme de référence pour découvrir et héberger des modèles d'IA.",
    websiteUrl: "https://huggingface.co",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "Le copilote IA pour les développeurs. Autocomplétion intelligente de code directement dans votre éditeur.",
    websiteUrl: "https://github.com/features/copilot",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "Un éditeur de code dopé à l'IA, conçu pour programmer infiniment plus vite.",
    websiteUrl: "https://cursor.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://mintlify.s3-us-west-1.amazonaws.com/cursor/images/logo/app-logo.png",
  },
  {
    id: "jasper",
    name: "Jasper",
    description: "L'IA conçue pour les équipes marketing. Rédigez des articles, pubs et e-mails conformes à votre image de marque.",
    websiteUrl: "https://jasper.ai",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/y1gix8wnt3fss1wntofx",
  },

  // --- E-COMMERCE & CMS ---
  {
    id: "shopify",
    name: "Shopify",
    description: "La plateforme e-commerce leader pour créer et gérer votre boutique en ligne facilement.",
    websiteUrl: "https://shopify.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg",
    isFeatured: true,
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Le CMS le plus utilisé au monde pour créer des blogs, vitrines et sites professionnels.",
    websiteUrl: "https://wordpress.org",
    categories: ["CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png",
    isFeatured: true,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Transformez n'importe quel site WordPress en une puissante boutique e-commerce.",
    websiteUrl: "https://woocommerce.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg",
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Créez des sites web professionnels, responsives et animés visuellement, sans coder.",
    websiteUrl: "https://webflow.com",
    categories: ["CMS & Création de site", "Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/Webflow_logo_2023.svg",
    isFeatured: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "L'infrastructure de paiement en ligne pour internet. Acceptez les cartes et paiements mondiaux.",
    websiteUrl: "https://stripe.com",
    categories: ["E-commerce"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  },

  // --- GRAPHISME & DESIGN ---
  {
    id: "canva",
    name: "Canva",
    description: "Outil de création graphique intuitif pour vos visuels réseaux sociaux, présentations et logos.",
    websiteUrl: "https://canva.com",
    categories: ["Graphisme & Design", "Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    isFeatured: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "L'outil collaboratif de conception d'interfaces UI/UX leader sur le marché.",
    websiteUrl: "https://figma.com",
    categories: ["Graphisme & Design", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    isFeatured: true,
  },
  {
    id: "adobe-creative-cloud",
    name: "Adobe Creative Cloud",
    description: "La suite ultime (Photoshop, Illustrator, Premiere Pro) pour la création professionnelle.",
    websiteUrl: "https://adobe.com/creativecloud.html",
    categories: ["Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Adobe_Creative_Cloud_Rainbow_Icon.svg",
  },

  // --- PRODUCTIVITE & AUTOMATISATION ---
  {
    id: "make",
    name: "Make",
    description: "Automatisez vos tâches quotidiennes en connectant vos applications sans écrire une seule ligne de code.",
    websiteUrl: "https://make.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://mms.businesswire.com/media/20220222005085/en/1367069/23/Make-Logo-Black-RGB.jpg",
    promoCode: "TECHNOVA",
    discount: "1 Mois Pro Offert",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connectez plus de 5000 applications ensemble pour créer des workflows automatisés puissants.",
    websiteUrl: "https://zapier.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Zapier_logo.png",
    isFeatured: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Espace de travail tout-en-un pour gérer projets, documents, wikis et bases de données avec l'IA.",
    websiteUrl: "https://notion.so",
    categories: ["Productivité & Automatisation", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    isFeatured: true,
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Mi-tableur, mi-base de données. Organisez tout, de vos clients à votre pipeline de produits.",
    websiteUrl: "https://airtable.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg",
  },

  // --- MARKETING & SEO ---
  {
    id: "systemeio",
    name: "Systeme.io",
    description: "L'outil marketing tout-en-un pour créer des tunnels de vente, gérer vos emails et vendre vos formations.",
    websiteUrl: "https://systeme.io",
    categories: ["Marketing & SEO", "E-commerce"],
    logoUrl: "https://pbs.twimg.com/profile_images/1618625906232750080/4N3aV5K3_400x400.jpg",
    promoCode: "FREE",
    discount: "Compte Gratuit à Vie",
    isFeatured: true,
  },
  {
    id: "semrush",
    name: "Semrush",
    description: "Outil complet pour le référencement (SEO), la recherche de mots-clés et l'analyse de la concurrence.",
    websiteUrl: "https://semrush.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Semrush_logo.svg/1200px-Semrush_logo.svg.png",
    isFeatured: true,
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    description: "Un ensemble d'outils SEO puissant pour auditer des sites, explorer des mots-clés et analyser des backlinks.",
    websiteUrl: "https://ahrefs.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Ahrefs_logo.svg",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Plateforme d'emailing et d'automatisation marketing pour créer des campagnes de newsletters.",
    websiteUrl: "https://mailchimp.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Mailchimp_Logo_2024.svg",
  },
  {
    id: "brevo",
    name: "Brevo",
    description: "CRM et plateforme marketing multi-canal (Email, SMS, Chat). (Anciennement Sendinblue).",
    websiteUrl: "https://brevo.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Brevo_Logo.svg",
  }
];
