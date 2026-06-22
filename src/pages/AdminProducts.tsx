import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, CourseCard, Course } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, SlidersHorizontal, PackageOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const AdminProducts = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      // Find the administrator's profile id from their store
      const { data: storeData } = await supabase
        .from("stores")
        .select("owner_id")
        .eq("slug", "easy-tech")
        .maybeSingle();

      const adminId = storeData?.owner_id || "9702b3c5-4acf-42e2-828c-8bf2d50dfff8";

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", adminId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const active = (data || []).filter((p: any) => {
        if (p.category === "discovery" || p.category === "template" || (p.category && p.category.startsWith("template:"))) {
          return false;
        }
        try {
          const f = typeof p.features === "string" ? JSON.parse(p.features) : (p.features || {});
          return f.status !== "draft";
        } catch {
          return true;
        }
      });

      return active.map((p: any) => ({
        slug: p.id,
        title: p.title,
        cover: p.thumbnail_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        category: p.category || "Formation",
        level: lang === "fr" ? "Tous niveaux" : "All levels",
        price: `${p.price} FCFA`,
        oldPrice: p.original_price ? `${p.original_price} FCFA` : undefined,
        duration: lang === "fr" ? "Accès à vie" : "Lifetime access",
      })) as Course[];
    },
  });

  // Extract unique categories dynamically from products
  const categories = ["all", ...new Set(dbProducts.map((p) => p.category).filter(Boolean))];

  const filteredProducts = dbProducts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: "var(--bg, #f2f2f7)", color: "var(--text, #1d1d1f)", fontFamily: "'Manrope', -apple-system, sans-serif" }}>
      <SEOHead
        canonicalPath="/admin-products"
        title={lang === "fr" ? "Produits Officiels TECHNOVA" : "Official TECHNOVA Products"}
        description={lang === "fr" ? "Retrouvez l'ensemble des formations, ebooks et ressources technologiques officiels édités directement par l'administration de TECHNOVA." : "Find all the official tech courses, ebooks, and resources published directly by the TECHNOVA admin."}
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-[color:var(--blue-soft)] px-3.5 py-1 text-xs font-semibold text-[color:var(--blue)] backdrop-blur mb-6">
              <Sparkles className="h-3.5 w-3.5" /> {lang === "fr" ? "Sélection Officielle TECHNOVA" : "Official TECHNOVA Selection"}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text)] font-display leading-[1.15] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {lang === "fr" ? <>Nos Produits <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Digitaux</span></> : <>Our Digital <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Products</span></>}
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
              {lang === "fr" ? "Ressources exclusives et formations certifiantes éditées et vérifiées par TECHNOVA." : "Exclusive resources and certified trainings created and verified by TECHNOVA."}
            </p>

            {/* Toggle tabs to switch pages */}
            <div className="inline-flex p-1.5 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm backdrop-blur mb-10">
              <Link
                to="/admin-products"
                className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-[color:var(--blue)] text-white shadow"
              >
                {lang === "fr" ? "Produits Officiels" : "Official Products"}
              </Link>
              <Link
                to="/all-products"
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 text-[color:var(--text-secondary)] hover:text-[color:var(--text)]"
              >
                {lang === "fr" ? "Tous les Vendeurs" : "All Sellers"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Content Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Search + Category Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 p-5 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-secondary)]" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher un ebook, formation..." : "Search course, ebook..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[color:var(--text)]"
              />
            </div>

            {/* Categories scroll wrapper */}
            <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-[color:var(--blue-soft)] border-blue-500/30 text-[color:var(--blue)]"
                      : "bg-[color:var(--bg)] border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-strong)]"
                  }`}
                >
                  {cat === "all" ? (lang === "fr" ? "Tout" : "All") : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 h-[380px] animate-pulse flex flex-col justify-between">
                  <div className="w-full h-44 rounded-2xl bg-[color:var(--bg)]" />
                  <div className="h-6 w-3/4 rounded bg-[color:var(--bg)] mt-4" />
                  <div className="h-4 w-1/2 rounded bg-[color:var(--bg)] mt-2" />
                  <div className="h-10 w-full rounded-full bg-[color:var(--bg)] mt-6" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, i) => (
                  <CourseCard key={p.slug} c={p} i={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-3xl p-8 max-w-md mx-auto">
              <PackageOpen className="h-14 w-14 text-[color:var(--text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">
                {lang === "fr" ? "Aucun produit trouvé" : "No products found"}
              </h3>
              <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed">
                {lang === "fr" ? "Modifiez votre recherche ou filtrez par une autre catégorie pour explorer nos ressources." : "Try changing your search query or choosing another category."}
              </p>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminProducts;
