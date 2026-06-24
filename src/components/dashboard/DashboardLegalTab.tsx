import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Sparkles, Scale, FileText, Shield, AlertTriangle } from "lucide-react";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const translations = {
  fr: {
    saveError: "Erreur lors de la sauvegarde",
    saveSuccess: "Mentions légales enregistrées",
    aiGenerateSuccess: "Document généré — pensez à l'adapter à votre activité",
    aiGenerateError: "Erreur lors de la génération",
    legalNotice: "Mentions légales",
    termsOfUse: "Conditions générales d'utilisation et de vente",
    privacyPolicy: "Politique de confidentialité (RGPD)",
    promptGenerate: "Génère un document complet de",
    promptStore: "pour la boutique en ligne",
    promptInclude: "Inclus toutes les sections nécessaires (identité du vendeur, hébergeur, propriété intellectuelle, données personnelles, cookies, droits du consommateur, etc.). Format HTML avec h2, h3, p, ul, li.",
    selectStoreMessage: "Sélectionnez une boutique pour gérer ses mentions légales.",
    htmlAllowed: "Contenu HTML autorisé",
    generating: "Génération…",
    generateAi: "Générer avec l'IA",
    cardTitle: "Mentions légales de votre boutique",
    cardDesc: "Ces pages s'affichent en bas de votre boutique. Personnalisez-les selon votre activité et votre pays.",
    tabLegal: "Mentions légales",
    tabTerms: "CGU/CGV",
    tabPrivacy: "Confidentialité",
    tabDisclaimer: "Disclaimer",
    legalPlaceholder: "<h2>Mentions légales</h2><p>Éditeur du site...</p>",
    termsPlaceholder: "<h2>Conditions générales</h2>",
    privacyPlaceholder: "<h2>Politique de confidentialité</h2>",
    disclaimerDesc: "Court texte d'avertissement affiché en bas de votre boutique (avant le copyright).",
    disclaimerPlaceholder: "Ce site n'est en aucun cas affilié à Facebook ou Meta. Les informations fournies sont à titre informatif uniquement et ne constituent pas un conseil professionnel ou financier.",
    saving: "Enregistrement…",
    saveBtn: "Enregistrer",
  },
  en: {
    saveError: "Error saving changes",
    saveSuccess: "Legal notice saved successfully",
    aiGenerateSuccess: "Document generated — remember to adapt it to your activity",
    aiGenerateError: "Error generating document",
    legalNotice: "Legal Notice",
    termsOfUse: "Terms of use and sales",
    privacyPolicy: "Privacy policy (GDPR)",
    promptGenerate: "Generate a comprehensive",
    promptStore: "document for the online shop",
    promptInclude: "Include all necessary sections (seller identity, hosting, intellectual property, personal data, cookies, consumer rights, etc.). HTML format with h2, h3, p, ul, li.",
    selectStoreMessage: "Select a shop to manage its legal notice.",
    htmlAllowed: "HTML content allowed",
    generating: "Generating…",
    generateAi: "Generate with AI",
    cardTitle: "Legal pages of your shop",
    cardDesc: "These pages are displayed at the bottom of your shop. Customize them according to your activity and country.",
    tabLegal: "Legal Notice",
    tabTerms: "Terms",
    tabPrivacy: "Privacy",
    tabDisclaimer: "Disclaimer",
    legalPlaceholder: "<h2>Legal Notice</h2><p>Site publisher...</p>",
    termsPlaceholder: "<h2>Terms of Use</h2>",
    privacyPlaceholder: "<h2>Privacy Policy</h2>",
    disclaimerDesc: "Short warning text displayed at the bottom of your shop (before copyright).",
    disclaimerPlaceholder: "This site is in no way affiliated with Facebook or Meta. The information provided is for informational purposes only and does not constitute professional or financial advice.",
    saving: "Saving…",
    saveBtn: "Save",
  }
};

