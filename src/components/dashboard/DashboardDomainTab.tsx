import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { toast } from "sonner";
import DomainConnectionUI from "./DomainConnectionUI";

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  dns_verified: boolean;
  created_at: string;
}

const translations = {
  fr: {
    domainErrorValid: "Veuillez entrer un nom de domaine valide (ex: maboutique.com)",
    domainErrorConn: "Erreur de connexion avec le serveur de domaine.",
    domainErrorUsed: "Ce domaine est déjà utilisé",
    domainErrorAdd: "Erreur lors de l'ajout du domaine",
    domainSuccessConn: "Domaine connecté ! Configurez vos enregistrements DNS.",
    domainErrorServer: "Erreur serveur lors de la connexion du domaine.",
    domainErrorDeleteDb: "Erreur lors de la suppression de la base de données",
    domainSuccessDelete: "Domaine supprimé avec succès",
    domainErrorDelete: "Erreur lors de la suppression du domaine",
    cardTitle: "Connecter un nom de domaine",
    cardDesc: "Définissez un nom de domaine personnalisé pour votre boutique",
    domainLabel: "Nom de domaine",
    btnConnect: "Connecter",
    currentUrlText: "Votre boutique est actuellement accessible à : ",
  },
  en: {
    domainErrorValid: "Please enter a valid domain name (e.g., myshop.com)",
    domainErrorConn: "Connection error with domain server.",
    domainErrorUsed: "This domain is already in use",
    domainErrorAdd: "Error adding domain",
    domainSuccessConn: "Domain connected! Configure your DNS records.",
    domainErrorServer: "Server error connecting domain.",
    domainErrorDeleteDb: "Error removing domain from database",
    domainSuccessDelete: "Domain deleted successfully",
    domainErrorDelete: "Error deleting domain",
    cardTitle: "Connect a Domain Name",
    cardDesc: "Define a custom domain name for your shop",
    domainLabel: "Domain Name",
    btnConnect: "Connect",
    currentUrlText: "Your shop is currently accessible at: ",
  }
};

const DashboardDomainTab = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState<CustomDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    if (activeStore?.id) fetchDomain();
  }, [activeStore?.id]);

  const fetchDomain = async () => {
    if (!activeStore?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("store_id", activeStore.id)
      .maybeSingle();
    setCustomDomain(data as CustomDomain | null);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!domain.trim() || !user?.id || !activeStore?.id) return;
    const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      toast.error(t.domainErrorValid);
      return;
    }
    setSaving(true);
    
    try {
      // 1. Ajouter le domaine sur Vercel via l'API proxy
      const vercelRes = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: cleanDomain })
      });
      
      if (!vercelRes.ok) {
        const errorData = await vercelRes.json();
        toast.error(errorData.error?.message || t.domainErrorConn);
        setSaving(false);
        return;
      }

      // 2. Sauvegarder dans notre base de données
      const { data, error } = await supabase
        .from("custom_domains")
        .insert({ domain: cleanDomain, store_id: activeStore.id, owner_id: user.id, status: "pending" })
        .select()
        .single();
        
      if (error) {
        toast.error(error.message.includes("duplicate") ? t.domainErrorUsed : t.domainErrorAdd);
      } else {
        setCustomDomain(data as CustomDomain);
        setDomain("");
        toast.success(t.domainSuccessConn);
      }
    } catch (err) {
      toast.error(t.domainErrorServer);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customDomain) return;
    setDeleting(true);
    
    try {
      // 1. Supprimer de Vercel
      await fetch(`/api/domains?domain=${customDomain.domain}`, { method: "DELETE" });
      
      // 2. Supprimer de Supabase
      const { error } = await supabase.from("custom_domains").delete().eq("id", customDomain.id);
      if (error) {
        toast.error(t.domainErrorDeleteDb);
      } else {
        setCustomDomain(null);
        toast.success(t.domainSuccessDelete);
      }
    } catch (err) {
      toast.error(t.domainErrorDelete);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t.cardTitle}</CardTitle>
          </div>
          <CardDescription>
            {t.cardDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {customDomain ? (
            <DomainConnectionUI 
              domainRecord={customDomain} 
              onDelete={handleDelete} 
              brandColor={activeStore?.brand_color || "#2563EB"} 
            />
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">{t.domainLabel}</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">https://</span>
                    <Input
                      id="domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="maboutique.com"
                      className="pl-16"
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving || !domain.trim()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                    {t.btnConnect}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.currentUrlText}<span className="font-medium text-foreground">technova.com/store/{activeStore?.slug}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDomainTab;
