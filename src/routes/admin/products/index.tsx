import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Search, MoreHorizontal, FileEdit, Trash2, ExternalLink, PackageOpen, Loader2, Filter } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-display font-semibold text-slate-900">Produits</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Trouvez n'importe quoi : Appuyez sur Ctrl+K..." 
              className="w-full bg-slate-50 border border-slate-200 text-[13px] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <Link 
            to="/admin/products/create" 
            className="bg-[#FCD34D] hover:bg-[#FBBF24] text-slate-900 px-5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Link>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Filters & Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher" 
              className="w-full bg-white border border-slate-200 text-[13px] rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-slate-300 transition-all shadow-sm"
            />
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button className="px-4 py-1.5 bg-slate-100 text-slate-900 rounded-full text-[13px] font-medium flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Tout
            </button>
            <button className="px-4 py-1.5 text-slate-600 hover:bg-slate-50 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Brouillon
            </button>
            <button className="px-4 py-1.5 text-slate-600 hover:bg-slate-50 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Publié
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
              <PackageOpen className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-[15px] font-medium text-slate-700 mb-1">Aucun produit trouvé</h3>
              <p className="text-[13px] mb-6">Commencez par créer votre premier produit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-500">
                    <th className="px-6 py-4 font-medium w-1/2">Produit</th>
                    <th className="px-6 py-4 font-medium">Prix</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    let status = 'active';
                    try {
                      const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                      if (feats?.status) status = feats.status;
                    } catch (e) {}

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="font-medium text-[14px] text-slate-800 line-clamp-1">{product.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-[13px] text-slate-600">{product.price.toLocaleString('fr-FR')} FCFA</div>
                        </td>
                        <td className="px-6 py-3">
                          {status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-slate-100 text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-transparent border border-slate-400" />
                              Brouillon
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center">
                            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
