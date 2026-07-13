import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Header, Footer, CourseCard, Course } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";
import appMockupGif from "@/assets/techgif.gif";
import SEOHead from "@/components/SEOHead";
import { getEmbedUrl, getVideoThumbnailUrl, isDirectVideo } from "@/lib/videoUtils";
import { BookOpen, Loader2, Search, PackageOpen } from "lucide-react";

const SUBCAT_LABELS: Record<string, string> = {
  notion: "Notion",
  canva: "Canva & Design",
  excel: "Excel & Finance",
  dev: "Dev & Web",
  marketing: "Marketing & Social",
  other: "Autre",
};

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business",
  design: "Design",
  tech: "Tech & Code",
  marketing: "Marketing",
  education: "Éducation",
  lifestyle: "Lifestyle",
  creative: "Créatif",
  divertissement: "Divertissement",
  sante_bien_etre: "Santé et bien être",
  developpement_personnel: "Développement personnel",
  langue: "Langues",
  other: "Autre",
};

const getDisplayCategory = (cat: string) => {
  if (!cat) return "Formation";
  if (cat === "template") return "Template";
  if (cat.startsWith("template:")) {
    const sub = cat.split(":")[1];
    return `Template ${SUBCAT_LABELS[sub] || sub}`;
  }
  if (cat === "ebook") return "E-book";
  if (cat === "formation") return "Formation";
  return CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
};

const PARTNERS = [
  { icon: "fab fa-google", name: "Google" },
  { icon: "fab fa-microsoft", name: "Microsoft" },
  { icon: "fab fa-aws", name: "Amazon AWS" },
  { icon: "fab fa-python", name: "Python" },
  { icon: "fab fa-meta", name: "Meta" },
  { icon: "fab fa-apple", name: "Apple" },
  { icon: "fab fa-salesforce", name: "Salesforce" },
  { icon: "fab fa-github", name: "GitHub" },
  { icon: "fab fa-docker", name: "Docker" },
  { icon: "fab fa-linux", name: "Linux Foundation" },
  { icon: "fab fa-react", name: "React" },
  { icon: "fab fa-node-js", name: "Node.js" },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: '"En 3 semaines j\'ai appris Excel de A à Z grâce à Technova. Mon employeur a immédiatement remarqué la différence."',
    name: "Sarah Jenkins",
    loc: "London, UK",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },

  {
    stars: 5,
    text: '"La formation Cybersécurité m\'a permis de décrocher un poste de consultant. Le paiement par Mobile Money est très pratique."',
    name: "Cédric TOUDONOU",
    loc: "Cotonou, Bénin",
    img: "https://i.pinimg.com/1200x/a2/09/d6/a209d6e66859493e14c59bc92e5b2e02.jpg",
  },

  {
    stars: 5,
    text: '"Découvrir Technova a été l\'une des meilleures décisions de ma vie. Leurs formations sont de qualité et abordables."',
    name: "William ANATO",
    loc: "Freetown , Sierra Leone",
    img: "https://randomuser.me/api/portraits/men/30.jpg",
  },

  {
    stars: 5,
    text: '"Formation Data Science très complète. Le support WhatsApp répond en moins de 2h. Vraiment professionnel."',
    name: "Emma Dubois",
    loc: "Paris, France",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
  },


];

