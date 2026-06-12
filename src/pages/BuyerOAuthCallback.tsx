import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { buyerSupabase as supabase } from "@/integrations/supabase/buyer-client";
import { toast } from "sonner";


const BuyerOAuthCallback = () => {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // In PKCE flow, getSession might not have exchanged the code yet. 
        // We listen to onAuthStateChange to wait for the session.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
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
            }

            sessionStorage.setItem("buyer_session", JSON.stringify({
              email: customerEmail,
              customerName: customerName,
              customerId: customerId,
              orders: orders,
              authenticatedAt: Date.now(),
            }));

            toast.success("Connexion réussie");
            navigate("/dashboard", { replace: true });
          }
        });

        // Also check getSession in case it's already exchanged or if it fails
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Give it a short timeout to let the event listener fire if it's currently exchanging
        setTimeout(() => {
          if (!session && !window.location.href.includes("code=")) {
            subscription.unsubscribe();
            toast.error("Session non établie. Réessayez.");
            navigate("/", { replace: true });
          }
        }, 3000);

      } catch (e: any) {
        console.error(e);
        toast.error("Erreur de connexion");
        navigate("/", { replace: true });
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
