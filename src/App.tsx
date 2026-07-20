import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Fichiers from "./pages/Fichiers";
import LicencesPage from "./pages/LicencesPage";
import Decouvertes from "./pages/Decouvertes";
import EServices from "./pages/EServices";

import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Partners from "./pages/Partners";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Jobs from "./pages/Jobs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LegalNotice from "./pages/LegalNotice";
import RefundPolicy from "./pages/RefundPolicy";
import StorePage from "./pages/StorePage";
import StoreProductDetail from "./pages/StoreProductDetail";
import ToolsDirectoryPage from "./pages/ToolsDirectoryPage";
import Marketplace from "./pages/Marketplace";
import Cours from "./pages/Cours";
import CoursePlayer from "./pages/CoursePlayer";
import Products from "./pages/Products";
import AdminProducts from "./pages/AdminProducts";
import AllProducts from "./pages/AllProducts";
import StoreLegalPage from "./pages/StoreLegalPage";
import PaymentCallback from "./pages/PaymentCallback";
import CheckoutPage from "./pages/CheckoutPage";
import BuyerLogin from "./pages/BuyerLogin";
import BuyerOAuthCallback from "./pages/BuyerOAuthCallback";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerOrderDetail from "./pages/BuyerOrderDetail";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import Actualites from "./pages/Actualites";
import ActualitesDetail from "./pages/ActualitesDetail";
import TechnovaApps from "./pages/TechnovaApps";
import Premium from "./pages/Premium";

import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import CreateProduct from "./pages/dashboard/CreateProduct";
import EditProduct from "./pages/dashboard/EditProduct";
import DashboardSales from "./pages/dashboard/DashboardSales";
import DashboardClients from "./pages/dashboard/DashboardClients";
import DashboardRevenue from "./pages/dashboard/DashboardRevenue";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardMarketing from "./pages/dashboard/DashboardMarketing";
import DashboardAffiliation from "./pages/dashboard/DashboardAffiliation";
import DashboardAutomations from "./pages/dashboard/DashboardAutomations";
import DashboardWebhooks from "./pages/dashboard/DashboardWebhooks";
import DashboardLicenses from "./pages/dashboard/DashboardLicenses";
import DashboardWithdrawals from "./pages/dashboard/DashboardWithdrawals";
import WithdrawNew from "./pages/dashboard/WithdrawNew";
import Wallet from "./pages/dashboard/Wallet";
import AdminKYC from "./pages/dashboard/AdminKYC";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminWithdrawals from "./pages/dashboard/AdminWithdrawals";
import AdminSupport from "./pages/dashboard/AdminSupport";
import AdminModeration from "./pages/dashboard/AdminModeration";
import DashboardStores from "./pages/dashboard/DashboardStores";
import DashboardOthers from "./pages/dashboard/DashboardOthers";

import DashboardBadge from "./pages/dashboard/DashboardBadge";
import AdminBadges from "./pages/dashboard/AdminBadges";

import DashboardSupport from "./pages/dashboard/DashboardSupport";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import SupportChatbot from "./components/SupportChatbot";
import { useCustomDomain, CustomDomainApp } from "./components/CustomDomainRouter";
import { Loader2 } from "lucide-react";
import { GeoPricingProvider } from "./contexts/GeoPricingContext";

const queryClient = new QueryClient();

const ExternalRedirect = ({ to }: { to: string }) => {
  window.location.href = to;
  return null;
};

