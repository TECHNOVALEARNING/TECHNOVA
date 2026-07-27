const fs = require('fs');

const iconMap = JSON.parse(fs.readFileSync('scratch/final_icon_map.json', 'utf8'));
const formattedTools = JSON.parse(fs.readFileSync('scratch/formatted_tools.json', 'utf8'));

// Existing featured tools with custom icon names
const existingTopTools = [
  {
    id: "antigravity",
    name: "Antigravity AI",
    description: "L'assistant IA de codage agentique le plus avancé par Google DeepMind. Développez et déployez à la vitesse de la lumière.",
    websiteUrl: "https://deepmind.google",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "/antigravity.svg",
    iconName: "Sparkles",
    isFeatured: true,
  },
  {
    id: "v0",
    name: "v0 (Vercel)",
    description: "Générez des interfaces utilisateurs React et Tailwind CSS de haute qualité simplement en les décrivant.",
    websiteUrl: "https://v0.dev",
    categories: ["Intelligence Artificielle", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=v0.dev",
    iconName: "Code",
    isFeatured: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Le constructeur de logiciels IA. Générez des applications web complètes et modernes en quelques prompts.",
    websiteUrl: "https://lovable.dev",
    categories: ["Intelligence Artificielle", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=lovable.dev",
    iconName: "Heart",
    isFeatured: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "L'assistant IA de référence pour rédiger, coder et analyser vos données en quelques secondes.",
    websiteUrl: "https://chatgpt.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=chatgpt.com",
    iconName: "MessageSquare",
    isFeatured: true,
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Une IA puissante pour l'écriture, la synthèse de documents et le code. Très naturel sur de longs textes.",
    websiteUrl: "https://claude.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=claude.ai",
    iconName: "Bot",
    isFeatured: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Le modèle d'IA multimodal de Google, parfait pour la recherche, la rédaction et l'analyse.",
    websiteUrl: "https://gemini.google.com",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=gemini.google.com",
    iconName: "Cpu",
    isFeatured: true,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Le moteur de recherche dopé à l'IA. Posez une question, obtenez une réponse sourcée et fiable.",
    websiteUrl: "https://www.perplexity.ai",
    categories: ["Intelligence Artificielle", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=perplexity.ai",
    iconName: "Globe",
    isFeatured: true,
  },
  {
    id: "canva",
    name: "Canva",
    description: "La plateforme tout-en-un de design graphique, présentations et création de contenus réseaux sociaux.",
    websiteUrl: "https://www.canva.com",
    categories: ["Graphisme & Design", "Productivité & Automatisation"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=canva.com",
    iconName: "Palette",
    isFeatured: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "L'outil collaboratif de référence pour le design d'interfaces (UI/UX) et le prototypage.",
    websiteUrl: "https://www.figma.com",
    categories: ["Graphisme & Design", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=figma.com",
    iconName: "Layout",
    isFeatured: true,
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "La solution e-commerce globale pour créer et gérer sa boutique en ligne facilement.",
    websiteUrl: "https://www.shopify.com",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=shopify.com",
    iconName: "ShoppingCart",
    isFeatured: true,
  },
  {
    id: "kkiapay",
    name: "KKiaPay",
    description: "L'agrégateur de paiement Mobile Money et Carte Bancaire incontournable en Afrique de l'Ouest.",
    websiteUrl: "https://kkiapay.me",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=kkiapay.me",
    iconName: "CreditCard",
    isFeatured: true,
  },
  {
    id: "feexpay",
    name: "FeexPay",
    description: "Solution complète d'encaissement Mobile Money et cartes bancaires intégrée pour marchands et créateurs.",
    websiteUrl: "https://feexpay.me",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://www.google.com/s2/favicons?sz=256&domain_url=feexpay.me",
    iconName: "Wallet",
    isFeatured: true,
  }
];

const seenIds = new Set(existingTopTools.map(t => t.id));

const mergedTools = [...existingTopTools];

formattedTools.forEach(t => {
  if (!seenIds.has(t.id)) {
    seenIds.add(t.id);
    const iconName = iconMap[t.id] || "Wrench";
    mergedTools.push({
      ...t,
      iconName,
    });
  }
});

console.log(`Total merged tools with iconName: ${mergedTools.length}`);

const codeContent = `export type ToolCategory =
  | "Intelligence Artificielle"
  | "E-commerce"
  | "CMS & Création de site"
  | "Graphisme & Design"
  | "Productivité & Automatisation"
  | "Marketing & SEO"
  | "Fintech & Banques"
  | "Calcul & Science"
  | "Développement & Code"
  | "Rédaction & Texte"
  | "Utilitaires & Quotidien";

export interface Tool {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  categories: ToolCategory[];
  logoUrl: string;
  iconName?: string;
  isFeatured?: boolean;
  promoCode?: string;
  discount?: string;
}

export const toolsCategories: { id: ToolCategory; label: string }[] = [
  { id: "Intelligence Artificielle", label: "🤖 IA & Générateurs" },
  { id: "Productivité & Automatisation", label: "⚡ Productivité" },
  { id: "Calcul & Science", label: "🧮 Calcul & Science" },
  { id: "Développement & Code", label: "💻 Développement & Code" },
  { id: "Rédaction & Texte", label: "✍️ Rédaction & Texte" },
  { id: "Graphisme & Design", label: "🎨 Graphisme & Design" },
  { id: "E-commerce", label: "🛒 E-commerce" },
  { id: "CMS & Création de site", label: "🌐 CMS & Web" },
  { id: "Marketing & SEO", label: "📈 Marketing & SEO" },
  { id: "Fintech & Banques", label: "💳 Fintech & Paiements" },
  { id: "Utilitaires & Quotidien", label: "🛠️ Utilitaires & Quotidien" },
];

export const toolsData: Tool[] = ${JSON.stringify(mergedTools, null, 2)};
`;

fs.writeFileSync('src/data/toolsData.ts', codeContent, 'utf8');
console.log("Successfully updated src/data/toolsData.ts with iconName!");
