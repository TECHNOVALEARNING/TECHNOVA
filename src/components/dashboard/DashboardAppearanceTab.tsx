import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Eye,
  RotateCcw,
  Save,
  Paintbrush,
  Type,
  MousePointerClick,
  ArrowUpDown,
  Star,
  ShoppingCart,
  Sparkles,
  Check,
  Package,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  Video,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isDirectVideo } from "@/lib/videoUtils";
import StoreSelector from "./StoreSelector";
import { useActiveStore } from "@/hooks/useActiveStore";

const FONTS = [
  { label: "Inter", value: "Inter" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Georgia", value: "Georgia" },
  { label: "Playfair Display", value: "Playfair Display" },
];

const translations = {
  fr: {
    viewStore: "Voir ma boutique",
    reset: "Réinitialiser",
    saving: "Enregistrement...",
    save: "Enregistrer",
    bannerTitle: "Bannière de la boutique",
    bannerDesc: "Image affichée en haut (recommandé : 1200×400)",
    bannerUploadClick: "Cliquez pour uploader une bannière",
    brandColorTitle: "Couleur de votre marque",
    brandColorDesc: "Utilisée pour les boutons, prix et accents",
    fontTitle: "Police d'écriture",
    buttonAnimTitle: "Animation du bouton d'achat",
    displayOptionsTitle: "Options d'affichage",
    showBuyBtnLabel: "Afficher le bouton d'achat",
    showBuyBtnDesc: "Bouton « Acheter » visible sur chaque carte produit",
    welcomeVideoTitle: "Vidéo de bienvenue",
    welcomeVideoDesc: "Configurez la vidéo d'accueil visible en bas de la section de bienvenue.",
    showWelcomeVideoLabel: "Afficher la vidéo de bienvenue",
    showWelcomeVideoDesc:
      "Activer ou désactiver l'affichage de la vidéo sur la page d'accueil publique",
    videoLinkLabel: "Lien de la vidéo (YouTube, Vimeo, MP4, etc.)",
    displayOrderTitle: "Ordre d'affichage",
    noStoreTitle: "Aucune boutique",
    noStoreDesc: "Créez votre première boutique dans l'onglet ",
    noStoreLinkText: "Mes Boutiques",
    saveSuccess: "Apparence sauvegardée !",
    saveError: "Erreur lors de la sauvegarde",
    uploadError: "Erreur lors de l'upload",
    bannerSuccess: "Bannière uploadée !",
    // Preview
    previewUrlPlaceholder: "votre-boutique.technova.app",
    previewDefaultStoreName: "Ma Boutique",
    previewTabProducts: "Produits",
    previewTabAbout: "À propos",
    previewTabContact: "Contact",
    previewDiscover: "Découvrez les produits de ",
    previewSearch: "🔍 Rechercher…",
    previewExampleProd: "Exemple de produit",
    previewOtherProd: "Autre produit",
    previewReviews: "0% (0 avis)",
    previewBuyBtn: "Acheter",
    previewPoweredBy: "Propulsé par",
    // Options lists
    colorBlue: "Bleu",
    colorEmerald: "Émeraude",
    colorOrange: "Orange",
    colorIndigo: "Indigo",
    colorPink: "Rose",
    colorYellow: "Jaune",
    colorRed: "Rouge",
    animNone: "Aucune",
    animPulse: "Pulse",
    animBounce: "Rebond",
    sortRecent: "Les plus récents en premier",
    sortRecentDesc: "Présentez vos nouveautés",
    sortAlpha: "Ordre alphabétique",
    sortAlphaDesc: "Produits dans l'ordre alphabétique",
    sortPriceDesc: "Les plus cher en premier",
    sortPriceDescDesc: "Valorisez vos produits haut de gamme",
    sortPriceAsc: "Moins cher en premier",
    sortPriceAscDesc: "Priorisez vos produits les plus abordables",
  },
  en: {
    viewStore: "View my shop",
    reset: "Reset",
    saving: "Saving...",
    save: "Save",
    bannerTitle: "Shop Banner",
    bannerDesc: "Image displayed at the top (recommended: 1200×400)",
    bannerUploadClick: "Click to upload a banner",
    brandColorTitle: "Brand Color",
    brandColorDesc: "Used for buttons, prices, and accents",
    fontTitle: "Typography / Font",
    buttonAnimTitle: "Buy button animation",
    displayOptionsTitle: "Display options",
    showBuyBtnLabel: "Show buy button",
    showBuyBtnDesc: "« Buy » button visible on each product card",
    welcomeVideoTitle: "Welcome Video",
    welcomeVideoDesc: "Configure the welcome video shown at the bottom of the welcome section.",
    showWelcomeVideoLabel: "Show welcome video",
    showWelcomeVideoDesc: "Enable or disable welcome video display on the public homepage",
    videoLinkLabel: "Video link (YouTube, Vimeo, MP4, etc.)",
    displayOrderTitle: "Display order",
    noStoreTitle: "No shop",
    noStoreDesc: "Create your first shop in the ",
    noStoreLinkText: "My Shops",
    saveSuccess: "Appearance saved!",
    saveError: "Error saving appearance",
    uploadError: "Error uploading banner",
    bannerSuccess: "Banner uploaded!",
    // Preview
    previewUrlPlaceholder: "your-shop.technova.app",
    previewDefaultStoreName: "My Shop",
    previewTabProducts: "Products",
    previewTabAbout: "About",
    previewTabContact: "Contact",
    previewDiscover: "Discover products from ",
    previewSearch: "🔍 Search…",
    previewExampleProd: "Example product",
    previewOtherProd: "Other product",
    previewReviews: "0% (0 reviews)",
    previewBuyBtn: "Buy",
    previewPoweredBy: "Powered by",
    // Options lists
    colorBlue: "Blue",
    colorEmerald: "Emerald",
    colorOrange: "Orange",
    colorIndigo: "Indigo",
    colorPink: "Pink",
    colorYellow: "Yellow",
    colorRed: "Red",
    animNone: "None",
    animPulse: "Pulse",
    animBounce: "Bounce",
    sortRecent: "Newest first",
    sortRecentDesc: "Showcase your latest items",
    sortAlpha: "Alphabetical order",
    sortAlphaDesc: "Products in alphabetical order",
    sortPriceDesc: "Most expensive first",
    sortPriceDescDesc: "Highlight premium products",
    sortPriceAsc: "Cheapest first",
    sortPriceAscDesc: "Prioritize affordable products",
  },
};

interface RealProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  type: string;
  description: string | null;
}

