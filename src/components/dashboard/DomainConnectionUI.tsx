import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowRightLeft, Loader2, CheckCircle2, Lock, Trash2, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { detectDnsProvider, DnsProvider } from "@/lib/dns-providers";
import { supabase } from "@/integrations/supabase/client";

interface DomainConnectionUIProps {
  domainRecord: any;
  onDelete: () => Promise<void>;
  brandColor: string;
}

export default function DomainConnectionUI({ domainRecord, onDelete, brandColor }: DomainConnectionUIProps) {
  const [provider, setProvider] = useState<DnsProvider | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [vercelData, setVercelData] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isApex = domainRecord.domain.split('.').length === 2;

  useEffect(() => {
    // 1. Détecter le fournisseur DNS
    detectDnsProvider(domainRecord.domain).then(res => {
      setProvider(res);
      setDetecting(false);
    });

    // 2. Lancer le polling de l'API Vercel
    fetchVercelStatus();
    const interval = setInterval(fetchVercelStatus, 6000);
    return () => clearInterval(interval);
  }, [domainRecord.domain]);

  const fetchVercelStatus = async () => {
    try {
      const res = await fetch(`/api/domains?domain=${domainRecord.domain}`);
      if (res.ok) {
        const data = await res.json();
        setVercelData(data);
        
        // Mettre à jour Supabase si le domaine devient actif
        if (data.verified && domainRecord.status !== 'active') {
          await supabase.from("custom_domains").update({ status: 'active', dns_verified: true }).eq('id', domainRecord.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isVerified = vercelData?.verified === true;
  // Parfois vercelData.verified est true, mais il y a une erreur DNS.
  // S'il n'y a pas d'erreur (ou si verified est vrai), c'rebon.
  const hasError = !!vercelData?.error;

  return (
    <div className="space-y-6">
      {/* HEADER VISUEL */}
      <div className="bg-muted/30 border rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center gap-6 sm:gap-10 relative z-10">
          {/* Logo Technova */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg p-2 overflow-hidden bg-white">
            <img src="/favicon.png" alt="TECHNOVA" className="w-full h-full object-contain" />
          </div>

          <ArrowRightLeft className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground opacity-50" />

          {/* Logo Fournisseur */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white border shadow-lg rounded-full flex items-center justify-center relative overflow-hidden">
            {detecting ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : provider ? (
              <img src={provider.logoUrl} alt={provider.name} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            ) : (
              <Globe className="h-8 w-8 text-muted-foreground" />
            )}
            {provider && <Globe className="h-8 w-8 text-muted-foreground hidden" />}
          </div>
        </div>

        <div className="mt-6 text-center z-10">
          <h3 className="text-lg font-semibold">{domainRecord.domain}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {detecting ? "Analyse de votre domaine..." : provider ? `Géré par ${provider.name}` : "Hébergeur non identifié"}
          </p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="space-y-4">
        {/* Step 1: Configuration DNS */}
        <Card className={`p-5 transition-colors ${isVerified ? 'bg-muted/20 opacity-70' : 'border-primary shadow-sm'}`}>
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isVerified ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
               {isVerified ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Configuration des DNS</h4>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous à votre fournisseur et ajoutez ces enregistrements.
                  </p>
                </div>
                {provider && !isVerified && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={provider.loginUrl} target="_blank" rel="noopener noreferrer">
                      Se connecter à {provider.name}
                    </a>
                  </Button>
                )}
              </div>

              {!isVerified && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground px-2">
                    <span>Type</span>
                    <span>Nom</span>
                    <span>Valeur</span>
                  </div>
                  
                  {isApex ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                        <span className="text-sm font-mono">A</span>
                        <button onClick={() => copyToClipboard('A', 'type1')} className="text-muted-foreground hover:text-foreground">
                          {copiedField === 'type1' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                        <span className="text-sm font-mono">@</span>
                        <button onClick={() => copyToClipboard('@', 'name1')} className="text-muted-foreground hover:text-foreground">
                          {copiedField === 'name1' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                        <span className="text-sm font-mono">76.76.21.21</span>
                        <button onClick={() => copyToClipboard('76.76.21.21', 'val1')} className="text-muted-foreground hover:text-foreground">
                          {copiedField === 'val1' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono">CNAME</span>
                      <button onClick={() => copyToClipboard('CNAME', 'type2')} className="text-muted-foreground hover:text-foreground">
                        {copiedField === 'type2' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono">{isApex ? 'www' : domainRecord.domain.split('.')[0]}</span>
                      <button onClick={() => copyToClipboard(isApex ? 'www' : domainRecord.domain.split('.')[0], 'name2')} className="text-muted-foreground hover:text-foreground">
                        {copiedField === 'name2' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-mono text-ellipsis overflow-hidden">cname.vercel-dns.com</span>
                      <button onClick={() => copyToClipboard('cname.vercel-dns.com', 'val2')} className="text-muted-foreground hover:text-foreground shrink-0">
                        {copiedField === 'val2' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-muted/50 py-2 px-3 rounded-lg w-max">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Recherche des enregistrements DNS...
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 2: Propagation */}
        <Card className={`p-5 transition-colors ${!isVerified ? 'opacity-50 grayscale' : 'border-primary shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isVerified ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
               {!isVerified ? <Loader2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
            <div>
              <h4 className="font-medium">Propagation DNS</h4>
              <p className="text-sm text-muted-foreground">
                {isVerified ? "Les enregistrements ont été trouvés." : "En attente de vos enregistrements."}
              </p>
            </div>
          </div>
        </Card>

        {/* Step 3: SSL */}
        <Card className={`p-5 transition-colors ${!isVerified ? 'opacity-50 grayscale' : 'bg-green-50/50 border-green-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isVerified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
               <Lock className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h4 className="font-medium">Génération du certificat SSL</h4>
                <p className="text-sm text-muted-foreground">
                  {isVerified ? "Votre domaine est sécurisé et prêt !" : "En attente de la propagation."}
                </p>
              </div>
              {isVerified && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Actif</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-4 flex justify-end border-t border-muted">
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Retirer ce domaine
        </Button>
      </div>
    </div>
  );
}
