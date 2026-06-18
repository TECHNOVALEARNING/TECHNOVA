import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Globe, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Discovery {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  download_url: string | null;
  created_at: string;
}

const Decouvertes = () => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("id, title, description, thumbnail_url, download_url, created_at")
          .eq("category", "discovery")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDiscoveries(data || []);
      } catch (err) {
        console.error("Error fetching discoveries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveries();
  }, []);

  const filtered = discoveries.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <Header />
      
      {/* Font imports and CSS variables */}
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
          --shadow-lg: 0 20px 60px rgba(0,0,0,0.5);
        }
      `}</style>

      <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mt-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--blue-soft)] text-[color:var(--blue)] text-xs font-mono uppercase tracking-wider mb-4 border border-[color:var(--blue-light)]/20"
          >
            <Sparkles className="h-3 w-3" />
            {lang === "fr" ? "Curations technologiques" : "Tech curation"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6 font-display"
          >
            {lang === "fr" ? "Découvertes Technologiques" : "Tech Discoveries"}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            {lang === "fr" 
              ? "Explorez une sélection de sites web, outils innovants et ressources incroyables ajoutés par notre administrateur pour booster votre productivité."
              : "Explore a curated selection of innovative websites, tools, and incredible resources recommended by our administrator to boost your productivity."}
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder={lang === "fr" ? "Rechercher une découverte..." : "Search discoveries..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 w-full rounded-2xl border-border/80 bg-background/50 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-[color:var(--blue)] transition-all shadow-sm"
          />
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--blue)]" />
            <p className="text-sm text-muted-foreground">{lang === "fr" ? "Chargement des découvertes..." : "Loading discoveries..."}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-background/30 rounded-3xl border border-dashed border-border max-w-lg mx-auto">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              {lang === "fr" ? "Aucune découverte trouvée" : "No discoveries found"}
            </h3>
            <p className="text-sm text-muted-foreground px-6">
              {lang === "fr" 
                ? "Revenez plus tard ou modifiez votre recherche pour explorer les sites ajoutés par l'administrateur."
                : "Check back later or adjust your search to explore the sites curated by the admin."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="course-card"
              >
                {/* Image Wrap */}
                <div className="course-img-wrap">
                  {d.thumbnail_url ? (
                    <img 
                      src={d.thumbnail_url} 
                      alt={d.title} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-primary/5 to-accent/10">
                      <Globe className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <span className="course-badge">
                    {lang === "fr" ? "Découverte" : "Discovery"}
                  </span>
                </div>

                {/* Card Content */}
                <div className="course-body flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="course-title line-clamp-2 hover:text-[color:var(--blue)] transition-colors mb-3">
                      {d.title}
                    </h3>
                    <div 
                      className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-4"
                      dangerouslySetInnerHTML={{ __html: d.description || "" }}
                    />
                  </div>

                  <a 
                    href={d.download_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-buy mt-auto py-2.5 text-center flex items-center justify-center"
                  >
                    <i className="fas fa-external-link-alt" style={{ marginRight: 8 }}></i>
                    {lang === "fr" ? "Visiter le site" : "Visit website"}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Decouvertes;
