import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseCard, type Course } from "@/components/site/shared";
import { PlayCircle, ArrowRight, Flame } from "lucide-react";

interface FeaturedCoursesSectionProps {
  lang: string;
}

export const VideoCoursesCarousel = ({ lang }: FeaturedCoursesSectionProps) => {
  // Fetch published video courses sorted by sales_count descending (then created_at)
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["home_featured_video_courses", lang],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data: rawProducts, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", "course")
        .eq("is_published", true)
        .order("sales_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching featured video courses:", error);
        throw error;
      }
      if (!rawProducts || rawProducts.length === 0) return [];

      // Fetch instructor profile names
      const creatorIds = Array.from(
        new Set(rawProducts.map((p: any) => p.creator_id).filter(Boolean))
      );

      const profilesMap: Record<string, string> = {};
      if (creatorIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", creatorIds);
          if (profiles) {
            profiles.forEach((p) => {
              profilesMap[p.id] = p.display_name || "";
            });
          }
        } catch (err) {
          console.error("Failed to fetch creator profiles:", err);
        }
      }

      // Format courses and assign ranking badges for the top 4
      return rawProducts.slice(0, 4).map((p: any, index: number) => {
        const m = (p.marketing_sections as any) || {};

        let rankBadge: string | undefined = undefined;
        if (index === 0) {
          rankBadge = lang === "fr" ? "#1 Top Vente" : "#1 Best Seller";
        } else if (index === 1) {
          rankBadge = lang === "fr" ? "#2 Populaire" : "#2 Popular";
        } else if (index === 2) {
          rankBadge = lang === "fr" ? "#3 Tendance" : "#3 Trending";
        } else if (index === 3) {
          rankBadge = lang === "fr" ? "#4 Coup de Cœur" : "#4 Top Pick";
        }

        const categoryFormatted = p.category
          ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
          : lang === "fr"
          ? "Formation Vidéo"
          : "Video Course";

        return {
          slug: p.id,
          title: p.title,
          cover:
            p.thumbnail_url ||
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
          category: categoryFormatted,
          level: lang === "fr" ? "Tous niveaux" : "All levels",
          price: `${p.price || 0} FCFA`,
          oldPrice: p.original_price ? `${p.original_price} FCFA` : undefined,
          duration: lang === "fr" ? "Accès à vie" : "Lifetime access",
          creatorId: p.creator_id,
          courseLanguage: m.course_language || "fr",
          formatType: m.format_type || "vod",
          liveDate: m.live_date || undefined,
          meetUrl: m.meet_url || undefined,
          instructorName: p.creator_id ? (profilesMap[p.creator_id] || "Formateur TechNova") : "Formateur TechNova",
          productType: "course",
          salesCount: p.sales_count || 0,
          rankBadge: rankBadge,
        } as Course;
      });
    },
  });

  if (!isLoading && courses.length === 0) {
    return null;
  }

  return (
    <section
      id="video-courses"
      className="section-pad-100 relative overflow-hidden"
      style={{
        background: "var(--section-alt)",
        borderTop: "1px solid var(--card-border)",
        borderBottom: "1px solid var(--card-border)",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-full blur-[140px] pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="mx-auto relative z-10" style={{ maxWidth: 1280, padding: "0 24px" }}>
        {/* Header Row: Title & Subtitle + View All Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>

            <h2 className="section-title">
              <span className="title-motion-wrap">
                <span className="title-motion">
                  {lang === "fr" ? "Nos formations vedettes" : "Featured Courses"}
                </span>
                <i className="fas fa-sparkles motion-spark" />
              </span>
            </h2>

            <p className="section-sub mt-2 max-w-2xl">
              {lang === "fr"
                ? "Découvrez nos cours vidéo et tutoriels pratiques les plus plébiscités par la communauté. Apprenez pas à pas avec des experts et obtenez votre certificat."
                : "Explore our most popular video courses and step-by-step tutorials. Learn directly from certified instructors and level up your career."}
            </p>
          </div>

          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--blue)] hover:underline self-start md:self-end"
          >
            <span>{lang === "fr" ? "Voir tout le catalogue" : "See all courses"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Courses Static Grid (No carousel) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-4 h-[380px] animate-pulse flex flex-col justify-between"
              >
                <div className="w-full h-44 rounded-xl bg-muted" />
                <div className="h-6 w-3/4 rounded bg-muted mt-4" />
                <div className="h-4 w-1/2 rounded bg-muted mt-2" />
                <div className="h-10 w-full rounded-full bg-muted mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c, i) => (
              <CourseCard key={c.slug} c={c} i={i} />
            ))}
          </div>
        )}

        {/* Bottom Banner: Call to Action to explore the entire catalog */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-r from-blue-900/10 via-purple-900/5 to-transparent backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base sm:text-lg">
                {lang === "fr"
                  ? "Prêt à apprendre ? Découvrez toutes nos formations disponibles"
                  : "Ready to learn? Discover all our available courses"}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {lang === "fr"
                  ? "Accédez aux vidéos HD en illimité, téléchargez les ressources et progressez à votre propre rythme."
                  : "Enjoy unlimited HD streaming, download resources, and learn at your own pace."}
              </p>
            </div>
          </div>

          <Link
            to="/formations"
            className="tn-btn-primary shrink-0 w-full sm:w-auto justify-center"
            style={{ padding: "12px 24px", fontSize: "0.9rem" }}
          >
            <span>{lang === "fr" ? "Explorer tout le catalogue" : "Browse all courses"}</span>
            <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
          </Link>
        </div>
      </div>
    </section>
  );
};
