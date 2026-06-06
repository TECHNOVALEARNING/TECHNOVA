import { createFileRoute } from '@tanstack/react-router';
import { 
  Sparkles, Plus, Play, Tag, TrendingUp, Users, DollarSign, ShoppingBag, Loader2, PackageOpen, Info
} from 'lucide-react';
import { adminSupabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data: productsData } = await adminSupabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        const productsWithSales = (productsData || []).map(p => ({
          ...p,
          sales_count: 0, 
          total_revenue: 0
        }));

        const soldProducts = productsWithSales
          .filter(p => p.sales_count > 0)
          .sort((a, b) => b.sales_count - a.sales_count)
          .slice(0, 5);

        setTopProducts(soldProducts);

        const { data: ordersData, error: ordersError } = await adminSupabase
          .from('orders')
          .select('customer_email');

        if (!ordersError && ordersData) {
          const uniqueClients = new Set(ordersData.filter(o => o.customer_email).map(o => o.customer_email));
          setTotalClients(uniqueClients.size);
        } else {
          setTotalClients(0);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="w-full space-y-8 pb-12">

      {/* WELCOME TEXT */}
      <div className="pt-2 pb-4">
        <h2 className="text-[28px] font-display font-medium text-slate-900 flex items-center gap-3">
          Bon après-midi Isidore Abraham ! <span className="text-3xl">⛅</span>
        </h2>
        <p className="text-[13px] text-slate-500 mt-1 flex items-center gap-2">
          <span className="text-[#8B5CF6] text-base">🪄</span> C'est l'heure de pointe - lancez cette campagne que vous planifiez !
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-200">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          Demander à l'IA
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-200">
          <Plus className="w-4 h-4 text-slate-400" />
          Ajouter un produit
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-200">
          <Play className="w-4 h-4 text-slate-400" />
          Créer un workflow
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-200">
          <Tag className="w-4 h-4 text-slate-400" />
          Créer une réduction
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between h-36 relative">
          <div>
            <div className="text-3xl font-display font-semibold text-slate-900 mb-1">0 FCFA</div>
            <div className="text-[13px] font-medium text-slate-500">Revenu total</div>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
            <Info className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between h-36 relative">
          <div>
            <div className="text-3xl font-display font-semibold text-slate-900 mb-1">0 FCFA</div>
            <div className="text-[13px] font-medium text-slate-500">7 derniers jours</div>
          </div>
          <div className="absolute bottom-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
            <Info className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between h-36">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-3xl font-display font-semibold text-slate-900 mb-1">{loading ? '...' : totalClients}</div>
            <div className="text-[13px] font-medium text-slate-500">Nombre total de clients</div>
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[17px] font-display font-bold text-slate-900">Produits les plus vendus</h3>
            <p className="text-[13px] text-slate-500 mt-1">Vos produits les plus vendus basés sur le total des ventes</p>
          </div>
          {topProducts.length > 0 && (
            <button className="px-5 py-2 bg-white rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ring-1 ring-slate-200">
              Voir tout
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden min-h-[120px] flex flex-col justify-center">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <PackageOpen className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-medium text-slate-600">Aucun produit vendu pour le moment.</p>
              <p className="text-sm mt-1 text-slate-400">Les produits apparaîtront ici dès votre première vente.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {topProducts.map((product, idx) => (
                <div key={product.id || idx} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${idx !== topProducts.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[14px] text-slate-900 flex items-center gap-2">
                        {product.title}
                        {idx === 0 && <span className="text-xs">🚀</span>}
                      </h4>
                      <div className="text-[13px] text-slate-500 mt-0.5">{product.price.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[14px] text-slate-900">{product.total_revenue.toLocaleString('fr-FR')} FCFA</div>
                    <div className="text-[13px] text-slate-500">{product.sales_count} Ventes</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
