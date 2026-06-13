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

export const topTools: Tool[] = [
  // --- INTELLIGENCE ARTIFICIELLE ---
  {
    id: "antigravity",
    name: "Antigravity AI",
    description: "L'assistant IA de codage agentique le plus avancé par Google DeepMind. Développez et déployez à la vitesse de la lumière.",
    websiteUrl: "https://deepmind.google",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=deepmind.google",
    isFeatured: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Le constructeur de logiciels IA. Générez des applications web complètes et modernes en quelques prompts.",
    websiteUrl: "https://lovable.dev",
    categories: ["Intelligence Artificielle", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=lovable.dev",
    isFeatured: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "L'assistant IA de référence pour rédiger, coder et analyser vos données en quelques secondes.",
    websiteUrl: "https://chatgpt.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=chatgpt.com",
    isFeatured: true,
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Une IA puissante pour l'écriture, la synthèse de documents et le code. Très naturel sur de longs textes.",
    websiteUrl: "https://claude.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=claude.ai",
    isFeatured: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Le modèle d'IA multimodal de Google, parfait pour la recherche, la rédaction et l'analyse.",
    websiteUrl: "https://gemini.google.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=gemini.google.com",
    isFeatured: true,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Le moteur de recherche dopé à l'IA. Posez une question, obtenez une réponse sourcée et fiable.",
    websiteUrl: "https://www.perplexity.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=perplexity.ai",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Générez des images époustouflantes et ultra-réalistes à partir de simples descriptions textuelles.",
    websiteUrl: "https://midjourney.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=midjourney.com",
    isFeatured: true,
  },
  {
    id: "leonardo-ai",
    name: "Leonardo.ai",
    description: "Créez des assets de production et des images conceptuelles pour vos projets avec une IA générative avancée.",
    websiteUrl: "https://leonardo.ai",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=leonardo.ai",
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    description: "Générateur d'images IA intégré à ChatGPT. Comprend de manière ultra-précise les requêtes textuelles complexes.",
    websiteUrl: "https://openai.com/dall-e-3",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=openai.com",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Le meilleur générateur de voix par IA. Clonez votre voix ou utilisez des voix ultra-réalistes pour vos vidéos.",
    websiteUrl: "https://elevenlabs.io",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=elevenlabs.io",
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "Créez des vidéos avec des avatars IA ultra-réalistes qui parlent avec votre voix dans plusieurs langues.",
    websiteUrl: "https://heygen.com",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=heygen.com",
  },
  {
    id: "runwayml",
    name: "Runway",
    description: "Suite d'outils magiques dopés à l'IA pour générer et éditer des vidéos (Gen-2, Gen-3 Alpha).",
    websiteUrl: "https://runwayml.com",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=runwayml.com",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "La communauté open-source et plateforme de référence pour découvrir et héberger des modèles d'IA.",
    websiteUrl: "https://huggingface.co",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=huggingface.co",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "Le copilote IA pour les développeurs. Autocomplétion intelligente de code directement dans votre éditeur.",
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
    description: "L'IA conçue pour les équipes marketing. Rédigez des articles, pubs et e-mails conformes à votre image de marque.",
    websiteUrl: "https://jasper.ai",
    categories: ["Intelligence Artificielle", "Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=jasper.ai",
  },

  // --- E-COMMERCE & CMS ---
  {
    id: "shopify",
    name: "Shopify",
    description: "La plateforme e-commerce leader pour créer et gérer votre boutique en ligne facilement.",
    websiteUrl: "https://shopify.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=shopify.com",
    isFeatured: true,
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Le CMS le plus utilisé au monde pour créer des blogs, vitrines et sites professionnels.",
    websiteUrl: "https://wordpress.org",
    categories: ["CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=wordpress.org",
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
    description: "Créez des sites web professionnels, responsives et animés visuellement, sans coder.",
    websiteUrl: "https://webflow.com",
    categories: ["CMS & Création de site", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=webflow.com",
    isFeatured: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "L'infrastructure de paiement en ligne pour internet. Acceptez les cartes et paiements mondiaux.",
    websiteUrl: "https://stripe.com",
    categories: ["E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=stripe.com",
  },

  // --- GRAPHISME & DESIGN ---
  {
    id: "canva",
    name: "Canva",
    description: "Outil de création graphique intuitif pour vos visuels réseaux sociaux, présentations et logos.",
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
    description: "La suite ultime (Photoshop, Illustrator, Premiere Pro) pour la création professionnelle.",
    websiteUrl: "https://adobe.com",
    categories: ["Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=adobe.com",
  },

  // --- PRODUCTIVITE & AUTOMATISATION ---
  {
    id: "make",
    name: "Make",
    description: "Automatisez vos tâches quotidiennes en connectant vos applications sans écrire une seule ligne de code.",
    websiteUrl: "https://make.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=make.com",
    promoCode: "TECHNOVA",
    discount: "1 Mois Pro Offert",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connectez plus de 5000 applications ensemble pour créer des workflows automatisés puissants.",
    websiteUrl: "https://zapier.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=zapier.com",
    isFeatured: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Espace de travail tout-en-un pour gérer projets, documents, wikis et bases de données avec l'IA.",
    websiteUrl: "https://notion.so",
    categories: ["Productivité & Automatisation", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=notion.so",
    isFeatured: true,
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Mi-tableur, mi-base de données. Organisez tout, de vos clients à votre pipeline de produits.",
    websiteUrl: "https://airtable.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=airtable.com",
  },

  // --- MARKETING & SEO ---
  {
    id: "systemeio",
    name: "Systeme.io",
    description: "L'outil marketing tout-en-un pour créer des tunnels de vente, gérer vos emails et vendre vos formations.",
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
    description: "Outil complet pour le référencement (SEO), la recherche de mots-clés et l'analyse de la concurrence.",
    websiteUrl: "https://semrush.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=semrush.com",
    isFeatured: true,
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    description: "Un ensemble d'outils SEO puissant pour auditer des sites, explorer des mots-clés et analyser des backlinks.",
    websiteUrl: "https://ahrefs.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=ahrefs.com",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Plateforme d'emailing et d'automatisation marketing pour créer des campagnes de newsletters.",
    websiteUrl: "https://mailchimp.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=mailchimp.com",
  },
  {
    id: "brevo",
    name: "Brevo",
    description: "CRM et plateforme marketing multi-canal (Email, SMS, Chat). (Anciennement Sendinblue).",
    websiteUrl: "https://brevo.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=brevo.com",
  },

  // --- NOUVEAUTÉS & FINTECH ---
  {
    id: "anijam",
    name: "Anijam AI",
    description: "La plateforme IA tout-en-un pour générer et éditer des vidéos d'animation complètes à partir de texte.",
    websiteUrl: "https://www.anijam.ai/?via=isidore",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=anijam.ai",
    isFeatured: true,
  },
  {
    id: "grey",
    name: "Grey",
    description: "Banque digitale idéale pour les freelances africains. Obtenez des comptes en USD, EUR et GBP pour recevoir vos paiements.",
    websiteUrl: "https://greyapp.page.link/jixhVD5wH6mdykEY7",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=grey.co",
    isFeatured: true,
  },
  {
    id: "accrue",
    name: "Accrue",
    description: "Épargnez et investissez facilement en dollars ou en crypto, et effectuez des paiements transfrontaliers en Afrique.",
    websiteUrl: "https://useaccrue.com/join?ref=XSZHWV43",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=useaccrue.com",
    isFeatured: true,
  },
  {
    id: "moneco",
    name: "Moneco",
    description: "La néo-banque de la diaspora africaine et des locaux. Compte en euros et transferts facilités sans frais cachés.",
    websiteUrl: "https://www.moneco.app",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=moneco.app",
  },
  {
    id: "binance",
    name: "Binance",
    description: "La plus grande plateforme d'échange de cryptomonnaies au monde. Idéal pour investir et trader.",
    websiteUrl: "https://www.binance.com",
    categories: ["Fintech & Banques"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=binance.com",
    isFeatured: true,
  }
];
