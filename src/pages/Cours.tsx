import { Header, Footer, CourseCard, type Course } from "@/components/site/shared";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGeoPricing } from "@/contexts/GeoPricingContext";

const CATEGORIES = [
  { id: "all", labelFr: "Toutes les formations", labelEn: "All Courses", icon: "fa-solid fa-layer-group" },
  { id: "ia", labelFr: "IA & Data Science", labelEn: "AI & Data", icon: "fa-solid fa-robot" },
  { id: "design", labelFr: "Design & Vidéo", labelEn: "Design & Video", icon: "fa-solid fa-palette" },
  { id: "dev", labelFr: "Développement & Code", labelEn: "Web Development", icon: "fa-solid fa-code" },
  { id: "marketing", labelFr: "Marketing & Vente", labelEn: "Marketing & Sales", icon: "fa-solid fa-chart-line" },
  { id: "business", labelFr: "Business & Freelance", labelEn: "Business & Freelance", icon: "fa-solid fa-briefcase" },
  { id: "langues", labelFr: "Langues", labelEn: "Languages", icon: "fa-solid fa-language" },
];

const Cours = () => {
  const navigate = useNavigate();
  const { formatPrice } = useGeoPricing();
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc">("recent");

  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const { data: rawCourses = [], isLoading } = useQuery({
    queryKey: ["all_courses_catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", "course")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Helper to strip HTML tags for clean text preview
  const stripHtml = (htmlStr: string) => {
    if (!htmlStr) return "";
    return htmlStr.replace(/<[^>]*>?/gm, "").trim();
  };

  // Filter & Sort courses
  const filteredCourses = useMemo(() => {
    let result = [...rawCourses];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((c) => {
        const cat = (c.category || "").toLowerCase();
        if (selectedCategory === "ia") return cat.includes("ia") || cat.includes("intelligence") || cat.includes("data");
        if (selectedCategory === "design") return cat.includes("design") || cat.includes("vidéo") || cat.includes("graphisme");
        if (selectedCategory === "dev") return cat.includes("dev") || cat.includes("code") || cat.includes("web");
        if (selectedCategory === "marketing") return cat.includes("market") || cat.includes("vente") || cat.includes("pub");
        if (selectedCategory === "business") return cat.includes("business") || cat.includes("free") || cat.includes("e-com");
        if (selectedCategory === "langues") return cat.includes("langue") || cat.includes("anglais") || cat.includes("espagnol");
        return true;
      });
    }

    // Language filter
    if (selectedLanguage !== "all") {
      result = result.filter((c) => {
        const m = (c.marketing_sections as any) || {};
        const cLang = m.course_language || "fr";
        return cLang === selectedLanguage;
      });
    }

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [rawCourses, searchQuery, selectedCategory, selectedLanguage, sortBy]);

  // Format to Course interface used on Homepage CourseCard
  const formattedCourses: Course[] = useMemo(() => {
    return filteredCourses.map((p: any) => {
      const m = (p.marketing_sections as any) || {};
      return {
        slug: p.id,
        title: p.title,
        cover:
          p.thumbnail_url ||
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : lang === "fr" ? "Formation" : "Course",
        level: lang === "fr" ? "Tous niveaux" : "All levels",
        price: `${p.price || 0}`,
        oldPrice: p.original_price ? `${p.original_price}` : undefined,
        duration: lang === "fr" ? "Accès à vie" : "Lifetime access",
        description: stripHtml(p.description),
        courseLanguage: m.course_language || "fr",
        formatType: m.format_type || "vod",
        liveDate: m.live_date || undefined,
        meetUrl: m.meet_url || undefined,
      };
    });
  }, [filteredCourses, lang]);

  const seoTitle =
    lang === "en"
      ? "Certifying Courses Catalog — TECHNOVA"
      : "Catalogue des Formations Certifiantes — TECHNOVA";
  const seoDesc =
    lang === "en"
      ? "Discover all our certified courses in AI, Development, Design, Digital Marketing, and Business. Learn at your own pace."
      : "Découvrez toutes nos formations certifiantes en IA, Développement, Design, Marketing Digital et Business. Apprenez à votre rythme.";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <SEOHead title={seoTitle} description={seoDesc} canonicalPath="/formations" />
      <Header />

      {/* Hero Header Banner (Matching Homepage Hero Styling & Outfit Font) */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#0071e3]/10 via-background to-background border-b border-border/40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0071e3]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                color: "var(--text)",
                marginBottom: 24,
              }}
            >
              {lang === "fr" ? (
                <>
                  Propulsez votre carrière numérique avec nos{" "}
                  <span style={{ color: "#0071e3" }}>Formations Certifiantes</span>
                </>
              ) : (
                <>
                  Boost your digital career with our{" "}
                  <span style={{ color: "#0071e3" }}>Certified Courses</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "1.05rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth: 540,
                marginBottom: 36,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {lang === "fr"
                ? "Acquérez des compétences pratiques recherchées, réalisez des projets concrets et obtenez votre certification reconnue — le tout à votre propre rythme."
                : "Acquire in-demand practical skills, complete real projects, and earn recognized certificates — all at your own pace."}
            </motion.p>

            {/* Search Input Bar (Hero Search) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative flex items-center rounded-2xl bg-card border border-border/80 shadow-lg p-2 focus-within:border-[#0071e3]/50 transition-all">
                <i className="fa-solid fa-magnifying-glass text-muted-foreground ml-3 shrink-0 text-sm" />
                <Input
                  type="text"
                  placeholder={
                    lang === "fr"
                      ? "Rechercher une formation (ex: IA, Design, Marketing, Code)..."
                      : "Search a course (e.g. AI, Design, Marketing, Code)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground bg-transparent font-normal"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 font-normal"
                  >
                    Effacer
                  </button>
                )}
                <Button className="rounded-xl px-5 text-sm font-medium shrink-0 gap-2 bg-[#0071e3] hover:bg-[#0071e3]/90 text-white">
                  <span>{lang === "fr" ? "Rechercher" : "Search"}</span>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-border/60 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] shrink-0">
                <i className="fa-solid fa-user-graduate text-base" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm tracking-tight">15k+ Apprenants</div>
                <div className="text-xs text-muted-foreground font-normal">Communauté active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] shrink-0">
                <i className="fa-solid fa-circle-play text-base" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm tracking-tight">Accès à vie</div>
                <div className="text-xs text-muted-foreground font-normal">Vidéos & ressources</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] shrink-0">
                <i className="fa-solid fa-certificate text-base" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm tracking-tight">Certifications</div>
                <div className="text-xs text-muted-foreground font-normal">Validées TECHNOVA</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] shrink-0">
                <i className="fa-solid fa-globe text-base" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm tracking-tight">100% En Ligne</div>
                <div className="text-xs text-muted-foreground font-normal">Mobile Money & CB</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Content */}
      <section className="py-12 bg-card/30 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Category Tabs Scroll Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-[#0071e3] text-white shadow-md"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <i className={`${cat.icon} text-xs`} />
                  <span>{lang === "en" ? cat.labelEn : cat.labelFr}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Filter Header & Sorting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div>
              <h2 className="section-title">
                <span className="title-motion-wrap">
                  <span className="title-motion">
                    {lang === "fr" ? "Toutes les formations" : "All Courses"}
                  </span>
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Language filter */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
                <i className="fa-solid fa-language text-primary text-xs" />
                <span>Langue :</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-card border border-border text-xs rounded-xl px-3 py-2 text-foreground font-normal outline-none focus:border-[#0071e3] font-sans"
                >
                  <option value="all">🌐 Toutes les langues</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="pt">🇵🇹 Português</option>
                  <option value="fr_en">🌐 Bilingue</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
                <i className="fa-solid fa-sliders text-xs" />
                <span>Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-card border border-border text-xs rounded-xl px-3 py-2 text-foreground font-normal outline-none focus:border-[#0071e3] font-sans"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price_asc">Prix : Croissant</option>
                  <option value="price_desc">Prix : Décroissant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Grid (Exact Homepage CourseCard Component) */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-4 h-[380px] animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full h-44 rounded-xl bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted mt-4" />
                  <div className="h-4 w-1/2 rounded bg-muted mt-2" />
                  <div className="h-10 w-full rounded-full bg-muted mt-6" />
                </div>
              ))}
            </div>
          ) : formattedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {formattedCourses.map((c, i) => (
                <CourseCard key={c.slug} c={c} i={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card max-w-md mx-auto p-8">
              <i className="fa-solid fa-graduation-cap text-4xl text-muted-foreground/30 mb-4 block" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                {lang === "fr" ? "Aucune formation trouvée" : "No courses found"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 font-normal">
                {lang === "fr"
                  ? "Essayez de modifier votre recherche ou sélectionnez une autre catégorie."
                  : "Try modifying your search or selecting another category."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="rounded-xl font-normal"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 3-Step Success Guide Section (Homepage Style) */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl text-center">
          <h2 className="section-title mb-4">
            <span className="title-motion-wrap">
              <span className="title-motion">
                {lang === "fr" ? "Votre parcours en 3 étapes simples" : "Your Journey in 3 Simple Steps"}
              </span>
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-14 font-normal">
            {lang === "fr"
              ? "Tout est pensé pour vous offrir un apprentissage fluide, pragmatique et valorisant."
              : "Everything is designed to provide you with a smooth, practical, and rewarding learning experience."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] font-bold text-base flex items-center justify-center mb-6">
                <i className="fa-solid fa-magnifying-glass text-base" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 tracking-tight">
                {lang === "fr" ? "01. Choisissez votre formation" : "01. Choose Your Course"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Parcourez le catalogue et sélectionnez le programme certifiant qui correspond à vos objectifs professionnels.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] font-bold text-base flex items-center justify-center mb-6">
                <i className="fa-solid fa-laptop-code text-base" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 tracking-tight">
                {lang === "fr" ? "02. Apprenez à votre rythme" : "02. Learn at Your Own Pace"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Accédez immédiatement aux contenus vidéo de haute qualité, ressources pratiques et exercices interactifs.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] font-bold text-base flex items-center justify-center mb-6">
                <i className="fa-solid fa-award text-base" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 tracking-tight">
                {lang === "fr" ? "03. Obtenez votre certification" : "03. Earn Your Certificate"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                Validez vos leçons, complétez le parcours et téléchargez votre diplôme certifiant au format PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cours;
