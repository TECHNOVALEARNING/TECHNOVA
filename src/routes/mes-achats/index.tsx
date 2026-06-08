import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Search, Package, GraduationCap, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/mes-achats/')({
  component: MesAchatsList,
});

function MesAchatsList() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const s = localStorage.getItem('buyer_session');
    if (!s) {
      navigate({ to: '/buyer-login' });
      return;
    }
    const parsed = JSON.parse(s);
    setSession(parsed);
    loadPurchases(parsed.customerId);
  }, [navigate]);

  const loadPurchases = async (customerId: string) => {
    setLoading(true);
    
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, amount, status, created_at, product_id, store_owner_id')
      .eq('customer_id', customerId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });

    if (ordersError || !orders || orders.length === 0) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    // Extract unique product IDs and store owner IDs
    const productIds = [...new Set(orders.map(o => o.product_id))];
    const ownerIds = [...new Set(orders.map(o => o.store_owner_id))];

    // Fetch products
    const { data: products } = await supabase
      .from('products')
      .select('id, title, type, thumbnail_url')
      .in('id', productIds);

    // Fetch profiles (store owners)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, store_name')
      .in('id', ownerIds);

    const productMap = new Map(products?.map(p => [p.id, p]));
    const profileMap = new Map(profiles?.map(p => [p.id, p]));

    const enrichedPurchases = orders.map(order => ({
      ...order,
      product: productMap.get(order.product_id),
      store: profileMap.get(order.store_owner_id)
    })).filter(p => p.product); // Filter out orders if product was deleted

    setPurchases(enrichedPurchases);
    setLoading(false);
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.product?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.product?.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!session) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900">
          Ravi de vous revoir, {session.customerName?.split(' ')[0] || session.email?.split('@')[0]} !
        </h1>
        <p className="text-[15px] text-slate-500 mt-2">
          Retrouvez tous vos achats, formations et fichiers au même endroit.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B] text-[15px] transition-colors shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide shrink-0">
          {[
            { id: 'all', label: 'Tout afficher' },
            { id: 'file', label: 'Fichiers' },
            { id: 'course', label: 'Formations' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-5 h-12 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-colors border ${
                filterType === f.id
                  ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Chargement de vos achats...</div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-[16px] font-bold text-slate-900">Aucun produit trouvé</h3>
          <p className="text-[14px] text-slate-500 mt-1">
            {searchQuery || filterType !== 'all' ? "Essayez d'autres filtres." : "Vous n'avez pas encore effectué d'achat avec cette adresse email."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map(purchase => {
            const product = purchase.product;
            const store = purchase.store;

            return (
              <div key={purchase.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group flex flex-col">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform duration-500">
                      {product.type === 'course' ? <GraduationCap className="w-16 h-16" /> : <Package className="w-16 h-16" />}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                     {product.type === 'course' ? <GraduationCap className="w-3.5 h-3.5"/> : <Package className="w-3.5 h-3.5"/>}
                     {product.type === 'course' ? 'FORMATION' : 'FICHIER'}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[16px] text-slate-900 leading-tight mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 mb-6 flex-1">
                    par {store?.store_name || 'Vendeur inconnu'}
                  </p>
                  
                  <Link
                    to={`/mes-achats/${purchase.id}`}
                    className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[14px] font-semibold text-slate-900 transition-colors group/btn"
                  >
                    Voir la commande
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-slate-600 transition-all" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
