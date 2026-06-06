import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { 
  Search, Filter, MoreVertical, FileText, ChevronLeft, ChevronRight, 
  Loader2, PackageOpen, Edit2, Link as LinkIcon, Trash2, Plus,
  Eye, Copy, Share2, Pin, Globe, Circle
} from 'lucide-react';
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

  const handleShare = async (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Produit TECHNOVA', url: url });
      } catch (err) {}
    } else {
      handleCopyLink(id);
    }
  };

  const handleDuplicate = async (product: any) => {
    try {
      const { id, created_at, ...rest } = product;
      const newProduct = { ...rest, title: `${product.title} (Copie)` };
      const { data, error } = await adminSupabase.from('products').insert([newProduct]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setProducts([data[0], ...products]);
      }
    } catch (err) {
      console.error("Erreur de duplication:", err);
      alert("Erreur lors de la duplication");
    }
  };

  const handleToggleStatus = async (product: any, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      let featuresObj: any = {};
      try {
        featuresObj = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
      } catch (e) {}
      featuresObj.status = newStatus;
      
      const { error } = await adminSupabase.from('products').update({ features: featuresObj }).eq('id', product.id);
      if (error) throw error;
      
      setProducts(products.map(p => p.id === product.id ? { ...p, features: featuresObj } : p));
    } catch (err) {
      console.error("Erreur de statut:", err);
    }
  };

  const handleTogglePin = async (product: any) => {
    try {
      let featuresObj: any = {};
      try {
        featuresObj = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
      } catch (e) {}
      featuresObj.is_pinned = !featuresObj.is_pinned;
      
      const { error } = await adminSupabase.from('products').update({ features: featuresObj }).eq('id', product.id);
      if (error) throw error;
      
      setProducts(products.map(p => p.id === product.id ? { ...p, features: featuresObj } : p));
    } catch (err) {
      console.error("Erreur d'épinglage:", err);
    }
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
      
      <div className="bg-white rounded-[24px]">
        
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-[20px] font-semibold text-slate-900">Produits</h2>
          <Link 
            to="/admin/products/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors shadow-sm"
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
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Tout
          </button>
          <button 
            onClick={() => setActiveTab('Brouillon')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'Brouillon' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Brouillon
          </button>
          <button 
            onClick={() => setActiveTab('Publié')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'Publié' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Publié
          </button>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[2.5fr_1fr_1fr_80px] px-6 py-3 border-b border-slate-100 text-[13px] font-medium text-slate-500">
          <div>Produit</div>
          <div>Prix</div>
          <div>Statut</div>
          <div className="text-center">Actions</div>
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
              let isPinned = false;
              try {
                const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                if (feats?.status) status = feats.status;
                if (feats?.is_pinned) isPinned = true;
              } catch (e) {}

              return (
                <div key={product.id} className="grid grid-cols-[2.5fr_1fr_1fr_80px] items-center px-6 py-3 hover:bg-slate-50/80 transition-colors border-b border-slate-50 group">
                  {/* Produit */}
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className="w-[42px] h-[42px] rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                      )}
                      {status === 'draft' && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-medium text-[14px] text-slate-900 truncate">{product.title}</h4>
                      {isPinned && <Pin className="w-3 h-3 text-blue-500 shrink-0 fill-blue-500" />}
                      <FileText 
                        className="w-3.5 h-3.5 text-slate-300 shrink-0 cursor-pointer hover:text-slate-600 transition-colors ml-1" 
                        onClick={(e) => { e.stopPropagation(); handleCopyLink(product.id); }} 
                      />
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="text-[14px] text-slate-700 font-medium">
                    {(product.price || 0).toLocaleString('fr-FR')} FCFA
                  </div>

                  {/* Statut */}
                  <div>
                    {status === 'active' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-white shadow-sm">
                        <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                        <span className="text-[12px] font-semibold text-emerald-700">Publié</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
                        <Circle className="w-2 h-2 text-slate-400 fill-transparent" />
                        <span className="text-[12px] font-semibold text-slate-600">Brouillon</span>
                      </div>
                    )}
                  </div>
                  
                  {/* ACTION BTN */}
                  <div className="flex justify-center relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === product.id ? null : product.id); }}
                      className={`w-8 h-8 flex items-center justify-center rounded-[10px] shadow-sm transition-colors border ${activeDropdown === product.id ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu Popup */}
                    {activeDropdown === product.id && (
                      <div 
                        className="absolute right-0 top-10 w-[200px] bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[16px] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => navigate({ to: '/admin/products/new' as any, search: { id: product.id } as any })}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                          Modifier
                        </button>
                        <button 
                          onClick={() => { window.open(`/checkout/${product.id}`, '_blank'); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          Voir
                        </button>
                        <button 
                          onClick={() => { handleDuplicate(product); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Copy className="w-4 h-4 text-slate-500" />
                          Dupliquer
                        </button>
                        <button 
                          onClick={() => { handleShare(product.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-slate-500" />
                          Partager
                        </button>
                        <button 
                          onClick={() => { handleCopyLink(product.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-slate-500" />
                          Lien
                        </button>
                        <button 
                          onClick={() => { handleTogglePin(product); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Pin className="w-4 h-4 text-slate-500" />
                          {isPinned ? 'Désépingler' : 'Épingler'}
                        </button>
                        <button 
                          onClick={() => { handleToggleStatus(product, status); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-[13px] text-slate-700 font-medium transition-colors"
                        >
                          <Globe className="w-4 h-4 text-slate-500" />
                          {status === 'active' ? 'Passer en brouillon' : 'Publier'}
                        </button>
                        
                        <div className="h-px w-full bg-slate-100 my-1"></div>
                        
                        <button 
                          onClick={() => { handleDelete(product.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-[13px] text-red-600 font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-slate-600 transition-colors shadow-sm bg-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-slate-600 transition-colors shadow-sm bg-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