const AppContent = () => {
  const { isCustomDomain, storeSlug, loading } = useCustomDomain();
  const [authHashPending, setAuthHashPending] = useState(() => {
    const hash = window.location.hash;
    const isBuyerPath =
      window.location.pathname.includes("/buyer-auth") ||
      window.location.pathname.includes("/buyer-login") ||
      window.location.pathname.includes("/mes-achats");
    return !!(
      hash &&
      !isBuyerPath &&
      (hash.includes("access_token=") || hash.includes("id_token=") || hash.includes("error="))
    );
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "technovalearning.com") {
      window.location.replace(
        `https://www.technovalearning.com${window.location.pathname}${window.location.search}${window.location.hash}`
      );
    }
  }, []);

  // When the app loads with an OAuth hash (e.g. #access_token=...),
  // block all rendering and let Supabase consume the token silently.
  // Once Supabase fires the auth state change, the hash is cleared
  // and we redirect to /dashboard without any page flashing.
  useEffect(() => {
    if (!authHashPending) return;

    const isBuyerPath =
      window.location.pathname.includes("/buyer-auth") ||
      window.location.pathname.includes("/buyer-login") ||
      window.location.pathname.includes("/mes-achats");

    if (isBuyerPath) {
      setAuthHashPending(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Token consumed — clear hash and redirect to dashboard
        window.history.replaceState(null, "", "/dashboard");
        setAuthHashPending(false);
      } else if (event === "SIGNED_OUT") {
        // Auth failed — just clear the gate
        window.history.replaceState(null, "", "/login");
        setAuthHashPending(false);
      }
    });

    // Safety timeout: if Supabase doesn't fire within 8 seconds, unblock
    const timer = setTimeout(() => {
      setAuthHashPending(false);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [authHashPending]);

  if (authHashPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Connexion en cours…
          </p>
        </div>
      </div>
    );
  }

  if (isCustomDomain && storeSlug) {
    return <CustomDomainApp storeSlug={storeSlug} />;
  }

  const hostname = window.location.hostname;
  if (hostname.startsWith("portal.")) {
    return (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<BuyerLogin />} />
          <Route path="/auth/callback" element={<BuyerOAuthCallback />} />
          <Route path="/buyer-auth/callback" element={<BuyerOAuthCallback />} />
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/orders/:orderId" element={<BuyerOrderDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AuthProvider>
        <div className="relative min-h-screen overflow-hidden">
          {/* Background floating orbs */}
          <div className="bg-orb orb-1" />
          <div className="bg-orb orb-2" />
          <div className="bg-orb orb-3" />

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/fichiers" element={<Fichiers />} />
              <Route path="/licences" element={<LicencesPage />} />
              <Route path="/e-services" element={<EServices />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPostDetail />} />
              <Route path="/actualites" element={<Actualites />} />
              <Route path="/actualites/:id" element={<ActualitesDetail />} />
              <Route path="/apps" element={<TechnovaApps />} />
              <Route path="/premium" element={<Premium />} />

              <Route path="/about" element={<About />} />
              <Route path="/outils-digitaux" element={<ToolsDirectoryPage />} />
              <Route path="/decouvertes" element={<Decouvertes />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/store" element={<AdminProducts />} />
              <Route path="/admin-products" element={<Navigate to="/store" replace />} />
              <Route path="/all-products" element={<AllProducts />} />
              <Route path="/cours" element={<Cours />} />
              <Route path="/formations" element={<Cours />} />
              <Route path="/learn/:courseId" element={<CoursePlayer />} />
              <Route path="/learn" element={<Navigate to="/formations" replace />} />
              <Route path="/products" element={<Products />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<LegalNotice />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/store/:slug" element={<StorePage />} />
              <Route path="/store/:slug/legal" element={<StoreLegalPage kind="legal" />} />
              <Route path="/store/:slug/terms" element={<StoreLegalPage kind="terms" />} />
              <Route path="/store/:slug/privacy" element={<StoreLegalPage kind="privacy" />} />
              <Route path="/store/:slug/:productId" element={<StoreProductDetail />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              <Route path="/checkout/:productId" element={<CheckoutPage />} />
              <Route path="/product/:productId" element={<StoreProductDetail />} />
              <Route path="/buyer-login" element={<BuyerLogin />} />
              <Route path="/buyer-auth/callback" element={<BuyerOAuthCallback />} />
              <Route path="/mes-achats" element={<BuyerDashboard />} />
              <Route path="/mes-achats/:orderId" element={<BuyerOrderDetail />} />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/products"
                element={
                  <ProtectedRoute>
                    <DashboardProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/products/new"
                element={
                  <ProtectedRoute>
                    <CreateProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/sales"
                element={
                  <ProtectedRoute>
                    <DashboardSales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clients"
                element={
                  <ProtectedRoute>
                    <DashboardClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/licenses"
                element={
                  <ProtectedRoute>
                    <DashboardLicenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/others"
                element={
                  <ProtectedRoute>
                    <DashboardOthers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/revenue"
                element={
                  <ProtectedRoute>
                    <DashboardRevenue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <ProtectedRoute>
                    <DashboardAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/marketing"
                element={
                  <ProtectedRoute>
                    <DashboardMarketing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/affiliation"
                element={
                  <ProtectedRoute>
                    <DashboardAffiliation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/automations"
                element={
                  <ProtectedRoute>
                    <DashboardAutomations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/withdrawals"
                element={
                  <ProtectedRoute>
                    <DashboardWithdrawals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/withdrawals/new"
                element={
                  <ProtectedRoute>
                    <WithdrawNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/webhooks"
                element={
                  <ProtectedRoute>
                    <DashboardWebhooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/appearance"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/domain"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/pixels"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/account"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/telegram"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/stores"
                element={
                  <ProtectedRoute>
                    <DashboardStores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/support"
                element={
                  <ProtectedRoute>
                    <DashboardSupport />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/kyc"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminKYC />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/withdrawals"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminWithdrawals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminModeration />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/badge"
                element={
                  <ProtectedRoute>
                    <DashboardBadge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/badges"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBadges />
                  </ProtectedRoute>
                }
              />

              <Route path="/learn/:courseId" element={<CoursePlayer />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <SupportChatbot />
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GeoPricingProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </CartProvider>
      </GeoPricingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
