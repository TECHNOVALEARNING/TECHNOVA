import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { 
  Plus, Users, Info, Loader2, PackageOpen, LayoutGrid, Sparkles, Play
} from 'lucide-react';
import { adminSupabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    salesCount: 0,
    customersCount: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch products
      const { data: productsData, error: productsError } = await adminSupabase
        .from('products')
        .select('*');
        
      if (productsError) throw productsError;

      // 2. Fetch orders to calculate real stats
      const { data: ordersData, error: ordersError } = await adminSupabase
        .from('orders')
        .select('*');
        
      if (ordersError) throw ordersError;

      // Compute Stats
      let totalRevenue = 0;
      let salesCount = 0;
      const uniqueCustomers = new Set();
      
      const productSalesMap: Record<string, { count: number; revenue: number }> = {};

      if (ordersData) {
        ordersData.forEach(order => {
          if (order.status === 'paid') {
            totalRevenue += (order.amount || 0);
            salesCount += 1;
            if (order.customer_email) uniqueCustomers.add(order.customer_email);
            
            if (order.product_id) {
              if (!productSalesMap[order.product_id]) {
                productSalesMap[order.product_id] = { count: 0, revenue: 0 };
              }
              productSalesMap[order.product_id].count += 1;
              productSalesMap[order.product_id].revenue += (order.amount || 0);
            }
          }
        });
      }

      setStats({
        totalRevenue,
        salesCount,
        customersCount: uniqueCustomers.size,
      });

      // 3. Map sales to products
      const productsWithSales = (productsData || []).map(p => ({
        ...p,
        sales_count: productSalesMap[p.title]?.count || 0, // Fallback to title matching since early data might not use UUID
        total_revenue: productSalesMap[p.title]?.revenue || 0
      }));

      // Sort by sales count and take top 5
      const sortedProducts = productsWithSales
        .filter(p => p.sales_count > 0)
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, 5);

      setTopProducts(sortedProducts);
    } catch (err) {
      console.error("Erreur de récupération des données du dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="w-full space-y-6">

      {/* WELCOME TEXT */}
      <div className="pt-2">
        <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
          Bonsoir Isidore<br />Abraham ! <span className="text-[32px]">🌙</span>
        </h2>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-sm"></div>
          </div>
          <p className="text-[13px] font-medium text-slate-600">
            Les heures de shopping sont là - optimisez vos offres !
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-3 pb-2">
        <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Demander à l'IA
        </button>
        <Link to="/admin/products/create" className="flex items-center gap-2 px-5 py-3 bg-white rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm">
          <Plus className="w-4 h-4 text-slate-500" />
          Ajouter un produit
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="flex flex-col gap-4">
        {/* BIG CARD */}
        <div className="bg-slate-50 rounded-3xl p-6 relative min-h-[140px] flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-transparent border border-slate-200 flex items-center justify-center mb-4">
            <span className="text-slate-500 text-sm font-medium">FCFA</span>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-slate-900 mb-1">
              {loading ? '...' : stats.totalRevenue.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-sm font-medium text-slate-500">Revenu total</div>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-400">
            <Info className="w-5 h-5" />
          </div>
        </div>
        
        {/* SMALL CARDS ROW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-3xl p-5 relative min-h-[140px] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-transparent flex items-center mb-2">
              <span className="text-slate-500 text-lg">🛍️</span>
            </div>
            <div>
              <div className="text-2xl font-display font-black text-slate-900 mb-1">
                {loading ? '...' : stats.salesCount}
              </div>
              <div className="text-[13px] font-medium text-slate-500">7 derniers jours</div>
            </div>
            <div className="absolute bottom-5 right-5 text-slate-400">
              <Info className="w-4 h-4" />
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-5 min-h-[140px] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-full bg-transparent flex items-center mb-2">
              <Users className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="text-2xl font-display font-black text-slate-900 mb-1">
                {loading ? '...' : stats.customersCount}
              </div>
              <div className="text-[13px] font-medium text-slate-500">Nombre total de clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-black text-slate-900">Produits les plus vendus</h3>
            <p className="text-[13px] text-slate-500 mt-1">Vos produits les plus vendus basés sur le total des ventes</p>
          </div>
          <Link to="/admin/products" className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0">
            Voir tout
          </Link>
        </div>

        <div className="bg-slate-50 rounded-3xl overflow-hidden min-h-[120px] flex flex-col justify-center">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-4 flex flex-col items-center justify-center py-8">
              <PackageOpen className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-[15px] font-medium text-slate-600">Aucune vente pour le moment.</p>
              <p className="text-[13px] text-slate-400 mt-1">Vos meilleurs produits apparaîtront ici.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {topProducts.map((product, idx) => (
                <div key={product.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[15px] text-slate-900 flex items-center gap-1.5">
                        {product.title}
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                      </h4>
                      <div className="text-[13px] text-slate-500 mt-0.5">{product.price.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[14px] text-slate-900">{product.total_revenue.toLocaleString('fr-FR')} FCFA</div>
                    <div className="text-[13px] text-slate-500">{product.sales_count} Ventes</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COMMUNITY SECTION (Placeholder pour l'exemple) */}
      <div className="pt-6">
        <h3 className="text-lg font-display font-black text-slate-900">Communauté</h3>
        <p className="text-[13px] text-slate-500 mt-1 mb-4">Connectez-vous avec des créateurs, apprenez de nouvelles compétences et aidez à façonner l'avenir de Technova.</p>
        
        <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <h4 className="font-bold text-[15px] text-slate-900 mb-1">Rejoignez-nous sur Youtube</h4>
          <p className="text-[13px] text-slate-500 px-4">Découvrez des vidéos pratiques pour apprendre à utiliser Technova</p>
        </div>
      </div>
      
    </div>
  );
}
