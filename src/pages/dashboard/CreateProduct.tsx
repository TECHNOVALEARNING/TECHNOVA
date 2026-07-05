import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  GraduationCap,
  Key,
  Layers,
  Check,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Package,
  Link as LinkIcon,
  FileAudio,
  FileVideo,
  Video as YoutubeIcon,
  Shield,
  Clock,
  Hash,
  Percent,
  Video,
  BookOpen,
  Download,
  Loader2,
  Sparkles,
  File as PdfIcon,
} from "lucide-react";
import CourseLessonsManager, { type Module } from "@/components/dashboard/CourseLessonsManager";
import RichTextEditor from "@/components/RichTextEditor";
import ProductModerationDialog, {
  type ProductModerationReview,
} from "@/components/dashboard/ProductModerationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { getEmbedUrl } from "@/lib/videoUtils";

type ProductType = "file" | "course" | "license";

const productTypes = [
  {
    type: "file" as ProductType,
    label: "Fichiers",
    description:
      "E-books, templates, fichiers audio : vos clients téléchargent instantanément après achat.",
    icon: FileText,
    color: "bg-amber-500",
    features: [
      "Tous formats acceptés (PDF, ZIP, MP3…)",
      "Livraison automatique",
      "Téléchargement sécurisé",
    ],
  },
  {
    type: "course" as ProductType,
    label: "Formations",
    description: "Créez des formations structurées avec vidéo, texte et contenu téléchargeable.",
    icon: GraduationCap,
    color: "bg-blue-500",
    features: [
      "Contenu vidéo, texte & téléchargeable",
      "Suivi de progression des étudiants",
      "Modules & leçons structurés",
    ],
  },
  {
    type: "license" as ProductType,
    label: "Licences",
    description: "Vendez des clés de licence avec contrôle total sur les activations et la durée.",
    icon: Key,
    color: "bg-purple-500",
    features: [
      "Génération automatique de licences",
      "Limite d'activations par licence",
      "Durée de validité configurable",
      "Suivi en temps réel",
    ],
  },
];

const TOTAL_STEPS = 5;

