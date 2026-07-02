import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Music2, BarChart3, Save, Info } from "lucide-react";

const translations = {
  fr: {
    fbPixelError: "L'ID du pixel Facebook doit être un nombre de 10 à 20 chiffres",
    saveError: "Erreur lors de la sauvegarde",
    saveSuccess: "Pixels sauvegardés !",
    howItWorksTitle: "Comment ça marche ?",
    howItWorksDesc:
      "Ajoutez vos identifiants de pixels publicitaires ci-dessous. Les événements suivants seront automatiquement suivis sur votre boutique :",
    pageViewDesc: "Quand un visiteur arrive sur votre boutique",
    viewContentDesc: "Quand un visiteur voit un produit",
    addToCartDesc: 'Quand un visiteur clique sur "Acheter"',
    purchaseDesc: "Après un achat réussi",
    fbPixelTitle: "Facebook / Meta Pixel",
    fbPixelDesc: "Suivez les conversions de vos publicités Facebook & Instagram",
    fbPixelHelp: "Trouvez votre Pixel ID dans le ",
    metaEventsManager: "Gestionnaire d'événements Meta",
    tiktokPixelTitle: "TikTok Pixel",
    tiktokPixelDesc: "Suivez les conversions de vos campagnes TikTok Ads",
    tiktokPixelHelp: "Trouvez votre Pixel ID dans le ",
    googleAdsTitle: "Google Ads (gtag)",
    googleAdsDesc: "Suivez les conversions de vos publicités Google",
    googleAdsConversionId: "ID de conversion",
    googleAdsHelp: "Trouvez votre ID dans ",
    googleAdsToolsPath: " → Outils → Conversions",
    saving: "Enregistrement...",
    saveBtn: "Enregistrer les pixels",
  },
  en: {
    fbPixelError: "The Facebook Pixel ID must be a number of 10 to 20 digits",
    saveError: "Error saving changes",
    saveSuccess: "Pixels saved!",
    howItWorksTitle: "How does it work?",
    howItWorksDesc:
      "Add your ad pixel identifiers below. The following events will be automatically tracked on your shop:",
    pageViewDesc: "When a visitor lands on your shop",
    viewContentDesc: "When a visitor views a product",
    addToCartDesc: 'When a visitor clicks "Buy"',
    purchaseDesc: "After a successful purchase",
    fbPixelTitle: "Facebook / Meta Pixel",
    fbPixelDesc: "Track conversions from your Facebook & Instagram ads",
    fbPixelHelp: "Find your Pixel ID in the ",
    metaEventsManager: "Meta Events Manager",
    tiktokPixelTitle: "TikTok Pixel",
    tiktokPixelDesc: "Track conversions from your TikTok Ads campaigns",
    tiktokPixelHelp: "Find your Pixel ID in the ",
    googleAdsTitle: "Google Ads (gtag)",
    googleAdsDesc: "Track conversions from your Google ads",
    googleAdsConversionId: "Conversion ID",
    googleAdsHelp: "Find your ID in ",
    googleAdsToolsPath: " → Tools → Conversions",
    saving: "Saving...",
    saveBtn: "Save pixels",
  },
};

const DashboardPixelsTab = () => {
  const { user, refreshProfile } = useAuth();
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [saving, setSaving] = useState(false);

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        const d = data as any;
        setFacebookPixelId(d.facebook_pixel_id || "");
        setTiktokPixelId(d.tiktok_pixel_id || "");
        setGoogleAdsId(d.google_ads_id || "");
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Basic validation
    const fbClean = facebookPixelId.trim();
    const ttClean = tiktokPixelId.trim();
    const gaClean = googleAdsId.trim();

    if (fbClean && !/^\d{10,20}$/.test(fbClean)) {
      toast.error(t.fbPixelError);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        facebook_pixel_id: fbClean || null,
        tiktok_pixel_id: ttClean || null,
        google_ads_id: gaClean || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error(t.saveError);
    } else {
      toast.success(t.saveSuccess);
      refreshProfile();
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-medium text-foreground mb-1">{t.howItWorksTitle}</p>
            <p>{t.howItWorksDesc}</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                • <strong>PageView</strong> — {t.pageViewDesc}
              </li>
              <li>
                • <strong>ViewContent</strong> — {t.viewContentDesc}
              </li>
              <li>
                • <strong>AddToCart</strong> — {t.addToCartDesc}
              </li>
              <li>
                • <strong>Purchase</strong> — {t.purchaseDesc}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t.fbPixelTitle}</p>
            <p className="text-xs text-muted-foreground">{t.fbPixelDesc}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Pixel ID</label>
          <Input
            value={facebookPixelId}
            onChange={(e) => setFacebookPixelId(e.target.value)}
            placeholder="Ex: 1234567890123456"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t.fbPixelHelp}
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t.metaEventsManager}
            </a>
          </p>
        </div>
      </div>

      {/* TikTok Pixel */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Music2 className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t.tiktokPixelTitle}</p>
            <p className="text-xs text-muted-foreground">{t.tiktokPixelDesc}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Pixel ID</label>
          <Input
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value)}
            placeholder="Ex: CXXXXXXXXXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t.tiktokPixelHelp}
            <a
              href="https://ads.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TikTok Ads Manager
            </a>{" "}
            → Assets → Events
          </p>
        </div>
      </div>

      {/* Google Ads */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[#4285F4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t.googleAdsTitle}</p>
            <p className="text-xs text-muted-foreground">{t.googleAdsDesc}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            {t.googleAdsConversionId}
          </label>
          <Input
            value={googleAdsId}
            onChange={(e) => setGoogleAdsId(e.target.value)}
            placeholder="Ex: AW-XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t.googleAdsHelp}
            <a
              href="https://ads.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Ads
            </a>
            {t.googleAdsToolsPath}
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
        <Save className="h-4 w-4" />
        {saving ? t.saving : t.saveBtn}
      </Button>
    </div>
  );
};

export default DashboardPixelsTab;
