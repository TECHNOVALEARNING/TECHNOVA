import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Search, MapPin, Briefcase, GraduationCap, Clock, Filter, X, ChevronRight, Mail, DollarSign, Building, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: { fr: string; en: string };
  company: string;
  location: { fr: string; en: string };
  type: { fr: string; en: string }; // e.g. Temps plein / Full-time
  category: string; // e.g. "Tech", "Design", "Marketing", "Management"
  education: string; // e.g. "Bac + 2", "Bac + 3", "Bac + 5"
  experience: { fr: string; en: string }; // e.g. "Débutant", "1-3 ans"
  publishedAt: { fr: string; en: string };
  description: { fr: string; en: string };
  requirements: { fr: string[]; en: string[] };
  responsibilities: { fr: string[]; en: string[] };
  salary: string;
  contactEmail: string;
  liveUrl?: string;
}

const JOBS_DATA: Job[] = [
  {
    id: "job-1",
    title: {
      fr: "Développeur Full Stack React/Node.js",
      en: "Full Stack React/Node.js Developer"
    },
    company: "EasyTech Solutions",
    location: {
      fr: "Cotonou, Bénin (Hybride)",
      en: "Cotonou, Benin (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Tech",
    education: "Bac + 3",
    experience: { fr: "1-3 ans", en: "1-3 years" },
    publishedAt: { fr: "il y a 2 jours", en: "2 days ago" },
    description: {
      fr: "Rejoignez EasyTech pour concevoir et développer des applications web innovantes. Vous travaillerez au sein d'une équipe agile sur la refonte de nos portails clients et l'intégration de services de paiement Mobile Money.",
      en: "Join EasyTech to design and develop innovative web applications. You will work within an agile team on the redesign of our customer portals and the integration of Mobile Money payment services."
    },
    requirements: {
      fr: [
        "Maîtrise de React.js, HTML5, CSS3/TailwindCSS et Node.js",
        "Expérience pratique avec PostgreSQL et Prisma ORM",
        "Connaissance des APIs REST et de l'authentification JWT",
        "Capacité à travailler de manière autonome et esprit d'équipe"
      ],
      en: [
        "Proficiency in React.js, HTML5, CSS3/TailwindCSS, and Node.js",
        "Hands-on experience with PostgreSQL and Prisma ORM",
        "Knowledge of REST APIs and JWT authentication",
        "Ability to work independently and as part of a team"
      ]
    },
    responsibilities: {
      fr: [
        "Développer des composants front-end réutilisables et performants",
        "Créer et optimiser les routes API du back-end",
        "Collaborer avec l'équipe de design UX/UI",
        "Assurer la maintenance corrective et évolutive du code"
      ],
      en: [
        "Develop reusable and high-performance front-end components",
        "Create and optimize back-end API routes",
        "Collaborate with the UX/UI design team",
        "Ensure corrective and evolutionary maintenance of the code"
      ]
    },
    salary: "450 000 - 650 000 FCFA / mois",
    contactEmail: "recrutement@easytech.bj"
  },
  {
    id: "job-2",
    title: {
      fr: "Designer UX/UI Senior",
      en: "Senior UX/UI Designer"
    },
    company: "Creative Lab Agency",
    location: {
      fr: "Dakar, Sénégal (Hybride)",
      en: "Dakar, Senegal (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Design",
    education: "Bac + 5",
    experience: { fr: "3-5 ans", en: "3-5 years" },
    publishedAt: { fr: "il y a 1 jour", en: "1 day ago" },
    description: {
      fr: "Nous recherchons un Designer UX/UI passionné pour concevoir des parcours utilisateurs intuitifs et des interfaces esthétiques pour nos clients en Afrique de l'Ouest. Vous serez responsable de l'ensemble du cycle de conception.",
      en: "We are looking for a passionate UX/UI Designer to design intuitive user flows and beautiful interfaces for our clients in West Africa. You will be responsible for the entire design lifecycle."
    },
    requirements: {
      fr: [
        "Expertise sur Figma, Adobe Creative Suite et outils de prototypage",
        "Solide portfolio démontrant des projets web et mobiles complexes",
        "Sensibilité aux principes d'ergonomie et d'accessibilité numérique",
        "Excellente communication pour présenter vos concepts de design"
      ],
      en: [
        "Expertise in Figma, Adobe Creative Suite, and prototyping tools",
        "Strong portfolio demonstrating complex web and mobile projects",
        "Sensitivity to ergonomics principles and digital accessibility",
        "Excellent communication skills to present your design concepts"
      ]
    },
    responsibilities: {
      fr: [
        "Conduire des recherches utilisateurs et élaborer des personas",
        "Créer des wireframes, user flows et maquettes haute fidélité",
        "Réaliser des prototypes interactifs et mener des tests utilisateurs",
        "Collaborer étroitement avec les équipes de développement"
      ],
      en: [
        "Conduct user research and create user personas",
        "Create wireframes, user flows, and high-fidelity mockups",
        "Build interactive prototypes and conduct user tests",
        "Collaborate closely with development teams"
      ]
    },
    salary: "800 000 - 1 200 000 FCFA / mois",
    contactEmail: "careers@creativelab.sn"
  },
  {
    id: "job-3",
    title: {
      fr: "Data Analyst Junior",
      en: "Junior Data Analyst"
    },
    company: "Africa Data Analytics",
    location: {
      fr: "Lomé, Togo (Sur site)",
      en: "Lome, Togo (On-site)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Tech",
    education: "Bac + 4",
    experience: { fr: "Débutant", en: "Beginner" },
    publishedAt: { fr: "il y a 5 jours", en: "5 days ago" },
    description: {
      fr: "Sous la direction du Lead Data Scientist, vous collecterez, analyserez et visualiserez les données de performance de nos campagnes digitales. C'est une excellente opportunité pour lancer votre carrière dans la data.",
      en: "Under the supervision of the Lead Data Scientist, you will collect, analyze, and visualize performance data for our digital campaigns. This is a great opportunity to launch your career in data."
    },
    requirements: {
      fr: [
        "Maîtrise SQL (requêtes complexes, jointures, agrégations)",
        "Bonne connaissance de Python (Pandas, Numpy) ou R",
        "Expérience avec un outil de BI (Power BI, Tableau ou Looker Studio)",
        "Esprit d'analyse affûté et rigueur méthodologique"
      ],
      en: [
        "Proficiency in SQL (complex queries, joins, aggregations)",
        "Good knowledge of Python (Pandas, Numpy) or R",
        "Experience with a BI tool (Power BI, Tableau, or Looker Studio)",
        "Sharp analytical mindset and methodological rigor"
      ]
    },
    responsibilities: {
      fr: [
        "Extraire et nettoyer les données provenant de multiples sources",
        "Créer des tableaux de bord interactifs pour les équipes métiers",
        "Identifier des tendances et formuler des recommandations stratégiques",
        "Rédiger des rapports de synthèse clairs"
      ],
      en: [
        "Extract and clean data from multiple sources",
        "Create interactive dashboards for business teams",
        "Identify trends and formulate strategic recommendations",
        "Write clear summary reports"
      ]
    },
    salary: "350 000 - 450 000 FCFA / mois",
    contactEmail: "contact@africadata.tg"
  },
  {
    id: "job-4",
    title: {
      fr: "Social Media Manager & Copywriter",
      en: "Social Media Manager & Copywriter"
    },
    company: "Growth Hub Digital",
    location: {
      fr: "Abidjan, Côte d'Ivoire (Hybride)",
      en: "Abidjan, Ivory Coast (Hybrid)"
    },
    type: { fr: "Freelance", en: "Freelance" },
    category: "Marketing",
    education: "Bac + 2",
    experience: { fr: "1-3 ans", en: "1-3 years" },
    publishedAt: { fr: "il y a 3 jours", en: "3 days ago" },
    description: {
      fr: "Growth Hub recherche un talent créatif pour concevoir et rédiger des publications engageantes sur nos différents réseaux sociaux (LinkedIn, Facebook, Instagram) et animer notre communauté en ligne.",
      en: "Growth Hub is looking for a creative talent to design and write engaging publications on our various social networks (LinkedIn, Facebook, Instagram) and moderate our online community."
    },
    requirements: {
      fr: [
        "Excellentes capacités rédactionnelles en français (orthographe irréprochable)",
        "Maîtrise des codes et des algorithmes des réseaux sociaux",
        "Notions de design graphique basique (Canva, Photoshop)",
        "Esprit d'initiative et réactivité"
      ],
      en: [
        "Excellent writing skills in French (impeccable spelling)",
        "Proficiency in social media guidelines and algorithms",
        "Basic graphic design skills (Canva, Photoshop)",
        "Spirit of initiative and reactivity"
      ]
    },
    responsibilities: {
      fr: [
        "Établir un calendrier éditorial mensuel",
        "Rédiger des posts percutants et créer des visuels adaptés",
        "Répondre aux commentaires et messages des abonnés",
        "Suivre et analyser les indicateurs de performance (KPIs)"
      ],
      en: [
        "Establish a monthly editorial calendar",
        "Write impactful posts and design appropriate visuals",
        "Reply to comments and messages from followers",
        "Track and analyze performance metrics (KPIs)"
      ]
    },
    salary: "200 000 - 350 000 FCFA / mission",
    contactEmail: "jobs@growthhub.ci"
  },
  {
    id: "job-5",
    title: {
      fr: "Administrateur Systèmes & DevOps",
      en: "DevOps & Systems Administrator"
    },
    company: "Sahel Cloud Solutions",
    location: {
      fr: "Niamey, Niger (Hybride)",
      en: "Niamey, Niger (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Tech",
    education: "Bac + 5",
    experience: { fr: "3-5 ans", en: "3-5 years" },
    publishedAt: { fr: "il y a 6 jours", en: "6 days ago" },
    description: {
      fr: "Rejoignez-nous pour gérer, automatiser et sécuriser nos infrastructures cloud. Vous serez le garant de la haute disponibilité de nos services critiques.",
      en: "Join us to manage, automate, and secure our cloud infrastructures. You will be the guarantor of the high availability of our critical services."
    },
    requirements: {
      fr: [
        "Solides compétences sous Linux (Ubuntu/Debian, CentOS)",
        "Maîtrise des technologies de conteneurisation (Docker, Kubernetes)",
        "Expérience avec AWS, GCP ou Azure et outils de CI/CD (GitHub Actions, GitLab CI)",
        "Connaissances solides en scripts Shell, Python ou Go"
      ],
      en: [
        "Strong skills under Linux (Ubuntu/Debian, CentOS)",
        "Proficiency in containerization technologies (Docker, Kubernetes)",
        "Experience with AWS, GCP, or Azure and CI/CD tools (GitHub Actions, GitLab CI)",
        "Solid knowledge of Shell, Python, or Go scripting"
      ]
    },
    responsibilities: {
      fr: [
        "Superviser et administrer les infrastructures serveurs",
        "Mettre en place des pipelines CI/CD automatisés",
        "Optimiser la sécurité et la sauvegarde des données",
        "Résoudre les incidents de production et assurer le monitoring"
      ],
      en: [
        "Supervise and administer server infrastructures",
        "Implement automated CI/CD pipelines",
        "Optimize data security and backup systems",
        "Resolve production incidents and handle monitoring"
      ]
    },
    salary: "600 000 - 900 000 FCFA / mois",
    contactEmail: "recrutement@sahelcloud.ne"
  },
  {
    id: "job-6",
    title: {
      fr: "Développeur Mobile Flutter",
      en: "Flutter Mobile Developer"
    },
    company: "AppVentures Studio",
    location: {
      fr: "Lomé, Togo (Hybride)",
      en: "Lome, Togo (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Tech",
    education: "Bac + 3",
    experience: { fr: "1-3 ans", en: "1-3 years" },
    publishedAt: { fr: "il y a 4 jours", en: "4 days ago" },
    description: {
      fr: "AppVentures recrute un développeur Flutter talentueux pour concevoir des applications mobiles robustes pour iOS et Android. Vous gérerez l'intégration d'APIs et la publication sur les stores.",
      en: "AppVentures is hiring a talented Flutter developer to build robust mobile applications for iOS and Android. You will manage API integration and publishing on the stores."
    },
    requirements: {
      fr: [
        "Expérience confirmée dans le développement Flutter et le langage Dart",
        "Gestion d'état (Provider, Riverpod or Bloc)",
        "Expérience dans le déploiement sur App Store et Google Play",
        "Souci du détail pour intégrer des interfaces fidèles aux maquettes"
      ],
      en: [
        "Proven experience in Flutter development and Dart language",
        "State management (Provider, Riverpod, or Bloc)",
        "Experience deploying to App Store and Google Play",
        "Attention to detail to build UI faithful to design mockups"
      ]
    },
    responsibilities: {
      fr: [
        "Écrire du code Dart propre, documenté et testable",
        "Connecter l'application aux services back-end via REST APIs",
        "Assurer la fluidité des animations et la performance globale",
        "Assurer le suivi des retours utilisateurs et corriger les bugs"
      ],
      en: [
        "Write clean, documented, and testable Dart code",
        "Connect the app to back-end services via REST APIs",
        "Ensure fluid animations and overall performance",
        "Track user feedback and fix bugs"
      ]
    },
    salary: "400 000 - 600 000 FCFA / mois",
    contactEmail: "jobs@appventures.tg"
  },
  {
    id: "job-7",
    title: {
      fr: "Chef de Projet Digital",
      en: "Digital Project Manager"
    },
    company: "Innov'Action Group",
    location: {
      fr: "Bamako, Mali (Hybride)",
      en: "Bamako, Mali (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Management",
    education: "Bac + 5",
    experience: { fr: "3-5 ans", en: "3-5 years" },
    publishedAt: { fr: "il y a 7 jours", en: "7 days ago" },
    description: {
      fr: "Vous piloterez des projets digitaux de bout en bout (sites e-commerce, applications d'entreprise). Vous ferez le pont entre nos clients grands comptes et nos équipes techniques de production.",
      en: "You will manage digital projects end-to-end (e-commerce websites, enterprise applications). You will bridge the gap between our large accounts and our production technical teams."
    },
    requirements: {
      fr: [
        "Forte expérience en gestion de projet agile (Scrum, Kanban)",
        "Excellentes compétences relationnelles et sens du service client",
        "Bonne compréhension technique globale (web, mobile, APIs)",
        "Maîtrise d'outils comme Jira, Trello ou ClickUp"
      ],
      en: [
        "Strong experience in agile project management (Scrum, Kanban)",
        "Excellent interpersonal skills and customer service orientation",
        "Good overall technical understanding (web, mobile, APIs)",
        "Proficiency in tools like Jira, Trello, or ClickUp"
      ]
    },
    responsibilities: {
      fr: [
        "Recueillir les besoins clients et rédiger les cahiers des charges",
        "Planifier les sprints et animer les réunions d'équipe",
        "Gérer les budgets, le planning et les risques du projet",
        "Assurer la qualité des livrables et la satisfaction client"
      ],
      en: [
        "Gather client requirements and write specifications",
        "Plan sprints and facilitate team meetings",
        "Manage budgets, schedule, and project risks",
        "Ensure deliverable quality and client satisfaction"
      ]
    },
    salary: "700 000 - 1 000 000 FCFA / mois",
    contactEmail: "recrutement@innovaction.ml"
  },
  {
    id: "job-8",
    title: {
      fr: "Consultant en Cybersécurité",
      en: "Cybersecurity Consultant"
    },
    company: "SecurAfric Consulting",
    location: {
      fr: "Abidjan, Côte d'Ivoire (Hybride)",
      en: "Abidjan, Ivory Coast (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Tech",
    education: "Bac + 5",
    experience: { fr: "1-3 ans", en: "1-3 years" },
    publishedAt: { fr: "il y a 3 jours", en: "3 days ago" },
    description: {
      fr: "Participez aux audits de sécurité et aux tests d'intrusion de nos clients d'Afrique de l'Ouest. Vous aiderez à identifier les vulnérabilités et à renforcer leurs systèmes.",
      en: "Participate in security audits and pentesting for our West African clients. You will help identify vulnerabilities and strengthen their systems."
    },
    requirements: {
      fr: [
        "Compétences solides en tests d'intrusion (Web, Réseau, Cloud)",
        "Connaissance des normes ISO 27001, OWASP et protocoles de chiffrement",
        "Utilisation d'outils comme Burp Suite, Nmap, Metasploit, Wireshark",
        "Certifications appréciées (CEH, OSCP, CompTIA Security+)"
      ],
      en: [
        "Solid skills in penetration testing (Web, Network, Cloud)",
        "Knowledge of ISO 27001, OWASP standards, and encryption protocols",
        "Usage of tools like Burp Suite, Nmap, Metasploit, Wireshark",
        "Certifications appreciated (CEH, OSCP, CompTIA Security+)"
      ]
    },
    responsibilities: {
      fr: [
        "Réaliser des tests d'intrusion et des audits de configuration",
        "Rédiger des rapports de vulnérabilités clairs avec recommandations",
        "Conseiller les équipes de développement sur les bonnes pratiques de codage sécurisé",
        "Sensibiliser les collaborateurs de nos clients aux cybermenaces"
      ],
      en: [
        "Perform penetration tests and configuration audits",
        "Write clear vulnerability reports with recommendations",
        "Advise developers on secure coding practices",
        "Sensitize clients' employees about cyber threats"
      ]
    },
    salary: "900 000 - 1 300 000 FCFA / mois",
    contactEmail: "securite@securafric.com"
  },
  {
    id: "job-9",
    title: {
      fr: "Rédacteur Web SEO / Content Specialist",
      en: "SEO Web Writer / Content Specialist"
    },
    company: "Editore Tech",
    location: {
      fr: "Paris, France (Télétravail total)",
      en: "Paris, France (Full Remote)"
    },
    type: { fr: "Temps partiel", en: "Part-time" },
    category: "Marketing",
    education: "Bac + 2",
    experience: { fr: "Débutant", en: "Beginner" },
    publishedAt: { fr: "il y a 8 jours", en: "8 days ago" },
    description: {
      fr: "Nous recherchons un rédacteur rigoureux capable d'écrire des articles de blog optimisés pour le SEO sur le thème du développement web, des outils digitaux et du business en ligne.",
      en: "We are looking for a rigorous writer capable of writing blog posts optimized for SEO on the topics of web development, digital tools, and online business."
    },
    requirements: {
      fr: [
        "Orthographe, grammaire et syntaxe irréprochables en français",
        "Compréhension des techniques fondamentales de SEO (mots-clés, balises Hn, maillage)",
        "Curiosité pour le monde de la tech et de la formation",
        "Capacité à respecter des consignes et des délais éditoriaux stricts"
      ],
      en: [
        "Flawless French spelling, grammar, and syntax",
        "Understanding of core SEO techniques (keywords, Hn tags, internal linking)",
        "Curiosity about tech and training sectors",
        "Ability to follow strict guidelines and editorial deadlines"
      ]
    },
    responsibilities: {
      fr: [
        "Rédiger des articles de blog de 1000 à 2000 mots",
        "Optimiser le contenu selon les directives SEO fournies",
        "Intégrer les articles directement sur WordPress",
        "Rechercher et ajouter des images libres de droits pertinentes"
      ],
      en: [
        "Write blog articles of 1,000 to 2,000 words",
        "Optimize content according to provided SEO guidelines",
        "Integrate articles directly into WordPress",
        "Find and add relevant royalty-free images"
      ]
    },
    salary: "150 000 - 250 000 FCFA / mois",
    contactEmail: "redaction@editore.tech"
  },
  {
    id: "job-10",
    title: {
      fr: "Expert Marketing Automation",
      en: "Marketing Automation Expert"
    },
    company: "Scale Partners",
    location: {
      fr: "Dakar, Sénégal (Hybride)",
      en: "Dakar, Senegal (Hybrid)"
    },
    type: { fr: "Temps plein", en: "Full-time" },
    category: "Marketing",
    education: "Bac + 3",
    experience: { fr: "3-5 ans", en: "3-5 years" },
    publishedAt: { fr: "il y a 9 jours", en: "9 days ago" },
    description: {
      fr: "Spécialisé dans les tunnels de vente complexes, vous automatiserez nos parcours clients et nos campagnes d'emailing pour maximiser notre taux de conversion de leads.",
      en: "Specializing in complex sales funnels, you will automate our customer journeys and emailing campaigns to maximize our lead conversion rate."
    },
    requirements: {
      fr: [
        "Maîtrise avancée d'outils comme ActiveCampaign, HubSpot, Make ou Zapier",
        "Compétences solides en copywriting et segmentation d'audience",
        "Capacité à analyser le comportement utilisateur et à configurer des tests A/B",
        "Compréhension des mécanismes de tracking (Pixels, UTMs, GA4)"
      ],
      en: [
        "Advanced proficiency in ActiveCampaign, HubSpot, Make, or Zapier",
        "Strong copywriting and audience segmentation skills",
        "Ability to analyze user behavior and configure A/B testing",
        "Understanding of tracking mechanisms (Pixels, UTMs, GA4)"
      ]
    },
    responsibilities: {
      fr: [
        "Concevoir et déployer des workflows d'emailing automatisés",
        "Segmenter les bases de données clients pour des campagnes ciblées",
        "Analyser les performances des tunnels et optimiser le taux de conversion (CRO)",
        "Collaborer avec l'équipe de création de contenu"
      ],
      en: [
        "Design and deploy automated emailing workflows",
        "Segment customer databases for targeted campaigns",
        "Analyze funnel performance and optimize conversion rates (CRO)",
        "Collaborate with the content creation team"
      ]
    },
    salary: "500 000 - 750 000 FCFA / mois",
    contactEmail: "hello@scalepartners.co"
  }
];

const guessCategory = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("dev") || t.includes("coder") || t.includes("programmation") || t.includes("informatique") || t.includes("system") || t.includes("réseau") || t.includes("cloud") || t.includes("flutter") || t.includes("react") || t.includes("node") || t.includes("technicien")) {
    return "Tech";
  }
  if (t.includes("design") || t.includes("graphiste") || t.includes("ux") || t.includes("ui") || t.includes("infographe")) {
    return "Design";
  }
  if (t.includes("marketing") || t.includes("social") || t.includes("redacteur") || t.includes("communication") || t.includes("digital") || t.includes("vente") || t.includes("commercial")) {
    return "Marketing";
  }
  if (t.includes("projet") || t.includes("chef") || t.includes("manager") || t.includes("responsable") || t.includes("directeur")) {
    return "Management";
  }
  return "Tech";
};

const Jobs = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [education, setEducation] = useState("All");
  const [experience, setExperience] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);
  const [liveJobDetails, setLiveJobDetails] = useState<{
    description: string;
    education: string;
    experience: string;
    deadline: string;
  } | null>(null);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  // Fetch live jobs from cDiscussion via CORS Proxy dynamically on load
  useEffect(() => {
    const fetchLiveJobs = async () => {
      try {
        setIsLoadingLive(true);
        const targetUrl = "https://www.cdiscussion.com/offres-emploi?type_offre=Offre+d%27emploi";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("CORS Proxy error fetching cDiscussion jobs");
        const json = await res.json();
        const html = json.contents;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const cardElements = doc.querySelectorAll(".card.glass-card");
        if (cardElements.length === 0) {
          throw new Error("cDiscussion job cards DOM layout changed or proxy returned empty content");
        }

        const jobs: Job[] = [];
        cardElements.forEach((el, index) => {
          const titleLink = el.querySelector("h5 a.stretched-link");
          const titleText = titleLink?.textContent?.trim() || "";
          const href = titleLink?.getAttribute("href") || "";

          const matchJobId = href.match(/details-job=(\d+)/);
          const jobId = matchJobId ? matchJobId[1] : `live-${index}`;
          const absoluteLink = `https://www.cdiscussion.com/offres-emploi${href}`;

          const companyElement = el.querySelector("i.fa-building")?.parentElement;
          const companyName = companyElement?.textContent?.trim() || "Entreprise Anonyme";

          const locationElement = el.querySelector("i.fa-map-marker-alt")?.parentElement;
          const locationName = locationElement?.textContent?.trim() || "Afrique de l'Ouest";

          // Extract metadata from listing badges
          const badgeList = el.querySelectorAll(".badge");
          let jobType = "Offre d'emploi";
          let eduText = "Non spécifié";
          let expText = "Non spécifié";

          badgeList.forEach((badge) => {
            const text = badge.textContent?.trim() || "";
            const icon = badge.querySelector("i");
            if (icon) {
              if (icon.classList.contains("fa-graduation-cap")) {
                eduText = text;
              } else if (icon.classList.contains("fa-briefcase")) {
                expText = text;
              }
            } else {
              if (text === "Offre d'emploi" || text === "Stage") {
                jobType = text;
              }
            }
          });

          // Check flex tags just in case
          const metaDiv = el.querySelector(".d-flex.flex-wrap.gap-2.small.text-muted");
          if (metaDiv) {
            const eduCap = metaDiv.querySelector("i.fa-graduation-cap");
            if (eduCap && eduCap.parentElement) {
              eduText = eduCap.parentElement.textContent?.trim() || eduText;
            }
            const briefCase = metaDiv.querySelector("i.fa-briefcase");
            if (briefCase && briefCase.parentElement) {
              expText = briefCase.parentElement.textContent?.trim() || expText;
            }
          }

          jobs.push({
            id: jobId,
            title: { fr: titleText, en: titleText },
            company: companyName,
            location: { fr: locationName, en: locationName },
            type: { fr: jobType, en: jobType === "Offre d'emploi" ? "Job Offer" : "Internship" },
            category: guessCategory(titleText),
            education: eduText,
            experience: { fr: expText, en: expText },
            publishedAt: { fr: "Récemment", en: "Recently" },
            description: {
              fr: "Chargement des détails en direct depuis le portail cDiscussion...",
              en: "Loading live job description from cDiscussion portal..."
            },
            requirements: {
              fr: ["Veuillez vous référer à l'offre officielle sur cDiscussion.com pour les critères."],
              en: ["Please refer to the official listing on cDiscussion.com for requirements."]
            },
            responsibilities: {
              fr: ["Veuillez vous référer à l'offre officielle sur cDiscussion.com pour les missions."],
              en: ["Please refer to the official listing on cDiscussion.com for responsibilities."]
            },
            salary: "Selon profil",
            contactEmail: "contact@cdiscussion.com",
            liveUrl: absoluteLink
          });
        });

        setLiveJobs(jobs);
      } catch (err) {
        console.error("Failed to load live jobs, falling back to static seeds:", err);
      } finally {
        setIsLoadingLive(false);
      }
    };

    fetchLiveJobs();
  }, []);

  const handleViewJobDetails = async (job: Job) => {
    setSelectedJob(job);
    setLiveJobDetails(null);

    // If it is a crawled live job, scrape description body dynamically
    if (job.liveUrl) {
      try {
        setJobDetailLoading(true);
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(job.liveUrl)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("Failed to fetch job detail HTML page");
        const json = await res.json();
        const html = json.contents;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const jobContentEl = doc.querySelector(".job-content");
        let descHtml = jobContentEl?.innerHTML || "";

        // Check if there is an iframe (PDF list document)
        const iframe = doc.querySelector(".job-content iframe");
        if (iframe) {
          const iframeSrc = iframe.getAttribute("src");
          if (iframeSrc) {
            descHtml += `<div class="mt-6 p-5 border border-dashed border-primary/40 rounded-2xl bg-secondary/10 text-center">
              <p class="mb-3 font-semibold text-foreground">Cette offre contient une description au format PDF.</p>
              <a href="${iframeSrc}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition shadow-md font-semibold text-sm">
                Ouvrir le PDF de l'offre
              </a>
            </div>`;
          }
        }

        if (!descHtml) {
          const mainCardBody = doc.querySelector(".col-lg-8 .card-body");
          descHtml = mainCardBody?.innerHTML || "";
        }

        let edu = job.education;
        let exp = job.experience.fr;
        let dead = "Non spécifiée";

        const listItems = doc.querySelectorAll(".col-lg-4 ul li");
        listItems.forEach((li) => {
          const txt = li.textContent?.trim() || "";
          if (txt.includes("Études:")) {
            edu = txt.replace("Études:", "").trim();
          } else if (txt.includes("Expérience:")) {
            exp = txt.replace("Expérience:", "").trim();
          } else if (txt.includes("Date limite:")) {
            dead = txt.replace("Date limite:", "").trim();
          }
        });

        setLiveJobDetails({
          description: descHtml,
          education: edu,
          experience: exp,
          deadline: dead
        });
      } catch (err) {
        console.error("Failed to load details dynamically:", err);
      } finally {
        setJobDetailLoading(false);
      }
    }
  };

  const displayedJobsList = liveJobs.length > 0 ? liveJobs : JOBS_DATA;

  // Filter Jobs
  const filteredJobs = displayedJobsList.filter((job) => {
    const titleMatch = 
      job.title[lang as "fr" | "en"].toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.description[lang as "fr" | "en"].toLowerCase().includes(search.toLowerCase());

    const locMatch = 
      job.location[lang as "fr" | "en"].toLowerCase().includes(location.toLowerCase());

    const catMatch = category === "All" || job.category === category;
    const eduMatch = education === "All" || job.education.toLowerCase().includes(education.toLowerCase());
    
    let expMatch = true;
    if (experience !== "All") {
      if (experience === "Beginner") {
        expMatch = job.experience.en.toLowerCase().includes("begin") || job.experience.fr.toLowerCase().includes("début");
      } else {
        expMatch = job.experience.en.toLowerCase().includes(experience.toLowerCase()) || job.experience.fr.toLowerCase().includes(experience.toLowerCase());
      }
    }

    return titleMatch && locMatch && catMatch && eduMatch && expMatch;
  });

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <SEOHead 
        title={lang === "fr" ? "Offres d'Emplois & Stages - TechNova Learning" : "Jobs & Internships - TechNova Learning"}
        description={lang === "fr" 
          ? "Trouvez votre prochaine opportunité professionnelle ou stage dans le numérique au Bénin, Côte d'Ivoire, Sénégal, Togo et à l'international." 
          : "Find your next career or internship opportunity in tech across Benin, Ivory Coast, Senegal, Togo, and globally."}
        canonicalPath="/jobs" 
        keywords={lang === "fr" 
          ? "Emploi Tech, Recrutement Afrique, Stage Web, Développeur Junior, UX/UI, Marketing Digital" 
          : "Tech Jobs, Africa Recruitment, Web Internship, Junior Developer, UX/UI, Digital Marketing"} 
      />

      <Header />

      {/* Hero section */}
      <section className="py-24 md:py-32 bg-mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--pastel-blue)] text-[color:var(--primary)] text-xs font-mono uppercase tracking-wider mb-4">
              <Briefcase className="h-3 w-3" /> TechNova Careers
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              {lang === "fr" ? "Espace " : "TechNova "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                {lang === "fr" ? "Recrutement" : "Jobs"}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "fr" 
                ? "Trouvez des opportunités ciblées dans les métiers du digital et de la tech en Afrique de l'Ouest et à l'international." 
                : "Explore highly-targeted job offers and internships in tech and digital sectors in West Africa and worldwide."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters & Listings */}
      <section className="py-12 bg-background relative z-10 -mt-8">
        <div className="container mx-auto px-6 max-w-5xl">
          
          {/* Search Panel styled after cDiscussion */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-lg space-y-4 mb-10 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Keyword input */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Métier, Mots-clés, Entreprise..." : "Job, Keywords, Company..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm text-foreground"
                />
              </div>

              {/* Location input */}
              <div className="md:col-span-4 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Ville ou Pays..." : "City or Country..."}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm text-foreground"
                />
              </div>

              {/* Action buttons */}
              <div className="md:col-span-3 flex gap-2">
                <Button 
                  onClick={() => setShowFilters(!showFilters)} 
                  variant="outline" 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl py-3 h-auto text-sm border-border ${showFilters ? 'bg-secondary' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">{lang === "fr" ? "Filtres" : "Filters"}</span>
                </Button>
                <Button 
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/95 hover:to-blue-600/95 py-3 h-auto text-sm font-semibold shadow-md text-white"
                >
                  {lang === "fr" ? "Rechercher" : "Search"}
                </Button>
              </div>
            </div>

            {/* Expandable Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border/60 pt-4 mt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        {lang === "fr" ? "Catégorie" : "Sectors"}
                      </label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full py-2 px-3 bg-secondary/30 rounded-lg border border-border outline-none transition text-sm text-foreground"
                      >
                        <option value="All">{lang === "fr" ? "Tous les secteurs" : "All sectors"}</option>
                        <option value="Tech">{lang === "fr" ? "Tech & Développement" : "Tech & Dev"}</option>
                        <option value="Design">Design & UX/UI</option>
                        <option value="Marketing">Marketing & Comm</option>
                        <option value="Management">Management & Gestion</option>
                      </select>
                    </div>

                    {/* Education Level Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        {lang === "fr" ? "Niveau d'étude" : "Education Level"}
                      </label>
                      <select 
                        value={education} 
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full py-2 px-3 bg-secondary/30 rounded-lg border border-border outline-none transition text-sm text-foreground"
                      >
                        <option value="All">{lang === "fr" ? "Tous niveaux" : "All levels"}</option>
                        <option value="Bac + 2">Bac + 2</option>
                        <option value="Bac + 3">Bac + 3</option>
                        <option value="Bac + 4">Bac + 4</option>
                        <option value="Bac + 5">Bac + 5</option>
                      </select>
                    </div>

                    {/* Experience Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                        {lang === "fr" ? "Expérience" : "Experience"}
                      </label>
                      <select 
                        value={experience} 
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full py-2 px-3 bg-secondary/30 rounded-lg border border-border outline-none transition text-sm text-foreground"
                      >
                        <option value="All">{lang === "fr" ? "Tous niveaux" : "All levels"}</option>
                        <option value="Beginner">{lang === "fr" ? "Débutant (0-1 an)" : "Beginner (0-1 yr)"}</option>
                        <option value="1-3 ans">1-3 ans</option>
                        <option value="3-5 ans">3-5 ans</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Job listings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {lang === "fr" ? "Toutes les opportunités d'emploi" : "All Job Opportunities"}
              </h2>
              <span className="text-sm font-medium text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full border border-border/40">
                {isLoadingLive ? "..." : filteredJobs.length} {lang === "fr" ? "offres disponibles" : "jobs found"}
              </span>
            </div>

            {isLoadingLive ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/80 animate-pulse space-y-3">
                    <div className="h-4 w-1/4 rounded bg-secondary/50" />
                    <div className="h-6 w-3/4 rounded bg-secondary/50" />
                    <div className="h-4 w-1/2 rounded bg-secondary/50" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 rounded bg-secondary/50" />
                      <div className="h-6 w-20 rounded bg-secondary/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-elegant transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        {/* Offre badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-gradient text-white">
                            {job.type[lang as "fr" | "en"]}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {job.publishedAt[lang as "fr" | "en"]}
                          </span>
                        </div>

                        {/* Title - clickable with stretched link pattern */}
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          <button 
                            onClick={() => handleViewJobDetails(job)}
                            className="text-left hover:underline focus:outline-none focus:ring-0 focus:underline"
                          >
                            {job.title[lang as "fr" | "en"]}
                          </button>
                        </h3>

                        {/* Company & Location */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-muted-foreground/80" />
                            <span className="font-semibold text-foreground/80">{job.company}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary/80" />
                            {job.location[lang as "fr" | "en"]}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50 text-xs font-medium text-foreground/80">
                            <Briefcase className="h-3 w-3 text-primary/80" /> {job.type[lang as "fr" | "en"]}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50 text-xs font-medium text-foreground/80">
                            <GraduationCap className="h-3 w-3 text-primary/80" /> {job.education}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50 text-xs font-medium text-foreground/80">
                            <Clock className="h-3 w-3 text-primary/80" /> {job.experience[lang as "fr" | "en"]}
                          </span>
                        </div>
                      </div>

                      {/* CTA button */}
                      <div className="md:self-center">
                        <Button 
                          onClick={() => handleViewJobDetails(job)}
                          className="w-full md:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-white px-5 py-2.5 font-semibold text-sm transition-all duration-300"
                        >
                          {lang === "fr" ? "Voir l'offre" : "View Details"}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border/60 rounded-2xl">
                <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "fr" ? "Aucune offre ne correspond à vos critères" : "No job listings matched your filters"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {lang === "fr" 
                    ? "Essayez d'élargir votre recherche ou de modifier vos filtres de sélection."
                    : "Try broadening your search keywords or clearing some filters."}
                </p>
                <Button 
                  onClick={() => {
                    setSearch("");
                    setLocation("");
                    setCategory("All");
                    setEducation("All");
                    setExperience("All");
                  }} 
                  variant="outline" 
                  className="mt-4 rounded-xl text-xs"
                >
                  {lang === "fr" ? "Réinitialiser les filtres" : "Reset Filters"}
                </Button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/90 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-secondary/80 flex items-center justify-center text-foreground hover:bg-secondary border border-border/60 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="space-y-3 pr-8">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-gradient text-white text-[10px] font-bold uppercase tracking-wider">
                    {selectedJob.type[lang as "fr" | "en"]}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                    {selectedJob.title[lang as "fr" | "en"]}
                  </h2>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground border-b border-border pb-4">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-muted-foreground/80" />
                      <span className="font-semibold text-foreground/85">{selectedJob.company}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary/80" />
                      {selectedJob.location[lang as "fr" | "en"]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      {selectedJob.salary}
                    </span>
                    {liveJobDetails?.deadline && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <strong>{lang === "fr" ? "Date limite :" : "Deadline:"}</strong> {liveJobDetails.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Description</h4>
                  {jobDetailLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        {lang === "fr" ? "Chargement des détails en direct..." : "Loading live job details..."}
                      </span>
                    </div>
                  ) : liveJobDetails ? (
                    <div 
                      className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3 max-h-[40vh] overflow-y-auto pr-2"
                      dangerouslySetInnerHTML={{ __html: liveJobDetails.description }}
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {selectedJob.description[lang as "fr" | "en"]}
                    </p>
                  )}
                </div>

                {/* Requirements (Only show if not live scraped job, or if details failed) */}
                {(!selectedJob.liveUrl || (!jobDetailLoading && !liveJobDetails)) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      {lang === "fr" ? "Profil recherché" : "Requirements"}
                    </h4>
                    <ul className="space-y-2">
                      {selectedJob.requirements[lang as "fr" | "en"].map((req, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-sm text-muted-foreground">
                          <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-none mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities (Only show if not live scraped job, or if details failed) */}
                {(!selectedJob.liveUrl || (!jobDetailLoading && !liveJobDetails)) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      {lang === "fr" ? "Missions" : "Responsibilities"}
                    </h4>
                    <ul className="space-y-2">
                      {selectedJob.responsibilities[lang as "fr" | "en"].map((resp, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-sm text-muted-foreground">
                          <span className="h-5 w-5 rounded-full bg-blue-400/10 flex items-center justify-center flex-none mt-0.5">
                            <ChevronRight className="h-3 w-3 text-blue-500" />
                          </span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Apply */}
                <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground text-center sm:text-left">
                    <span className="block font-semibold text-foreground/80 mb-0.5">
                      {selectedJob.liveUrl ? (lang === "fr" ? "Postuler via le portail" : "Apply via portal") : (lang === "fr" ? "Postuler en direct" : "Apply directly")}
                    </span>
                    {selectedJob.liveUrl ? "cDiscussion.com" : selectedJob.contactEmail}
                  </div>
                  <Button 
                    asChild 
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/95 hover:to-blue-600/95 py-3.5 h-auto text-sm font-semibold shadow-md text-white px-8"
                  >
                    <a 
                      href={selectedJob.liveUrl || `mailto:${selectedJob.contactEmail}?subject=Candidature - ${selectedJob.title[lang as "fr" | "en"]}`}
                      target={selectedJob.liveUrl ? "_blank" : undefined}
                      rel={selectedJob.liveUrl ? "noopener noreferrer" : undefined}
                    >
                      {selectedJob.liveUrl ? (
                        <>
                          <Briefcase className="h-4 w-4 mr-1.5" />
                          {lang === "fr" ? "Postuler sur cDiscussion" : "Apply on cDiscussion"}
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          {lang === "fr" ? "Envoyer ma candidature" : "Send Application"}
                        </>
                      )}
                    </a>
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Jobs;
