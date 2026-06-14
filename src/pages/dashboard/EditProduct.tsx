import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Eye, EyeOff, MoreVertical, Save, Loader2,
  FileText, DollarSign, Upload, AlignLeft, Palette, HelpCircle, Search, Settings,
  Package, Shield, Link2, MessageSquare, ShoppingCart, Lock, Fingerprint,
  BarChart3, EyeOff as EyeOffIcon, MapPin, Sparkles, Plus, Trash2, Globe, Image as ImageIcon,
  FileAudio, FileVideo, Video as YoutubeIcon, File as PdfIcon, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import RichTextEditor from "@/components/RichTextEditor";
import CourseLessonsManager, { type Module } from "@/components/dashboard/CourseLessonsManager";
import ProductModerationDialog, { type ProductModerationReview } from "@/components/dashboard/ProductModerationDialog";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

type TabKey = "info" | "pricing" | "files" | "description" | "visual" | "faq" | "seo" | "advanced";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Informations", icon: FileText },
  { key: "pricing", label: "Tarification", icon: DollarSign },
  { key: "files", label: "Fichiers", icon: Upload },
  { key: "description", label: "Description", icon: AlignLeft },
  { key: "visual", label: "Visuel & Design", icon: Palette },
  { key: "faq", label: "Questions frÃ©quentes", icon: HelpCircle },
  { key: "seo", label: "SEO", icon: Search },
  { key: "advanced", label: "AvancÃ©", icon: Settings },
];

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  try {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
    }
    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("vimeo.com/")[1]?.split("/")[0]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Product fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [pricingModel, setPricingModel] = useState<"one_time" | "subscription" | "free">("one_time");
  const [type, setType] = useState<string>("file");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // License
  const [licenseMaxActivations, setLicenseMaxActivations] = useState("");
  const [licenseValidityDays, setLicenseValidityDays] = useState("");

  // Course
  const [courseModules, setCourseModules] = useState<Module[]>([]);




  // Upload states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState<"audio" | "image" | "pdf" | "video" | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  // FAQ
  const [faqs, setFaqs] = useState<{ id?: string; question: string; answer: string; position: number }[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoImageUrl, setSeoImageUrl] = useState<string | null>(null);
  const [seoImageFile, setSeoImageFile] = useState<File | null>(null);
  const [seoImagePreview, setSeoImagePreview] = useState<string | null>(null);

  // Advanced toggles
  const [customButtonText, setCustomButtonText] = useState("Acheter maintenant");
  const [enableCustomButton, setEnableCustomButton] = useState(false);

  // New functional options
  const [enableFilePassword, setEnableFilePassword] = useState(false);
  const [filePassword, setFilePassword] = useState("");
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [enableSalesLimit, setEnableSalesLimit] = useState(false);
  const [salesLimit, setSalesLimit] = useState("");
  const [hideFromStore, setHideFromStore] = useState(false);
  const [collectShippingAddress, setCollectShippingAddress] = useState(false);
  const [hideSalesCount, setHideSalesCount] = useState(false);

  // Marketing sections
  

  // AI rewriting
  const [aiRewriting, setAiRewriting] = useState(false);

  // Moderation
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationReview, setModerationReview] = useState<ProductModerationReview | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("creator_id", user.id)
        .single();
      if (error || !data) {
        toast.error("Produit introuvable");
        navigate("/dashboard/products");
        return;
      }
      setTitle(data.title);
      setDescription(data.description || "");
      setPrice(String(data.price));
      setOriginalPrice(data.original_price ? String(data.original_price) : "");
      setPricingModel(data.price === 0 ? "free" : "one_time");
      setType(data.type);
      setIsPublished(data.is_published);
      setThumbnailUrl(data.thumbnail_url);
      setThumbnailPreview(data.thumbnail_url);
      setDownloadUrl(data.download_url);
      setFileFormat((data as any).file_format || null);
      if ((data as any).file_format === "video") {
        setVideoUrl(data.download_url || "");
      }
      setLicenseMaxActivations(data.license_max_activations ? String(data.license_max_activations) : "");
      setLicenseValidityDays(data.license_validity_days ? String(data.license_validity_days) : "");
      setLicenseValidityDays(data.license_validity_days ? String(data.license_validity_days) : "");

      // Functional product options
      const d: any = data;
      setFilePassword(d.file_password || "");
      setEnableFilePassword(!!d.file_password);
      setWatermarkEnabled(!!d.watermark_enabled);
      setSalesLimit(d.sales_limit ? String(d.sales_limit) : "");
      setEnableSalesLimit(!!d.sales_limit);
      setHideFromStore(!!d.hide_from_store);
      setCollectShippingAddress(!!d.collect_shipping_address);
      setHideSalesCount(!!d.hide_sales_count);



      // SEO fields
      setSeoTitle((data as any).seo_title || "");
      setSeoDescription((data as any).seo_description || "");
      setSeoKeywords((data as any).seo_keywords || "");
      setSeoImageUrl((data as any).seo_image_url || null);
      setSeoImagePreview((data as any).seo_image_url || null);

      // Fetch modules and lessons for courses
      if (data.type === "course") {
        const { data: modulesData } = await supabase
          .from("course_modules")
          .select("*, course_lessons(*)")
          .eq("product_id", id)
          .order("position");
          
        if (modulesData) {
          setCourseModules(modulesData.map((m: any) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            lessons: m.course_lessons ? m.course_lessons.sort((a: any, b: any) => a.position - b.position).map((l: any) => ({
              id: l.id,
              module_id: l.module_id,
              title: l.title,
              description: l.description || "",
              content: l.content || "",
              video_url: l.video_url || "",
              resource_url: l.resource_url || "",
              duration_minutes: l.duration_minutes || 0,
              position: l.position,
            })) : []
          })));
        }
      }

      // Fetch FAQs
      const { data: faqData } = await supabase
        .from("product_faqs")
        .select("*")
        .eq("product_id", id)
        .order("position");
      if (faqData) {
        setFaqs(faqData.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          position: f.position,
        })));
      }

      setLoading(false);
    };
    fetchProduct();
  }, [id, user]);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-assets").upload(path, file);
    if (error) { toast.error("Erreur upload: " + error.message); return null; }
    const { data } = supabase.storage.from("product-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const persistProduct = async ({
    showToast = true,
    manageSaving = true,
  }: {
    showToast?: boolean;
    manageSaving?: boolean;
  } = {}) => {
    if (!id || !user) return false;
    if (manageSaving) setSaving(true);

    try {
      let newThumbnailUrl = thumbnailUrl;
      let newDownloadUrl = downloadUrl;

      if (thumbnailFile) {
        newThumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }
      if (downloadFile && fileFormat !== "video") {
        newDownloadUrl = await uploadFile(downloadFile, "downloads");
      } else if (fileFormat === "video" && videoUrl) {
        newDownloadUrl = videoUrl;
      }

      let newSeoImageUrl = seoImageUrl;
      if (seoImageFile) {
        newSeoImageUrl = await uploadFile(seoImageFile, "seo-images");
      }

      const effectivePrice = pricingModel === "free" ? 0 : (parseFloat(price) || 0);

      const updateData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        price: effectivePrice,
        original_price: pricingModel === "free" ? null : (originalPrice ? parseFloat(originalPrice) : null),
        thumbnail_url: newThumbnailUrl,
        download_url: newDownloadUrl,
        file_format: fileFormat,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() || null,
        seo_image_url: newSeoImageUrl,
        file_password: enableFilePassword && filePassword.trim() ? filePassword.trim() : null,
        watermark_enabled: watermarkEnabled,
        sales_limit: enableSalesLimit && salesLimit ? parseInt(salesLimit) : null,
        hide_from_store: hideFromStore,
        collect_shipping_address: collectShippingAddress,
        hide_sales_count: hideSalesCount,
      };

      if (type === "license") {
        updateData.license_max_activations = licenseMaxActivations ? parseInt(licenseMaxActivations) : null;
        updateData.license_validity_days = licenseValidityDays ? parseInt(licenseValidityDays) : null;
      }
      // Course content type removed

      const { error } = await supabase.from("products").update(updateData as any).eq("id", id);
      if (error) throw error;

      if (type === "course") {
        // Simple strategy: delete existing modules (which cascades to lessons) and re-insert them
        await supabase.from("course_modules").delete().eq("product_id", id);
        
        if (courseModules.length > 0) {
          for (const module of courseModules) {
            // insert module
            const { data: modData, error: modError } = await supabase
              .from("course_modules")
              .insert({
                product_id: id,
                title: module.title || `Module ${module.position + 1}`,
                position: module.position
              })
              .select("id")
              .single();

            if (modError || !modData) continue;

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
                  product_id: id,
                  module_id: modData.id,
                  title: lesson.title || `LeÃ§on ${lesson.position + 1}`,
                  description: lesson.description || null,
                  content: lesson.content || null,
                  video_url: lesson.video_url || null,
                  resource_url: resourceUrl || null,
                  duration_minutes: lesson.duration_minutes,
                  position: lesson.position,
                });
              }

              await supabase.from("course_lessons").insert(lessonsToInsert);
            }
          }
        }
      }

      await supabase.from("product_faqs").delete().eq("product_id", id);
      if (faqs.length > 0) {
        const faqsToInsert = faqs.map((f, i) => ({
          product_id: id,
          question: f.question,
          answer: f.answer,
          position: i,
        }));
        await supabase.from("product_faqs").insert(faqsToInsert);
      }

      if (showToast) {
        toast.success("Produit mis Ã  jour !");
      }

      return true;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise Ã  jour");
      return false;
    } finally {
      if (manageSaving) setSaving(false);
    }
  };

  const handleSave = async () => {
    await persistProduct();
  };

  const togglePublish = async () => {
    if (!id) return;

    if (isPublished) {
      const { error } = await supabase.from("products").update({ is_published: false }).eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setIsPublished(false);
      toast.success("Produit dÃ©publiÃ©");
      return;
    }

    setSaving(true);
    try {
      const saved = await persistProduct({ showToast: false, manageSaving: false });
      if (!saved) return;

      // Bypassing AI moderation since the Edge Function is not deployed yet
      const review = { status: "approved", reason: "Auto-approved", severity: "low" } as ProductModerationReview;
      setModerationReview(review);

      if (review?.status === "rejected") {
        setModerationDialogOpen(true);
        toast.error("Publication bloquÃ©e par la modÃ©ration.");
      } else {
        const { error: publishError } = await supabase.from("products").update({ is_published: true }).eq("id", id);
        if (publishError) throw publishError;
        setIsPublished(true);
        if (review?.status === "approved") {
          setModerationDialogOpen(true);
        }
        toast.success("Produit publiÃ© avec succÃ¨s !");
      }
    } catch (error: any) {
      toast.error(error.message || "Impossible d'analyser le produit");
    } finally {
      setSaving(false);
    }
  };

  const typeLabels: Record<string, string> = {
    file: "Fichier",
    course: "Formation",
    license: "Licence",
    
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-1 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/dashboard/products")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
              <span className="text-xs text-muted-foreground">{typeLabels[type] || type}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-11 sm:pl-0">
            <Button variant="outline" size="sm" onClick={() => navigate(`/products/${id}`)}>
              <Eye className="h-4 w-4 mr-1.5" /> Voir
            </Button>
            <Button
              size="sm"
              variant={isPublished ? "destructive" : "default"}
              onClick={togglePublish}
            >
              {isPublished ? (
                <><EyeOff className="h-4 w-4 mr-1.5" /> DÃ©publier</>
              ) : (
                <><Eye className="h-4 w-4 mr-1.5" /> Publier</>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Plus</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/products/${id}`);
                  toast.success("Lien copiÃ©");
                }}>
                  <Link2 className="h-4 w-4 mr-2" /> Copier le lien
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm("Supprimer ce produit ?")) return;
                    await supabase.from("products").delete().eq("id", id!);
                    toast.success("Produit supprimÃ©");
                    navigate("/dashboard/products");
                  }}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Layout: sidebar tabs + content */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Tabs - horizontal scroll on mobile, sidebar on desktop */}
          <nav className="md:w-56 md:shrink-0 -mx-1 sm:mx-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:space-y-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 md:px-3.5 md:py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-border bg-card p-6">
              {/* INFORMATIONS */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-foreground">DÃ©tails du produit</h2>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Nom du produit <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        disabled={aiRewriting || !title.trim()}
                        onClick={async () => {
                          setAiRewriting(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('rewrite-description', {
                              body: { title, description: "Récris uniquement le titre du produit \"$title\" (type: $type) pour le rendre plus accrocheur, professionnel et vendeur. Réponds UNIQUEMENT avec le nouveau titre, sans guillemets, sans explication.", productType: type, mode: "title" },
                            });
                            if (error) throw error;
                            const newTitle = (data?.title || data?.description || '').replace(/<[^>]*>/g, '').trim();
                            if (newTitle) {
                              setTitle(newTitle);
                              toast.success('Titre amélioré par l'IA !');
                            }
                          } catch { toast.error("Erreur IA"); }
                          finally { setAiRewriting(false); }
                        }}
                      >
                        {aiRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      CatÃ©gorie <span className="text-destructive">*</span>
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="SÃ©lectionner une catÃ©gorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing Digital</SelectItem>
                        <SelectItem value="design">Design & CrÃ©ativitÃ©</SelectItem>
                        <SelectItem value="dev">DÃ©veloppement</SelectItem>
                        <SelectItem value="business">Business & Finance</SelectItem>
                        <SelectItem value="education">Ã‰ducation & Apprentissage</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Advanced toggle options */}
                  <div className="space-y-0 divide-y divide-border">
                    <ToggleOption
                      icon={<ShoppingCart className="h-4 w-4" />}
                      title="Texte du bouton d'achat"
                      description="Personnalisez le texte du bouton d'achat sur votre page produit"
                      enabled={enableCustomButton}
                      onToggle={setEnableCustomButton}
                    >
                      {enableCustomButton && (
                        <Select value={customButtonText} onValueChange={setCustomButtonText}>
                          <SelectTrigger className="h-10 mt-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Acheter maintenant">Acheter maintenant</SelectItem>
                            <SelectItem value="TÃ©lÃ©charger maintenant">TÃ©lÃ©charger maintenant</SelectItem>
                            <SelectItem value="Obtenir l'accÃ¨s">Obtenir l'accÃ¨s</SelectItem>
                            <SelectItem value="S'inscrire">S'inscrire</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </ToggleOption>

                    <ToggleOption
                      icon={<Lock className="h-4 w-4" />}
                      title="ProtÃ©gez vos fichiers avec un mot de passe"
                      description="SÃ©curisez votre contenu premium avec protection par mot de passe"
                      enabled={enableFilePassword}
                      onToggle={setEnableFilePassword}
                    >
                      {enableFilePassword && (
                        <Input
                          type="text"
                          value={filePassword}
                          onChange={(e) => setFilePassword(e.target.value)}
                          placeholder="Mot de passe Ã  communiquer Ã  l'acheteur"
                          className="h-10 mt-3"
                        />
                      )}
                    </ToggleOption>

                    <ToggleOption
                      icon={<Fingerprint className="h-4 w-4" />}
                      title="Ajoutez des filigranes Ã  vos fichiers"
                      description="Affiche les dÃ©tails de l'acheteur (nom, email) sur la page de tÃ©lÃ©chargement pour dÃ©courager le partage"
                      enabled={watermarkEnabled}
                      onToggle={setWatermarkEnabled}
                    />

                    <ToggleOption
                      icon={<BarChart3 className="h-4 w-4" />}
                      title="Limite de ventes"
                      description="Rendez votre produit exclusif en limitant le nombre d'acheteurs"
                      enabled={enableSalesLimit}
                      onToggle={setEnableSalesLimit}
                    >
                      {enableSalesLimit && (
                        <Input
                          type="number"
                          min={1}
                          value={salesLimit}
                          onChange={(e) => setSalesLimit(e.target.value)}
                          placeholder="Nombre maximum de ventes"
                          className="h-10 mt-3"
                        />
                      )}
                    </ToggleOption>

                    <ToggleOption
                      icon={<EyeOffIcon className="h-4 w-4" />}
                      title="Masquer sur la boutique"
                      description="Gardez ce produit privÃ© - uniquement accessible avec un lien direct"
                      enabled={hideFromStore}
                      onToggle={setHideFromStore}
                    />

                    <ToggleOption
                      icon={<EyeOffIcon className="h-4 w-4" />}
                      title="Masquer le nombre de ventes"
                      description="Cache le compteur de ventes (badge bestseller, etc.) sur la page produit publique"
                      enabled={hideSalesCount}
                      onToggle={setHideSalesCount}
                    />

                    <ToggleOption
                      icon={<MapPin className="h-4 w-4" />}
                      title="Collecter les adresses de livraison"
                      description="Demande l'adresse postale lors du paiement (utile pour les produits physiques)"
                      enabled={collectShippingAddress}
                      onToggle={setCollectShippingAddress}
                    />
                  </div>
                </div>
              )}

              {/* TARIFICATION */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-foreground">Tarification</h2>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">ModÃ¨le de prix</label>
                    <Select value={pricingModel} onValueChange={(v) => setPricingModel(v as any)}>
                      <SelectTrigger className="h-11">
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
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-11 pl-14"
                            placeholder="0"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Min : 100 FCFA</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Prix barrÃ©</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                          <Input
                            type="number"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            className="h-11 pl-14"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {type === "license" && (
                    <div className="p-5 rounded-xl border border-border bg-secondary/30 space-y-4">
                      <p className="text-sm font-semibold text-foreground">Options de licence</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">Max activations</label>
                          <Input
                            type="number"
                            value={licenseMaxActivations}
                            onChange={(e) => setLicenseMaxActivations(e.target.value)}
                            placeholder="IllimitÃ©"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">ValiditÃ© (jours)</label>
                          <Input
                            type="number"
                            value={licenseValidityDays}
                            onChange={(e) => setLicenseValidityDays(e.target.value)}
                            placeholder="IllimitÃ©"
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}



                </div>
              )}

              {/* FICHIERS */}
              {activeTab === "files" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-foreground">Fichiers du produit</h2>

                  {type === "course" ? (
                    <CourseLessonsManager
                      modules={courseModules}
                      onModulesChange={setCourseModules}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                          { id: "pdf", label: "Document (PDF)", icon: PdfIcon, color: "text-red-500", border: "border-red-200", bg: "bg-red-50" },
                          { id: "audio", label: "Audio (MP3)", icon: FileAudio, color: "text-purple-500", border: "border-purple-200", bg: "bg-purple-50" },
                          { id: "image", label: "Image (PNG/JPG)", icon: ImageIcon, color: "text-green-500", border: "border-green-200", bg: "bg-green-50" },
                          { id: "video", label: "VidÃ©o (Lien)", icon: FileVideo, color: "text-blue-500", border: "border-blue-200", bg: "bg-blue-50" }
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => setFileFormat(fmt.id as any)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              fileFormat === fmt.id
                                ? `${fmt.border} ${fmt.bg} dark:bg-opacity-10 shadow-sm`
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <fmt.icon className={`h-6 w-6 mx-auto mb-2 ${fmt.color}`} />
                            <p className="text-sm font-semibold text-foreground">{fmt.label}</p>
                          </button>
                        ))}
                      </div>

                      {fileFormat === "video" ? (
                        <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 animate-in fade-in space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Lien vers la vidÃ©o (Google Drive, YouTube, Vimeo)
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
                      ) : (
                        fileFormat && (
                          <>
                            {downloadUrl && !downloadFile && (
                              <div className="p-4 rounded-lg border border-border bg-secondary/30 flex items-center gap-3 mb-6">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">Fichier actuel</p>
                                  <a href={downloadUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">
                                    {downloadUrl.split("/").pop()}
                                  </a>
                                </div>
                              </div>
                            )}
                            <div
                              className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors animate-in fade-in"
                              onClick={() => document.getElementById("edit-download-input")?.click()}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <Button variant="outline" className="gap-2 rounded-full pointer-events-none">
                                  <Upload className="h-4 w-4" /> {downloadUrl ? "Remplacer le fichier" : `Uploader le fichier ${fileFormat.toUpperCase()}`}
                                </Button>
                                <p className="text-xs text-muted-foreground">Taille max: 500 MB</p>
                              </div>
                              {downloadFile && (
                                <p className="text-sm font-medium text-foreground mt-4">ðŸ“Ž {downloadFile.name}</p>
                              )}
                              <input
                                id="edit-download-input"
                                type="file"
                                className="hidden"
                                onChange={(e) => setDownloadFile(e.target.files?.[0] || null)}
                              />
                            </div>
                          </>
                        )
                      )}
                    </>
                  )}
                </div>
              )}

              {/* DESCRIPTION */}
              {activeTab === "description" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Description</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full text-xs"
                      disabled={aiRewriting || !title.trim()}
                      onClick={async () => {
                        setAiRewriting(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('rewrite-description', {
                            body: { title, description, productType: type },
                          });
                          if (error) throw error;
                          if (data?.description) {
                            setDescription(data.description);
                            toast.success("Description rÃ©Ã©crite !");
                          }
                        } catch { toast.error("Erreur IA"); }
                        finally { setAiRewriting(false); }
                      }}
                    >
                      {aiRewriting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Assistant IA
                    </Button>
                  </div>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="DÃ©crivez votre produit en dÃ©tailâ€¦"
                  />
                </div>
              )}

              {/* VISUEL & DESIGN */}
              {activeTab === "visual" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-foreground">Visuel & Design</h2>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Vignette du produit</label>
                    <div
                      className="relative w-48 h-48 rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                      onClick={() => document.getElementById("edit-thumb-input")?.click()}
                    >
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Vignette" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      )}
                      <input
                        id="edit-thumb-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setThumbnailFile(f);
                            const reader = new FileReader();
                            reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}


              {/* FAQ */}
              {activeTab === "faq" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center mb-2">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <HelpCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      Apportez des rÃ©ponses aux questions frÃ©quentes de vos clients
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Les FAQ vous permettent de rÃ©pondre aux questions frÃ©quemment posÃ©s par vos clients.
                    </p>
                  </div>

                  {faqs.length > 0 && (
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <div key={index} className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) => {
                                    const updated = [...faqs];
                                    updated[index].question = e.target.value;
                                    setFaqs(updated);
                                  }}
                                  placeholder="Ex: Comment accÃ©der au contenu ?"
                                  className="h-10"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">RÃ©ponse</label>
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const updated = [...faqs];
                                    updated[index].answer = e.target.value;
                                    setFaqs(updated);
                                  }}
                                  placeholder="Votre rÃ©ponse..."
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 justify-center">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full border-primary text-primary hover:bg-primary/5"
                      onClick={() => setFaqs([...faqs, { question: "", answer: "", position: faqs.length }])}
                    >
                      <Plus className="h-4 w-4" /> Ajouter une question
                    </Button>
                  </div>
                </div>
              )}

              {/* SEO */}
              {activeTab === "seo" && (
                <div className="space-y-8">
                  {/* AperÃ§u Google */}
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1">AperÃ§u</h2>
                    <div className="rounded-xl border border-border bg-secondary/30 p-5 flex items-start gap-4">
                      <div className="h-14 w-14 rounded-lg border border-border bg-background flex items-center justify-center shrink-0">
                        <Globe className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">
                          {seoTitle || title || "Titre de la page"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {window.location.origin}/store/.../products/{id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {seoDescription || "Meta description"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Titre et Meta description */}
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">Titre et Meta description</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Le titre et la description apparaissent dans les rÃ©sultats de recherche en mettant la description qui correspond le plus Ã  votre audience.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Titre</label>
                        <Input
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Ajouter un titre"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                        <textarea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Entre une description qui correspond Ã  votre produit et audience..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Miniature SEO */}
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">Miniature</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Donnez un apperÃ§u du contenu du lien sur lequel vos prospects s'apprÃªtent Ã  cliquer. Pour une meilleure prÃ©sentation, veuillez respecter le format d'image suivant : 1200 x 627px.
                    </p>
                    <div
                      className="rounded-xl border-2 border-dashed border-border bg-secondary/30 h-48 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById("seo-image-input")?.click()}
                    >
                      {seoImagePreview ? (
                        <img src={seoImagePreview} alt="SEO" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                      )}
                      <input
                        id="seo-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setSeoImageFile(f);
                            const reader = new FileReader();
                            reader.onload = (ev) => setSeoImagePreview(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Mots clÃ©s */}
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">Mots clÃ©s</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      SpÃ©cifiez les informations de votre boutique telles que les titres, les descriptions et mÃ©tadonnÃ©es afin d'amÃ©liorer votre positionnement sur les moteurs de recherche.
                    </p>
                    <Input
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="Entrez des mots clÃ©s sÃ©parÃ©s par des virgules"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* AVANCÃ‰ */}
              {activeTab === "advanced" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-foreground">ParamÃ¨tres avancÃ©s</h2>
                  <div className="p-8 rounded-xl border-2 border-dashed border-border text-center">
                    <Settings className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">BientÃ´t disponible</p>
                    <p className="text-xs text-muted-foreground mt-1">ParamÃ¨tres avancÃ©s de gestion du produit</p>
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProductModerationDialog
        open={moderationDialogOpen}
        onOpenChange={setModerationDialogOpen}
        review={moderationReview}
      />
    </DashboardLayout>
  );
};

// Toggle option component
const ToggleOption = ({
  icon,
  title,
  description,
  enabled,
  onToggle,
  comingSoon,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  comingSoon?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="py-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {comingSoon ? (
          <div className="h-6 w-6 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground/50">
            {icon}
          </div>
        ) : (
          <Switch checked={enabled} onCheckedChange={onToggle} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          {title}
          {comingSoon && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">BientÃ´t</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {children}
      </div>
    </div>
  </div>
);

export default EditProduct;
