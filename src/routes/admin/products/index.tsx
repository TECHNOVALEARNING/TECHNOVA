import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, Filter, MoreHorizontal, FileText, ChevronLeft, ChevronRight, Loader2, PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/products/')({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Erreur de récupération des produits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="w-full pb-12">
      {/* HEADER / SEARCH */}
      <div className="mb-4">
        <div className="relative w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher" 
            className="w-full bg-slate-50 border border-slate-200 text-[15px] rounded-full pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 rounded text-slate-500 font-bold text-xs">
            /
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar border-b border-slate-100">
        <button className="px-5 py-2 bg-slate-100 text-slate-900 rounded-full text-[14px] font-semibold flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Tout
        </button>
        <button className="px-5 py-2 text-slate-600 hover:bg-slate-50 rounded-full text-[14px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Brouillon
        </button>
        <button className="px-5 py-2 text-slate-600 hover:bg-slate-50 rounded-full text-[14px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Publié
        </button>
      </div>

      {/* LIST HEADER */}
      <div className="flex items-center justify-between py-4 text-[14px] font-semibold text-slate-500 border-b border-slate-200">
        <span>Produit</span>
        <span>Actions</span>
      </div>

      {/* LIST */}
      <div className="flex flex-col">
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
             <PackageOpen className="w-16 h-16 text-slate-200 mb-4" />
             <h3 className="text-[15px] font-medium text-slate-700 mb-1">Aucun produit</h3>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {/* IMAGE / ICON */}
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
                {/* INFO */}
                <div>
                  <h4 className="font-semibold text-[15px] text-slate-900 flex items-center gap-1.5">
                    <span className="line-clamp-1">{product.title}</span>
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </h4>
                  <div className="text-[13px] text-slate-500 mt-0.5">{product.price.toLocaleString('fr-FR')} FCFA</div>
                </div>
              </div>
              
              {/* ACTION BTN */}
              <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shrink-0">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {products.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-8 text-slate-400">
          <button className="p-2 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="p-2 hover:text-slate-600 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
}
