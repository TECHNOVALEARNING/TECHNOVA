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

export const toolsCategories: { id: ToolCategory; label: string; icon: string }[] = [
  { id: "IA", label: "Intelligence Artificielle", icon: "Bot" },
  { id: "Productivité", label: "Productivité", icon: "Zap" },
  { id: "Création", label: "Création Visuelle", icon: "Palette" },
  { id: "Marketing", label: "Marketing", icon: "Megaphone" },
  { id: "Vidéo", label: "Vidéo & Audio", icon: "Video" },
  { id: "Business", label: "Business & Ventes", icon: "Briefcase" },
];

export const topTools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "L'assistant IA de référence par OpenAI. Rédigez, codez et analysez des données en quelques secondes.",
    url: "https://chatgpt.com",
    categories: ["IA", "Productivité"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    isPopular: true
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Générez des images époustouflantes et hyper-réalistes à partir de simples descriptions textuelles.",
    url: "https://midjourney.com",
    categories: ["IA", "Création"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    isPopular: true
  },
  {
    id: "notion",
    name: "Notion",
    description: "L'espace de travail tout-en-un pour vos notes, projets et bases de données. Intègre maintenant une IA puissante.",
    url: "https://notion.so",
    categories: ["Productivité", "Business"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    isPopular: true
  },
  {
    id: "canva",
    name: "Canva",
    description: "Créez des designs professionnels facilement. Idéal pour les miniatures, posts sociaux et présentations.",
    url: "https://canva.com",
    categories: ["Création", "Marketing"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    isPopular: true
  },
  {
    id: "make",
    name: "Make",
    description: "Automatisez vos tâches et connectez vos applications entre elles sans écrire une seule ligne de code.",
    url: "https://make.com",
    categories: ["Productivité", "Business"],
    logo: "https://mms.businesswire.com/media/20220222005085/en/1367069/23/Make-Logo-Black-RGB.jpg",
    promoCode: "TECHNOVA",
    discount: "1 Mois Pro Offert"
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Le meilleur générateur de voix par IA. Clonez votre voix ou utilisez des voix ultra-réalistes pour vos vidéos.",
    url: "https://elevenlabs.io",
    categories: ["IA", "Vidéo"],
    logo: "https://mms.businesswire.com/media/20240122934068/en/2000880/23/elevenlabs_logo_%281%29.jpg",
  },
  {
    id: "capcut",
    name: "CapCut",
    description: "Montage vidéo gratuit et puissant, avec des fonctionnalités IA pour générer des sous-titres automatiquement.",
    url: "https://capcut.com",
    categories: ["Vidéo", "Création"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Capcut-logo.png",
  },
  {
    id: "systemeio",
    name: "Systeme.io",
    description: "L'outil marketing tout-en-un pour créer des tunnels de vente, gérer vos emails et vendre vos formations.",
    url: "https://systeme.io",
    categories: ["Marketing", "Business"],
    logo: "https://pbs.twimg.com/profile_images/1618625906232750080/4N3aV5K3_400x400.jpg",
    promoCode: "FREE",
    discount: "Compte Gratuit à Vie"
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Une IA redoutable pour l'écriture et le code. Souvent plus naturelle et précise que ChatGPT sur les longs textes.",
    url: "https://claude.ai",
    categories: ["IA", "Productivité"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Anthropic_logo.png",
    isPopular: true
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "Créez des vidéos avec des avatars IA ultra-réalistes qui parlent avec votre voix dans plusieurs langues.",
    url: "https://heygen.com",
    categories: ["IA", "Vidéo", "Marketing"],
    logo: "https://assets-global.website-files.com/63fdcbe48aa020c0a5493507/65668e61eb4d3d19ea73d0a2_heygen_logo_black.svg",
  }
];