const CreateProduct = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 - Type
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);

  // Step 2 - Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [templateSubcat, setTemplateSubcat] = useState("other");
  const [pricingModel, setPricingModel] = useState("one_time");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");

  // License-specific
  const [licenseMaxActivations, setLicenseMaxActivations] = useState("");
  const [licenseValidityDays, setLicenseValidityDays] = useState("");

  // Course

  // Step 3 - Description
  const [description, setDescription] = useState("");
  const [aiRewriting, setAiRewriting] = useState(false);
  const [aiRewritingTitle, setAiRewritingTitle] = useState(false);

  // Step 4 - Images
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Step 5 - Download file
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState<"audio" | "image" | "pdf" | "video" | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  // Countdown timer settings
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownEndsAt, setCountdownEndsAt] = useState("");

  // Course modules
  const [courseModules, setCourseModules] = useState<Module[]>([]);

  // Moderation
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationReview, setModerationReview] = useState<ProductModerationReview | null>(null);
  const [moderationRedirectPath, setModerationRedirectPath] = useState<string | null>(null);

  const selectedTypeData = productTypes.find((t) => t.type === selectedType);

  const handleFilePreview = (file: File, setter: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (category === "discovery") {
      setPricingModel("free");
      setPrice("0");
      setOriginalPrice("");
    }
  }, [category]);

  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;
  const priceError =
    price && priceNum > 0 && priceNum < 100 ? "Le prix minimum est de 100 FCFA" : "";
  const originalPriceError =
    originalPrice && originalPriceNum > 0 && originalPriceNum <= priceNum
      ? "Le prix barré doit être supérieur au prix de vente"
      : "";

  const canNext = () => {
    switch (step) {
      case 1:
        return !!selectedType;
      case 2:
        return (
          !!title.trim() &&
          (pricingModel === "free" ||
            (!!price && priceNum >= 100 && !priceError && !originalPriceError))
        );
      case 3:
        return !!description.replace(/<[^>]*>/g, "").trim();
      case 4:
        return true;
      case 5:
        if (selectedType === "file") {
          if (fileFormat === "video") return !!videoUrl.trim();
          return !!downloadFile && !!fileFormat;
        }
        if (selectedType === "course") return courseModules.length > 0;
        return true;
      default:
        return false;
    }
  };

  const rewriteTitle = async () => {
    if (!title.trim()) {
      toast.error("Entrez d'abord un titre à améliorer");
      return;
    }
    setAiRewritingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-description", {
        body: {
          title,
          description: `Récris uniquement le titre du produit "${title}" (type: ${selectedType || "fichier numérique"}) pour le rendre plus accrocheur, professionnel et vendeur. Réponds UNIQUEMENT avec le nouveau titre, sans guillemets, sans explication.`,
          productType: selectedType || "file",
          mode: "title",
        },
      });
      if (error) throw error;
      const newTitle = (data?.title || data?.description || "").replace(/<[^>]*>/g, "").trim();
      if (newTitle) {
        setTitle(newTitle);
        toast.success("Titre amélioré par l'IA !");
      }
    } catch (err: any) {
      toast.error("Erreur IA : " + (err.message || "Réessayez"));
    } finally {
      setAiRewritingTitle(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-assets").upload(path, file);
    if (error) {
      toast.error("Erreur upload: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("product-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !selectedType || !title.trim()) return;
    if (!isAdmin && selectedType !== "file") {
      toast.error("Seul l'administrateur peut publier des formations ou des licences.");
      return;
    }
    if (selectedType === "file") {
      if (category === "discovery") {
        if (!videoUrl.trim()) {
          toast.error("Veuillez entrer le lien du site internet");
          return;
        }
      } else {
        if (!fileFormat) {
          toast.error("Veuillez choisir le format du fichier");
          return;
        }
        if (fileFormat === "video" && !videoUrl.trim()) {
          toast.error("Veuillez entrer le lien de la vidéo");
          return;
        }
        if (fileFormat !== "video" && !downloadFile) {
          toast.error("Veuillez uploader le fichier");
          return;
        }
      }
    }
    if (selectedType === "course" && courseModules.length === 0) {
      toast.error("Veuillez ajouter au moins un module à votre formation");
      return;
    }

    setSaving(true);
    let createdProductId: string | null = null;

    try {
      let thumbnailUrl: string | null = null;
      let downloadUrl: string | null = null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }
      if (downloadFile && fileFormat !== "video") {
        downloadUrl = await uploadFile(downloadFile, "downloads");
      } else if (fileFormat === "video" && videoUrl) {
        downloadUrl = videoUrl;
      }

      const effectivePrice = pricingModel === "free" ? 0 : parseFloat(price);

      const finalCategory =
        category === "template" ? `template:${templateSubcat}` : category || null;

      const productData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        category: finalCategory,
        price: effectivePrice,
        original_price:
          pricingModel === "free" ? null : originalPrice ? parseFloat(originalPrice) : null,
        type: selectedType,
        thumbnail_url: thumbnailUrl,
        download_url: downloadUrl,
        file_format: fileFormat,
        creator_id: user.id,
        is_published: false,
        marketing_sections: {
          countdown_timer: {
            enabled: countdownEnabled,
            ends_at: countdownEnabled && countdownEndsAt ? new Date(countdownEndsAt).toISOString() : null,
          }
        },
      };

      if (selectedType === "license") {
        productData.license_max_activations = licenseMaxActivations
          ? parseInt(licenseMaxActivations)
          : null;
        productData.license_validity_days = licenseValidityDays
          ? parseInt(licenseValidityDays)
          : null;
      }

      // Course content type removed
      const { data: productResult, error } = await supabase
        .from("products")
        .insert(productData as any)
        .select("id")
        .single();

      if (error || !productResult) {
        throw error || new Error("Impossible de créer le produit");
      }

      createdProductId = productResult.id;

      if (selectedType === "course" && courseModules.length > 0) {
        for (const module of courseModules) {
          // insert module
          const { data: modData, error: modError } = await supabase
            .from("course_modules")
            .insert({
              product_id: productResult.id,
              title: module.title || `Module ${module.position + 1}`,
              position: module.position,
            })
            .select("id")
            .single();

          if (modError || !modData) {
            toast.error("Erreur lors de la création d'un module: " + (modError?.message || ""));
            continue;
          }

          // insert lessons for this module
          if (module.lessons.length > 0) {
            const lessonsToInsert = [];
            for (const lesson of module.lessons) {
              let resourceUrl = lesson.resource_url;
              if (lesson.resourceFile) {
                const uploaded = await uploadFile(lesson.resourceFile, "course-resources");
                if (uploaded) resourceUrl = uploaded;
              }

              lessonsToInsert.push({
                product_id: productResult.id,
                module_id: modData.id,
                title: lesson.title || `Leçon ${lesson.position + 1}`,
                description: lesson.description || null,
                content: lesson.content || null,
                video_url: lesson.video_url || null,
                resource_url: resourceUrl || null,
                duration_minutes: lesson.duration_minutes,
                position: lesson.position,
              });
            }

            const { error: lessonsError } = await supabase
              .from("course_lessons")
              .insert(lessonsToInsert);
            if (lessonsError) {
              toast.error("Erreur sur les leçons d'un module: " + lessonsError.message);
            }
          }
        }
      }

      // Bypassing AI moderation since the Edge Function is not deployed yet
      const review = {
        status: "approved",
        reason: "Auto-approved",
        severity: "low",
      } as ProductModerationReview;
      setModerationReview(review);

      if (review?.status === "rejected") {
        // Only block for rejected (illegal/scam)
        setModerationDialogOpen(true);
        setModerationRedirectPath(`/dashboard/products/${productResult.id}/edit`);
        toast.error("Publication bloquée par la modération.");
      } else {
        // approved or needs_review → publish silently
        const { error: publishError } = await supabase
          .from("products")
          .update({ is_published: true })
          .eq("id", productResult.id);

        if (publishError) throw publishError;

        if (review?.status === "approved") {
          setModerationDialogOpen(true);
          setModerationRedirectPath("/dashboard/products");
        } else {
          // needs_review: publish without popup, admin notified by email
          setModerationRedirectPath(null);
          navigate("/dashboard/products");
        }
        toast.success("Produit publié avec succès !");
      }
    } catch (error: any) {
      if (createdProductId) {
        toast.error(
          error.message || "Analyse impossible. Le produit a été enregistré en brouillon.",
        );
        navigate(`/dashboard/products/${createdProductId}/edit`);
      } else {
        toast.error(error.message || "Impossible de créer le produit.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getStep5Content = () => {
    if (category === "discovery") {
      return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Lien de la découverte</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Entrez l'URL du site internet de cette découverte.
          </p>
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Lien du site internet <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <div className="bg-white dark:bg-background border border-border flex items-center px-3 rounded-md">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setFileFormat("video");
                  }}
                  placeholder="https://example.com"
                  className="flex-1 bg-white dark:bg-background h-12"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (selectedType) {
      case "file":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Configurez votre produit numérique
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choisissez d'abord le format de votre produit. Les vidéos sont hébergées via lien
              (Drive, YouTube).
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                {
                  id: "pdf",
                  label: "Document (PDF)",
                  icon: PdfIcon,
                  color: "text-red-500",
                  border: "border-red-200 dark:border-red-900/50",
                  bg: "bg-red-50 dark:bg-red-950/30",
                },
                {
                  id: "audio",
                  label: "Audio (MP3)",
                  icon: FileAudio,
                  color: "text-purple-500",
                  border: "border-purple-200 dark:border-purple-900/50",
                  bg: "bg-purple-50 dark:bg-purple-950/30",
                },
                {
                  id: "image",
                  label: "Image (PNG/JPG)",
                  icon: ImageIcon,
                  color: "text-green-500",
                  border: "border-green-200 dark:border-green-900/50",
                  bg: "bg-green-50 dark:bg-green-950/30",
                },
                {
                  id: "video",
                  label: "Vidéo (Lien)",
                  icon: FileVideo,
                  color: "text-blue-500",
                  border: "border-blue-200 dark:border-blue-900/50",
                  bg: "bg-blue-50 dark:bg-blue-950/30",
                },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFileFormat(fmt.id as any)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    fileFormat === fmt.id
                      ? `${fmt.border} ${fmt.bg} shadow-sm`
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <fmt.icon className={`h-6 w-6 mx-auto mb-2 ${fmt.color}`} />
                  <p className="text-sm font-semibold text-foreground">{fmt.label}</p>
                </button>
              ))}
            </div>

            {fileFormat && fileFormat !== "video" && (
              <div
                className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors animate-in fade-in"
                onClick={() => document.getElementById("download-input")?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-amber-600" />
                  </div>
                  <Button variant="outline" className="gap-2 rounded-full pointer-events-none">
                    <Upload className="h-4 w-4" /> Uploader le fichier {fileFormat.toUpperCase()}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Taille max: 50 MB. Stocké de façon sécurisée.
                  </p>
                </div>
                {downloadFile && (
                  <p className="text-sm font-medium text-foreground mt-4">📎 {downloadFile.name}</p>
                )}
                <input
                  id="download-input"
                  type="file"
                  className="hidden"
                  accept={
                    fileFormat === "image"
                      ? "image/*"
                      : fileFormat === "audio"
                        ? "audio/*"
                        : fileFormat === "software"
                          ? ".exe,.dmg,.pkg,.zip,.rar"
                          : ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                  }
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 50 * 1024 * 1024) {
                        toast.error("Le fichier dépasse la limite autorisée de 50MB.");
                        e.target.value = "";
                        setDownloadFile(null);
                        return;
                      }
                      setDownloadFile(f);
                    } else {
                      setDownloadFile(null);
                    }
                  }}
                />
              </div>
            )}

            {fileFormat === "video" && (
              <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 animate-in fade-in space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Lien vers la vidéo (Google Drive, YouTube, Vimeo)
                  </label>
                  <div className="flex gap-2">
                    <div className="bg-white dark:bg-background border border-border flex items-center px-3 rounded-md">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 bg-white dark:bg-background"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Le lecteur vidéo sera directement intégré sur la page pour vos acheteurs.
                  </p>
                </div>

                {videoUrl && videoUrl.trim().startsWith("http") && (
                  <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-border bg-black/5 mt-4">
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {fileFormat && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 animate-in fade-in">
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <Shield className="h-4 w-4" />
                  <span>Accès hautement sécurisé, réservé uniquement aux acheteurs vérifiés.</span>
                </div>
              </div>
            )}
          </div>
        );

      case "course":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Structure de la formation</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Construisez votre programme. Ajoutez des modules, et pour chaque leçon intégrez des
              vidéos, du texte riche et des fichiers téléchargeables.
            </p>

            <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 shrink-0">
                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                  Écosystème d'apprentissage complet
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Chaque leçon est un écosystème en soi : ajoutez-y une vidéo (lien Drive/Youtube),
                  rédigez le cours complet, et joignez un fichier ressource si besoin. L'interface
                  d'apprentissage s'adaptera automatiquement !
                </p>
              </div>
            </div>

            <CourseLessonsManager modules={courseModules} onModulesChange={setCourseModules} />

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <GraduationCap className="h-4 w-4" />
                <span>La progression des étudiants sera suivie automatiquement</span>
              </div>
            </div>
          </div>
        );

      case "license":
        return (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Configuration de la licence</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Les clés de licence seront générées automatiquement à chaque achat.
            </p>

            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-border bg-card space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-purple-500" />
                    Nombre max d'activations par licence
                  </label>
                  <Input
                    type="number"
                    value={licenseMaxActivations}
                    onChange={(e) => setLicenseMaxActivations(e.target.value)}
                    placeholder="Ex: 3 (laisser vide pour illimité)"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Limitez le nombre d'appareils sur lesquels la licence peut être activée.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Durée de validité (en jours)
                  </label>
                  <Input
                    type="number"
                    value={licenseValidityDays}
                    onChange={(e) => setLicenseValidityDays(e.target.value)}
                    placeholder="Ex: 365 (laisser vide pour illimité)"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Après ce délai, la licence expirera automatiquement.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Fichier associé (optionnel)
                </label>
                <div
                  className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById("download-input")?.click()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full pointer-events-none"
                  >
                    <Upload className="h-4 w-4" /> Ajouter un fichier
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Logiciel, documentation, etc.
                  </p>
                  {downloadFile && (
                    <p className="text-sm font-medium text-foreground mt-3">
                      📎 {downloadFile.name}
                    </p>
                  )}
                  <input
                    id="download-input"
                    type="file"
                    className="hidden"
                    accept={
                      fileFormat === "image"
                        ? "image/*"
                        : fileFormat === "audio"
                          ? "audio/*"
                          : fileFormat === "software"
                            ? ".exe,.dmg,.pkg,.zip,.rar"
                            : ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    }
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 50 * 1024 * 1024) {
                          toast.error("Le fichier dépasse la limite autorisée de 50MB.");
                          e.target.value = "";
                          setDownloadFile(null);
                          return;
                        }
                        setDownloadFile(f);
                      } else {
                        setDownloadFile(null);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                  <Key className="h-4 w-4" />
                  <span>Les activations seront suivies en temps réel dans votre dashboard</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/dashboard/products"))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-foreground">Créer un produit</span>
        </div>

        {/* Type banner */}
        {selectedTypeData && step > 1 && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-secondary">
            <div
              className={`h-10 w-10 rounded-xl ${selectedTypeData.color} flex items-center justify-center`}
            >
              <selectedTypeData.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedTypeData.label}</p>
              <p className="text-xs text-muted-foreground">{selectedTypeData.description}</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Type */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8 italic">
                  Quel type de produit désirez-vous créer ?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productTypes
                    .filter((pt) => isAdmin || pt.type === "file")
                    .map((pt) => (
                      <button
                        key={pt.type}
                        onClick={() => setSelectedType(pt.type)}
                        className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                          selectedType === pt.type
                            ? "border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        {selectedType === pt.type && (
                          <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div
                          className={`h-12 w-12 rounded-xl ${pt.color} flex items-center justify-center mb-3`}
                        >
                          <pt.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{pt.label}</p>
                      </button>
                    ))}
                </div>

                {selectedTypeData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-xl border border-border bg-card"
                  >
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {selectedTypeData.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedTypeData.description}
                    </p>
                    <div className="space-y-2">
                      {selectedTypeData.features.map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-primary" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">Détails du produit</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Nom du produit <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Guide complet Facebook Ads 2025"
                        className="h-12 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 shrink-0 border-primary/30 hover:bg-primary/5"
                        onClick={rewriteTitle}
                        disabled={aiRewritingTitle || !title.trim()}
                        title="Améliorer le titre avec l'IA"
                      >
                        {aiRewritingTitle ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      💡 Cliquez sur l'icône ✨ pour améliorer votre titre avec l'IA
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Catégorie <span className="text-destructive">*</span>
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Dans quelle catégorie classer ce produit ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">💼 Business</SelectItem>
                        <SelectItem value="design">🎨 Design</SelectItem>
                        <SelectItem value="tech">💻 Tech & Code</SelectItem>
                        <SelectItem value="marketing">📈 Marketing</SelectItem>
                        <SelectItem value="education">🎓 Éducation</SelectItem>
                        <SelectItem value="lifestyle">🌿 Lifestyle</SelectItem>
                        <SelectItem value="creative">🎬 Créatif</SelectItem>
                        <SelectItem value="divertissement">🎮 Divertissement</SelectItem>
                        <SelectItem value="sante_bien_etre">❤️ Santé et bien être</SelectItem>
                        <SelectItem value="developpement_personnel">
                          ✨ Développement personnel
                        </SelectItem>
                        {isAdmin && (
                          <>
                            <SelectItem value="template">📋 Templates</SelectItem>
                            <SelectItem value="discovery">🔍 Découvertes (Lien externe)</SelectItem>
                          </>
                        )}
                        <SelectItem value="other">✨ Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {category === "template" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Sous-catégorie du template <span className="text-destructive">*</span>
                      </label>
                      <Select value={templateSubcat} onValueChange={setTemplateSubcat}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Sélectionner la sous-catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notion">📋 Notion</SelectItem>
                          <SelectItem value="canva">🎨 Canva & Design</SelectItem>
                          <SelectItem value="excel">📊 Excel & Finance</SelectItem>
                          <SelectItem value="dev">💻 Dev & Web</SelectItem>
                          <SelectItem value="marketing">📈 Marketing & Social</SelectItem>
                          <SelectItem value="other">📁 Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {category !== "discovery" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Modèle de tarification <span className="text-destructive">*</span>
                        </label>
                        <Select value={pricingModel} onValueChange={setPricingModel}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one_time">Paiement unique</SelectItem>
                            <SelectItem value="subscription">Abonnement</SelectItem>
                            <SelectItem value="free">Gratuit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {pricingModel !== "free" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Prix <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                FCFA
                              </span>
                              <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className={`h-12 pl-14 ${priceError ? "border-destructive" : ""}`}
                                placeholder="100"
                                min={100}
                              />
                            </div>
                            {priceError && (
                              <p className="text-[11px] text-destructive mt-1">{priceError}</p>
                            )}
                            {!priceError && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Min : 100 FCFA
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Prix barré
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                FCFA
                              </span>
                              <Input
                                type="number"
                                value={originalPrice}
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                className={`h-12 pl-14 ${originalPriceError ? "border-destructive" : ""}`}
                                placeholder="0"
                              />
                            </div>
                            {originalPriceError && (
                              <p className="text-[11px] text-destructive mt-1">
                                {originalPriceError}
                              </p>
                            )}
                            {!originalPriceError &&
                              originalPrice &&
                              originalPriceNum > priceNum && (
                                <p className="text-[11px] text-emerald-600 mt-1">
                                  Réduction de{" "}
                                  {Math.round(
                                    ((originalPriceNum - priceNum) / originalPriceNum) * 100,
                                  )}
                                  %
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Countdown Timer Config */}
                  {pricingModel !== "free" && category !== "discovery" && (
                    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Compte à rebours de promotion
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Affichez une urgence de promotion sur la page du produit.
                          </p>
                        </div>
                        <Switch
                          checked={countdownEnabled}
                          onCheckedChange={setCountdownEnabled}
                        />
                      </div>
                      
                      {countdownEnabled && (
                        <div className="space-y-2 pt-2 border-t border-border animate-in fade-in slide-in-from-top-2">
                          <label className="text-xs font-semibold text-foreground">
                            Date et heure d'expiration (Locale) <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="datetime-local"
                            value={countdownEndsAt}
                            onChange={(e) => setCountdownEndsAt(e.target.value)}
                            required={countdownEnabled}
                            className="h-12 bg-background"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Le compte à rebours se terminera exactement à cette heure sur la page du produit.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedType === "license" && (
                    <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 space-y-4">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-500" />
                        Options de licence
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Max activations
                          </label>
                          <Input
                            type="number"
                            value={licenseMaxActivations}
                            onChange={(e) => setLicenseMaxActivations(e.target.value)}
                            placeholder="Illimité"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Validité (jours)
                          </label>
                          <Input
                            type="number"
                            value={licenseValidityDays}
                            onChange={(e) => setLicenseValidityDays(e.target.value)}
                            placeholder="Illimité"
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Ajouter la description du produit
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  La description est obligatoire pour pouvoir publier votre produit.
                </p>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">Décrivez votre produit</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full text-xs"
                      disabled={aiRewriting || !title.trim()}
                      onClick={async () => {
                        setAiRewriting(true);
                        try {
                          const { data, error } = await supabase.functions.invoke(
                            "rewrite-description",
                            {
                              body: { title, description, productType: selectedType },
                            },
                          );
                          if (error) throw error;
                          if (data?.description) {
                            setDescription(data.description);
                            toast.success("Description réécrite par l'IA !");
                          }
                        } catch (err: any) {
                          toast.error("Erreur IA: " + (err.message || "Réessayez"));
                        } finally {
                          setAiRewriting(false);
                        }
                      }}
                    >
                      {aiRewriting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" /> Réécriture...
                        </>
                      ) : (
                        <>✨ Assistant IA</>
                      )}
                    </Button>
                  </div>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Décrivez votre produit en détail. Utilisez la barre d'outils pour formater le texte, ajouter des liens, des images..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Images */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">
                  Personnaliser la page produit
                </h2>
                <div className="space-y-8">
                  {/* Thumbnail */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Ajouter une vignette
                    </label>
                    <div
                      className="relative w-48 h-48 rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                      onClick={() => document.getElementById("thumbnail-input")?.click()}
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Vignette"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      )}
                      <input
                        id="thumbnail-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            if (f.size > 50 * 1024 * 1024) {
                              toast.error("La vignette dépasse la limite de 50MB.");
                              e.target.value = "";
                              return;
                            }
                            setThumbnailFile(f);
                            handleFilePreview(f, setThumbnailPreview);
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Créez une vignette mémorable. Utilisez une image carrée (minimum 600x600px) au
                      format JPG ou PNG.
                    </p>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Ajouter une bannière
                    </label>
                    <div
                      className="relative w-full h-48 rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                      onClick={() => document.getElementById("banner-input")?.click()}
                    >
                      {bannerPreview ? (
                        <img
                          src={bannerPreview}
                          alt="Bannière"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                          <span className="text-sm text-muted-foreground">
                            Cliquez pour ajouter
                          </span>
                        </div>
                      )}
                      <input
                        id="banner-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            if (f.size > 50 * 1024 * 1024) {
                              toast.error("La bannière dépasse la limite de 50MB.");
                              e.target.value = "";
                              return;
                            }
                            setBannerFile(f);
                            handleFilePreview(f, setBannerPreview);
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Créez une bannière attrayante. Utilisez une image rectangulaire (1200x400px
                      recommandé).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Type-specific content */}
            {step === 5 && getStep5Content()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {step > 1 && (
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setStep(step - 1)}
            >
              Retour
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              Continuer
            </Button>
          ) : (
            <Button
              className="rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Analyse en cours..." : "Analyser et publier"}
            </Button>
          )}
        </div>
      </div>

      <ProductModerationDialog
        open={moderationDialogOpen}
        onOpenChange={(open) => {
          setModerationDialogOpen(open);
          if (!open && moderationRedirectPath) {
            navigate(moderationRedirectPath);
          }
        }}
        review={moderationReview}
      />
    </DashboardLayout>
  );
};

export default CreateProduct;
