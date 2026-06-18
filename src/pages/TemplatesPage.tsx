import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, SlidersHorizontal, PackageOpen, LayoutGrid } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface TemplateProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  category: string;
  rating?: number;
  students?: number;
  badge?: string;
}

const TEMPLATE_CATEGORIES = [
  { key: "all", label: "Tout", icon: "✨" },
  { key: "notion", label: "Notion", icon: "📋" },
  { key: "canva", label: "Canva & Design", icon: "🎨" },
  { key: "excel", label: "Excel & Finance", icon: "📊" },
  { key: "dev", label: "Dev & Web", icon: "💻" },
  { key: "marketing", label: "Marketing & Social", icon: "📈" },
  { key: "other", label: "Autres", icon: "📁" }
];

const SUBCAT_LABELS: Record<string, string> = {
  notion: "Notion",
  canva: "Canva & Design",
  excel: "Excel & Finance",
  dev: "Dev & Web",
  marketing: "Marketing & Social",
  other: "Autre"
};

const getDisplayCategory = (cat: string) => {
  if (cat && cat.startsWith("template:")) {
    const sub = cat.split(":")[1];
    return `Template ${SUBCAT_LABELS[sub] || sub}`;
  }
  return "Template";
};

const getTemplateSubcat = (cat: string) => {
  if (cat && cat.startsWith("template:")) {
    return cat.split(":")[1] || "other";
  }
  return "other";
};

const getBadgeClass = (b: string) => {
  const badge = b.toLowerCase();
  if (badge.includes("best") || badge.includes("vente")) return "label-bestseller";
  if (badge.includes("nouveau") || badge.includes("new")) return "label-nouveau";
  if (badge.includes("populaire") || badge.includes("top")) return "label-populaire";
  if (badge.includes("promo") || badge.includes("off")) return "label-promo";
  return "label-tendance";
};

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = "";
  for (let i = 0; i < full; i++) s += "★";
  if (half) s += "½";
  return <span className="stars-sm">{s}</span>;
};

const TemplatesPage = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcat, setSelectedSubcat] = useState("all");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin_templates_list"],
    queryFn: async () => {
      // Find the administrator's profile id from their store
      const { data: storeData } = await supabase
        .from("stores")
        .select("owner_id")
        .eq("slug", "easy-tech")
        .maybeSingle();

      const adminId = storeData?.owner_id || "9a7bc1fd-3c21-4a8c-b7a3-c60ff2fcf902";

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", adminId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter products that are templates
      const rawTemplates = (data || []).filter((p: any) => {
        const cat = p.category || "";
        return cat === "template" || cat.startsWith("template:");
      });

      return rawTemplates.map((p: any) => {
        const hash = p.title.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const ratings = [4.5, 4.8, 5.0, 4.6, 4.7];
        const studentsList = [240, 120, 310, 180, 210];
        
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          original_price: p.original_price,
          thumbnail_url: p.thumbnail_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
          category: p.category || "template",
          rating: ratings[hash % ratings.length],
          students: studentsList[hash % studentsList.length],
          badge: p.original_price && p.original_price > p.price ? "Promo" : undefined,
        };
      }) as TemplateProduct[];
    },
  });

  const filteredTemplates = templates.filter((t) => {
    const subcat = getTemplateSubcat(t.category);
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedSubcat === "all" || subcat === selectedSubcat;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        canonicalPath="/templates"
        title={lang === "fr" ? "Templates Digitaux Professionnels - TECHNOVA" : "Professional Digital Templates - TECHNOVA"}
        description={lang === "fr" ? "Téléchargez nos templates prêts à l'emploi pour Notion, Canva, Excel, et le développement. Optimisez votre productivité instantanément." : "Download our ready-to-use templates for Notion, Canva, Excel, and development. Instantly boost your productivity."}
      />
      <Header />

      {/* Hero Header Banner */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-[color:var(--blue-soft)] px-3.5 py-1 text-xs font-semibold text-[color:var(--blue)] backdrop-blur mb-6 animate-pulse">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} /> {lang === "fr" ? "Ressources & Templates Premium" : "Premium Resources & Templates"}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text)] font-display leading-[1.15] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {lang === "fr" ? <>Optimisez votre <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Productivité</span></> : <>Optimize Your <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Productivity</span></>}
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
              {lang === "fr" ? "Des structures prêtes à l'emploi créées par des professionnels pour propulser vos projets et votre business." : "Ready-to-use frameworks built by professionals to scale your projects and business."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Templates Content Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Search + Category Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 p-5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-secondary)]" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher un template..." : "Search template..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[color:var(--text)] font-medium"
              />
            </div>

            {/* Categories scroll wrapper */}
            <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar py-1">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedSubcat(cat.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200 flex items-center gap-1.5 ${
                    selectedSubcat === cat.key
                      ? "bg-[color:var(--blue-soft)] border-blue-500/30 text-[color:var(--blue)] shadow-sm"
                      : "bg-[color:var(--bg)] border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-strong)]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {lang === "fr" ? cat.label : (cat.key === "all" ? "All" : cat.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 h-[380px] animate-pulse flex flex-col justify-between">
                  <div className="w-full h-44 rounded-2xl bg-[color:var(--bg)]" />
                  <div className="h-6 w-3/4 rounded bg-[color:var(--bg)] mt-4" />
                  <div className="h-4 w-1/2 rounded bg-[color:var(--bg)] mt-2" />
                  <div className="h-10 w-full rounded-full bg-[color:var(--bg)] mt-6" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((t, idx) => {
                  const formattedPrice = new Intl.NumberFormat("fr-FR").format(t.price) + " F";
                  const priceUsd = (t.price / 563).toFixed(2) + " $";
                  
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="course-card"
                    >
                      <div className="course-img-wrap">
                        <img src={t.thumbnail_url || ""} alt={t.title} loading="lazy" />
                        <span className="course-badge">{getDisplayCategory(t.category)}</span>
                        {t.badge && (
                          <span className={`label-badge ${getBadgeClass(t.badge)}`}>{t.badge}</span>
                        )}
                      </div>
                      <div className="course-body">
                        <div className="course-title line-clamp-2">{t.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {t.description || "Pas de description fournie."}
                        </p>
                        <div className="course-meta">
                          <span className="students">
                            <i className="fas fa-users" style={{ fontSize: "0.65rem", marginRight: 4 }}></i>
                            {t.students}
                          </span>
                          {renderStars(t.rating || 5)}
                        </div>
                        <div className="price-row">
                          <div>
                            <div className="price-main">{formattedPrice}</div>
                            <div className="price-usd">{priceUsd}</div>
                          </div>
                        </div>
                        <Link className="btn-buy" to={`/checkout/${t.id}`}>
                          <i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>
                          {lang === "fr" ? "Acheter" : "Buy"}
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-3xl p-8 max-w-md mx-auto">
              <PackageOpen className="h-14 w-14 text-[color:var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">
                {lang === "fr" ? "Aucun template trouvé" : "No templates found"}
              </h3>
              <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed">
                {lang === "fr" ? "Nous n'avons aucun template dans cette catégorie pour le moment. Modifiez vos filtres pour voir d'autres templates." : "No templates match your query in this category yet. Change filters to see other templates."}
              </p>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TemplatesPage;
