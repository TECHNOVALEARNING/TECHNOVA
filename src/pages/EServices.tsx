import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/site/shared";
import {
  Laptop,
  Palette,
  Cpu,
  LineChart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Send,
  Mail,
  Phone,
  Layers,
  Zap,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import humaniserImg from "@/assets/humaniser.jpg";

interface Skill {
  icon: any;
  title: string;
  desc: string;
  technologies: string[];
}

interface Service {
  icon: any;
  title: string;
  desc: string;
  features: string[];
  price: string;
}

interface Project {
  title: string;
  category: string;
  desc: string;
  image: string;
  tags: string[];
  stats: string;
  url: string;
  upcoming?: boolean;
}

const EServices = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "development",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(
        lang === "fr"
          ? "Veuillez remplir tous les champs obligatoires."
          : "Please fill in all required fields.",
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success(
        lang === "fr"
          ? "Message envoyé avec succès ! Nous vous recontacterons sous 24h."
          : "Message sent successfully! We will contact you within 24 hours.",
      );
      setFormData({ name: "", email: "", service: "development", message: "" });
      setSubmitting(false);
    }, 1500);
  };

  const skills: Skill[] = [
    {
      icon: Laptop,
      title: lang === "fr" ? "Développement Full-Stack" : "Full-Stack Development",
      desc:
        lang === "fr"
          ? "Création d'applications web et mobiles robustes et scalables en utilisant les meilleures technologies modernes."
          : "Building robust, scalable web and mobile applications using the best modern technologies.",
      technologies: [
        "React / Next.js",
        "TypeScript",
        "Node.js / Express",
        "Supabase / Postgres",
        "Python",
      ],
    },
    {
      icon: Palette,
      title: lang === "fr" ? "Design UI/UX & Branding" : "UI/UX Design & Branding",
      desc:
        lang === "fr"
          ? "Conception d'interfaces utilisateurs intuitives et esthétiques axées sur l'expérience client et la conversion."
          : "Crafting intuitive and gorgeous user interfaces focused on customer experience and conversion metrics.",
      technologies: ["Figma", "Design Systems", "Prototypage", "Motion Design", "Responsive Web"],
    },
    {
      icon: Cpu,
      title: lang === "fr" ? "Intégration d'IA & Automatisation" : "AI Integration & Automation",
      desc:
        lang === "fr"
          ? "Optimisation de vos flux de travail en connectant des agents d'intelligence artificielle et des webhooks."
          : "Optimizing your workflows by connecting custom artificial intelligence agents and real-time webhooks.",
      technologies: [
        "GPT-4/Gemini APIs",
        "LangChain",
        "Chatbots intelligents",
        "Make / Zapier",
        "Webhooks",
      ],
    },
    {
      icon: LineChart,
      title: lang === "fr" ? "Marketing Digital & Tracking" : "Digital Marketing & Tracking",
      desc:
        lang === "fr"
          ? "Mise en place de pixels de tracking publicitaire et d'entonnoirs de vente hautement optimisés."
          : "Implementation of advanced advertising tracking pixels and highly optimized conversion funnels.",
      technologies: [
        "Pixels (Meta, TikTok)",
        "Google Analytics 4",
        "SEO Technique",
        "Emailing (Resend)",
        "A/B Testing",
      ],
    },
  ];

  const services: Service[] = [
    {
      icon: Zap,
      title: lang === "fr" ? "Boutiques E-commerce Premium" : "Premium E-commerce Stores",
      desc:
        lang === "fr"
          ? "Une boutique en ligne rapide avec intégration complète des moyens de paiement locaux (Mobile Money) et internationaux."
          : "A lightning-fast online shop fully integrated with local Mobile Money and international payment gateways.",
      features: [
        lang === "fr" ? "Design unique et moderne" : "Unique and modern design",
        lang === "fr" ? "Paiement MTN, Moov, Wave, Visa" : "MTN, Moov, Wave, Visa payments",
        lang === "fr" ? "Panier et checkout optimisés" : "Optimized cart & checkout flow",
        lang === "fr" ? "Dashboard vendeur simplifié" : "Simplified seller dashboard",
      ],
      price: lang === "fr" ? "À partir de 4 000 000 FCFA" : "From $7 000",
    },
    {
      icon: Layers,
      title: lang === "fr" ? "Développement SaaS sur Mesure" : "Custom SaaS Development",
      desc:
        lang === "fr"
          ? "Transformez votre idée de produit en une application logicielle cloud complète et sécurisée avec authentification et abonnements."
          : "Turn your product idea into a complete, secure cloud application with built-in authentication and subscriptions.",
      features: [
        lang === "fr" ? "Base de données relationnelle sécurisée" : "Secure relational database",
        lang === "fr" ? "Gestion des comptes utilisateurs" : "User account management",
        lang === "fr" ? "Facturation Stripe ou Fedapay" : "Stripe or Fedapay billing integration",
        lang === "fr" ? "Panel d'administration complet" : "Complete administrator panel",
      ],
      price: lang === "fr" ? "Sur devis uniquement" : "Custom quote",
    },
    {
      icon: ShieldCheck,
      title: lang === "fr" ? "Tunnels de Vente & Landing Pages" : "Sales Funnels & Landing Pages",
      desc:
        lang === "fr"
          ? "Des pages de capture et de vente à fort impact visuel conçues spécifiquement pour maximiser vos taux de conversion publicitaire."
          : "High-impact landing pages designed specifically to maximize your advertising campaign conversion rates.",
      features: [
        lang === "fr" ? "Vitesse de chargement ultra-rapide" : "Ultra-fast loading speed",
        lang === "fr" ? "Optimisé à 100% pour mobile" : "100% optimized for mobile",
        lang === "fr" ? "Pixels de conversion configurés" : "Configured conversion pixels",
        lang === "fr" ? "Formulaires de capture intelligents" : "Intelligent capture forms",
      ],
      price: lang === "fr" ? "À partir de 60 000 FCFA" : "From $100",
    },
  ];

  const projects: Project[] = [
    {
      title: "TECHNOVA Learning",
      category: lang === "fr" ? "Plateforme Web" : "Web Platform",
      desc:
        lang === "fr"
          ? "Plateforme de cours en ligne avec paiements sécurisés et accès instantané aux formations."
          : "Online course platform with secure payments and instant access to training modules.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      tags: [
        "React 18",
        "TypeScript",
        "Supabase",
        "Tailwind CSS 3",
        "Vite 5",
        "PawaPay",
        "Edge Functions",
      ],
      stats: "+2,000 users",
      url: "https://technovalearning.com",
    },
    {
      title: "Technova Humanizer",
      category: lang === "fr" ? "Outil IA" : "AI Tool",
      desc:
        lang === "fr"
          ? "Outil IA de transformation de texte IA en texte humain"
          : "AI tool for transforming AI text into human text",
      image: humaniserImg,
      tags: ["React 19", "Express (Node.js)", "Tailwind CSS 4", "Gemini API", "Motion"],
      stats: "0.8s load time",
      url: "https://humanizer-ai-technova.vercel.app/",
    },
    {
      title: "Viral IA Agent",
      category: lang === "fr" ? "Automatisation & IA" : "Automation & AI",
      desc:
        lang === "fr" ? "Agent IA de viralisation de contenu" : "AI agent for content viralization",
      image: "https://i.pinimg.com/736x/b1/bb/ac/b1bbac1e29f08c1c7b5fa1cdb8d5aebb.jpg",
      tags: ["HTML5 / CSS3", "Vanilla JS", "Gemini API", "Local Storage"],
      stats: "92% resolution rate",
      url: "#",
      upcoming: true,
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{
        background: "var(--bg, #f2f2f7)",
        color: "var(--text, #1d1d1f)",
        fontFamily: "'Manrope', -apple-system, sans-serif",
      }}
    >
      <SEOHead
        canonicalPath="/e-services"
        title={
          lang === "fr"
            ? "Nos E-services & Solutions Digitales · TECHNOVA"
            : "Our E-services & Digital Solutions · TECHNOVA"
        }
        description={
          lang === "fr"
            ? "Explorez nos services d'accompagnement technique : développement e-commerce Mobile Money, création d'applications SaaS, intégration d'IA et création de tunnels de vente."
            : "Explore our technical services: Mobile Money e-commerce development, SaaS apps creation, AI integrations, and sales funnels."
        }
      />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text)] font-display leading-[1.15] mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {lang === "fr" ? (
                <>
                  Des Services Digitaux de{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Haute Qualité
                  </span>
                </>
              ) : (
                <>
                  High-Quality{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Digital Services
                  </span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
              {lang === "fr"
                ? "Nous transformons vos idées complexes en projets techniques concrets. E-commerce locaux, solutions SaaS, intégrations d'intelligence artificielle sur mesure."
                : "We transform your complex ideas into real technical projects. Local e-commerce, SaaS solutions, and tailored artificial intelligence integrations."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() =>
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 rounded-full text-sm font-bold bg-[color:var(--blue)] text-white shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {lang === "fr" ? "Lancer un projet" : "Start a project"}
              </button>
              <button
                onClick={() =>
                  document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 rounded-full text-sm font-semibold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:bg-[color:var(--surface-strong)] transition-all duration-200"
              >
                {lang === "fr" ? "Découvrir nos compétences" : "Explore our skills"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills / Competencies Section */}
      <section id="skills" className="py-20 bg-[color:var(--section-alt)]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[color:var(--blue)] font-bold mb-3 block">
              {lang === "fr" ? "Nos Compétences" : "Our Competencies"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[color:var(--text)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {lang === "fr"
                ? "Une expertise technique complète"
                : "A complete technical expertise"}
            </h2>
            <p className="mt-4 text-sm text-[color:var(--text-secondary)] leading-relaxed">
              {lang === "fr"
                ? "Notre équipe maîtrise les technologies les plus demandées pour vous offrir des solutions sécurisées, rapides et modernes."
                : "Our team masters the most demanded technologies to offer you secure, fast, and modern solutions."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <motion.div
                  key={skill.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="feature-card"
                >
                  <div className="feature-icon">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base mb-3 text-[color:var(--text)]">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed mb-6">
                    {skill.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[color:var(--divider)]">
                    {skill.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-[color:var(--blue-soft)] text-[color:var(--blue)] font-mono text-[10px] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Offered Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[color:var(--blue)] font-bold mb-3 block">
              {lang === "fr" ? "Nos Services" : "Our Services"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[color:var(--text)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {lang === "fr"
                ? "Des offres conçues pour votre croissance"
                : "Offers designed for your growth"}
            </h2>
            <p className="mt-4 text-sm text-[color:var(--text-secondary)] leading-relaxed">
              {lang === "fr"
                ? "Choisissez l'offre qui convient le mieux à vos objectifs et laissez-nous piloter le reste."
                : "Choose the package that best fits your goals and let us handle the rest."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-3xl border border-[color:var(--tn-card-border)] bg-[color:var(--tn-card)] p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/20 transition-all duration-300"
                >
                  <div>
                    <div className="h-12 w-12 rounded-2xl bg-[color:var(--blue-soft)] border border-blue-500/10 flex items-center justify-center text-[color:var(--blue)] mb-6">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[color:var(--text)] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed mb-6">
                      {service.desc}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-xs text-[color:var(--text)]"
                        >
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-[color:var(--divider)] flex items-center justify-between">
                    <span className="text-xs text-[color:var(--text-secondary)] font-medium">
                      {lang === "fr" ? "Investissement" : "Investment"}
                    </span>
                    <span className="text-sm font-extrabold text-[color:var(--blue)]">
                      {service.price}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Showcase (Portfolio) */}
      <section className="py-20 bg-[color:var(--section-alt)]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[color:var(--blue)] font-bold mb-3 block">
              {lang === "fr" ? "Nos Réalisations" : "Our Completed Projects"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[color:var(--text)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {lang === "fr" ? "Découvrez nos derniers projets" : "Discover our latest projects"}
            </h2>
            <p className="mt-4 text-sm text-[color:var(--text-secondary)] leading-relaxed">
              {lang === "fr"
                ? "Chaque projet représente un défi relevé avec succès pour propulser l'activité numérique de nos partenaires."
                : "Each project represents a successfully completed challenge to boost the digital business of our partners."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="course-card"
              >
                <div className="course-img-wrap h-52">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="course-badge">{project.category}</span>
                </div>
                <div className="course-body flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base mb-2 text-[color:var(--text)]">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed mb-6">
                      {project.desc}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[color:var(--text-secondary)] font-medium pt-3 border-t border-[color:var(--divider)]">
                      <span className="flex items-center gap-1">
                        {project.upcoming ? (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            {lang === "fr" ? "En développement" : "In development"}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            {lang === "fr" ? "Lancement réussi" : "Successful launch"}
                          </>
                        )}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-semibold">
                        {project.stats}
                      </span>
                    </div>
                    {project.upcoming ? (
                      <div className="mt-4 flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-muted text-muted-foreground opacity-60 cursor-not-allowed">
                        {lang === "fr" ? "Bientôt disponible" : "Coming soon"}
                      </div>
                    ) : (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-[color:var(--blue-soft)] text-[color:var(--blue)] hover:bg-[color:var(--blue)] hover:text-white transition-all duration-200"
                      >
                        {lang === "fr" ? "Visiter le site" : "Visit website"}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Info (Left) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[color:var(--blue)] font-bold mb-3 block">
                  {lang === "fr" ? "Coordonnées" : "Contact Details"}
                </span>
                <h2
                  className="text-3xl font-extrabold text-[color:var(--text)] leading-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {lang === "fr" ? "Discutons de votre projet" : "Let's discuss your project"}
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-[color:var(--text-secondary)] leading-relaxed">
                  {lang === "fr"
                    ? "Vous avez un projet en tête ou besoin de conseils techniques ? Envoyez-nous un message et nous reviendrons vers vous rapidement."
                    : "Have a project in mind or need technical advice? Send us a message and we'll get back to you shortly."}
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="mailto:support@technovalearning.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[color:var(--surface)] hover:bg-[color:var(--surface-strong)] border border-[color:var(--border)] transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[color:var(--text-secondary)] uppercase tracking-wider font-bold">
                      {lang === "fr" ? "Écrivez-nous" : "Email us"}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[color:var(--text)]">
                      support@technovalearning.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://wa.me/22947883735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[color:var(--surface)] hover:bg-[color:var(--surface-strong)] border border-[color:var(--border)] transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[color:var(--text-secondary)] uppercase tracking-wider font-bold">
                      {lang === "fr" ? "WhatsApp direct" : "WhatsApp Chat"}
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact Form (Right) */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-[color:var(--tn-card-border)] bg-[color:var(--tn-card)] p-6 sm:p-8 shadow-sm"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[color:var(--text)] pl-1">
                        {lang === "fr" ? "Nom complet *" : "Full name *"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder={lang === "fr" ? "Ex: Jean Dupont" : "Ex: John Doe"}
                        className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-xs text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[color:var(--text)] pl-1">
                        {lang === "fr" ? "Email *" : "Email *"}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder={lang === "fr" ? "Ex: jean@mail.com" : "Ex: john@mail.com"}
                        className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-xs text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[color:var(--text)] pl-1">
                      {lang === "fr" ? "Service concerné" : "Project Service"}
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-xs text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ecommerce">
                        {lang === "fr" ? "E-commerce (Mobile Money)" : "E-commerce (Mobile Money)"}
                      </option>
                      <option value="saas">
                        {lang === "fr"
                          ? "Développement SaaS sur mesure"
                          : "Custom SaaS Development"}
                      </option>
                      <option value="landing">
                        {lang === "fr"
                          ? "Landing Page / Tunnel de vente"
                          : "Landing Page / Sales Funnel"}
                      </option>
                      <option value="ai-automation">
                        {lang === "fr"
                          ? "Intégration d'IA & Automatisation"
                          : "AI Integration & Automation"}
                      </option>
                      <option value="other">
                        {lang === "fr" ? "Autre demande" : "Other request"}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[color:var(--text)] pl-1">
                      {lang === "fr" ? "Message *" : "Message *"}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder={
                        lang === "fr"
                          ? "Décrivez brièvement votre projet ou vos besoins..."
                          : "Briefly describe your project or needs..."
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-xs text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl text-xs font-bold bg-[color:var(--blue)] text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {lang === "fr" ? "Envoi en cours..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        {lang === "fr" ? "Envoyer mon message" : "Send my message"}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EServices;
