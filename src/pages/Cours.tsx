import { Header, Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Video,
  Award,
  Users,
  ArrowRight,
  Search,
  Sparkles,
  Star,
  Clock,
  SlidersHorizontal,
  Globe
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGeoPricing } from "@/contexts/GeoPricingContext";

const CATEGORIES = [
  { id: "all", labelFr: "Toutes les formations", labelEn: "All Courses", icon: "🌐" },
  { id: "ia", labelFr: "IA & Data Science", labelEn: "AI & Data", icon: "🤖" },
  { id: "design", labelFr: "Design & Vidéo", labelEn: "Design & Video", icon: "🎨" },
  { id: "dev", labelFr: "Développement & Code", labelEn: "Web Development", icon: "💻" },
  { id: "marketing", labelFr: "Marketing & Vente", labelEn: "Marketing & Sales", icon: "📈" },
  { id: "business", labelFr: "Business & Freelance", labelEn: "Business & Freelance", icon: "💼" },
  { id: "langues", labelFr: "Langues", labelEn: "Languages", icon: "🗣️" },
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

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [rawCourses, searchQuery, selectedCategory, sortBy]);

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

      {/* Hero Header Banner (Learnixx Style) */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6"
            >
              {lang === "fr" ? (
                <>
                  Propulsez votre carrière numérique avec nos <span className="text-gradient">Formations Certifiantes</span>
                </>
              ) : (
                <>
                  Boost your digital career with our <span className="text-gradient">Certified Courses</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed"
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
              <div className="relative flex items-center rounded-2xl bg-card border border-border/80 shadow-lg p-2 focus-within:border-primary/50 transition-all">
                <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
                <Input
                  type="text"
                  placeholder={
                    lang === "fr"
                      ? "Rechercher une formation (ex: IA, Design, Marketing, Code)..."
                      : "Search a course (e.g. AI, Design, Marketing, Code)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    Effacer
                  </button>
                )}
                <Button className="rounded-xl px-5 text-sm font-semibold shrink-0">
                  {lang === "fr" ? "Rechercher" : "Search"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-border/60 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-foreground text-sm">15k+ Apprenants</div>
                <div className="text-xs text-muted-foreground">Communauté active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-foreground text-sm">Accès à vie</div>
                <div className="text-xs text-muted-foreground">Vidéos & ressources</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-foreground text-sm">Certifications</div>
                <div className="text-xs text-muted-foreground">Validées TECHNOVA</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-foreground text-sm">100% En Ligne</div>
                <div className="text-xs text-muted-foreground">Mobile Money & CB</div>
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === "en" ? cat.labelEn : cat.labelFr}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Filter Header & Sorting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span>{lang === "fr" ? "Toutes les formations" : "All Courses"}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {filteredCourses.length}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Trier par :</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card border border-border text-xs rounded-xl px-3 py-2 text-foreground font-medium outline-none focus:border-primary"
              >
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix : Croissant</option>
                <option value="price_desc">Prix : Décroissant</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
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
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((product, i) => {
                const priceFormatted =
                  product.price > 0 ? formatPrice(product.price) : lang === "fr" ? "Gratuit" : "Free";
                const oldPriceFormatted = product.original_price
                  ? formatPrice(product.original_price)
                  : null;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Course Thumbnail Wrapper */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={
                            product.thumbnail_url ||
                            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={product.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-[11px] font-semibold text-foreground shadow-sm">
                          {product.category || "Formation"}
                        </span>

                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Accès à vie
                        </span>
                      </div>

                      {/* Course Card Body */}
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-2">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                          <span className="text-muted-foreground font-normal">(1.2k élèves)</span>
                        </div>

                        <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                          {product.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-normal">
                          {stripHtml(product.description) ||
                            (lang === "fr"
                              ? "Formation complète certifiante avec exercices et ressources téléchargeables."
                              : "Complete certifying course with exercises and downloadable resources.")}
                        </p>
                      </div>
                    </div>

                    {/* Footer & Price Row */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Prix :</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold text-primary">
                              {priceFormatted}
                            </span>
                            {oldPriceFormatted && (
                              <span className="text-xs text-muted-foreground line-through">
                                {oldPriceFormatted}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link to={`/product/${product.id}`}>
                          <Button size="sm" className="rounded-xl px-3.5 gap-1 font-semibold text-xs">
                            <span>Explorer</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card max-w-md mx-auto">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                {lang === "fr" ? "Aucune formation trouvée" : "No courses found"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
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
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 3-Step Success Guide Section (Learnixx Style) */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
            {lang === "fr" ? "Votre parcours en 3 étapes simples" : "Your Journey in 3 Simple Steps"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-14">
            {lang === "fr"
              ? "Tout est pensé pour vous offrir un apprentissage fluide, pragmatique et valorisant."
              : "Everything is designed to provide you with a smooth, practical, and rewarding learning experience."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center mb-6">
                01
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {lang === "fr" ? "Choisissez votre formation" : "Choose Your Course"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Parcourez le catalogue et sélectionnez le programme certifiant qui correspond à vos objectifs professionnels.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center mb-6">
                02
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {lang === "fr" ? "Apprenez à votre rythme" : "Learn at Your Own Pace"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Accédez immédiatement aux contenus vidéo de haute qualité, ressources pratiques et exercices interactifs.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-card border border-border text-left hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center mb-6">
                03
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {lang === "fr" ? "Obtenez votre certification" : "Get Your Certificate"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Validez vos acquis, recevez votre certificat certifié TECHNOVA et valorisez-le sur votre profil et CV.
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
