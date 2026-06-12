import { useEffect, useState } from "react";
import {
  Package, DollarSign, Users, Plus, Workflow, Tag, TrendingUp,
  ExternalLink, ShoppingCart, HelpCircle, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { subDays } from "date-fns";

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0, published: 0, totalRevenue: 0, weekRevenue: 0,
    clients: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).eq("creator_id", user.id),
        supabase.from("orders").select("amount, created_at, customer_id, product_id, status").eq("store_owner_id", user.id).eq("status", "completed"),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const published = products.filter((p: any) => p.is_published).length;
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);

      const weekAgo = subDays(new Date(), 7);
      const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const uniqueClients = new Set(orders.map(o => o.customer_id)).size;

      setStats({
        products: productsRes.count || 0,
        published,
        totalRevenue,
        weekRevenue,
        clients: uniqueClients,
      });

      // Top products
      const salesByProduct: Record<string, { total: number; count: number }> = {};
      orders.forEach(o => {
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

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pt-4 sm:pt-6 pb-12 space-y-8 px-2 sm:px-0">
        
        {/* Header Section */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-[#111827] tracking-tight">
              Bonjour {profile?.display_name || "Créateur"} ! 🌞
            </h1>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Revenu total",
              value: `${stats.totalRevenue.toLocaleString()} FCFA`,
              icon: DollarSign,
            },
            {
              label: "7 derniers jours",
              value: `${stats.weekRevenue.toLocaleString()} FCFA`,
              icon: ShoppingCart,
            },
            {
              label: "Nombre total de clients",
              value: stats.clients.toString(),
              icon: Users,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="dash-hero-3d rounded-[24px] p-6 flex flex-col items-center justify-center text-center min-h-[150px] sm:min-h-[160px] group hover:-translate-y-1 transition-all duration-300 text-white"
            >
              <div className="mb-4 relative z-10">
                <div className="h-11 w-11 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-white/20 backdrop-blur-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/30">
                  <card.icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-2xl sm:text-[28px] font-extrabold tracking-tight tabular-nums leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-1.5">
                  {card.value}
                </p>
                <p className="text-[12px] uppercase tracking-[0.1em] font-bold text-white/80">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Produits les plus vendus</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">Vos produits les plus vendus basés sur le total des ventes</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl text-[13px] font-medium h-9 px-4 border-gray-200 shadow-sm w-full sm:w-auto" 
              onClick={() => navigate("/dashboard/products")}
            >
              Voir tout
            </Button>
          </div>

          <div className="rounded-[24px] bg-[#f7f8f9] p-2 sm:p-3 overflow-hidden">
            {topProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-[#111827] mb-1">Aucun produit vendu</p>
                <p className="text-xs text-gray-500">Les statistiques de vos produits apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-[16px] hover:bg-white/60 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-[14px] sm:text-[15px] font-semibold text-[#111827] flex items-center gap-1.5 group-hover:text-primary transition-colors truncate">
                          <span className="truncate">{p.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        </p>
                        <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mt-0.5 truncate">{Number(p.price || 0).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] sm:text-[15px] font-bold text-[#111827]">{p.salesTotal.toLocaleString()} FCFA</p>
                      <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mt-0.5">{p.salesCount} Vente{p.salesCount > 1 ? "s" : ""}</p>
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
