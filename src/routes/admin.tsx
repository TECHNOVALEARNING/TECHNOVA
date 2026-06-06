import { createFileRoute, Outlet, useRouterState, redirect, Link } from '@tanstack/react-router';
import { 
  Home, ShoppingBag, Users, Settings, HelpCircle, Package, Bell, Search,
  CircleDollarSign, Menu as MenuIcon, X, BarChart2, Megaphone, Share2, Zap, Plus, ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import siteLogo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: '/login', search: { redirect: location.href } });
    const adminEmails = ['isidoreagonan@gmail.com', 'acres707@gmail.com'];
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const isActive = (path: string) => {
    return path === '/admin/' || path === '/admin'
      ? (currentPath === '/admin' || currentPath === '/admin/')
      : currentPath.startsWith(path);
  };

  const getPageTitle = () => {
    if (currentPath === '/admin' || currentPath === '/admin/') return 'Aperçu';
    if (currentPath.startsWith('/admin/sales')) return 'Ventes';
    if (currentPath.startsWith('/admin/products')) return 'Produits';
    if (currentPath.startsWith('/admin/customers')) return 'Clients';
    if (currentPath.startsWith('/admin/earnings')) return 'Revenus';
    if (currentPath.startsWith('/admin/analytics')) return 'Analytiques';
    if (currentPath.startsWith('/admin/settings')) return 'Paramètres';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-white flex text-slate-800 font-sans overflow-hidden">
      
      {/* ======================= */}
      {/* SIDEBAR PC (Hidden on mobile) */}
      {/* ======================= */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-slate-100 flex-col h-screen py-4">
        {/* Logo Section */}
        <div className="px-6 mb-6 flex items-center gap-2 font-display font-black text-xl text-blue-600 tracking-tight shrink-0">
          <img src={siteLogo} alt="Logo" className="h-6 w-auto object-contain" />
          TECHNOVA <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium ml-1">Preview</span>
        </div>

        {/* Store Selector */}
        <div className="px-4 mb-4 shrink-0">
          <button className="w-full flex items-center justify-between bg-white border border-slate-200 hover:bg-slate-50 transition px-3 py-2 rounded-xl text-[13px] font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <span className="truncate max-w-[120px]">Dolapo-ECOM</span>
            </div>
            <span className="text-slate-400">▾</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-hide pb-4">
          <Link to="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin') && currentPath === '/admin' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <Home className={`w-[18px] h-[18px] ${isActive('/admin') && currentPath === '/admin' ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Accueil</span>
          </Link>
          <Link to="/admin/sales" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin/sales') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <ShoppingBag className={`w-[18px] h-[18px] ${isActive('/admin/sales') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Ventes</span>
          </Link>
          <Link to="/admin/products" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin/products') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <Package className={`w-[18px] h-[18px] ${isActive('/admin/products') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Produits</span>
          </Link>
          <Link to="/admin/customers" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin/customers') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <Users className={`w-[18px] h-[18px] ${isActive('/admin/customers') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Clients</span>
          </Link>
          <Link to="/admin/earnings" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin/earnings') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <CircleDollarSign className={`w-[18px] h-[18px] ${isActive('/admin/earnings') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Revenus</span>
          </Link>
          <Link to="/admin/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive('/admin/analytics') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <BarChart2 className={`w-[18px] h-[18px] ${isActive('/admin/analytics') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Analytiques</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
            <Megaphone className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[14px]">Marketing</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
            <Share2 className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[14px]">Affiliation</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
            <Zap className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[14px]">Automatisations</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
            <Plus className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[14px]">Plus</span>
          </div>
          <Link to="/admin/settings" className={`flex items-center gap-3 px-3 py-2 mt-4 rounded-lg transition-colors group ${isActive('/admin/settings') ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
            <Settings className={`w-[18px] h-[18px] ${isActive('/admin/settings') ? 'text-slate-900' : 'text-slate-400'}`} />
            <span className="text-[14px]">Paramètres</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
            <HelpCircle className="w-[18px] h-[18px] text-slate-400" />
            <span className="text-[14px]">Centre d'aide</span>
          </div>
        </nav>
        
        {/* Bottom Collapse Button */}
        <div className="px-4 shrink-0 border-t border-slate-100 pt-4">
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-[13px] font-medium transition-colors">
            <MenuIcon className="w-4 h-4" />
            Réduire le menu
          </button>
        </div>
      </aside>

      {/* ======================= */}
      {/* MOBILE MENU FULL SCREEN */}
      {/* ======================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] lg:hidden flex flex-col h-screen animate-in slide-in-from-bottom-4 duration-200">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <img src={siteLogo} alt="Logo" className="h-6 w-auto" />
              <span className="font-bold text-lg">technova</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <nav className="space-y-4">
              <Link to="/admin" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><Home className="w-5 h-5 text-slate-400"/> Accueil</Link>
              <Link to="/admin/sales" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><ShoppingBag className="w-5 h-5 text-slate-400"/> Ventes</Link>
              <Link to="/admin/products" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><Package className="w-5 h-5 text-slate-400"/> Produits</Link>
              <Link to="/admin/customers" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><Users className="w-5 h-5 text-slate-400"/> Clients</Link>
              <Link to="/admin/earnings" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><CircleDollarSign className="w-5 h-5 text-slate-400"/> Revenus</Link>
              <div className="h-px bg-slate-100 my-4"></div>
              <Link to="/admin/settings" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><Settings className="w-5 h-5 text-slate-400"/> Paramètres</Link>
            </nav>
            <div className="mt-auto pt-8">
              <a href="/" target="_blank" className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 rounded-xl font-semibold text-slate-800">
                <Home className="w-5 h-5" /> Visiter ma boutique
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================= */}
      {/* MAIN CONTENT AREA */}
      {/* ======================= */}
      <main className="flex-1 flex flex-col min-w-0 h-screen w-full relative lg:pl-[240px] pb-[70px] lg:pb-0">
        
        {/* HEADER MOBILE & PC */}
        <header className="h-[72px] bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4 min-w-max">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-[15px] text-slate-900">{getPageTitle()}</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 max-w-[600px] mx-8 relative">
            <Search className="w-[18px] h-[18px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Trouvez n'importe quoi : Appuyez sur ⌘K sur votre clavier"
              className="w-full bg-slate-50/80 border border-slate-200/60 rounded-full pl-11 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <button className="hidden lg:flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              Visiter ma boutique
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 bg-blue-50 transition-colors">
              <Zap className="w-[18px] h-[18px]" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Plus className="w-[18px] h-[18px]" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-sm flex-shrink-0" />
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-auto bg-white lg:px-8 px-4">
          <div className="py-6 max-w-[1200px] mx-auto h-full">
            <Outlet />
          </div>
        </div>

        {/* ======================= */}
        {/* MOBILE BOTTOM NAVIGATION */}
        {/* ======================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 flex justify-between items-center z-40 pb-safe">
          <Link to="/admin" className={`flex flex-col items-center gap-1 w-1/5 ${isActive('/admin') && currentPath === '/admin' ? 'text-blue-600' : 'text-slate-500'}`}>
            <div className={`p-1.5 rounded-full ${isActive('/admin') && currentPath === '/admin' ? 'bg-blue-50' : ''}`}>
              <Home className="w-6 h-6" strokeWidth={isActive('/admin') && currentPath === '/admin' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">Accueil</span>
          </Link>
          <Link to="/admin/products" className={`flex flex-col items-center gap-1 w-1/5 ${isActive('/admin/products') ? 'text-blue-600' : 'text-slate-500'}`}>
            <div className={`p-1.5 rounded-full ${isActive('/admin/products') ? 'bg-blue-50' : ''}`}>
              <Package className="w-6 h-6" strokeWidth={isActive('/admin/products') ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">Produits</span>
          </Link>
          <Link to="/admin/sales" className={`flex flex-col items-center gap-1 w-1/5 ${isActive('/admin/sales') ? 'text-blue-600' : 'text-slate-500'}`}>
            <div className={`p-1.5 rounded-full ${isActive('/admin/sales') ? 'bg-blue-50' : ''}`}>
              <ShoppingBag className="w-6 h-6" strokeWidth={isActive('/admin/sales') ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">Ventes</span>
          </Link>
          <button className="flex flex-col items-center gap-1 w-1/5 text-slate-500">
            <div className="p-1.5 rounded-full">
              <CircleDollarSign className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium">Affilié</span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 w-1/5 text-slate-500">
            <div className={`p-1.5 rounded-full ${isMobileMenuOpen ? 'bg-slate-100 text-slate-900' : ''}`}>
              <MenuIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-slate-900">Menu</span>
          </button>
        </div>

      </main>
    </div>
  );
}