const Index = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const time = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const draw = () => {
      // time += 0.45; (Background animation stopped to make it static)
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";

      // Subtle ambient glowing radial gradient in the center
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6,
      );
      if (isDark) {
        glowGrad.addColorStop(0, "rgba(168, 85, 247, 0.12)"); // Purple glow
        glowGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.04)"); // Blue glow
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(168, 85, 247, 0.05)"); // Softer glow
        glowGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.02)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Linear stroke gradient for the ribbon
      const ribbonGrad = ctx.createLinearGradient(0, 0, width, 0);
      if (isDark) {
        ribbonGrad.addColorStop(0, "rgba(245, 166, 35, 0)");
        ribbonGrad.addColorStop(0.15, "rgba(245, 166, 35, 0.85)"); // Peach
        ribbonGrad.addColorStop(0.35, "rgba(236, 72, 153, 0.9)"); // Pink/magenta
        ribbonGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.9)"); // Purple/violet
        ribbonGrad.addColorStop(0.85, "rgba(59, 130, 246, 0.85)"); // Blue
        ribbonGrad.addColorStop(1.0, "rgba(59, 130, 246, 0)");
      } else {
        ribbonGrad.addColorStop(0, "rgba(245, 166, 35, 0)");
        ribbonGrad.addColorStop(0.15, "rgba(245, 124, 0, 0.8)"); // Saturated orange
        ribbonGrad.addColorStop(0.35, "rgba(219, 39, 119, 0.85)"); // Pink
        ribbonGrad.addColorStop(0.6, "rgba(124, 58, 237, 0.85)"); // Purple
        ribbonGrad.addColorStop(0.85, "rgba(29, 78, 216, 0.8)"); // Saturated Blue
        ribbonGrad.addColorStop(1.0, "rgba(29, 78, 216, 0)");
      }
      ctx.strokeStyle = ribbonGrad;

      const numLines = 22;
      const step = 28;

      for (let i = 0; i < numLines; i++) {
        const v = -1 + (2 * i) / (numLines - 1);

        ctx.beginPath();
        let first = true;

        for (let x = 0; x <= width; x += step) {
          const u = x / width;

          // Wave equation forming a 3D ribbon
          const spineY = height * (0.55 - u * 0.1) + Math.sin(u * Math.PI * 2.5 - time * 0.02) * 35;
          const spineZ = Math.cos(u * Math.PI * 2.5 - time * 0.016) * 45;

          // Twist effect
          const twist = u * Math.PI * 2.4 + time * 0.03;

          // Ribbon width pinch and spread
          const ribbonWidth = (55 + Math.sin(u * Math.PI) * 25) * (1 - Math.abs(v) * 0.08);

          const yOffset = v * ribbonWidth * Math.cos(twist);
          const zOffset = v * ribbonWidth * Math.sin(twist);

          // Project depth into height coordinate for 3D perspective
          const yFinal = spineY + yOffset + zOffset * 0.22;

          if (first) {
            ctx.moveTo(x, yFinal);
            first = false;
          } else {
            ctx.lineTo(x, yFinal);
          }
        }

        // Draw glow pass
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = isDark
          ? (0.03 + (1 - Math.abs(v)) * 0.22) * 0.55
          : (0.02 + (1 - Math.abs(v)) * 0.12) * 0.4;
        ctx.stroke();

        // Draw sharp pass
        ctx.lineWidth = 1.15;
        ctx.globalAlpha = isDark
          ? 0.08 + (1 - Math.abs(v)) * 0.65
          : 0.15 + (1 - Math.abs(v)) * 0.55;
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [isLoadedDelayed, setIsLoadedDelayed] = useState(false);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  useEffect(() => {
    // Delay loading the heavy video scripts/frames slightly to improve core web vitals
    const timer = setTimeout(() => {
      setIsLoadedDelayed(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const { data: storeInfo } = useQuery({
    queryKey: ["public_store_home"],
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("layout_sections")
        .eq("slug", "nova-shop")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const welcomeVideoUrl = (() => {
    const defaultUrl = "#";
    if (!storeInfo?.layout_sections) return defaultUrl;
    const sections = Array.isArray(storeInfo.layout_sections) ? storeInfo.layout_sections : [];
    const videoSection = sections.find((s: any) => s.type === "video");
    if (videoSection && videoSection.enabled) {
      return videoSection.config?.video_url || defaultUrl;
    }
    return defaultUrl;
  })();

  const { data: productsData = { products: [], adminId: "9702b3c5-4acf-42e2-828c-8bf2d50dfff8" } } = useQuery({
    queryKey: ["public_products_home"],
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    queryFn: async () => {
      // Find the administrator's profile id from their store
      const { data: storeData } = await supabase
        .from("stores")
        .select("owner_id")
        .eq("slug", "nova-shop")
        .maybeSingle();
      const adminId = storeData?.owner_id || "9702b3c5-4acf-42e2-828c-8bf2d50dfff8";

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const active = (data || []).filter((p: any) => {
        if (p.category === "discovery") {
          return false;
        }
        try {
          const f = typeof p.features === "string" ? JSON.parse(p.features) : p.features || {};
          return f.status !== "draft";
        } catch {
          return true;
        }
      });
      const products = active.map((p: any) => ({
        slug: p.id,
        title: p.title,
        cover:
          p.thumbnail_url ||
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        category: getDisplayCategory(p.category || "Formation"),
        level: lang === "fr" ? "Tous niveaux" : "All levels",
        price: `${p.price} FCFA`,
        oldPrice: p.original_price ? `${p.original_price} FCFA` : undefined,
        duration: lang === "fr" ? "Accès à vie" : "Lifetime access",
        creatorId: p.creator_id,
      })) as Course[];

      return { products, adminId };
    },
  });

  const { products: dbProducts, adminId } = productsData;

  const displayProducts = searchQuery
    ? dbProducts.filter((p) => {
      return (
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    : dbProducts.filter((p) => p.creatorId === adminId).slice(0, 8);

  const { data: stats } = useQuery({
    queryKey: ["homepage_stats"],
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes since this is static/aggregated
    queryFn: async () => {
      // Count profiles
      const { count: profilesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Count products
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get reviews sentiment
      const { data: reviews } = await supabase.from("product_reviews").select("sentiment");

      const totalReviews = reviews?.length || 0;
      const positiveReviews = reviews?.filter((r: any) => r.sentiment === "positive").length || 0;
      const satisfactionRate =
        totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 95; // Default fallback

      return {
        users: profilesCount || 0,
        products: productsCount || 0,
        satisfaction: satisfactionRate,
      };
    },
  });

  const usersCountDisplay = (stats?.users || 0) >= 300 ? "300+" : String(stats?.users || 0);
  const satisfactionRateDisplay = `${stats?.satisfaction || 95}%`;
  const productsCountDisplay = `${stats?.products || 0}+`;

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{
        background: "var(--bg, #f2f2f7)",
        color: "var(--text, #1d1d1f)",
        fontFamily: "'Manrope', -apple-system, sans-serif",
      }}
    >
      {/* Font import via style tag */}
      <style>{`
        @media (max-width: 768px) {
          *, ::before, ::after {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
        :root {
          --blue: #0071e3; --blue-light: #409cff; --blue-soft: rgba(0,113,227,0.08);
          --accent: #f5a623; --bg: #f2f2f7; --surface: rgba(255,255,255,0.75);
          --surface-strong: rgba(255,255,255,0.92); --card: rgba(255,255,255,0.68);
          --card-border: rgba(255,255,255,0.55); --text: #1d1d1f; --text-secondary: #6e6e73;
          --divider: rgba(0,0,0,0.08); --glass-blur: blur(24px) saturate(180%);
          --shadow-sm: 0 2px 16px rgba(0,0,0,0.06); --shadow-md: 0 8px 40px rgba(0,0,0,0.09);
          --shadow-lg: 0 20px 60px rgba(0,0,0,0.12); --radius: 20px; --radius-sm: 12px; --radius-lg: 28px;
          --section-alt: rgba(0,0,0,0.018);
        }
        [data-theme="dark"] {
          --bg: #000000;
          --surface: rgba(28,28,30,0.82);
          --surface-strong: rgba(44,44,46,0.92);
          --card: rgba(28,28,30,0.72);
          --card-border: rgba(255,255,255,0.1);
          --text: #f5f5f7;
          --text-secondary: #98989d;
          --divider: rgba(255,255,255,0.08);
          --shadow-sm: 0 2px 16px rgba(0,0,0,0.3);
          --shadow-md: 0 8px 40px rgba(0,0,0,0.4);
          --section-alt: rgba(255,255,255,0.018);
        }
        .tn-card { background: var(--card); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: 1px solid var(--card-border); }
        .tn-hero-title { font-family:'Outfit',sans-serif; font-size:clamp(2.6rem,5vw,4.2rem); font-weight:800; line-height:1.08; letter-spacing:-0.04em; }
        .tn-hero-span { background:linear-gradient(135deg,var(--blue),var(--blue-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .tn-section-title { font-family:'Outfit',sans-serif; font-size:clamp(1.8rem,3vw,2.8rem); font-weight:800; letter-spacing:-0.03em; line-height:1.1; }
        .tn-eyebrow { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--blue); display:block; margin-bottom:12px; }
        .tn-btn-primary { display:inline-flex; align-items:center; gap:10px; background:var(--blue); color:white; font-family:'Outfit',sans-serif; font-weight:600; font-size:0.95rem; padding:14px 28px; border-radius:50px; text-decoration:none; transition:all 0.3s ease; box-shadow:0 8px 24px rgba(0,113,227,0.35); }
        .tn-btn-primary:hover { background:#0077ed; color:white; transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,113,227,0.45); }
        .tn-feature-card { background:var(--card); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur); border:1px solid var(--card-border); border-radius:var(--radius); padding:36px 32px; transition:all 0.3s ease; box-shadow:var(--shadow-sm); }
        .tn-feature-card:hover { transform:translateY(-6px); box-shadow:var(--shadow-md); border-color:rgba(0,113,227,0.2); }
        .tn-feature-icon { width:52px; height:52px; background:var(--blue-soft); border:1px solid rgba(0,113,227,0.15); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:var(--blue); margin-bottom:24px; }
        .partners-track { display:flex; gap:48px; align-items:center; animation:scrollPartners 30s linear infinite; width:max-content; will-change:transform; }
        .partners-track:hover { animation-play-state:paused; }
        @keyframes scrollPartners { from { transform:translate3d(0,0,0); } to { transform:translate3d(-50%,0,0); } }
        .partner-item { display:flex; align-items:center; gap:10px; opacity:0.38; transition:opacity 0.3s; white-space:nowrap; cursor:default; flex-shrink:0; }
        .partner-item:hover { opacity:0.8; }
        .tn-testi-card { background:var(--card); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur); border:1px solid var(--card-border); border-radius:var(--radius); padding:32px 28px; height:100%; box-shadow:var(--shadow-sm); transition:all 0.3s; }
        .tn-testi-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-md); }
        .tn-cta-wrap { background:linear-gradient(135deg,#0071e3,#409cff); border-radius:var(--radius-lg); padding:72px 48px; text-align:center; position:relative; overflow:hidden; }
        .tn-about-ico { width:46px; height:46px; min-width:46px; background:var(--blue); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; color:white; }
        .bg-orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; opacity:0.35; transition:opacity 0.5s; }
        .orb-1 { width:600px; height:600px; background:radial-gradient(circle,#0071e3,transparent); top:-200px; left:-200px; }
        .orb-2 { width:500px; height:500px; background:radial-gradient(circle,#409cff,transparent); bottom:20%; right:-150px; }
        .orb-3 { width:400px; height:400px; background:radial-gradient(circle,#f5a623,transparent); top:50%; left:40%; }
        @keyframes heroImageFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes heroCardFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .pay-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; font-weight:800; font-size:0.82rem; margin:4px; }
        .pay-mtn { background:#ffcc00; color:#000; }
        .pay-moov { background:#0066cc; color:#fff; }
        .pay-orange { background:#FF6B00; color:white; }
        .pay-wave { background:#1A73E8; color:white; }
        .pay-visa { background:white; border:1px solid rgba(0,0,0,0.12); color:#1a1f71; font-style:italic; }
        .pay-mastercard { background:#D92F21; border:1px solid rgba(0,0,0,0.12); color:white; font-style:italic; }
        .pay-apple { background:black; color:white; }
        .pay-google { background:white; border:1px solid rgba(0,0,0,0.12); color:black; }
        .pay-dolapay { background:#007bff; color:#fff; }
        .stats-section {
          background: linear-gradient(to bottom, var(--section-alt), var(--bg) 15%, var(--bg) 85%, var(--section-alt));
          position: relative;
          transition: background 0.3s, color 0.3s;
        }
        @media (max-width: 1024px) {
          .hero-video-container {
            margin-top: 48px;
            padding: 0 16px;
          }
          .hero-badge-left {
            display: none !important;
          }
          .hero-badge-right {
            display: none !important;
          }
        }
      `}</style>

      {/* BG Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <Header />
      <SEOHead
        title={lang === "en" ? "TECHNOVA Learning — Master AI, Data & Cybersecurity" : undefined}
        description={
          lang === "en"
            ? "Certified online courses in AI, Data, Cybersecurity & Design. Learn at your own pace, from anywhere. Pay with Mobile Money or Visa."
            : undefined
        }
        canonicalPath="/"
      />

      {/* ============ HERO ============ */}
      <section
        id="home"
        className="relative pt-20 pb-10 md:pt-36 md:pb-24 overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Shapes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[
            { cls: "500px", bg: "var(--blue)", top: "-100px", right: "0" },
            { cls: "300px", bg: "var(--accent)", bottom: "0", left: "10%" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: s.cls,
                height: s.cls,
                background: s.bg,
                borderRadius: "50%",
                opacity: 0.06,
                animation: "heroImageFloat 8s ease-in-out infinite",
                ...(s.top ? { top: s.top } : { bottom: s.bottom }),
                ...(s.right ? { right: s.right } : { left: s.left }),
              }}
            />
          ))}
        </div>

        <div className="container mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
            className="max-lg:!grid-cols-1"
          >
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="tn-hero-title" style={{ marginBottom: 24, color: "var(--text)" }}>
                {lang === "fr" ? (
                  <>
                    Maîtrisez la Tech de <span className="tn-hero-span">Demain</span>.
                  </>
                ) : (
                  <>
                    Master the Tech of <span className="tn-hero-span">Tomorrow</span>.
                  </>
                )}
              </h1>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                  marginBottom: 40,
                }}
              >
                {lang === "fr"
                  ? "TECHNOVA Learning votre passerelle vers le développement, la data science et le design. Formez-vous aux talents qui ouvrent les portes du marché. Etudiants, freelancers, entreprises, c'est ici que ça se passe."
                  : "TECHNOVA Courses is the ultimate platform to learn development, data science, and design. Learn the skills recruiters are looking for. Students, freelancers, companies, this is where it happens."}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 36,
                }}
              >
                <Link
                  to="/#courses"
                  className="tn-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {lang === "fr" ? "Explorer les ebooks" : "Explore ebooks"}{" "}
                  <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                </Link>
                <Link
                  to="/formations"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    borderRadius: 50,
                    border: "1.5px solid var(--blue)",
                    color: "var(--blue)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    textDecoration: "none",
                    transition: "all 0.25s",
                  }}
                >
                  {lang === "fr" ? "Voir les formations" : "View courses"}
                </Link>
              </div>
              {/* Social proof */}
              {/* <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex" }}>
                  {[
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/85.jpg",
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid var(--bg)",
                        objectFit: "cover",
                        marginLeft: i === 0 ? 0 : -10,
                      }}
                    />
                  ))}
                </div> */}
              {/* <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  <strong style={{ color: "var(--text)" }}>Plusieurs</strong>{" "}
                  {lang === "fr" ? "étudiants nous font déjà confiance" : "students trust us"}
                </p>
              </div> */}
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-video-container"
              style={{ position: "relative", width: "100%" }}
            >
              <div
                style={{
                  width: "100%",
                  background: "var(--card)",
                  backdropFilter: "var(--glass-blur)",
                  WebkitBackdropFilter: "var(--glass-blur)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  padding: 0,
                  boxShadow: "var(--shadow-lg)",
                  animation: "none",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%" /* 16:9 Aspect Ratio */,
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    cursor: "default",
                  }}
                >
                  {welcomeVideoUrl && welcomeVideoUrl !== "#" && isLoadedDelayed && (
                    isDirectVideo(welcomeVideoUrl) ? (
                      <video
                        src={welcomeVideoUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        preload="auto"
                        playsInline
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(welcomeVideoUrl, true)}
                        style={{
                          position: "absolute",
                          top: "-10%",
                          left: "-10%",
                          width: "120%",
                          height: "120%",
                          border: 0,
                        }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  )}
                </div>
              </div>
              {/* Stat card */}
              <div
                className="hero-badge-left"
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: -20,
                  background: "var(--surface-strong)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--radius)",
                  padding: "12px 18px",
                  boxShadow: "var(--shadow-md)",
                  minWidth: 160,
                  zIndex: 10,
                  animation: "heroCardFloat 7s ease-in-out infinite",
                  animationDelay: "-2s",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--blue)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  95%
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  {lang === "fr" ? "Taux de satisfaction" : "Satisfaction rate"}
                </div>
              </div>
              {/* Badge */}
              <div
                className="hero-badge-right"
                style={{
                  position: "absolute",
                  top: 12,
                  right: -12,
                  background: "linear-gradient(135deg,#0071e3,#409cff)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  textAlign: "center",
                  color: "white",
                  boxShadow: "var(--shadow-md)",
                  minWidth: 90,
                  zIndex: 10,
                  animation: "heroCardFloat 9s ease-in-out infinite",
                  animationDelay: "-4s",
                }}
              >
                <div
                  style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}
                >
                  +10
                </div>
                <div style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                  {lang === "fr" ? "Entreprises" : "Companies"}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Annonces et Publicités */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ marginTop: 64, width: "100%" }}
          >
            <div
              style={{
                maxWidth: 840,
                margin: "0 auto",
                background: "var(--surface)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                border: "1px dashed var(--blue)",
                borderRadius: "var(--radius-lg)",
                padding: "32px 24px",
                boxShadow: "var(--shadow-sm)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            > */}
          {/* <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: "var(--blue-soft)",
                  borderRadius: "50%",
                  filter: "blur(20px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  background: "var(--blue-soft)",
                  borderRadius: "50%",
                  filter: "blur(20px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--blue-soft)",
                    border: "1px solid rgba(0,113,227,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--blue)",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="fas fa-bullhorn" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {lang === "fr"
                    ? "Espace Annonces & Publicités"
                    : "Announcements & Advertisements Space"}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    maxWidth: 500,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {lang === "fr"
                    ? "Découvrez bientôt ici nos offres exclusives, nouveautés technologiques, lancements de formations et événements à venir."
                    : "Stay tuned for exclusive offers, tech news, course launches, and upcoming events in this space."}
                </p>
              </div>
            </div>
          </motion.div> */}
        </div>
      </section>

      {/* ============ PARTNERS MARQUEE ============ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--surface)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid var(--divider)",
          borderBottom: "1px solid var(--divider)",
          padding: "28px 0",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: 16,
          }}
        >
          {lang === "fr" ? "NOS TECHNOLOGIES" : "OUR TECHNOLOGIES"}
        </p>
        <div className="partners-track">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div key={i} className="partner-item">
              <i className={p.icon} style={{ fontSize: "1.5rem", color: "var(--text)" }} />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section id="features" className="section-pad-100" style={{ position: "relative", zIndex: 1 }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ marginBottom: 48, maxWidth: 600 }}>
            <span className="section-eyebrow">
              {lang === "fr" ? "Pourquoi TECHNOVA" : "Why TECHNOVA"}
            </span>
            <h2 className="section-title">
              {lang === "fr" ? "Pourquoi choisir TECHNOVA ?" : "Why choose TECHNOVA?"}
            </h2>
            <p className="section-sub">
              {lang === "fr"
                ? "Une pédagogie adaptée au marché de l'emploi local et international."
                : "A pedagogy adapted to the local and international job market."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "fas fa-laptop-code",
                title: lang === "fr" ? "100% Pratique" : "100% Practical",
                desc:
                  lang === "fr"
                    ? "Des projets concrets pour construire votre portfolio professionnel dès la première leçon."
                    : "Concrete projects to build your professional portfolio from the first lesson.",
              },
              {
                icon: "fas fa-headset",
                title: lang === "fr" ? "Support Dédié" : "Dedicated Support",
                desc:
                  lang === "fr"
                    ? "Un accompagnement personnalisé pour répondre à vos questions pendant toute la formation."
                    : "Personalized guidance to answer your questions throughout the training.",
              },
              {
                icon: "fas fa-mobile-alt",
                title: lang === "fr" ? "Paiement Local" : "Local Payment",
                desc:
                  lang === "fr"
                    ? "Payez facilement via MTN MoMo, Moov Money, Orange Money, Wave ou Carte Visa."
                    : "Pay easily via MTN MoMo, Moov Money, Orange Money, Wave, or Visa Card.",
              },
              {
                icon: "fas fa-certificate",
                title: lang === "fr" ? "Attestations Reconnues" : "Recognized Attestations",
                desc:
                  lang === "fr"
                    ? "Obtenez des attestations reconnues par les employeurs."
                    : "Obtain attestations recognized by employers.",
              },
              {
                icon: "fas fa-users",
                title: lang === "fr" ? "Communauté Active" : "Active Community",
                desc:
                  lang === "fr"
                    ? "Rejoignez 10 000+ apprenants et un réseau de mentors passionnés par la technologie."
                    : "Join 10,000+ learners and a network of mentors passionate about technology.",
              },
              {
                icon: "fas fa-infinity",
                title: lang === "fr" ? "Accès à Vie" : "Access for life",
                desc:
                  lang === "fr"
                    ? "Achetez une fois, apprenez pour toujours. Mises à jour incluses sans frais supplémentaires."
                    : "Buy once, learn forever. Updates included without extra charges.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <i className={f.icon} />
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      <section
        id="courses"
        className="section-pad-100"
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--section-alt)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h2 className="section-title">
                <span className="title-motion-wrap">
                  <span className="title-motion">
                    {lang === "fr" ? "Nos Produits Digitaux" : "Our Digital Products"}
                  </span>
                  <i className="fas fa-sparkles motion-spark"></i>
                </span>
              </h2>
              <p className="section-sub" style={{ marginTop: 8 }}>
                {lang === "fr"
                  ? "Construisez votre avenir avec nos ebooks et templates sélectionnés."
                  : "Build your future with our selected ebooks and templates."}
              </p>
            </div>

            {/* Premium glassmorphism search bar */}
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-secondary)]" style={{ transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder={
                  lang === "fr" ? "Rechercher un produit, ebook..." : "Search product, ebook..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "2.25rem",
                  paddingRight: "2.5rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  borderRadius: "12px",
                  border: "1px solid var(--card-border)",
                  background: "var(--card)",
                  backdropFilter: "var(--glass-blur)",
                  WebkitBackdropFilter: "var(--glass-blur)",
                  fontSize: "0.875rem",
                  color: "var(--text)",
                  outline: "none",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.25s",
                }}
                className="focus:ring-2 focus:ring-blue-500/20"
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--blue)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0, 113, 227, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--card-border)";
                  e.target.style.boxShadow = "var(--shadow-sm)";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-secondary)] hover:text-[color:var(--text)] transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", transform: "translateY(-50%)" }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayProducts.map((c, i) => (
                  <CourseCard key={c.slug} c={c} i={i} />
                ))}
              </div>
              {!searchQuery && (
                <div className="flex justify-center mt-12">
                  <Link to="/store" className="tn-btn-primary">
                    {lang === "fr" ? "Voir tous les produits" : "See all products"}{" "}
                    <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
              {dbProducts.length === 0 ? (
                <>
                  <i
                    className="fas fa-graduation-cap"
                    style={{
                      fontSize: "3rem",
                      marginBottom: 16,
                      display: "block",
                      color: "var(--blue)",
                    }}
                  />
                  <p>
                    {lang === "fr"
                      ? "Les formations sont en cours de chargement..."
                      : "Loading courses..."}
                  </p>
                </>
              ) : (
                <div className="text-center py-12 bg-[color:var(--card)] border border-[color:var(--card-border)] rounded-3xl p-8 max-w-md mx-auto backdrop-blur-md">
                  <PackageOpen className="h-14 w-14 text-[color:var(--text-secondary)] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">
                    {lang === "fr" ? "Aucun produit trouvé" : "No products found"}
                  </h3>
                  <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed">
                    {lang === "fr"
                      ? "Modifiez votre recherche pour explorer d'autres produits."
                      : "Try changing your search query to find other products."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section
        className="stats-section section-pad-90"
        style={{ overflow: "hidden", zIndex: 1 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="mx-auto"
          style={{ maxWidth: 1280, padding: "0 24px", position: "relative", zIndex: 10 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Stat 1: Users */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                {usersCountDisplay}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {lang === "fr" ? "Nombre d'utilisateurs" : "Students Worldwide"}
              </div>
            </div>

            {/* Stat 2: Satisfaction */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                {satisfactionRateDisplay}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {lang === "fr" ? "Taux de satisfaction" : "Satisfaction Rate"}
              </div>
            </div>

            {/* Stat 3: Products */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                {productsCountDisplay}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {lang === "fr" ? "Nombre de Produits" : "Courses Available"}
              </div>
            </div>

            {/* Stat 4: Companies */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                10+
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {lang === "fr" ? "Nombre d'entreprises" : "Partner Companies"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ APPS ============ */}
      <section
        id="apps"
        className="section-pad-100"
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--background)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div className="app-glass">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 48,
                alignItems: "center",
              }}
              className="max-lg:!grid-cols-1"
            >
              <div>
                <div className="app-icon-wrap">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <span className="section-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {lang === "fr" ? "Nos Applications" : "Our Applications"}
                </span>
                <h2 className="section-title" style={{ color: "white", marginBottom: 16 }}>
                  TECHNOVA &nbsp; Apps
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.93rem",
                    marginBottom: 32,
                    lineHeight: 1.6,
                  }}
                >
                  {lang === "fr"
                    ? "Accédez à toutes nos applications et sites web. Que vous soyez sur Android, iOS ou n’importe quel appareil connecté, TECHNOVA vous accompagne partout."
                    : "Access all our applications and websites. Whether you're on Android, iOS, or any connected device, TECHNOVA supports you wherever you go."}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href="/apps" className="btn-app btn-app-light">
                    <svg className="h-4 w-4 mr-1 fill-current" viewBox="0 0 24 24">
                      <path d="M5 3.23v17.54c0 .54.45.98.99.98.17 0 .34-.05.5-.14L20.25 13.7c.47-.27.75-.76.75-1.3s-.28-1.03-.75-1.3L6.49 3.28C6 3 5.48 3.1 5.12 3.48c-.08.09-.12.2-.12.31z" />
                    </svg>
                    Nos applications
                  </a>
                  <a href="/e-services" className="btn-app btn-app-outline">
                    {/* <svg className="h-4 w-4 mr-1 fill-current" viewBox="0 0 24 24">
                      <path d="M16 2H8C6.9 2 6 2.9 6 4V6H2C1.45 6 1 6.45 1 7V17C1 17.55 1.45 18 2 18H6V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V18H22C22.55 18 23 17.55 23 17V7C23 6.45 22.55 6 22 6H18V4C18 2.9 17.1 2 16 2ZM16 20H8V18H16V20ZM22 17H18V7H22V17ZM16 4H8V2H16V4ZM8 14C8 14.55 7.55 15 7 15H5C4.45 15 4 14.55 4 14V10C4 9.45 4.45 9 5 9H7C7.55 9 8 9.45 8 10V14ZM8 10V14H5V10H8ZM10 14H12V10H10V14ZM12 14H14V10H12V14ZM14 14H16V10H14V14ZM16 14H18V10H16V14ZM16 4H18V2H16V4ZM18 7H22V4H18V7ZM14 4H16V2H14V4ZM10 4H12V2H10V4ZM8 4H10V2H8V4Z" />
                    </svg> */}
                    Nos services
                  </a>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <img
                  src={appMockupGif}
                  alt="Mobile App"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 460,
                    borderRadius: 16,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section
        id="about"
        className="section-pad-100"
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--section-alt)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr",
              gap: 48,
              alignItems: "center",
            }}
            className="max-lg:!grid-cols-1"
          >
            <img
              src="https://i.pinimg.com/1200x/8a/2b/51/8a2b51d771dcd3e25c709d02c3ef1e98.jpg"
              alt="Team"
              style={{ borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%" }}
            />
            <div>
              <span className="tn-eyebrow">{lang === "fr" ? "À propos" : "About"}</span>
              <h2 className="tn-section-title" style={{ color: "var(--text)", marginBottom: 16 }}>
                {lang === "fr" ? "Qui Sommes-Nous ?" : "About Us"}
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-secondary)",
                  marginBottom: 32,
                  lineHeight: 1.6,
                }}
              >
                {lang === "fr"
                  ? "TECHNOVA est née d'une vision simple : rendre l'éducation et l'information technologique accessible à tous dans le monde. Nous croyons que chacun mérite d'avoir accès aux compétences du futur."
                  : "TECHNOVA was born from a simple vision: to make technological education and information accessible to everyone worldwide. We believe everyone deserves access to the skills of the future."}
              </p>
              {[
                {
                  icon: "fas fa-bullseye",
                  title: lang === "fr" ? "Notre Vision" : "Our Vision",
                  desc:
                    lang === "fr"
                      ? "Devenir la plateforme de référence pour l'apprentissage tech d'ici 2030."
                      : "Become the reference platform for tech learning by 2030.",
                },
                {
                  icon: "fas fa-heart",
                  title: lang === "fr" ? "Nos Valeurs" : "Our Values",
                  desc:
                    lang === "fr"
                      ? "Excellence, accessibilité, innovation et accompagnement personnalisé."
                      : "Excellence, accessibility, innovation, and personalized support.",
                },
                {
                  icon: "fas fa-award",
                  title: lang === "fr" ? "Nos Résultats" : "Our Results",
                  desc:
                    lang === "fr"
                      ? "Plusieurs étudiants déjà formés, 95% de taux de satisfaction, 500+ entreprises partenaires."
                      : "Several students already trained, 95% satisfaction rate, 500+ partner companies.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}
                >
                  <div className="tn-about-ico">
                    <i className={item.icon} />
                  </div>
                  <div>
                    <h5
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        marginBottom: 4,
                        color: "var(--text)",
                      }}
                    >
                      {item.title}
                    </h5>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="avis" className="section-pad-100" style={{ position: "relative", zIndex: 1 }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="tn-eyebrow">{lang === "fr" ? "Ce que les utilisateurs réalisent grâce à l’apprentissage" : "What users achieve through learning"}</span>
            <h2 className="section-title">
              <span className="title-motion-wrap">
                <span className="title-motion">
                  {lang === "fr" ? "Témoignages" : "Testimonials"}
                </span>
                <i className="fas fa-sparkles motion-spark"></i>
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="tn-testi-card"
              >
                <div
                  style={{
                    color: "#f5a623",
                    fontSize: "0.8rem",
                    marginBottom: 16,
                    letterSpacing: 2,
                  }}
                >
                  {"★".repeat(t.stars)}
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    lineHeight: 1.7,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  {t.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--blue-soft)",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {t.loc}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PAYMENT ============ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "60px 0",
          background: "var(--section-alt)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px", textAlign: "center" }}>
          <span className="tn-eyebrow">
            {lang === "fr" ? "Moyens de paiement" : "Payment Methods"}
          </span>
          <h2 className="tn-section-title" style={{ color: "var(--text)", marginBottom: 24 }}>
            {lang === "fr" ? "Payez facilement" : "Pay easily"}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            <span className="pay-badge pay-mtn">MTN MoMo</span>
            <span className="pay-badge pay-moov">Moov Money</span>
            <span className="pay-badge pay-orange">Orange Money</span>
            <span className="pay-badge pay-wave">Wave</span>
            <span className="pay-badge pay-visa">
              <i className="fab fa-cc-visa" style={{ marginRight: 4 }} />
              VISA
            </span>
            <span className="pay-badge pay-mastercard">
              <i className="fab fa-cc-mastercard" style={{ marginRight: 4 }} />
              Mastercard
            </span>
            <span className="pay-badge pay-apple">
              <i className="fab fa-apple" style={{ marginRight: 4 }} />
              Apple Pay
            </span>
            <span className="pay-badge pay-google">
              <i className="fab fa-google" style={{ marginRight: 4 }} />
              Google Pay
            </span>
            <span className="pay-badge pay-dolapay">
              <i className="fab fa-dolapay" style={{ marginRight: 4 }} />
              Dolapay
            </span>
          </div>
        </div>
      </section>

      {/* ============ DIGITAL TOOLS PREVIEW ============ */}
      <section
        id="tools"
        className="section-pad-80"
        style={{ position: "relative", zIndex: 1, background: "var(--bg)" }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <span className="tn-eyebrow">
                {lang === "fr" ? "Fonctionne avec TECHNOVA" : "Works with TECHNOVA"}
              </span>
              <h2 className="section-title">
                <span className="title-motion-wrap">
                  <span className="title-motion">
                    {lang === "fr" ? "L'Annuaire des Outils Digitaux" : "Top Digital Tools"}
                  </span>
                  <i className="fas fa-sparkles motion-spark"></i>
                </span>
              </h2>
            </div>
            <Link
              to="/outils-digitaux"
              style={{
                fontWeight: 600,
                color: "var(--blue)",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {lang === "fr" ? "Explorer l'annuaire" : "Explore directory"}{" "}
              <i className="fas fa-chevron-right" style={{ fontSize: "0.8em" }} />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                id: "shopify",
                name: "Shopify",
                desc: "La plateforme e-commerce leader pour créer votre boutique.",
                logo: "https://www.google.com/s2/favicons?sz=256&domain_url=shopify.com",
                url: "https://shopify.com",
              },
              {
                id: "canva",
                name: "Canva",
                desc: "Outil de création graphique intuitif pour vos visuels.",
                logo: "https://www.google.com/s2/favicons?sz=256&domain_url=canva.com",
                url: "https://canva.com",
              },
              {
                id: "chatgpt",
                name: "ChatGPT",
                desc: "L'assistant IA de référence pour rédiger et coder.",
                logo: "https://www.google.com/s2/favicons?sz=256&domain_url=chatgpt.com",
                url: "https://chatgpt.com",
              },
            ].map((t) => (
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                key={t.id}
                style={{ textDecoration: "none" }}
                className="tn-feature-card"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "white",
                      borderRadius: 12,
                      padding: 8,
                      border: "1px solid var(--divider)",
                    }}
                  >
                    <img
                      src={t.logo}
                      alt={t.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <h4
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {t.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section-pad-80" style={{ position: "relative", zIndex: 1 }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div className="tn-cta-wrap">
            <h2
              style={{
                fontSize: "clamp(1.8rem,3vw,2.5rem)",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              {lang === "fr" ? "Prêt à changer de vie ?" : "Ready to change your life?"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", marginBottom: 36 }}>
              {lang === "fr"
                ? "Rejoignez la communauté TECHNOVA aujourd'hui."
                : "Join the TECHNOVA community today."}
            </p>
            <Link
              to="/premium"
              style={{
                background: "white",
                color: "var(--blue)",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "14px 32px",
                borderRadius: 50,
                textDecoration: "none",
                display: "inline-block",
                transition: "all 0.25s",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {lang === "fr" ? "Espace Premium" : "Premium Space"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
