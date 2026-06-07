import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { Header, Footer, CourseCard, Course } from "@/components/site/shared";
import { supabase } from "@/lib/supabase";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/")(({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "TECHNOVA — Formations Professionnelles" },
      { name: "description", content: "Cybersécurité, IA, marketing, entrepreneuriat. Formations & ebooks pratiques, payez en Mobile Money. 2000+ apprenants nous font confiance." },
      { property: "og:title", content: "TECHNOVA Learning — Apprenez la tech à petit prix" },
      { property: "og:description", content: "Formations 100% pratiques, paiement Mobile Money, support 7j/7." },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
}) as any);

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
  { stars: 5, text: "\"La formation Cybersécurité m'a permis de décrocher un poste de consultant. Le paiement par Mobile Money est très pratique.\"", name: "Koffi Jean-Marc", loc: "Abidjan, Côte d'Ivoire", img: "https://i.pinimg.com/1200x/a2/09/d6/a209d6e66859493e14c59bc92e5b2e02.jpg" },
  { stars: 5, text: "\"J'adore le pack Design Graphique. Les vidéos sont claires et le certificat Technova a boosté mon profil LinkedIn.\"", name: "Aminata Diallo", loc: "Cotonou, Bénin", img: "https://i.pinimg.com/736x/7d/e4/c4/7de4c4c91b6a68c6f4f59065e3efc700.jpg" },
  { stars: 5, text: "\"Le cours sur l'IA Premium est une mine d'or. Je recommande vivement Technova pour la qualité du contenu.\"", name: "Patrick Nguema", loc: "Libreville, Gabon", img: "https://i.pinimg.com/1200x/1f/c9/6e/1fc96e1619b913eade6eb6533f72cf83.jpg" },
  { stars: 5, text: "\"En 3 semaines j'ai appris Excel de A à Z grâce à Technova. Mon employeur a immédiatement remarqué la différence.\"", name: "Fatou Coulibaly", loc: "Bamako, Mali", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { stars: 5, text: "\"Le pack 200 formations est incroyable rapport qualité-prix. J'ai lancé mon agence digitale 2 mois après ma formation.\"", name: "Moussa Traoré", loc: "Ouagadougou, Burkina Faso", img: "https://randomuser.me/api/portraits/men/41.jpg" },
  { stars: 5, text: "\"Formation Data Science très complète. Le support WhatsApp répond en moins de 2h. Vraiment professionnel.\"", name: "Adaeze Okonkwo", loc: "Lagos, Nigeria", img: "https://randomuser.me/api/portraits/women/29.jpg" },
];

