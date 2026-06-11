import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Info, Trash2, Copy, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { toast } from "sonner";

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  dns_verified: boolean;
  created_at: string;
}

const getDnsRecords = (domain: string) => {
  const parts = domain.split('.');
  const isSubdomain = parts.length > 2 && parts[0] !== 'www';
  
  if (isSubdomain) {
    return [{ type: "CNAME", name: parts[0], value: "cname.vercel-dns.com" }];
  }
  return [
    { type: "A", name: "@", value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" }
  ];
};

const DashboardDomainTab = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState<CustomDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
      toast.error("Veuillez entrer un nom de domaine valide (ex: maboutique.com)");
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
        toast.error(errorData.error?.message || "Erreur de connexion avec le serveur de domaine.");
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
        toast.error(error.message.includes("duplicate") ? "Ce domaine est déjà utilisé" : "Erreur lors de l'ajout du domaine");
      } else {
        setCustomDomain(data as CustomDomain);
        setDomain("");
        toast.success("Domaine connecté ! Configurez vos enregistrements DNS.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la connexion du domaine.");
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
        toast.error("Erreur lors de la suppression de la base de données");
      } else {
        setCustomDomain(null);
        toast.success("Domaine supprimé avec succès");
      }
    } catch (err) {
      toast.error("Erreur lors de la suppression du domaine");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
    active: { label: "Actif", variant: "default", icon: CheckCircle2 },
    pending: { label: "En attente", variant: "secondary", icon: Clock },
    failed: { label: "Échec", variant: "destructive", icon: AlertCircle },
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
            <CardTitle className="text-lg">Connecter un nom de domaine</CardTitle>
          </div>
          <CardDescription>
            Définissez un nom de domaine personnalisé pour votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {customDomain ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Nom de domaine</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 rounded-lg border flex-1">
                      <span className="text-sm text-muted-foreground">https://</span>
                      <span className="text-sm font-medium">{customDomain.domain}</span>
                    </div>
                    {(() => {
                      const config = statusConfig[customDomain.status] || statusConfig.pending;
                      const Icon = config.icon;
                      return (
                        <Badge variant={config.variant} className="gap-1 shrink-0">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="shrink-0 mt-5 sm:mt-0"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
                  Supprimer
                </Button>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Assurez-vous d'avoir correctement configuré les enregistrements DNS auprès de votre fournisseur de nom de domaine. La propagation DNS peut prendre jusqu'à une heure.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground px-2">
                  <span>Type</span>
                  <span>Noms</span>
                  <span>Valeur</span>
                </div>
                {getDnsRecords(customDomain.domain).map((record, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono">{record.type}</span>
                      <button onClick={() => copyToClipboard(record.type, `type-${i}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {copiedField === `type-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono">{record.name}</span>
                      <button onClick={() => copyToClipboard(record.name, `name-${i}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {copiedField === `name-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono">{record.value}</span>
                      <button onClick={() => copyToClipboard(record.value, `value-${i}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {copiedField === `value-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Nom de domaine</Label>
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
                    Connecter
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Votre boutique est actuellement accessible à : <span className="font-medium text-foreground">technova.com/store/{activeStore?.slug}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDomainTab;