const DashboardLegalTab = () => {
  const { activeStore, activeStoreId } = useActiveStore();
  const [legalNotice, setLegalNotice] = useState("");
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    if (!activeStore) return;
    setLegalNotice((activeStore as any).legal_notice || "");
    setTerms((activeStore as any).terms_of_use || "");
    setPrivacy((activeStore as any).privacy_policy || "");
    setDisclaimer((activeStore as any).footer_disclaimer || "");
  }, [activeStoreId]);

  const handleSave = async () => {
    if (!activeStoreId) return;
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({
        legal_notice: legalNotice,
        terms_of_use: terms,
        privacy_policy: privacy,
        footer_disclaimer: disclaimer,
      } as any)
      .eq("id", activeStoreId);
    setSaving(false);
    if (error) {
      toast.error(t.saveError);
      return;
    }
    toast.success(t.saveSuccess);
  };

  const generateWithAI = async (
    type: "legal_notice" | "terms" | "privacy",
    setter: (v: string) => void
  ) => {
    if (!activeStore) return;
    setGenerating(type);
    try {
      const titles: Record<string, string> = {
        legal_notice: t.legalNotice,
        terms: t.termsOfUse,
        privacy: t.privacyPolicy,
      };
      const { data, error } = await supabase.functions.invoke("rewrite-description", {
        body: {
          title: `${titles[type]} ${t.promptStore} ${activeStore.name}`,
          description: `${t.promptGenerate} "${titles[type]}" ${t.promptStore} ${activeStore.name}. ${t.promptInclude}`,
          productType: "file",
        },
      });
      if (error) throw error;
      const html = data?.description || "";
      if (html) {
        setter(html);
        toast.success(t.aiGenerateSuccess);
      }
    } catch {
      toast.error(t.aiGenerateError);
    } finally {
      setGenerating(null);
    }
  };

  if (!activeStore) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {t.selectStoreMessage}
        </CardContent>
      </Card>
    );
  }

  const Editor = ({
    value,
    onChange,
    placeholder,
    onAI,
    aiKey,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    onAI?: () => void;
    aiKey?: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{t.htmlAllowed}</Label>
        {onAI && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAI}
            disabled={generating === aiKey}
            className="gap-1.5 h-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating === aiKey ? t.generating : t.generateAi}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={14}
        className="font-mono text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" />
            {t.cardTitle}
          </CardTitle>
          <CardDescription>
            {t.cardDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="legal" className="gap-1.5 text-xs">
                <Scale className="h-3.5 w-3.5" /> {t.tabLegal}
              </TabsTrigger>
              <TabsTrigger value="terms" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> {t.tabTerms}
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" /> {t.tabPrivacy}
              </TabsTrigger>
              <TabsTrigger value="disclaimer" className="gap-1.5 text-xs">
                <AlertTriangle className="h-3.5 w-3.5" /> {t.tabDisclaimer}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="legal" className="mt-4">
              <Editor
                value={legalNotice}
                onChange={setLegalNotice}
                placeholder={t.legalPlaceholder}
                onAI={() => generateWithAI("legal_notice", setLegalNotice)}
                aiKey="legal_notice"
              />
            </TabsContent>
            <TabsContent value="terms" className="mt-4">
              <Editor
                value={terms}
                onChange={setTerms}
                placeholder={t.termsPlaceholder}
                onAI={() => generateWithAI("terms", setTerms)}
                aiKey="terms"
              />
            </TabsContent>
            <TabsContent value="privacy" className="mt-4">
              <Editor
                value={privacy}
                onChange={setPrivacy}
                placeholder={t.privacyPlaceholder}
                onAI={() => generateWithAI("privacy", setPrivacy)}
                aiKey="privacy"
              />
            </TabsContent>
            <TabsContent value="disclaimer" className="mt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">
                {t.disclaimerDesc}
              </Label>
              <Textarea
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                placeholder={t.disclaimerPlaceholder}
                rows={5}
                className="text-sm"
                maxLength={600}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {disclaimer.length}/600
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? t.saving : t.saveBtn}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLegalTab;
