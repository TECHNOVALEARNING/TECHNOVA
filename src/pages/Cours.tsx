import { Header, Footer, CourseCard, type Course } from "@/components/site/shared";
import { motion } from "framer-motion";
import { GraduationCap, Video, Award, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: GraduationCap, title: "Modules structurés", desc: "Créez des formations avec chapitres, leçons et progression des élèves." },
  { icon: Video, title: "Vidéo HD", desc: "Hébergez vos vidéos directement sur la plateforme avec streaming adaptatif." },
  { icon: Award, title: "Certificats", desc: "Générez automatiquement des certificats de complétion pour vos étudiants." },
  { icon: Users, title: "Communauté", desc: "Espace de discussion intégré pour vos élèves et forums de support." },
];

const Cours = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin_courses"],
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
        .eq("type", "course")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
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

  const seoTitle = lang === "en" 
    ? "Tech Products & Course Catalog — TECHNOVA" 
    : "Catalogue de Produits & Formations Tech — TECHNOVA";
  const seoDesc = lang === "en" 
    ? "Discover our tech courses and digital products in AI, Data, Cybersecurity, and Design. Accessible from Europe, the USA, and worldwide."
    : "Découvrez nos formations et produits digitaux en IA, Data, Cybersécurité et Design. Accessibles depuis l'Europe, les USA et le monde.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoTitle} description={seoDesc} canonicalPath="/formations" />
      <Header />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Suivez vos <span className="text-gradient">cours en ligne</span> <br />
              <span className="text-md text-muted-foreground">Bientôt disponible</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Formations complètes avec vidéos, quiz, certificats et suivi de progression — tout en un seul endroit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Liste des formations */}
      <section className="py-16 bg-[color:var(--bg,#f2f2f7)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              {lang === "fr" ? "Nos formations disponibles" : "Our Available Courses"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "fr" ? "Explorez nos programmes intensifs officiels pour acquérir les compétences les plus recherchées du marché." : "Explore our official intensive programs to gain the most sought-after skills on the market."}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-4 h-[380px] animate-pulse flex flex-col justify-between">
                  <div className="w-full h-44 rounded-2xl bg-muted" />
                  <div className="h-6 w-3/4 rounded bg-muted mt-4" />
                  <div className="h-4 w-1/2 rounded bg-muted mt-2" />
                  <div className="h-10 w-full rounded-full bg-muted mt-6" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.map((c, i) => (
                <CourseCard key={c.slug} c={c} i={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-card max-w-md mx-auto">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                {lang === "fr" ? "Aucune formation disponible" : "No courses available"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "fr" ? "Revenez plus tard pour découvrir nos prochains cours officiels." : "Check back later to explore our upcoming official courses."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Cours;
