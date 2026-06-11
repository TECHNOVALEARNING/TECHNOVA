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

        let customerName = session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Client";
        let customerEmail = session.user?.email || "";
        let customerId = session.user?.id || "";
        let orders = [];

        try {
          const { data, error } = await supabase.functions.invoke("buyer-oauth-check");
          if (!error && !data?.error && data?.customer) {
            customerName = data.customer.name || customerName;
            customerEmail = data.customer.email || customerEmail;
            customerId = data.customer.id || customerId;
            orders = data.orders || [];
          }
        } catch (err) {
          console.error("buyer-oauth-check error:", err);
          // Proceed with empty orders
        }

        sessionStorage.setItem("buyer_session", JSON.stringify({
          email: customerEmail,
          customerName: customerName,
          customerId: customerId,
          orders: orders,
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
