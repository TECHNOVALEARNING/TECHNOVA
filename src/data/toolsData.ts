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
    isFeatured: false,
  },
  {
    id: "canva",
    name: "Canva",
    description: "Outil de création graphique intuitif pour vos visuels réseaux sociaux, présentations et logos.",
    websiteUrl: "https://canva.com",
    categories: ["Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    isFeatured: true,
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
    id: "make",
    name: "Make",
    description: "Automatisez vos tâches quotidiennes en connectant vos applications sans écrire une seule ligne de code.",
    websiteUrl: "https://make.com",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://mms.businesswire.com/media/20220222005085/en/1367069/23/Make-Logo-Black-RGB.jpg",
    promoCode: "TECHNOVA",
    discount: "1 Mois Pro Offert",
    isFeatured: false,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Le meilleur générateur de voix par IA. Clonez votre voix ou utilisez des voix ultra-réalistes pour vos vidéos.",
    websiteUrl: "https://elevenlabs.io",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/p5nwnnxyrycib1c76b1z",
    isFeatured: false,
  },
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
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Une IA redoutable pour l'écriture et le code. Souvent plus naturelle et précise que ChatGPT sur les longs textes.",
    websiteUrl: "https://claude.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Anthropic_logo.png",
    isFeatured: false,
  },
  {
    id: "semrush",
    name: "Semrush",
    description: "Outil complet pour le référencement (SEO), la recherche de mots-clés et l'analyse de la concurrence.",
    websiteUrl: "https://semrush.com",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Semrush_logo.svg/1200px-Semrush_logo.svg.png",
    isFeatured: false,
  }
];