const DashboardAppearanceTab = () => {
  const { user, profile, isAdmin } = useAuth();
  const {
    stores,
    activeStore,
    activeStoreId,
    setActiveStoreId,
    updateStore,
    isLoading,
    hasStores,
  } = useActiveStore();

  const [brandColor, setBrandColor] = useState("#2563EB");
  const [font, setFont] = useState("Inter");
  const [buttonAnimation, setButtonAnimation] = useState("none");
  const [showBuyButton, setShowBuyButton] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");
  const [saving, setSaving] = useState(false);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const BRAND_COLORS = [
    { name: t.colorBlue, value: "#2563EB" },
    { name: t.colorEmerald, value: "#10B981" },
    { name: t.colorOrange, value: "#F97316" },
    { name: t.colorIndigo, value: "#6366F1" },
    { name: t.colorPink, value: "#EC4899" },
    { name: t.colorYellow, value: "#EAB308" },
    { name: t.colorRed, value: "#EF4444" },
  ];

  const BUTTON_ANIMATIONS = [
    { label: t.animNone, value: "none" },
    { label: t.animPulse, value: "pulse" },
    { label: t.animBounce, value: "bounce" },
  ];

  const SORT_OPTIONS = [
    { label: t.sortRecent, desc: t.sortRecentDesc, value: "recent", icon: Sparkles },
    { label: t.sortAlpha, desc: t.sortAlphaDesc, value: "alphabetical", icon: ArrowUpDown },
    { label: t.sortPriceDesc, desc: t.sortPriceDescDesc, value: "price_desc", icon: ArrowUpDown },
    { label: t.sortPriceAsc, desc: t.sortPriceAscDesc, value: "price_asc", icon: ArrowUpDown },
  ];

  useEffect(() => {
    if (activeStore) {
      setBrandColor(activeStore.brand_color || "#2563EB");
      setFont(activeStore.font || "Inter");
      setButtonAnimation(activeStore.button_animation || "none");
      setShowBuyButton(activeStore.show_buy_button ?? true);
      setSortOrder(activeStore.sort_order || "recent");
      setBannerUrl(activeStore.banner_url || null);

      const sections = Array.isArray(activeStore.layout_sections)
        ? activeStore.layout_sections
        : [];
      const videoSection = sections.find((s: any) => s.type === "video");
      setVideoUrl(videoSection?.config?.video_url || "");
      setShowVideo(videoSection?.enabled ?? false);
    }
  }, [activeStore]);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, original_price, thumbnail_url, type, description")
      .eq("creator_id", user!.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) setRealProducts(data as RealProduct[]);
  };

  const handleSave = async () => {
    if (!user || !activeStoreId) return;
    setSaving(true);
    try {
      const currentSections = Array.isArray(activeStore?.layout_sections)
        ? activeStore.layout_sections
        : [];
      let videoSectionExists = false;
      const newSections = currentSections.map((sec: any) => {
        if (sec.type === "video") {
          videoSectionExists = true;
          return {
            ...sec,
            enabled: showVideo,
            config: {
              ...sec.config,
              video_url: videoUrl,
              video_type:
                videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
                  ? "youtube"
                  : "direct",
            },
          };
        }
        return sec;
      });

      if (!videoSectionExists) {
        newSections.push({
          type: "video",
          enabled: showVideo,
          position: 6,
          config: {
            title: "Vidéo de bienvenue",
            video_url: videoUrl,
            video_type:
              videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
                ? "youtube"
                : "direct",
          },
        });
      }

      await updateStore.mutateAsync({
        brand_color: brandColor,
        font,
        button_animation: buttonAnimation,
        show_buy_button: showBuyButton,
        sort_order: sortOrder,
        banner_url: bannerUrl,
        layout_sections: newSections,
      } as any);

      await supabase
        .from("profiles")
        .update({
          store_brand_color: brandColor,
          store_font: font,
          store_button_animation: buttonAnimation,
          store_show_buy_button: showBuyButton,
          store_sort_order: sortOrder,
          store_banner_url: bannerUrl,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      toast.success(t.saveSuccess);
    } catch {
      toast.error(t.saveError);
    }
    setSaving(false);
  };

  const handleReset = () => {
    setBrandColor("#2563EB");
    setFont("Inter");
    setButtonAnimation("none");
    setShowBuyButton(true);
    setSortOrder("recent");
    setBannerUrl(null);
    setVideoUrl("");
    setShowVideo(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/banner-${activeStoreId}.${ext}`;
    const { error } = await supabase.storage
      .from("product-assets")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(t.uploadError);
      setUploadingBanner(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setBannerUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploadingBanner(false);
    toast.success(t.bannerSuccess);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // limit to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(lang === "fr" ? "La vidéo dépasse la limite autorisée de 50 Mo" : "Video size exceeds 50MB limit");
      return;
    }

    setUploadingVideo(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/welcome-video-${activeStoreId}.${ext}`;
    
    const { error } = await supabase.storage
      .from("product-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(lang === "fr" ? "Erreur lors du téléchargement de la vidéo" : "Error uploading video");
      setUploadingVideo(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setVideoUrl(urlData.publicUrl);
    setUploadingVideo(false);
    toast.success(lang === "fr" ? "Vidéo de bienvenue mise en ligne !" : "Welcome video uploaded successfully!");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (!hasStores) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{t.noStoreTitle}</p>
            <p className="text-xs text-muted-foreground">
              {t.noStoreDesc}
              <a href="/dashboard/stores" className="text-primary hover:underline">
                {t.noStoreLinkText}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  const storeSlug = activeStore?.slug;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Settings */}
      <div className="flex-1 max-w-2xl space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <StoreSelector
            stores={stores}
            activeStoreId={activeStoreId}
            onSelect={setActiveStoreId}
          />
          {storeSlug && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" /> {t.viewStore}
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> {t.reset}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? t.saving : t.save}
          </Button>
        </div>

        {/* Banner */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t.bannerTitle}</p>
              <p className="text-xs text-muted-foreground">{t.bannerDesc}</p>
            </div>
          </div>
          {bannerUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={bannerUrl} alt="Bannière" className="w-full aspect-[3/1] object-cover" />
              <button
                onClick={() => setBannerUrl(null)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 cursor-pointer transition-colors bg-secondary/30">
              {uploadingBanner ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-xs text-muted-foreground">{t.bannerUploadClick}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="sr-only"
                disabled={uploadingBanner}
              />
            </label>
          )}
        </div>

        {/* Brand Color */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Paintbrush className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t.brandColorTitle}</p>
              <p className="text-xs text-muted-foreground">{t.brandColorDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {BRAND_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setBrandColor(c.value)}
                className={cn(
                  "h-10 w-10 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background",
                  brandColor === c.value
                    ? "ring-foreground scale-110"
                    : "ring-transparent hover:scale-105",
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
            <label className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors">
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Font */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" />{" "}
            <p className="text-sm font-semibold text-foreground">{t.fontTitle}</p>
          </div>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Button Animation */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />{" "}
            <p className="text-sm font-semibold text-foreground">{t.buttonAnimTitle}</p>
          </div>
          <Select value={buttonAnimation} onValueChange={setButtonAnimation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUTTON_ANIMATIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">{t.displayOptionsTitle}</p>
          <ToggleOption
            icon={ShoppingCart}
            label={t.showBuyBtnLabel}
            desc={t.showBuyBtnDesc}
            checked={showBuyButton}
            onChange={setShowBuyButton}
          />
        </div>

        {/* Vidéo de bienvenue */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Video className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t.welcomeVideoTitle}</p>
              <p className="text-xs text-muted-foreground">{t.welcomeVideoDesc}</p>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Switch checked={showVideo} onCheckedChange={setShowVideo} />
                <div>
                  <p className="text-sm font-medium text-foreground">{t.showWelcomeVideoLabel}</p>
                  <p className="text-xs text-muted-foreground">{t.showWelcomeVideoDesc}</p>
                </div>
              </div>
            </div>
            {showVideo && (
              <div className="space-y-4 pt-2 border-t border-border mt-2 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    {t.videoLinkLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Ex: https://www.youtube.com/watch?v=9xwazD5SyVg"
                      className="bg-background flex-1"
                    />
                    <label className="flex items-center justify-center h-10 px-4 border border-input rounded-md bg-background hover:bg-muted/50 cursor-pointer text-xs font-medium gap-2 shrink-0 transition-colors">
                      {uploadingVideo ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>
                        {uploadingVideo
                          ? (lang === "fr" ? "Envoi..." : "Uploading...")
                          : (lang === "fr" ? "Uploader de mon PC" : "Upload from PC")}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {videoUrl && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      {isDirectVideo(videoUrl) ? (
                        <span className="text-green-500 font-medium flex items-center gap-1">✓ {lang === "fr" ? "Fichier vidéo hébergé" : "Hosted video file"}</span>
                      ) : (
                        <span>{lang === "fr" ? "Lien externe configuré" : "External link configured"}</span>
                      )}
                      <button
                        onClick={() => setVideoUrl("")}
                        className="text-red-500 hover:underline flex items-center gap-0.5"
                      >
                        <X className="h-3 w-3" /> {lang === "fr" ? "Effacer" : "Clear"}
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {lang === "fr"
                      ? "Vous pouvez entrer un lien (YouTube, Vimeo, etc.) OU cliquer sur le bouton à droite pour téléverser un fichier de votre ordinateur (max 50 Mo)."
                      : "You can enter a link (YouTube, Vimeo, etc.) OR click the button on the right to upload a file from your computer (50MB max)."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sort Order */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">{t.displayOrderTitle}</p>
          <div className="space-y-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortOrder(opt.value)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left",
                  sortOrder === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <opt.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {sortOrder === opt.value && (
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="hidden lg:block w-[420px] shrink-0">
        <div className="sticky top-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-muted px-3 py-2 text-[10px] text-muted-foreground truncate border-b border-border flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-destructive/50" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <div className="h-2 w-2 rounded-full bg-green-500/50" />
              </div>
              <span>
                {storeSlug ? `https://technova.com/store/${storeSlug}` : t.previewUrlPlaceholder}
              </span>
            </div>
            <div className="h-[650px] overflow-y-auto">
              <StorePreview
                storeName={activeStore?.name || profile?.display_name || t.previewDefaultStoreName}
                storeDescription={activeStore?.description || ""}
                logoUrl={activeStore?.logo_url || profile?.avatar_url || ""}
                brandColor={brandColor}
                font={font}
                showBuyButton={showBuyButton}
                products={realProducts}
                bannerUrl={bannerUrl}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ToggleOption({
  icon: Icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: any;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <Switch checked={checked} onCheckedChange={onChange} />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StorePreview({
  storeName,
  storeDescription,
  logoUrl,
  brandColor,
  font,
  showBuyButton,
  products,
  bannerUrl,
  t,
}: {
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  brandColor: string;
  font: string;
  showBuyButton: boolean;
  products: RealProduct[];
  bannerUrl: string | null;
  t: any;
}) {
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: "1",
            title: t.previewExampleProd,
            price: 5000,
            original_price: 8000,
            thumbnail_url: null,
            type: "file",
            description: null,
          },
          {
            id: "2",
            title: t.previewOtherProd,
            price: 3000,
            original_price: null,
            thumbnail_url: null,
            type: "course",
            description: null,
          },
        ];

  return (
    <div style={{ fontFamily: font }} className="bg-white min-h-full text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white overflow-hidden"
            style={{ backgroundColor: brandColor }}
          >
            {logoUrl ? (
              <img src={logoUrl} className="h-full w-full object-cover" />
            ) : (
              storeName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-bold text-gray-900 text-[10px]">{storeName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[8px] font-medium text-gray-900"
            style={{ borderBottom: `1px solid ${brandColor}` }}
          >
            {t.previewTabProducts}
          </span>
          <span className="text-[8px] text-gray-400">{t.previewTabAbout}</span>
          <span className="text-[8px] text-gray-400">{t.previewTabContact}</span>
        </div>
      </div>

      {/* Title */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-bold text-gray-900">{`${t.previewDiscover}${storeName}`}</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="h-5 rounded-md border border-gray-200 bg-gray-50 flex items-center px-2">
          <span className="text-[7px] text-gray-400">{t.previewSearch}</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-3 pb-4 grid grid-cols-2 gap-3">
        {displayProducts.slice(0, 6).map((p) => {
          const disc =
            p.original_price && p.original_price > p.price
              ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
              : null;
          return (
            <div key={p.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-gray-200" />
                )}
                {disc && (
                  <span
                    className="absolute top-1 right-1 text-[6px] font-bold px-1 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {disc}% OFF
                  </span>
                )}
              </div>
              <div className="p-1.5 space-y-0.5">
                <p className="text-[8px] font-semibold text-gray-900 line-clamp-2">{p.title}</p>
                <p className="text-[7px] text-gray-400">{t.previewReviews}</p>
                <div className="flex items-baseline gap-1">
                  {p.original_price && p.original_price > p.price && (
                    <span className="text-[6px] line-through text-gray-300">
                      {p.original_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[8px] font-bold" style={{ color: brandColor }}>
                    {p.price.toLocaleString()} FCFA
                  </span>
                </div>
                {showBuyButton && (
                  <button
                    className="w-full text-[7px] text-white py-1 font-medium rounded-md"
                    style={{ backgroundColor: brandColor }}
                  >
                    {t.previewBuyBtn}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-2 text-center">
        <span className="text-[7px] text-gray-300">
          {t.previewPoweredBy}{" "}
          <span className="font-medium" style={{ color: brandColor }}>
            TECHNOVA
          </span>
        </span>
      </div>
    </div>
  );
}

export default DashboardAppearanceTab;
