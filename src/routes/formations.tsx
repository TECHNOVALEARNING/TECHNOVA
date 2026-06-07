import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Header, Footer, CourseCard, SectionHead, Benefits,
  PaymentSecurity, Reviews, FaqSection,
  Course
} from "@/components/site/shared";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/formations")({
  component: FormationsPage,
  head: () => ({
    meta: [
      { title: "Nos formations — TECHNOVA Learning" },
      { name: "description", content: "Catalogue complet des formations TECHNOVA : cybersécurité, IA, marketing, entrepreneuriat, data, web, design. Prix accessibles, certificats inclus." },
      { property: "og:title", content: "Toutes nos formations — TECHNOVA Learning" },
      { property: "og:description", content: "Catalogue complet de formations digitales à petit prix." },
      { property: "og:url", content: "/formations" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/formations" }],
  }),
});

const CATEGORIES = ["Toutes", "Sécurité", "Data", "Intelligence Artificielle", "Design", "Pack Bundle", "Bureautique", "E-commerce", "Développement", "Marketing", "Business & Entrepreneuriat"];

function FormationsPage() {
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");

  const { data: dbProducts = [] } = useQuery({
    queryKey: ["public_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const activeProducts = (data || []).filter((p: any) => {
        try {
          const feats = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || {});
          return feats.status !== 'draft';
        } catch(e) {
          return true;
        }
      });
      
      return activeProducts.map((p: any) => ({
        slug: p.id,
        title: p.title,
        cover: p.image_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
        category: p.category,
        level: "Tous niveaux",
        price: `${p.price} FCFA`,
        oldPrice: p.crossed_price ? `${p.crossed_price} FCFA` : undefined,
        duration: "Accès à vie"
      })) as Course[];
    }
  });

  const combinedCourses = [...dbProducts];

  const filtered = combinedCourses.filter((c) => {
    const matchCat = filter === "Toutes" || c.category === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* HERO */}
      <section className="relative bg-hero overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[color:var(--primary)]/10 animate-blob" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-soft text-[color:var(--primary)] text-xs font-mono-display uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" /> Catalogue complet
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Toutes nos <span className="text-gradient">formations</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Choisissez votre prochaine compétence. Apprenez à votre rythme, payez en Mobile Money, recevez votre certificat.
            </p>

            {/* search */}
            <div className="mt-8 max-w-xl mx-auto flex items-center gap-1.5 sm:gap-2 bg-white rounded-full shadow-soft p-1.5 sm:p-2 pl-4 sm:pl-5">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une formation..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm py-2" />
              <button aria-label="Chercher"
                className="h-9 w-9 sm:h-10 sm:w-auto sm:px-5 rounded-full bg-primary-gradient text-white text-sm font-semibold inline-flex items-center justify-center flex-none">
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Chercher</span>
              </button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="py-10 bg-white border-b border-[color:var(--border)] sticky top-16 z-30 backdrop-blur bg-white/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition ${
                filter === cat
                  ? "bg-primary-gradient text-white shadow-glow"
                  : "bg-[color:var(--sky-soft)] text-foreground hover:bg-[color:var(--pastel-blue)]"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{filtered.length}</span> formation{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Aucune formation ne correspond à votre recherche.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((c, i) => <CourseCard key={c.slug} c={c} i={i} />)}
            </div>
          )}
        </div>
      </section>

      <Benefits />
      <Reviews />
      <PaymentSecurity />
      <FaqSection />

      <Footer />
    </div>
  );
}
