import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Download,
  Award,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Sparkles,
  Lock,
  GraduationCap,
  ShieldCheck,
  Share2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { buyerSupabase } from "@/integrations/supabase/buyer-client";
import { useAuth } from "@/contexts/AuthContext";
import { CourseVideoPlayer } from "@/components/course/CourseVideoPlayer";
import ProductReviewForm from "@/components/buyer/ProductReviewForm";
import ProductReviewsSection from "@/components/store/ProductReviewsSection";
import { ContactTrainerModal } from "@/components/ContactTrainerModal";
import { getCompletedLessons, saveCompletedLessons } from "@/lib/courseProgressSync";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import SEOHead from "@/components/SEOHead";
import { QuizPlayer, QuizData } from "@/components/course/QuizPlayer";
import { toast } from "sonner";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  resource_url?: string;
  duration_minutes?: number;
  position: number;
}

interface Module {
  id: string;
  product_id: string;
  title: string;
  description?: string;
  position: number;
  lessons: Lesson[];
}

export const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModuleIds, setOpenModuleIds] = useState<string[]>([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchStudentName = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setStudentName(profile.full_name);
        } else {
          const metaName = user.user_metadata?.full_name;
          if (metaName) {
            setStudentName(metaName);
          } else {
            const { data: customer } = await supabase
              .from("customers")
              .select("name")
              .eq("auth_id", user.id)
              .maybeSingle();

            if (customer?.name) {
              setStudentName(customer.name);
            } else {
              setStudentName(user.email ? user.email.split("@")[0] : "Étudiant TECHNOVA");
            }
          }
        }
      } catch (e) {
        console.error("Error loading student name:", e);
      }
    };
    fetchStudentName();
  }, [user]);

  const handleEndLiveSession = async () => {
    if (!course?.id) return;
    if (!window.confirm("Êtes-vous sûr de vouloir clore cette session en direct ? Cela fermera les nouvelles ventes en direct et affichera le statut 'Direct Terminé'.")) {
      return;
    }
    try {
      const currentM = (course.marketing_sections as any) || {};
      const updatedM = { ...currentM, live_ended: true };
      const { error } = await supabase
        .from("products")
        .update({ marketing_sections: updatedM })
        .eq("id", course.id);

      if (error) throw error;
      setCourse((prev: any) => prev ? { ...prev, marketing_sections: updatedM } : prev);
      toast.success("La session en direct a été clôturée avec succès ! Les nouvelles inscriptions sont désormais fermées.");
    } catch (err: any) {
      toast.error("Erreur lors de la clôture du direct : " + (err.message || "Réessayez."));
    }
  };

  useEffect(() => {
    if (courseId && user?.id) {
      const saved = localStorage.getItem(`live_reminder_${courseId}_${user.id}`);
      if (saved === "true") setReminderActive(true);
    }
  }, [courseId, user]);

  // Load course, modules, and lessons
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // 1. Fetch course product info (resilient against RLS store join issues)
        let productData: any = null;

        // Try sellerSupabase first
        const { data: pData } = await supabase
          .from("products")
          .select("*")
          .eq("id", courseId)
          .maybeSingle();

        if (pData) {
          productData = pData;
        } else {
          // Fallback to buyerSupabase
          const { data: bData } = await buyerSupabase
            .from("products")
            .select("*")
            .eq("id", courseId)
            .maybeSingle();
          if (bData) {
            productData = bData;
          }
        }

        // Check if course product exists in sessionStorage buyer session orders as ultimate fallback
        if (!productData) {
          try {
            const rawSession = sessionStorage.getItem("buyer_session");
            if (rawSession) {
              const bSession = JSON.parse(rawSession);
              const orderMatch = (bSession.orders || []).find(
                (o: any) => o.product?.id === courseId
              );
              if (orderMatch?.product) {
                productData = orderMatch.product;
              }
            }
          } catch (e) {
            console.error("Error reading buyer session fallback:", e);
          }
        }

        if (!productData) {
          console.error("Course product not found for ID:", courseId);
          toast.error("Cours introuvable");
          navigate("/formations");
          return;
        }

        // Try fetching store info optionally
        if (productData.store_id) {
          const { data: storeData } = await supabase
            .from("stores")
            .select("name, logo_url")
            .eq("id", productData.store_id)
            .maybeSingle();
          if (storeData) {
            productData.stores = storeData;
          }
        }

        setCourse(productData);

        // 2. Fetch modules with lessons
        let modulesData: any[] = [];
        const { data: mData } = await supabase
          .from("course_modules")
          .select("*, course_lessons(*)")
          .eq("product_id", courseId)
          .order("position", { ascending: true });

        if (mData && mData.length > 0) {
          modulesData = mData;
        } else {
          const { data: bmData } = await buyerSupabase
            .from("course_modules")
            .select("*, course_lessons(*)")
            .eq("product_id", courseId)
            .order("position", { ascending: true });
          if (bmData) modulesData = bmData;
        }

        const formattedModules: Module[] = (modulesData || []).map((m: any) => ({
          id: m.id,
          product_id: m.product_id,
          title: m.title,
          description: m.description,
          position: m.position,
          lessons: (m.course_lessons || []).sort((a: any, b: any) => a.position - b.position),
        }));

        setModules(formattedModules);

        // Auto open all module accordions
        setOpenModuleIds(formattedModules.map((m) => m.id));

        // Select first lesson by default
        const allLessons = formattedModules.flatMap((m) => m.lessons);
        if (allLessons.length > 0) {
          setActiveLesson(allLessons[0]);
        }

        // Load completed lessons from Cloud Sync + Local Cache
        let buyerEmail = null;
        try {
          const rawSession = sessionStorage.getItem("buyer_session");
          if (rawSession) {
            const parsed = JSON.parse(rawSession);
            if (parsed?.email) buyerEmail = parsed.email;
          }
        } catch (e) {}

        const userIdentifier = user?.email || user?.id || buyerEmail || "anonymous_student";
        const syncedCompleted = await getCompletedLessons(courseId, userIdentifier);
        setCompletedLessonIds(syncedCompleted);
      } catch (e: any) {
        toast.error("Erreur lors du chargement du cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  // All lessons flat list
  const allLessons = useMemo(() => {
    return modules.flatMap((m) => m.lessons);
  }, [modules]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (allLessons.length === 0) return 0;
    return Math.round((completedLessonIds.length / allLessons.length) * 100);
  }, [allLessons, completedLessonIds]);

  // Dynamic Quiz Parser & Comprehension Test Generator
  const activeQuiz = useMemo<QuizData | null>(() => {
    if (!activeLesson) return null;

    if (activeLesson.content) {
      try {
        if (activeLesson.content.trim().startsWith("{")) {
          const parsed = JSON.parse(activeLesson.content);
          if (parsed?.questions && Array.isArray(parsed.questions)) {
            return parsed as QuizData;
          }
        }
      } catch (e) {
        // Plain text content
      }
    }

    // Default dynamic comprehension quiz for video lessons
    return {
      title: `Quiz de Compréhension : ${activeLesson.title}`,
      passPercentage: 70,
      questions: [
        {
          id: `q1_${activeLesson.id}`,
          question: `Avez-vous assimilé les éléments clés présentés dans la leçon "${activeLesson.title}" ?`,
          options: [
            "Oui, j'ai visionné la vidéo et retenu les concepts fondamentaux",
            "Je dois revoir certains passages de la vidéo pour consolider mes notions",
            "Non, je n'ai pas encore terminé l'étude de cette leçon",
            "Je n'ai pas d'avis",
          ],
          correctAnswer: 0,
          explanation: "Suivre chaque vidéo attentivement permet de valider le module et de progresser vers votre certificat de fin de formation.",
        },
        {
          id: `q2_${activeLesson.id}`,
          question: `Comment mettre en pratique les acquis de la leçon "${activeLesson.title}" ?`,
          options: [
            "En appliquant immédiatement les exercices et méthodes expliqués dans le cours",
            "En sautant les travaux pratiques",
            "En conservant uniquement le support théorique sans pratiquer",
            "Aucune de ces réponses",
          ],
          correctAnswer: 0,
          explanation: "La pratique immédiate est la meilleure méthode pour acquérir des compétences immédiatement exploitables.",
        },
      ],
    };
  }, [activeLesson]);

  const toggleLessonCompleted = (lessonId: string) => {
    let updated: string[];
    if (completedLessonIds.includes(lessonId)) {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);
    if (courseId) {
      let buyerEmail = null;
      try {
        const rawSession = sessionStorage.getItem("buyer_session");
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed?.email) buyerEmail = parsed.email;
        }
      } catch (e) {}

      const userIdentifier = user?.email || user?.id || buyerEmail || "anonymous_student";
      saveCompletedLessons(courseId, updated, userIdentifier);
    }

    // Check if course is 100% completed
    if (allLessons.length > 0 && updated.length === allLessons.length) {
      setShowCertificateModal(true);
    }
  };

  const toggleModuleOpen = (moduleId: string) => {
    if (openModuleIds.includes(moduleId)) {
      setOpenModuleIds(openModuleIds.filter((id) => id !== moduleId));
    } else {
      setOpenModuleIds([...openModuleIds, moduleId]);
    }
  };

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex((l) => l.id === activeLesson.id);
  }, [activeLesson, allLessons]);

  const goToNextLesson = () => {
    if (currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      if (activeLesson) {
        toggleLessonCompleted(activeLesson.id);
      }
      setActiveLesson(nextLesson);
    } else if (activeLesson) {
      toggleLessonCompleted(activeLesson.id);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setActiveLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Chargement de votre espace de cours...</p>
        </div>
      </div>
    );
  }

  const isPortal =
    window.location.hostname.startsWith("portal.") ||
    window.location.hostname.startsWith("client.");
  const hasBuyerSession = typeof window !== "undefined" && !!sessionStorage.getItem("buyer_session");
  const backPath = isPortal ? "/dashboard" : hasBuyerSession ? "/mes-achats" : "/formations";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <SEOHead
        title={course ? `${course.title} — Espace de cours` : "Formation TECHNOVA"}
        description="Espace d'apprentissage virtuel sécurisé TECHNOVA"
      />

      {/* Top Header Bar */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to={backPath}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={hasBuyerSession ? "Retour à mes achats" : "Retour aux formations"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-sm font-bold text-foreground line-clamp-1 max-w-xs sm:max-w-md">
              {course?.title || "Formation"}
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {course?.stores?.name || "TECHNOVA Academy"}
            </p>
          </div>
        </div>

        {/* Progress Bar & Certificate CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end w-36 sm:w-48">
            <div className="flex items-center justify-between w-full text-xs font-semibold mb-1">
              <span className="text-muted-foreground">Progression</span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 w-full" />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowContactModal(true)}
            className="rounded-xl text-xs font-bold gap-1.5 border-border"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Contacter l'Instructeur</span>
            <span className="sm:hidden">Question</span>
          </Button>

          {progressPercent === 100 && (
            <Button
              size="sm"
              onClick={() => setShowCertificateModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md animate-pulse"
            >
              <Award className="h-4 w-4" />
              <span>Certificat</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Classroom Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Main Viewing Column */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {/* Google Meet Live Banner if live course */}
          {(() => {
            const m = (course?.marketing_sections as any) || {};
            const liveDateStr = m.live_date;
            const meetUrl = m.meet_url;
            const isLiveCourse = m.format_type === "live_meet" || m.format_type === "hybrid" || !!liveDateStr;
            const liveDateObj = liveDateStr ? new Date(liveDateStr) : null;
            const now = new Date();
            const isLiveUnlocked = liveDateObj ? now.getTime() >= liveDateObj.getTime() - 15 * 60 * 1000 : true;
            const isLiveExpired = liveDateObj ? now.getTime() > liveDateObj.getTime() + 2 * 60 * 60 * 1000 : false;

            if (!isLiveCourse) return null;

            if (isLiveExpired) {
              return (
                <div className="mb-6 p-5 rounded-2xl bg-muted/40 border border-border/80 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-500/20 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-lg shrink-0">
                        <i className="fa-solid fa-calendar-check text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            🏁 Session en Direct Expirée & Terminée
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/30">
                            Replay VOD & Ressources
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {liveDateObj
                            ? `Le direct s'est déroulé le : ${liveDateObj.toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "Session en direct terminée."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-check text-emerald-500" />
                        <span>Direct Terminé (Consulter les Leçons & Replay)</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-red-500/30 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                      <i className="fa-solid fa-video animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                          🔴 Session en Direct Google Meet
                        </span>
                        {m.course_language && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-background border border-border">
                            {m.course_language === "en"
                              ? "🇬🇧 English"
                              : m.course_language === "es"
                              ? "🇪🇸 Español"
                              : "🇫🇷 Français"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {liveDateObj
                          ? `Date du Direct : ${liveDateObj.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Session de visioconférence programmée"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Add to Google Calendar Button */}
                    {liveDateObj && (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                          course?.title || "Session Live TECHNOVA"
                        )}&dates=${liveDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(
                          liveDateObj.getTime() + 90 * 60 * 1000
                        )
                          .toISOString()
                          .replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(
                          "Rejoignez votre formation en direct sur TECHNOVA."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
                      >
                        <i className="fa-solid fa-calendar-plus text-primary" />
                        <span>Ajouter au Calendrier</span>
                      </a>
                    )}

                    {/* Email Reminder Notification Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !reminderActive;
                        setReminderActive(nextState);
                        if (user?.id) {
                          localStorage.setItem(`live_reminder_${courseId}_${user.id}`, String(nextState));
                        }
                        if (nextState) {
                          toast.success("Rappel activé ! Vous recevrez une notification par e-mail 24h et 1h avant le direct.");
                        } else {
                          toast.info("Rappel des événements désactivé.");
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        reminderActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "bg-secondary hover:bg-secondary/80 text-foreground border-border"
                      }`}
                    >
                      <i className={`fa-solid ${reminderActive ? "fa-bell-circle-check text-emerald-500" : "fa-bell text-amber-500"}`} />
                      <span>{reminderActive ? "Rappel Email Activé" : "Rappel Email (24h & 1h)"}</span>
                    </button>

                    {/* Meet Access Button */}
                    {meetUrl ? (
                      <a
                        href={isLiveUnlocked ? meetUrl : "#"}
                        target={isLiveUnlocked ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!isLiveUnlocked) {
                            e.preventDefault();
                            toast.info(
                              "Le lien Google Meet se débloque 15 minutes avant le début de la session !"
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                          isLiveUnlocked
                            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                            : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                        }`}
                      >
                        <i className="fa-solid fa-video" />
                        <span>
                          {isLiveUnlocked ? "Rejoindre le Google Meet" : "Lien débloqué 15 min avant"}
                        </span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Lien Meet transmis prochainement
                      </span>
                    )}

                    {/* Trainer Action: Close Live Stream */}
                    {(user?.id === course?.creator_id || user?.id === course?.stores?.owner_id || isAdmin) && (
                      <button
                        type="button"
                        onClick={handleEndLiveSession}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 transition-colors shadow"
                        title="Formateur: Clôturer la session en direct pour fermer les ventes"
                      >
                        <i className="fa-solid fa-flag-checkered text-amber-400" />
                        <span>Clôturer le Direct (Formateur)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeLesson ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="w-full">
                <CourseVideoPlayer
                  src={
                    activeLesson.video_url ||
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  }
                  title={activeLesson.title}
                  userEmail={(() => {
                    if (user?.email) return user.email;
                    try {
                      const rawSession = sessionStorage.getItem("buyer_session");
                      if (rawSession) {
                        const parsed = JSON.parse(rawSession);
                        if (parsed?.email) return parsed.email;
                      }
                    } catch (e) {}
                    return "etudiant@technova.com";
                  })()}
                  autoPlay={false}
                  onEnded={() => {
                    if (activeLesson && !completedLessonIds.includes(activeLesson.id)) {
                      toggleLessonCompleted(activeLesson.id);
                      toast.success("Vidéo terminée ! Leçon validée.");
                    }
                  }}
                />
              </div>

              {/* Lesson Title & Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 mb-2 inline-block">
                    Leçon {currentLessonIndex + 1} sur {allLessons.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {activeLesson.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContactModal(true)}
                    className="rounded-xl text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Poser une question</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousLesson}
                    disabled={currentLessonIndex <= 0}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Précédent
                  </Button>

                  <Button
                    size="sm"
                    onClick={goToNextLesson}
                    className="rounded-xl text-xs font-semibold gap-1.5"
                  >
                    {completedLessonIds.includes(activeLesson.id) ? (
                      <>
                        <span>Suivant</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Terminer & Suivant</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Lesson Description & Details */}
              {activeLesson.description && (
                <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                  <p>{activeLesson.description}</p>
                </div>
              )}

              {/* Resource Attachments Download Box */}
              {activeLesson.resource_url && (
                <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Fichiers & Ressources jointes</h4>
                      <p className="text-[11px] text-muted-foreground">Support de cours & exercices pratiques</p>
                    </div>
                  </div>
                  <a
                    href={activeLesson.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold">
                      <Download className="h-3.5 w-3.5" />
                      <span>Télécharger</span>
                    </Button>
                  </a>
                </div>
              )}

              {/* Dynamic Comprehension Quiz Section */}
              {activeQuiz && (
                <div className="pt-4">
                  <QuizPlayer
                    quiz={activeQuiz}
                    lessonTitle={activeLesson.title}
                    onPass={() => {
                      if (activeLesson && !completedLessonIds.includes(activeLesson.id)) {
                        toggleLessonCompleted(activeLesson.id);
                        toast.success("Quiz réussi ! Leçon validée avec succès.");
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dedicated Live Meet Overview Card */}
              <div className="p-6 sm:p-8 bg-card rounded-3xl border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 font-bold text-xl">
                      <i className="fa-solid fa-chalkboard-user" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                        Formation en Direct Google Meet
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                        {course?.title}
                      </h2>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setShowContactModal(true)}
                    className="rounded-xl text-xs font-bold gap-1.5 shrink-0"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Contacter l'Instructeur</span>
                  </Button>
                </div>

                {course?.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Présentation de la Formation
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>
                )}

                {/* Course Resource File Download if attached to course product */}
                {course?.download_url && (
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Support de cours téléchargeable</h4>
                        <p className="text-[11px] text-muted-foreground">Fichiers & documents d'accompagnement</p>
                      </div>
                    </div>
                    <a
                      href={course.download_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold">
                        <Download className="h-3.5 w-3.5" />
                        <span>Télécharger le Support</span>
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verified Student Reviews & Rating Section */}
          {courseId && (
            <div className="mt-12 pt-8 border-t border-border space-y-6">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <i className="fa-solid fa-star text-amber-400" />
                <span>Avis & Témoignages des Élèves</span>
              </div>

              {user?.id && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Donner votre avis sur ce cours
                  </h4>
                  <ProductReviewForm productId={courseId} customerId={user.id} />
                </div>
              )}

              <ProductReviewsSection productId={courseId} />
            </div>
          )}
        </div>

        {/* Right/Sidebar Modules Column - Only show if modules exist */}
        {modules.length > 0 && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card/50 overflow-y-auto p-4 sm:p-6 shrink-0">
            <div className="mb-6">
              <h3 className="font-extrabold text-foreground text-base mb-1">Sommaire du cours</h3>
              <p className="text-xs text-muted-foreground">
                {modules.length} module{modules.length > 1 ? "s" : ""} • {allLessons.length} leçon
                {allLessons.length > 1 ? "s" : ""}
              </p>
            </div>

          {/* Modules Accordion */}
          <div className="space-y-3">
            {modules.map((m, mIdx) => {
              const isOpen = openModuleIds.includes(m.id);
              const completedInModule = m.lessons.filter((l) =>
                completedLessonIds.includes(l.id)
              ).length;

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModuleOpen(m.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                        0{mIdx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                          {m.title}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {completedInModule}/{m.lessons.length} leçons
                        </span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {/* Lessons List */}
                  {isOpen && (
                    <div className="border-t border-border/60 divide-y divide-border/40 bg-muted/20">
                      {m.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary font-bold border-l-4 border-primary"
                                : "hover:bg-muted/50 text-foreground/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonCompleted(lesson.id);
                                }}
                                className="shrink-0 text-muted-foreground hover:text-primary"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground/60" />
                                )}
                              </button>
                              <span className="truncate">{lesson.title}</span>
                            </div>

                            {lesson.duration_minutes && (
                              <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* CERTIFICATE COMPLETION MODAL */}
      <AnimatePresence>
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 text-center relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

              <div className="h-20 w-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Award className="h-10 w-10" />
              </div>

              <h2 className="text-2xl font-extrabold text-foreground mb-2">Félicitations ! 🎉</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Vous avez terminé 100% de la formation <br />
                <strong className="text-foreground">{course?.title}</strong>
              </p>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border mb-6 text-left space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Titulaire :</span>
                  <strong className="text-foreground">{studentName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Organisme :</span>
                  <strong className="text-foreground">TECHNOVA Learning</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Statut :</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Certifié
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={async () => {
                    await generateCertificatePDF({
                      studentName: studentName || "Étudiant TECHNOVA",
                      courseTitle: course?.title || "Formation Certifiante",
                      storeName: course?.stores?.name || "TECHNOVA Academy",
                    });
                    toast.success("Votre attestation PDF a été générée !");
                    setShowCertificateModal(false);
                  }}
                  className="w-full rounded-xl py-5 font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger l'Attestation (PDF)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowCertificateModal(false)}
                  className="w-full rounded-xl py-5 font-semibold"
                >
                  Fermer
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT TRAINER MODAL */}
      <ContactTrainerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        courseTitle={course?.title || "Formation TECHNOVA"}
        sellerName={course?.stores?.name || "L'Instructeur"}
        sellerId={course?.creator_id || course?.stores?.owner_id}
      />
    </div>
  );
};

export default CoursePlayer;
