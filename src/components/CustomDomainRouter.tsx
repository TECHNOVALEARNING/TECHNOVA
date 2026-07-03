import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import StorePage from "@/pages/StorePage";
import StoreProductDetail from "@/pages/StoreProductDetail";
import StoreLegalPage from "@/pages/StoreLegalPage";
import PaymentCallback from "@/pages/PaymentCallback";
import CheckoutPage from "@/pages/CheckoutPage";
import BuyerLogin from "@/pages/BuyerLogin";
import BuyerOAuthCallback from "@/pages/BuyerOAuthCallback";
import BuyerDashboard from "@/pages/BuyerDashboard";
import BuyerOrderDetail from "@/pages/BuyerOrderDetail";

export const useCustomDomain = () => {
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomain = async () => {
      const hostname = window.location.hostname;

      if (hostname.startsWith("portal.")) {
        // Stop loading and let the app render
        // But we will intercept this in App.tsx
        setLoading(false);
        return;
      }

      // Skip for main domains and local dev
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("technova") ||
        hostname.endsWith(".vercel.app") ||
        hostname.endsWith(".lovableproject.com")
      ) {
        setLoading(false);
        return;
      }

      // Check if domain exists in our DB
      try {
        const { data, error } = await supabase
          .from("custom_domains")
          .select("stores(slug)")
          .eq("domain", hostname.replace(/^www\./, ""))
          .maybeSingle();

        if (data?.stores && "slug" in data.stores) {
          setStoreSlug(data.stores.slug as string);
        }
      } catch (err) {
        console.error("Domain check error", err);
      } finally {
        setLoading(false);
      }
    };

    checkDomain();
  }, []);

  return { isCustomDomain: !!storeSlug, storeSlug, loading };
};

export const CustomDomainApp = ({ storeSlug }: { storeSlug: string }) => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<StorePage customSlug={storeSlug} />} />
        <Route path="/checkout/:productId" element={<CheckoutPage customSlug={storeSlug} />} />
        <Route path="/success" element={<PaymentCallback />} />
        <Route path="/:productId" element={<StoreProductDetail customSlug={storeSlug} />} />
        <Route path="/legal" element={<StoreLegalPage kind="legal" customSlug={storeSlug} />} />
        <Route path="/terms" element={<StoreLegalPage kind="terms" customSlug={storeSlug} />} />
        <Route path="/privacy" element={<StoreLegalPage kind="privacy" customSlug={storeSlug} />} />
        <Route path="/buyer-login" element={<BuyerLogin />} />
        <Route path="/buyer-auth/callback" element={<BuyerOAuthCallback />} />
        <Route path="/mes-achats" element={<BuyerDashboard />} />
        <Route path="/mes-achats/:orderId" element={<BuyerOrderDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
