export type ToolCategory = 
  | "IA" 
  | "Productivité" 
  | "Création" 
  | "Marketing" 
  | "Vidéo" 
  | "Business";

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  categories: ToolCategory[];
  logo: string;
  isPopular?: boolean;
  promoCode?: string;
  discount?: string;
}

export const toolsCategories: ToolCategory[] = [
  "IA",
  "Productivité",
  "Création",
  "Marketing",
  "Vidéo",
  "Business"
];

export const topTools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    description: "L'assistant IA le plus puissant. Génération de texte, code, analyse de données et création d'images avec DALL-E 3.",
    url: "https://chat.openai.com",
    categories: ["IA", "Productivité"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    isPopular: true
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Créez des images époustouflantes à partir de descriptions textuelles avec la meilleure IA génératrice d'art.",
    url: "https://www.midjourney.com",
    categories: ["IA", "Création"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    isPopular: true
  },
  {
    id: "canva",
    name: "Canva Pro",
    description: "La plateforme de conception graphique ultime. Modèles prêts à l'emploi, suppression d'arrière-plan et outils IA magiques.",
    url: "https://www.canva.com",
    categories: ["Création", "Marketing"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    isPopular: true
  },
  {
    id: "notion",
    name: "Notion",
    description: "L'espace de travail tout-en-un. Prenez des notes, gérez des projets et organisez votre vie avec l'intégration IA.",
    url: "https://www.notion.so",
    categories: ["Productivité", "Business"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Le générateur de voix IA le plus réaliste. Synthèse vocale ultra-naturelle et clonage vocal dans plusieurs langues.",
    url: "https://elevenlabs.io",
    categories: ["IA", "Vidéo"],
    logo: "https://cdn.worldvectorlogo.com/logos/elevenlabs-1.svg",
    isPopular: true
  },
  {
    id: "capcut",
    name: "CapCut",
    description: "Éditeur vidéo gratuit et puissant. Sous-titres automatiques, effets IA et modèles viraux pour TikTok et Reels.",
    url: "https://www.capcut.com",
    categories: ["Vidéo", "Création"],
    logo: "https://freelogopng.com/images/all_img/1664287128capcut-logo-png.png"
  },
  {
    id: "claude",
    name: "Claude 3 (Anthropic)",
    description: "L'alternative IA la plus sérieuse. Excellente capacité de rédaction, de code et d'analyse de documents longs.",
    url: "https://claude.ai",
    categories: ["IA", "Productivité"],
    logo: "https://mintlify.s3-us-west-1.amazonaws.com/anthropic/logo/dark.svg"
  },
  {
    id: "hostinger",
    name: "Hostinger",
    description: "Hébergement web rapide, sécurisé et abordable. Créez votre site avec l'IA ou installez WordPress en 1 clic.",
    url: "https://www.hostinger.fr",
    categories: ["Business", "Marketing"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Hostinger_logo.png",
    promoCode: "TECHNOVA20",
    discount: "-20% supplémentaires"
  },
  {
    id: "systemeio",
    name: "Systeme.io",
    description: "La plateforme marketing tout-en-un pour lancer votre business en ligne. Tunnels de vente, emails et formations.",
    url: "https://systeme.io",
    categories: ["Marketing", "Business"],
    logo: "https://systeme.io/assets/images/logo/systemeio_logo_dark.svg",
    isPopular: true
  },
  {
    id: "make",
    name: "Make (ex-Integromat)",
    description: "Automatisez votre travail sans coder. Connectez des milliers d'applications et gagnez des heures chaque jour.",
    url: "https://www.make.com",
    categories: ["Productivité", "Business"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Make_Logo.svg"
  }
];
