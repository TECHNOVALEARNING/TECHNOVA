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
  coverImageUrl?: string;
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
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "L'assistant IA le plus puissant pour la rédaction, le code et l'analyse de données.",
    websiteUrl: "https://chat.openai.com/",
    categories: ["Intelligence Artificielle"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600&h=300",
    isFeatured: true
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Générateur d'images IA de haute qualité pour la création artistique et le design.",
    websiteUrl: "https://www.midjourney.com/",
    categories: ["Intelligence Artificielle", "Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    coverImageUrl: "https://images.unsplash.com/photo-1686191128892-3b37013f7362?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "La plateforme e-commerce leader pour créer et gérer votre boutique en ligne.",
    websiteUrl: "https://www.shopify.com/",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600&h=300",
    isFeatured: true
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Infrastructure de paiement en ligne pour les entreprises sur internet.",
    websiteUrl: "https://stripe.com/",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "figma",
    name: "Figma",
    description: "Outil de conception d'interfaces collaboratif pour les équipes.",
    websiteUrl: "https://www.figma.com/",
    categories: ["Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "notion",
    name: "Notion",
    description: "L'espace de travail tout-en-un pour vos notes, tâches, wikis et bases de données.",
    websiteUrl: "https://www.notion.so/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    coverImageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600&h=300",
    isFeatured: true
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connectez vos applications et automatisez vos flux de travail sans coder.",
    websiteUrl: "https://zapier.com/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "canva",
    name: "Canva",
    description: "Créez facilement des designs graphiques, des présentations et des vidéos.",
    websiteUrl: "https://www.canva.com/",
    categories: ["Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Plateforme marketing intégrée pour l'emailing et l'automatisation.",
    websiteUrl: "https://mailchimp.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Mailchimp_Freddie_Icon.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Créez des sites web sur mesure visuellement sans écrire de code.",
    websiteUrl: "https://webflow.com/",
    categories: ["CMS & Création de site"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/webflow.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600&h=300",
    isFeatured: true
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Le CMS le plus utilisé au monde pour créer des blogs et des sites web.",
    websiteUrl: "https://wordpress.org/",
    categories: ["CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/09/Wordpress-Logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    description: "Outils SEO tout-en-un pour optimiser votre site web et analyser vos concurrents.",
    websiteUrl: "https://ahrefs.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/ahrefs-1.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "semrush",
    name: "SEMrush",
    description: "Plateforme leader pour la visibilité en ligne et le marketing de contenu.",
    websiteUrl: "https://www.semrush.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/semrush-1.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "make",
    name: "Make (ex Integromat)",
    description: "Plateforme visuelle pour concevoir, construire et automatiser des tâches complexes.",
    websiteUrl: "https://www.make.com/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_1bc1dc6210fec6034e4029bc4f3d2fbc/make-formerly-integromat.png",
    coverImageUrl: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Créez des applications collaboratives sur une plateforme mi-base de données mi-tableur.",
    websiteUrl: "https://airtable.com/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/airtable.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Solution de paiement en ligne simple, rapide et sécurisée.",
    websiteUrl: "https://www.paypal.com/",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "L'infrastructure de paiement en ligne privilégiée en Afrique.",
    websiteUrl: "https://paystack.com/",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png",
    coverImageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Développez votre entreprise avec des paiements mondiaux intégrés pour l'Afrique.",
    websiteUrl: "https://flutterwave.com/",
    categories: ["Fintech & Banques", "E-commerce"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Flutterwave_Logo.png",
    coverImageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "framer",
    name: "Framer",
    description: "Concevez et publiez des sites web impressionnants en quelques minutes.",
    websiteUrl: "https://www.framer.com/",
    categories: ["CMS & Création de site", "Graphisme & Design"],
    logoUrl: "https://cdn.worldvectorlogo.com/logos/framer.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "claude",
    name: "Claude AI",
    description: "Assistant IA développé par Anthropic, performant pour l'analyse de documents.",
    websiteUrl: "https://claude.ai/",
    categories: ["Intelligence Artificielle"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Anthropic_logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "L'extension e-commerce open-source la plus populaire pour WordPress.",
    websiteUrl: "https://woocommerce.com/",
    categories: ["E-commerce", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "brevo",
    name: "Brevo (ex Sendinblue)",
    description: "Plateforme marketing complète: emails, SMS, chat et automatisation.",
    websiteUrl: "https://www.brevo.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Brevo_Logo.png",
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "adobecc",
    name: "Adobe Creative Cloud",
    description: "La suite d'outils créatifs de référence pour la photo, la vidéo et le design.",
    websiteUrl: "https://www.adobe.com/creativecloud.html",
    categories: ["Graphisme & Design"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Plateforme de communication collaborative pour les équipes.",
    websiteUrl: "https://slack.com/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "trello",
    name: "Trello",
    description: "Outil de gestion de projet visuel basé sur les tableaux Kanban.",
    websiteUrl: "https://trello.com/",
    categories: ["Productivité & Automatisation"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Trello-logo-blue.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "github",
    name: "GitHub",
    description: "Plateforme de développement collaboratif pour l'hébergement de code source.",
    websiteUrl: "https://github.com/",
    categories: ["Productivité & Automatisation", "CMS & Création de site"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Plateforme cloud pour les frameworks frontend et les sites statiques.",
    websiteUrl: "https://vercel.com/",
    categories: ["CMS & Création de site"],
    logoUrl: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
    coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "L'alternative open-source à Firebase pour votre backend.",
    websiteUrl: "https://supabase.com/",
    categories: ["Productivité & Automatisation", "CMS & Création de site"],
    logoUrl: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png",
    coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Logiciel CRM complet pour le marketing, les ventes et le service client.",
    websiteUrl: "https://www.hubspot.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600&h=300"
  },
  {
    id: "googleanalytics",
    name: "Google Analytics",
    description: "Outil d'analyse d'audience puissant pour votre site web.",
    websiteUrl: "https://analytics.google.com/",
    categories: ["Marketing & SEO"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/89/Google_Analytics_icon_%282023%29.svg",
    coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=300"
  }
];
