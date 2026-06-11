import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const BuyerOAuthCallback = () => {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // Wait for Supabase to process OAuth tokens
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Session non établie. Réessayez.");
          navigate("/buyer-login", { replace: true });
          return;
        }

        const { data, error } = await supabase.functions.invoke("buyer-oauth-check");
        if (error || data?.error) {
          toast.error(data?.error || "Aucun achat trouvé pour ce compte");
          await supabase.auth.signOut();
          navigate("/buyer-login", { replace: true });
          return;
        }

        sessionStorage.setItem("buyer_session", JSON.stringify({
          email: data.customer.email,
          customerName: data.customer.name,
          customerId: data.customer.id,
          orders: data.orders || [],
          authenticatedAt: Date.now(),
        }));

        toast.success("Connexion réussie");
        navigate("/mes-achats", { replace: true });
      } catch (e: any) {
        console.error(e);
        toast.error("Erreur de connexion");
        navigate("/buyer-login", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Connexion en cours…</p>
      </div>
    </div>
  );
};

export default BuyerOAuthCallback;
