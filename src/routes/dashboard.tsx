import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { 
  LogOut, Search, PlayCircle, Download, FileText, Briefcase, Key, LayoutGrid
} from 'lucide-react';
import siteLogo from '@/assets/logo.png';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
    return { session };
  },
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { session } = Route.useRouteContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const email = session?.user?.email;
        if (!email) {
          setLoading(false);
          return;
        }

        // 1. Fetch completed orders for this email
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('customer_email', email)
          .eq('status', 'completed');
          
        if (ordersError) throw ordersError;

        // 2. Extract unique products from orders
        const uniqueProducts = new Map();
        (ordersData || []).forEach(order => {
           if (order.products) {
              const p = order.products;
              // Filtrer les anciens produits de test Lumézia
              let type = '';
              try {
                const feats = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
                if (feats?.type) type = feats.type;
              } catch(e) {}
              
              if (['fichier', 'formation', 'service', 'pdf', 'ebook'].includes(type)) {
                uniqueProducts.set(p.id, p);
              }
           }
        });
        
        setProducts(Array.from(uniqueProducts.values()));
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [session?.user?.email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || 'AA';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Top Navigation - Chariow Style */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-xl text-blue-600 tracking-tight">
          <img src={siteLogo} alt="Logo" className="h-6 w-auto object-contain" />
          TECHNOVA
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Accueil
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-900 font-bold bg-slate-50 px-4 py-2 rounded-full">
            <LayoutGrid className="w-4 h-4" />
            Achats
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Découvrir
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Se déconnecter">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
            {userInitials}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Ravi de vous revoir</h1>
          <p className="text-slate-500 text-lg">Voici tous vos achats</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher" 
            className="w-full bg-white border border-slate-200 text-base rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-50 transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button className="px-5 py-2 bg-white border border-slate-200 text-slate-900 rounded-full text-sm font-semibold shadow-sm">Tout</button>
          <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            <span className="text-yellow-500"><FileText className="w-4 h-4" /></span>
            Fichiers
          </button>
          <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            <span className="text-blue-500"><PlayCircle className="w-4 h-4" /></span>
            Cours
          </button>
          <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            <span className="text-slate-700"><Briefcase className="w-4 h-4" /></span>
            Services
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Chargement de vos achats...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
            Vous n'avez pas encore d'achats.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              let type = 'fichier';
              try {
                const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                if (feats?.type) type = feats.type;
              } catch(e) {}

              const isFile = type === 'fichier' || type === 'pdf' || type === 'ebook';
              const buttonText = isFile ? "Télécharger le fichier" : "Accéder au cours";

              return (
                <Link 
                  key={product.id} 
                  to="/history/$id"
                  params={{ id: product.id }}
                  className="bg-white rounded-[2rem] border border-slate-100 p-3 hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-square w-full rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4 relative">
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-4">{product.title}</h3>
                    <div className="mt-auto">
                      <button className="w-full bg-[#1c222b] hover:bg-black text-white font-medium py-3.5 rounded-xl transition-colors">
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
