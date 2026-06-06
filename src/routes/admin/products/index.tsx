import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Search, Filter, MoreHorizontal, FileText, ChevronLeft, ChevronRight, Loader2, PackageOpen, Edit2, Link as LinkIcon, Trash2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/products/')({
  component: AdminProducts,
});

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Tout' | 'Brouillon' | 'Publié'>('Tout');

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      try {
        await adminSupabase.from('products').delete().eq('id', id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error("Erreur suppression:", err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(url);
    alert('Lien de paiement copié !');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let status = 'active';
    try {
      const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
      if (feats?.status) status = feats.status;
    } catch (e) {}

    const matchesTab = 
      activeTab === 'Tout' ? true :
      activeTab === 'Brouillon' ? status === 'draft' :
      activeTab === 'Publié' ? status === 'active' : true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="w-full pb-12 font-sans" onClick={() => setActiveDropdown(null)}>
      
      {/* Container principal */}
      <div className="bg-white rounded-[24px] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-[20px] font-semibold text-slate-900">Produits</h2>
          <Link 
            to="/admin/products/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-12 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <Filter className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('Tout')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'Tout' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Tout
          </button>
          <button 
            onClick={() => setActiveTab('Publié')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'Publié' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Publié
          </button>
          <button 
            onClick={() => setActiveTab('Brouillon')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'Brouillon' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Brouillon
          </button>
        </div>

        {/* LIST */}
        <div className="flex flex-col">
          {loading ? (
            <div className="py-24 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
               <PackageOpen className="w-16 h-16 text-slate-200 mb-4" />
               <h3 className="text-[15px] font-medium text-slate-700 mb-1">Aucun produit</h3>
            </div>
          ) : (
            filteredProducts.map((product, idx) => {
              let status = 'active';
              try {
                const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                if (feats?.status) status = feats.status;
              } catch (e) {}

              return (
                <div key={product.id} className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors group relative ${idx !== filteredProducts.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    {/* IMAGE / ICON */}
                    <div className="w-[48px] h-[48px] rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                      )}
                      {status === 'draft' && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
                      )}
                    </div>
                    {/* INFO */}
                    <div>
                      <h4 className="font-semibold text-[15px] text-slate-900 flex items-center gap-1.5">
                        <span className="line-clamp-1">{product.title}</span>
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[14px] font-medium text-slate-900">{product.price.toLocaleString('fr-FR')} FCFA</span>
                        {status === 'draft' && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Brouillon</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* ACTION BTN */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === product.id ? null : product.id); }}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 hover:text-slate-600 rounded-xl transition-colors shrink-0"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === product.id && (
                      <div 
                        className="absolute right-0 top-12 w-48 bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-1.5 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => navigate({ to: '/admin/products/new' as any, search: { id: product.id } as any })}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[14px] text-slate-700 font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                          Modifier
                        </button>
                        <button 
                          onClick={() => { handleCopyLink(product.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[14px] text-slate-700 font-medium transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                          Lien de paiement
                        </button>
                        <div className="h-px w-full bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => { handleDelete(product.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-[14px] text-red-600 font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* PAGINATION */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-6 text-slate-400">
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-slate-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
