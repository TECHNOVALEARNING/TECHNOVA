import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Sparkles, Shield, Lock, BadgeCheck, Fingerprint, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Header, Footer, CourseCard, SectionHead, Benefits,
  PaymentSecurity, Reviews, FaqSection,
  Course
} from "@/components/site/shared";
import { supabase } from "@/lib/supabase";
import heroImage from "@/assets/hero-bg.png";

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

      {/* HERO MARKETPLACE — IMAGE BANNER */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative">
          <img
            src={heroImage}
            alt="Marketplace de formations"
            className="h-[340px] w-full object-cover sm:h-[440px] md:h-[560px]"
          />
          {/* gradient overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-white/20" />
        </div>

        {/* floating search & ctas */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 md:-mt-56 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-3 py-1 text-[11px] font-semibold text-[color:var(--navy)] backdrop-blur sm:text-xs">
              <Sparkles className="h-3 w-3 text-[color:var(--accent)]" /> La référence des formations numériques
            </span>
            <h1 className="mb-4 text-3xl font-display font-extrabold leading-[1.05] tracking-tight text-[color:var(--navy)] sm:text-5xl md:text-6xl">
              Catalogue complet.{" "}
              <span className="text-gradient">
                Apprenez sans limite.
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-600 sm:text-base md:text-lg">
              Choisissez votre prochaine compétence. Apprenez à votre rythme, payez en Mobile Money, recevez votre certificat reconnu.
            </p>

            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200/60 bg-white/80 p-2 shadow-2xl backdrop-blur-xl sm:p-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-xl border border-gray-100 p-1.5 sm:p-2 pl-4 sm:pl-5">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-none" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une formation..."
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm py-2 text-gray-700" />
                <button aria-label="Chercher"
                  className="h-9 w-9 sm:h-11 sm:w-auto sm:px-6 rounded-lg bg-[#004DB8] hover:bg-[#003c91] transition-colors text-white text-sm font-semibold inline-flex items-center justify-center flex-none">
                  <Search className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Chercher</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TRUST BENEFITS BAR */}
        <div className="mx-auto max-w-7xl px-4 pb-2 pt-10 sm:pt-14 relative z-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { icon: Fingerprint, label: "Accès à vie", desc: "Mises à jour incluses" },
              { icon: BadgeCheck, label: "Certificat inclus", desc: "Reconnu sur le marché" },
              { icon: Lock, label: "Paiement Mobile Money", desc: "Sécurisé & Rapide" },
              { icon: Shield, label: "Qualité garantie", desc: "Experts du domaine" },
            ].map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white/60 p-3 backdrop-blur sm:gap-3 sm:p-4 shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--sky-soft)] sm:h-10 sm:w-10">
                  <b.icon className="h-4 w-4 text-[color:var(--primary)] sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                    {b.label}
                  </div>
                  <div className="truncate text-[10px] text-gray-500 sm:text-xs">
                    {b.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE TOOLBAR */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une formation..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#004DB8] focus:bg-white focus:ring-2 focus:ring-[#004DB8]/10 transition"
              />
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none cursor-pointer rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#004DB8] focus:bg-white focus:ring-2 focus:ring-[#004DB8]/10 transition w-full sm:w-48"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                className="appearance-none cursor-pointer rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#004DB8] focus:bg-white focus:ring-2 focus:ring-[#004DB8]/10 transition w-full sm:w-44"
              >
                <option>Plus récents</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Mieux notés</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-10 bg-[#F7F8FC] min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Count + label */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
              formation{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </p>
            {filter !== "Toutes" && (
              <button
                onClick={() => setFilter("Toutes")}
                className="text-xs text-[#004DB8] font-semibold hover:underline"
              >
                ✕ Effacer le filtre
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2FF]">
                <Search className="h-8 w-8 text-[#004DB8]" />
              </div>
              <p className="text-lg font-semibold text-gray-800">Aucune formation trouvée</p>
              <p className="mt-1 text-sm text-gray-500">Essayez un autre mot-clé ou catégorie.</p>
              <button onClick={() => { setSearch(""); setFilter("Toutes"); }}
                className="mt-4 rounded-lg bg-[#004DB8] px-5 py-2 text-sm font-medium text-white hover:bg-[#003c91] transition">
                Voir toutes les formations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
