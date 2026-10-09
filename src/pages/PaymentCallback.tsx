import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, ShoppingBag, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ref = searchParams.get("ref") || searchParams.get("order_id");
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const productId = searchParams.get("product_id") || searchParams.get("productId");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Notifier la fenêtre parente (CheckoutDialog) si ouverte en popup et tenter de fermer l'onglet
  useEffect(() => {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          {
            type: "NYOLE_PAYMENT_SUCCESS",
            ref,
            sessionId,
            productId,
          },
          "*",
        );
        // Tenter de fermer l'onglet de paiement popup pour revenir au dialogue d'origine
        const timer = setTimeout(() => {
          try {
            window.close();
          } catch {
            // Ignoré si le navigateur bloque window.close()
          }
        }, 500);
        return () => clearTimeout(timer);
      } catch (err) {
        console.warn("[PaymentCallback] Erreur notification opener:", err);
      }
    }
  }, [ref, sessionId, productId]);

  // 2. Charger les détails du produit si on reste sur cette page (ex: mobile ou popup non fermée)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (productId) {
          const { data } = await supabase
            .from("products")
            .select("id, title, thumbnail_url, download_url, type")
            .eq("id", productId)
            .maybeSingle();
          if (isMounted && data) {
            setProduct(data);
          }
        }
      } catch (e) {
        console.warn("[PaymentCallback] Erreur chargement produit:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // 3. Déclencher le téléchargement automatique après 700ms si download_url est disponible
  useEffect(() => {
    if (product?.download_url) {
      const timer = setTimeout(() => {
        try {
          const a = document.createElement("a");
          a.href = product.download_url;
          a.target = "_blank";
          a.rel = "noreferrer";
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          console.warn("[PaymentCallback] Auto-download error:", e);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [product?.download_url]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEOHead
        title="Paiement Confirmé — TECHNOVA"
        description="Votre paiement a été validé avec succès sur TECHNOVA. Téléchargez votre produit dès maintenant."
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-2xl text-center"
      >
        {/* Animated Success Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="relative h-24 w-24 mx-auto mb-6"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              filter: "drop-shadow(0 12px 30px rgba(16, 185, 129, 0.4))",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Paiement réussi !
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Merci pour votre achat. Votre commande a été confirmée.
        </p>

        {/* Product preview if loaded */}
        {product && (
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-3.5 mb-5 flex items-center gap-3 text-left">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt=""
                className="h-14 w-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-foreground truncate">{product.title}</h4>
              <p className="text-xs text-muted-foreground">Accès immédiat</p>
            </div>
          </div>
        )}

        {/* Emerald download notification badge */}
        {product?.download_url && (
          <div className="inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/15 py-1.5 px-4 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Le téléchargement a démarré automatiquement !</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground/80 mb-6">
          Une copie de confirmation vous a également été envoyée par email.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {product?.download_url && (
            <Button
              asChild
              className="w-full h-12 text-sm font-bold shadow-md hover:shadow-lg transition-all text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <a href={product.download_url} target="_blank" rel="noreferrer" download>
                <Download className="h-4 w-4 mr-2" /> Télécharger manuellement
              </a>
            </Button>
          )}

          <Button
            variant={product?.download_url ? "outline" : "default"}
            onClick={() => navigate("/buyer-login")}
            className="w-full h-11 text-sm font-semibold gap-2 border-border"
          >
            <ShoppingBag className="h-4 w-4" />
            Accéder à mes achats
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full h-10 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Retour à l'accueil
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallback;
