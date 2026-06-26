import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CheckoutDialog from "@/components/CheckoutDialog";
import SEOHead from "@/components/SEOHead";

interface Product {
  id: string;
  title: string;
  price: number;
  creator_id: string;
  download_url: string | null;
  type: string;
  thumbnail_url: string | null;
  file_password: string | null;
  watermark_enabled: boolean | null;
  collect_shipping_address: boolean | null;
}

const CheckoutPage = ({ customSlug }: { customSlug?: string }) => {
  const { productId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storeSlugFromQuery = searchParams.get('store');
  const storeSlug = customSlug || storeSlugFromQuery;
  
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [brandColor, setBrandColor] = useState<string | undefined>();
  const [storeName, setStoreName] = useState<string>("TECHNOVA");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!productId) {
        setError("Produit introuvable");
        setLoading(false);
        return;
      }
      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("id, title, price, creator_id, download_url, type, thumbnail_url, file_password, watermark_enabled, collect_shipping_address")
        .eq("id", productId)
        .maybeSingle();
      if (pErr || !p) {
        setError("Ce produit n'existe pas ou n'est plus disponible.");
        setLoading(false);
        return;
      }
      setProduct(p as Product);

      if (storeSlug) {
        const { data: store } = await supabase
          .from("stores")
          .select("brand_color, logo_url, name")
          .eq("slug", storeSlug)
          .maybeSingle();
        if (store) {
          setBrandColor(store.brand_color || undefined);
          setStoreName(store.name || "TECHNOVA");
          setLogoUrl(store.logo_url || null);
        }
      }
      setLoading(false);
    };
    load();
  }, [productId, storeSlug]);

  const accent = brandColor || "#7C2DCC";

  return (
    <>
      <SEOHead
        title={`Paiement sécurisé — ${product?.title || "TECHNOVA"}`}
        description="Finalisez votre commande en toute sécurité."
        noindex
      />
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
        {/* Background floating orbs */}
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />

        <div className="relative z-10">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
              <Link
                to={storeSlug ? (productId ? `/store/${storeSlug}/${productId}` : `/store/${storeSlug}`) : (productId ? `/product/${productId}` : "/")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour au produit</span>
                <span className="sm:hidden">Retour</span>
              </Link>
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: accent }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-bold text-foreground">{storeName}</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Sécurisé</span>
              </div>
            </div>
          </header>

          <main className="px-3 sm:px-6 py-6 sm:py-10">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            ) : error || !product ? (
              <div className="max-w-md mx-auto text-center py-24">
                <p className="text-lg font-semibold text-foreground mb-2">{error || "Produit introuvable"}</p>
                <Link to="/" className="text-sm text-violet-600 hover:underline">Retour à l'accueil</Link>
              </div>
            ) : (
              <CheckoutDialog
                fullPage
                open
                onOpenChange={(o) => { if (!o) { if (window.history.length > 1) navigate(-1); else window.close(); } }}
                product={product}
                storeSlug={storeSlug}
                brandColor={brandColor}
              />
            )}

            <p className="text-center text-[11px] text-muted-foreground mt-8">
              Propulsé par <Link to="/" className="font-semibold text-foreground hover:underline">TECHNOVA</Link> · Paiement chiffré bout-en-bout
            </p>
          </main>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
