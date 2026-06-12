import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Store, Phone, Globe, Upload, ImageIcon, AlertCircle, FileText, Sparkles, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import StoreSelector from "./StoreSelector";
import { useActiveStore } from "@/hooks/useActiveStore";

const DashboardProfileTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { stores, activeStore, activeStoreId, setActiveStoreId, updateStore, isLoading, hasStores } = useActiveStore();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [contact, setContact] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImproveDescription = async () => {
    const text = storeDescription.replace(/<[^>]*>/g, "").trim();
    if (!text) {
      toast.error("Ajoutez d'abord une description avant de l'améliorer");
      return;
    }
    setImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-store-description", {
        body: { description: storeDescription, storeName },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const improved = (data as any)?.improved as string;
      if (!improved) throw new Error("Réponse vide");
      setStoreDescription(improved);
      toast.success("Description réorganisée par l'IA ✨");
    } catch (err: any) {
      toast.error(err.message || "Impossible d'améliorer la description");
    } finally {
      setImproving(false);
    }
  };

  // Sync form with active store
  useEffect(() => {
    if (activeStore) {
      setStoreName(activeStore.name || "");
      setStoreSlug(activeStore.slug || "");
      setStoreDescription((activeStore as any).description || "");
      setLogoUrl(activeStore.logo_url || null);
      
      const fetchDomain = async () => {
        const { data } = await supabase
          .from("custom_domains")
          .select("domain")
          .eq("store_id", activeStore.id)
          .maybeSingle();
        setCustomDomain(data?.domain || null);
      };
      fetchDomain();
    }
    // Contact stays on profile level
    if (profile) {
      setContact(profile.contact || "");
    }
  }, [activeStore, profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeStoreId) return;
    if (!file.type.startsWith("image/")) { toast.error("Veuillez sélectionner une image"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logos/${user.id}/${activeStoreId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-assets").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erreur lors de l'upload"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploadé !");
  };

  const handleSave = async () => {
    if (!user || !activeStoreId) return;
    if (!storeName.trim()) { toast.error("Le nom de la boutique est obligatoire"); return; }
    setSaving(true);
    
    const slug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Treat empty rich-text (e.g. "<p></p>") as null
    const descriptionTextOnly = storeDescription.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    const cleanDescription = descriptionTextOnly.length > 0 ? storeDescription.trim() : null;

    try {
      // Update store
      await updateStore.mutateAsync({
        name: storeName.trim(),
        slug: slug || activeStore?.slug,
        description: cleanDescription,
        logo_url: logoUrl,
      } as any);

      // Update contact + store_description on profile (mirror)
      await supabase.from("profiles").update({
        contact: contact.trim() || null,
        display_name: storeName.trim(),
        store_slug: slug || null,
        store_description: cleanDescription,
        store_logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      } as any).eq("id", user.id);

      toast.success("Boutique mise à jour !");
      refreshProfile();
    } catch (err: any) {
      if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
        toast.error("Ce slug est déjà utilisé");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-10 bg-muted rounded w-48" /><div className="h-32 bg-muted rounded" /></div>;
  }

  if (!hasStores) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Aucune boutique</p>
            <p className="text-xs text-muted-foreground">Créez votre première boutique dans l'onglet <a href="/dashboard/stores" className="text-primary hover:underline">Mes Boutiques</a> pour configurer votre profil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <StoreSelector stores={stores} activeStoreId={activeStoreId} onSelect={setActiveStoreId} />
        <Button onClick={handleSave} disabled={saving} className="hidden sm:flex">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3">Identité</h3>
            
            {/* Store Logo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                Logo de la boutique
              </label>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="text-center">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-full">
                    {uploading ? "Upload..." : logoUrl ? "Changer le logo" : "Ajouter un logo"}
                  </Button>
                  <p className="text-[11px] text-gray-400 mt-2">JPG, PNG. Max 2 Mo.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Store className="h-4 w-4 text-gray-400" />
                Nom de la boutique
              </label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Ma Super Boutique" className="bg-gray-50/50" />
            </div>

            {/* Contact */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                Contact public
              </label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Ex: +229 97 00 00 00" className="bg-gray-50/50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3">Domaine</h3>
            
            {/* Store Domain / Slug */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                Lien de la boutique
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-gray-100 text-xs text-gray-500 whitespace-nowrap">
                  technova.com/store/
                </span>
                <Input className="rounded-l-none bg-white" value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)} placeholder="ma-boutique" />
              </div>
              {storeSlug && (
                <div className="mt-3 space-y-2">
                  <a
                    href={`https://technovalearning.com/store/${storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-gray-500 hover:text-blue-600 hover:underline truncate block"
                  >
                    ↗ Ouvrir mon lien par défaut
                  </a>
                  
                  {customDomain && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                      <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Domaine Personnalisé</p>
                      <a
                        href={`https://${customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-700 hover:underline truncate block"
                      >
                        https://{customDomain}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Description & Présentation
              </h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleImproveDescription}
                disabled={improving}
                className="gap-1.5 h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                {improving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Amélioration...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Optimiser avec l'IA
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Présentez votre boutique, vos produits et votre histoire. Vous pouvez ajouter des images, des vidéos YouTube et formater votre texte pour le rendre attrayant.
            </p>
            
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300 transition-all">
              <RichTextEditor
                content={storeDescription}
                onChange={setStoreDescription}
                placeholder="Commencez à écrire ici..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end sm:hidden">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardProfileTab;
