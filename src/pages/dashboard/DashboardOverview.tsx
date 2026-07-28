import { useEffect, useState } from "react";
import {
  Package,
  DollarSign,
  Users,
  Plus,
  Workflow,
  Tag,
  TrendingUp,
  ExternalLink,
  ShoppingCart,
  HelpCircle,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { subDays } from "date-fns";

const translations = {
  fr: {
    welcome: "Bonjour",
    totalRevenue: "Revenu total",
    last7Days: "7 derniers jours",
    totalCustomers: "Nombre total de clients",
    bestSellers: "Produits les plus vendus",
    bestSellersSub: "Vos produits les plus vendus basés sur le total des ventes",
    viewAll: "Voir tout",
    noSales: "Aucun produit vendu",
    noSalesSub: "Les statistiques de vos produits apparaîtront ici",
    sale: "Vente",
    sales: "Ventes",
    creator: "Créateur",
  },
  en: {
    welcome: "Welcome back",
    totalRevenue: "Total Revenue",
    last7Days: "Last 7 days",
    totalCustomers: "Total Customers",
    bestSellers: "Best Selling Products",
    bestSellersSub: "Your best selling products based on total sales revenue",
    viewAll: "View all",
    noSales: "No products sold",
    noSalesSub: "Your product statistics will appear here",
    sale: "Sale",
    sales: "Sales",
    creator: "Creator",
  },
};

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    published: 0,
    totalRevenue: 0,
    weekRevenue: 0,
    clients: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).eq("creator_id", user.id),
        supabase
          .from("orders")
          .select("amount, created_at, customer_id, product_id, status, products(price)")
          .eq("store_owner_id", user.id)
          .eq("status", "completed"),
      ]);

      const products = productsRes.data || [];
      const orders = (ordersRes.data || []).map((o: any) => {
        const prodPrice = o.products?.price ? Number(o.products.price) : 0;
        const amount = Number(o.amount) > 0 ? Number(o.amount) : prodPrice;
        return { ...o, amount };
      });
      const published = products.filter((p: any) => p.is_published).length;
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);

      const weekAgo = subDays(new Date(), 7);
      const weekOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const uniqueClients = new Set(orders.map((o) => o.customer_id)).size;

      setStats({
        products: productsRes.count || 0,
        published,
        totalRevenue,
        weekRevenue,
        clients: uniqueClients,
      });

      // Top products
      const salesByProduct: Record<string, { total: number; count: number }> = {};
      orders.forEach((o) => {
        if (!salesByProduct[o.product_id]) salesByProduct[o.product_id] = { total: 0, count: 0 };
        salesByProduct[o.product_id].total += Number(o.amount);
        salesByProduct[o.product_id].count += 1;
      });
      const enriched = products.map((p: any) => ({
        ...p,
        salesTotal: salesByProduct[p.id]?.total || 0,
        salesCount: salesByProduct[p.id]?.count || 0,
      }));
      enriched.sort((a: any, b: any) => b.salesTotal - a.salesTotal);
      setTopProducts(enriched.slice(0, 5));
    };
    fetchStats();
  }, [user]);

  const currencySuffix = lang === "en" ? " CFA" : " FCFA";

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pt-4 sm:pt-6 pb-12 space-y-8 px-2 sm:px-0">
        {/* Header Section */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-foreground tracking-tight">
              {t.welcome}, {profile?.display_name || t.creator} ! 🌞
            </h1>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: t.totalRevenue,
              value: `${stats.totalRevenue.toLocaleString()}${currencySuffix}`,
              icon: DollarSign,
            },
            {
              label: t.last7Days,
              value: `${stats.weekRevenue.toLocaleString()}${currencySuffix}`,
              icon: ShoppingCart,
            },
            {
              label: t.totalCustomers,
              value: stats.clients.toString(),
              icon: Users,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="dash-hero-3d rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center min-h-[90px] sm:min-h-[160px] group hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 text-white gap-4 sm:gap-0 shadow-lg relative overflow-hidden"
            >
              <div className="relative z-10 shrink-0 sm:mb-4">
                <div className="h-12 w-12 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-white/20 backdrop-blur-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/30">
                  <card.icon className="h-6 w-6 sm:h-5 sm:w-5" strokeWidth={2} />
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0 flex flex-col sm:flex-col-reverse justify-center">
                <p className="text-[13px] sm:text-[12px] uppercase tracking-[0.05em] sm:tracking-[0.1em] font-medium sm:font-bold text-white/80 mb-1 sm:mb-0 sm:mt-1.5">
                  {card.label}
                </p>
                <p className="text-2xl sm:text-[28px] font-extrabold tracking-tight tabular-nums leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] truncate">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">{t.bestSellers}</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">{t.bestSellersSub}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl text-[13px] font-medium h-9 px-4 border-border/80 shadow-sm w-full sm:w-auto hover:bg-muted bg-background/50 text-foreground"
              onClick={() => navigate("/dashboard/products")}
            >
              {t.viewAll}
            </Button>
          </div>

          <div className="rounded-[24px] p-2 sm:p-3 overflow-hidden dash-glass">
            {topProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-foreground mb-1">{t.noSales}</p>
                <p className="text-xs text-muted-foreground">{t.noSalesSub}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-[16px] hover:bg-muted/40 dark:hover:bg-muted/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {p.thumbnail_url ? (
                          <img
                            src={p.thumbnail_url}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/45" />
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-[14px] sm:text-[15px] font-semibold text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors truncate">
                          <span className="truncate">{p.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        </p>
                        <p className="text-[12px] sm:text-[13px] text-muted-foreground font-medium mt-0.5 truncate">
                          {Number(p.price || 0).toLocaleString()}
                          {currencySuffix}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] sm:text-[15px] font-bold text-foreground">
                        {p.salesTotal.toLocaleString()}
                        {currencySuffix}
                      </p>
                      <p className="text-[12px] sm:text-[13px] text-muted-foreground font-medium mt-0.5">
                        {p.salesCount} {p.salesCount > 1 ? t.sales : t.sale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