function HomePage() {
  const { data: dbProducts = [] } = useQuery({
    queryKey: ["public_products_home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      const active = (data || []).filter((p: any) => {
        try { const f = typeof p.features === "string" ? JSON.parse(p.features) : (p.features || {}); return f.status !== "draft"; } catch { return true; }
      });
      return active.map((p: any) => ({
        slug: p.id, title: p.title,
        cover: p.image_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
        category: p.category, level: "Tous niveaux",
        price: `${p.price} FCFA`,
        oldPrice: p.crossed_price ? `${p.crossed_price} FCFA` : undefined,
        duration: "Accès à vie",
      })) as Course[];
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      {/* Font import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        :root {
          --blue: #0071e3; --blue-light: #409cff; --blue-soft: rgba(0,113,227,0.08);
          --accent: #f5a623; --bg: #f2f2f7; --surface: rgba(255,255,255,0.75);
          --surface-strong: rgba(255,255,255,0.92); --card: rgba(255,255,255,0.68);
          --card-border: rgba(255,255,255,0.55); --text: #1d1d1f; --text-secondary: #6e6e73;
          --divider: rgba(0,0,0,0.08); --glass-blur: blur(24px) saturate(180%);
          --shadow-sm: 0 2px 16px rgba(0,0,0,0.06); --shadow-md: 0 8px 40px rgba(0,0,0,0.09);
          --shadow-lg: 0 20px 60px rgba(0,0,0,0.12); --radius: 20px; --radius-sm: 12px; --radius-lg: 28px;
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
        .partners-track { display:flex; gap:48px; align-items:center; animation:scrollPartners 30s linear infinite; width:max-content; }
        .partners-track:hover { animation-play-state:paused; }
        @keyframes scrollPartners { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .partner-item { display:flex; align-items:center; gap:10px; opacity:0.38; transition:opacity 0.3s; white-space:nowrap; cursor:default; }
        .partner-item:hover { opacity:0.8; }
        .tn-testi-card { background:var(--card); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur); border:1px solid var(--card-border); border-radius:var(--radius); padding:32px 28px; height:100%; box-shadow:var(--shadow-sm); transition:all 0.3s; }
        .tn-testi-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-md); }
        .tn-cta-wrap { background:linear-gradient(135deg,#0071e3,#409cff); border-radius:var(--radius-lg); padding:72px 48px; text-align:center; position:relative; overflow:hidden; }
        .tn-blog-card { background:var(--card); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur); border:1px solid var(--card-border); border-radius:var(--radius); overflow:hidden; height:100%; transition:all 0.3s; box-shadow:var(--shadow-sm); }
        .tn-blog-card:hover { transform:translateY(-6px); box-shadow:var(--shadow-md); }
        .tn-about-ico { width:46px; height:46px; min-width:46px; background:var(--blue); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; color:white; }
        @keyframes orbFloat { 0%,100% { transform:translateY(0) scale(1); } 33% { transform:translateY(-30px) scale(1.04); } 66% { transform:translateY(20px) scale(0.97); } }
        .bg-orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; opacity:0.35; transition:opacity 0.5s; animation:orbFloat 12s ease-in-out infinite; }
        .orb-1 { width:600px; height:600px; background:radial-gradient(circle,#0071e3,transparent); top:-200px; left:-200px; }
        .orb-2 { width:500px; height:500px; background:radial-gradient(circle,#409cff,transparent); bottom:20%; right:-150px; animation-delay:-4s; }
        .orb-3 { width:400px; height:400px; background:radial-gradient(circle,#f5a623,transparent); top:50%; left:40%; animation-delay:-8s; }
        @keyframes heroImageFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes heroCardFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .pay-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; font-weight:800; font-size:0.82rem; margin:4px; }
        .pay-mtn { background:#ffcc00; color:#000; }
        .pay-moov { background:#0066cc; color:#fff; }
        .pay-orange { background:#FF6B00; color:white; }
        .pay-wave { background:#1A73E8; color:white; }
        .pay-visa { background:white; border:1px solid rgba(0,0,0,0.12); color:#1a1f71; font-style:italic; }
      `}</style>

      {/* BG Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <Header />

      {/* ============ HERO ============ */}
      <section id="home" style={{ position: "relative", zIndex: 1, padding: "140px 0 100px", overflow: "hidden" }}>
        {/* Shapes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[
            { cls: "500px", bg: "var(--blue)", top: "-100px", right: "0" },
            { cls: "300px", bg: "var(--accent)", bottom: "0", left: "10%" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: s.cls, height: s.cls, background: s.bg, borderRadius: "50%", opacity: 0.06, animation: "heroImageFloat 8s ease-in-out infinite", ...(s.top ? { top: s.top } : { bottom: s.bottom }), ...(s.right ? { right: s.right } : { left: s.left }) }} />
          ))}
        </div>

        <div className="container mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }} className="max-lg:!grid-cols-1">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,113,227,0.15)", padding: "6px 14px", borderRadius: 20, marginBottom: 28 }}>
                <i className="fas fa-rocket" /> <span>Plateforme #1 en Afrique</span>
              </div>
              <h1 className="tn-hero-title" style={{ marginBottom: 24, color: "var(--text)" }}>
                Maîtrisez la Tech de <span className="tn-hero-span">Demain</span>.
              </h1>
              <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
                TECHNOVA Courses est la plateforme ultime pour apprendre le développement, la data science et le design. Formez-vous aux compétences recherchées par les recruteurs.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
                <Link to="/formations" className="tn-btn-primary">
                  Explorer les cours <i className="fas fa-arrow-right" />
                </Link>
                <Link to="/formations" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 50, border: "1.5px solid var(--blue)", color: "var(--blue)", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", transition: "all 0.25s" }}>
                  Voir les formations
                </Link>
              </div>
              {/* Social proof */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex" }}>
                  {["https://randomuser.me/api/portraits/men/32.jpg", "https://randomuser.me/api/portraits/women/44.jpg", "https://randomuser.me/api/portraits/men/85.jpg"].map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--bg)", objectFit: "cover", marginLeft: i === 0 ? 0 : -10 }} />
                  ))}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  <strong style={{ color: "var(--text)" }}>+10k</strong> étudiants nous font confiance
                </p>
              </div>
            </motion.div>

            {/* Right */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning"
                style={{ width: "100%", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", animation: "heroImageFloat 6s ease-in-out infinite" }}
              />
              {/* Stat card */}
              <div style={{ position: "absolute", bottom: 28, left: -24, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: "var(--radius)", padding: "16px 22px", boxShadow: "var(--shadow-md)", minWidth: 180, animation: "heroCardFloat 7s ease-in-out infinite", animationDelay: "-2s" }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--blue)", letterSpacing: "-0.03em" }}>95%</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>Taux de satisfaction</div>
              </div>
              {/* Badge */}
              <div style={{ position: "absolute", top: 24, right: -16, background: "linear-gradient(135deg,#0071e3,#409cff)", borderRadius: "var(--radius)", padding: "14px 18px", textAlign: "center", color: "white", boxShadow: "var(--shadow-md)", minWidth: 110, animation: "heroCardFloat 9s ease-in-out infinite", animationDelay: "-4s" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>500+</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.85 }}>Entreprises</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ PARTNERS MARQUEE ============ */}
      <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px) saturate(180%)", borderTop: "1px solid var(--divider)", borderBottom: "1px solid var(--divider)", padding: "28px 0", overflow: "hidden" }}>
        <p style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 16 }}>NOS PARTENAIRES TECHNOLOGIQUES</p>
        <div className="partners-track">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div key={i} className="partner-item">
              <i className={p.icon} style={{ fontSize: "1.5rem", color: "var(--text)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", fontFamily: "'Outfit',sans-serif" }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "100px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="tn-eyebrow">Pourquoi TECHNOVA</span>
            <h2 className="tn-section-title" style={{ color: "var(--text)" }}>Pourquoi choisir TECHNOVA ?</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>Une pédagogie adaptée au marché de l'emploi local et international.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: "fas fa-laptop-code", title: "100% Pratique", desc: "Des projets concrets pour construire votre portfolio professionnel dès la première semaine." },
              { icon: "fas fa-headset", title: "Support Dédié", desc: "Un accompagnement personnalisé via WhatsApp pour répondre à toutes vos questions." },
              { icon: "fas fa-mobile-alt", title: "Paiement Local", desc: "Payez facilement via MTN MoMo, Moov Money, Orange Money, Wave ou Carte Visa." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="tn-feature-card">
                <div className="tn-feature-icon"><i className={f.icon} /></div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{f.title}</h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      <section id="courses" style={{ position: "relative", zIndex: 1, padding: "100px 0", background: "rgba(0,0,0,0.018)" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="tn-eyebrow">Formations</span>
            <h2 className="tn-section-title" style={{ color: "var(--text)" }}>Nos Formations Phares</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>Investissez dans votre avenir à petit prix.</p>
          </div>
          {dbProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {dbProducts.map((c, i) => <CourseCard key={c.slug} c={c} i={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
              <i className="fas fa-graduation-cap" style={{ fontSize: "3rem", marginBottom: 16, display: "block", color: "var(--blue)" }} />
              <p>Les formations sont en cours de chargement...</p>
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/formations" className="tn-btn-primary">
              Voir toutes les formations <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ APPS ============ */}
      <section id="apps" style={{ position: "relative", zIndex: 1, padding: "100px 0", background: "rgba(0,0,0,0.018)" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ background: "linear-gradient(135deg,rgba(0,113,227,0.12),rgba(64,156,255,0.08))", backdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(0,113,227,0.2)", borderRadius: "var(--radius-lg)", padding: "56px 48px", overflow: "hidden", position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="max-lg:!grid-cols-1">
              <div>
                <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#0071e3,#409cff)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white", marginBottom: 28, boxShadow: "0 10px 30px rgba(0,113,227,0.4)" }}>
                  <i className="fas fa-graduation-cap" />
                </div>
                <span className="tn-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>Nos Applications</span>
                <h2 className="tn-section-title" style={{ color: "white" }}>TECHNOVA Mobile</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", marginBottom: 32 }}>Accédez à tous vos cours depuis votre smartphone. Téléchargez vos leçons et apprenez hors ligne.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 14, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", background: "white", color: "#1d1d1f", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", transition: "all 0.25s" }}>
                    <i className="fab fa-google-play" /> Google Play
                  </a>
                  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 14, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.5)", transition: "all 0.25s" }}>
                    <i className="fab fa-apple" /> App Store
                  </a>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=600&fit=crop" alt="Mobile App" style={{ maxHeight: 460, borderRadius: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", maxWidth: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOG ============ */}
      <section id="blog" style={{ position: "relative", zIndex: 1, padding: "100px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="tn-eyebrow">Blog & Actualités</span>
            <h2 className="tn-section-title" style={{ color: "var(--text)" }}>Informez-vous</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 480 }}>Actualités et conseils tech</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=350&fit=crop", date: "15 Jan 2026", title: "L'IA générative en 2026", desc: "Découvrez les dernières avancées en intelligence artificielle et leur impact sur le marché du travail." },
              { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&fit=crop", date: "12 Jan 2026", title: "Cybersécurité : Les tendances", desc: "Protégez vos données avec les meilleures pratiques de sécurité en 2026." },
              { img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=350&fit=crop", date: "08 Jan 2026", title: "Devenir développeur Full Stack", desc: "Le guide complet pour maîtriser le développement web moderne." },
            ].map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="tn-blog-card">
                <div style={{ height: 200, overflow: "hidden" }}>
                  <img src={b.img} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} />
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--blue)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="far fa-calendar" /> {b.date}
                  </div>
                  <h5 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{b.title}</h5>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>{b.desc}</p>
                  <a href="#" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--blue)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Lire plus <i className="fas fa-arrow-right fa-xs" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" style={{ position: "relative", zIndex: 1, padding: "100px 0", background: "rgba(0,0,0,0.018)" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "center" }} className="max-lg:!grid-cols-1">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" alt="Team" style={{ borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%" }} />
            <div>
              <span className="tn-eyebrow">À propos</span>
              <h2 className="tn-section-title" style={{ color: "var(--text)", marginBottom: 16 }}>Qui Sommes-Nous ?</h2>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>TECHNOVA est née d'une vision simple : rendre l'éducation technologique accessible à tous en Afrique et au-delà. Nous croyons que chacun mérite d'avoir accès aux compétences du futur.</p>
              {[
                { icon: "fas fa-bullseye", title: "Notre Vision", desc: "Devenir la plateforme de référence pour l'apprentissage tech en Afrique d'ici 2030." },
                { icon: "fas fa-heart", title: "Nos Valeurs", desc: "Excellence, accessibilité, innovation et accompagnement personnalisé." },
                { icon: "fas fa-award", title: "Nos Résultats", desc: "+10,000 étudiants formés, 95% de taux de satisfaction, 500+ entreprises partenaires." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
                  <div className="tn-about-ico"><i className={item.icon} /></div>
                  <div>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4, color: "var(--text)" }}>{item.title}</h5>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="avis" style={{ position: "relative", zIndex: 1, padding: "100px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="tn-eyebrow">Témoignages</span>
            <h2 className="tn-section-title" style={{ color: "var(--text)" }}>Ils ont réussi avec nous</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="tn-testi-card">
                <div style={{ color: "#f5a623", fontSize: "0.8rem", marginBottom: 16, letterSpacing: 2 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={t.img} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--blue-soft)" }} />
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t.loc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PAYMENT ============ */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 0", background: "rgba(0,0,0,0.018)" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px", textAlign: "center" }}>
          <span className="tn-eyebrow">Moyens de paiement</span>
          <h2 className="tn-section-title" style={{ color: "var(--text)", marginBottom: 24 }}>Payez facilement</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            <span className="pay-badge pay-mtn">MTN MoMo</span>
            <span className="pay-badge pay-moov">Moov Money</span>
            <span className="pay-badge pay-orange">Orange Money</span>
            <span className="pay-badge pay-wave">Wave</span>
            <span className="pay-badge pay-visa"><i className="fab fa-cc-visa" style={{ marginRight: 4 }} />VISA</span>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 0" }}>
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
          <div className="tn-cta-wrap">
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 16 }}>Prêt à changer de vie ?</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", marginBottom: 36 }}>Rejoignez la communauté TECHNOVA aujourd'hui.</p>
            <Link to="/formations" style={{ background: "white", color: "var(--blue)", fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px", borderRadius: 50, textDecoration: "none", display: "inline-block", transition: "all 0.25s", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              Choisir ma formation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
