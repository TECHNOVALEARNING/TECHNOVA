import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { 
  Plus, Users, Info, Loader2, PackageOpen, Sparkles, Workflow, Tag, Play, FileText, ShoppingBag
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
      const { data: productsData, error: productsError } = await adminSupabase.from('products').select('*');
      if (productsError) throw productsError;

      const { data: ordersData, error: ordersError } = await adminSupabase.from('orders').select('*');
      if (ordersError) throw ordersError;

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

      const productsWithSales = (productsData || []).map(p => ({
        ...p,
        sales_count: productSalesMap[p.title]?.count || 0,
        total_revenue: productSalesMap[p.title]?.revenue || 0
      }));

      const sortedProducts = productsWithSales
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
    <div className="w-full space-y-8 pb-12 font-sans">

      {/* WELCOME TEXT */}
      <div className="text-center md:text-left mt-4 md:mt-8">
        <h2 className="text-[32px] md:text-[40px] font-display font-medium text-slate-900 tracking-tight leading-tight flex items-center justify-center md:justify-start gap-3">
          Bonsoir Isidore Abraham ! <span className="text-[32px] md:text-[40px]">🌙</span>
        </h2>
        <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <p className="text-[14px] text-slate-500">
            Le moment parfait pour planifier le succès de demain.
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all border border-slate-200/80 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Demander à l'IA
        </button>
        <Link to="/admin/products/create" className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all border border-slate-200/80 shadow-sm">
          <PackageOpen className="w-4 h-4 text-slate-600" />
          Ajouter un produit
        </Link>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all border border-slate-200/80 shadow-sm">
          <Workflow className="w-4 h-4 text-slate-600" />
          Créer un workflow
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all border border-slate-200/80 shadow-sm">
          <Tag className="w-4 h-4 text-slate-600" />
          Créer une réduction
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-100/70 rounded-[24px] p-6 relative min-h-[160px] flex flex-col justify-end transition-all">
          <div className="absolute top-6 left-6 w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
            <span className="text-slate-500 text-xs font-semibold">FCFA</span>
          </div>
          <div>
            <div className="text-[28px] md:text-[32px] font-display font-semibold text-slate-900 mb-1 leading-none">
              {loading ? '...' : `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`}
            </div>
            <div className="text-[14px] text-slate-500 font-medium">Revenu total</div>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-400 cursor-pointer hover:text-slate-600">
            <Info className="w-5 h-5" />
          </div>
        </div>
        
        {/* Last 7 Days Revenue (Mocked for now since not tracking history, showing 0 or calculated) */}
        <div className="bg-slate-100/70 rounded-[24px] p-6 relative min-h-[160px] flex flex-col justify-end transition-all">
          <div className="absolute top-6 left-6 w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="text-[28px] md:text-[32px] font-display font-semibold text-slate-900 mb-1 leading-none">
              0 FCFA
            </div>
            <div className="text-[14px] text-slate-500 font-medium">7 derniers jours</div>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-400 cursor-pointer hover:text-slate-600">
            <Info className="w-5 h-5" />
          </div>
        </div>
        
        {/* Total Customers */}
        <div className="bg-slate-100/70 rounded-[24px] p-6 relative min-h-[160px] flex flex-col justify-end transition-all">
          <div className="absolute top-6 left-6 w-8 h-8 rounded-full flex items-center">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <div className="text-[28px] md:text-[32px] font-display font-semibold text-slate-900 mb-1 leading-none">
              {loading ? '...' : stats.customersCount}
            </div>
            <div className="text-[14px] text-slate-500 font-medium">Nombre total de clients</div>
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[18px] font-semibold text-slate-900">Produits les plus vendus</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Vos produits les plus vendus basés sur le total des ventes</p>
          </div>
          <Link to="/admin/products" className="px-5 py-2.5 bg-white rounded-full border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-sm">
            Voir tout
          </Link>
        </div>

        <div className="bg-slate-50/50 rounded-[24px] overflow-hidden flex flex-col justify-center border border-slate-100">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-4 flex flex-col items-center justify-center py-12">
              <PackageOpen className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-[15px] font-medium text-slate-600">Aucun produit.</p>
            </div>
          ) : (
            <div className="flex flex-col p-2 gap-1">
              {topProducts.map((product, idx) => (
                <div key={product.id || idx} className="p-3 flex items-center justify-between hover:bg-white transition-colors cursor-pointer rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[15px] text-slate-900 flex items-center gap-1.5">
                        {product.title} 🚀
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                      </h4>
                      <div className="text-[13px] text-slate-500 line-through mt-0.5">{(product.price || 0).toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[14px] text-slate-900">{(product.total_revenue || 0).toLocaleString('fr-FR')} FCFA</div>
                    <div className="text-[13px] text-slate-500">{product.sales_count || 0} Ventes</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COMMUNITY SECTION */}
      <div className="pt-4">
        <h3 className="text-[18px] font-semibold text-slate-900">Communauté</h3>
        <p className="text-[13px] text-slate-500 mt-0.5 mb-4">Connectez-vous avec des créateurs, apprenez de nouvelles compétences et aidez à façonner l'avenir de TECHNOVA.</p>
        
        {/* Example card, Chariow has a generic community card here */}
        <div className="bg-slate-50/50 rounded-[24px] p-8 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm min-h-[200px]">
          {/* Add real community content here later */}
        </div>
      </div>
      
    </div>
  );
}
