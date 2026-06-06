import { createFileRoute, Outlet, useRouterState, redirect, Link } from '@tanstack/react-router';
import { 
  Home, ShoppingBag, Users, Settings, HelpCircle, Package, Bell, Search,
  CircleDollarSign, Menu as MenuIcon, X
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-slate-800 font-sans overflow-hidden">
      
      {/* ======================= */}
      {/* SIDEBAR PC (Hidden on mobile) */}
      {/* ======================= */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 flex-col h-screen">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 font-display font-black text-xl text-blue-600 tracking-tight">
            <img src={siteLogo} alt="Logo" className="h-8 w-auto object-contain" />
            TECHNOVA <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium ml-1">Admin</span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 shrink-0">
          <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition px-3 py-2 rounded-lg text-sm font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px]">
                IE
              </div>
              <span>Boutique Principale</span>
            </div>
            <span className="text-slate-400">▾</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          <Link to="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/admin') && currentPath === '/admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Home className={`w-5 h-5 ${isActive('/admin') && currentPath === '/admin' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            <span className="font-medium text-[14px]">Accueil</span>
          </Link>
          <Link to="/admin/sales" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/admin/sales') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ShoppingBag className={`w-5 h-5 ${isActive('/admin/sales') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            <span className="font-medium text-[14px]">Ventes</span>
          </Link>
          <Link to="/admin/products" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/admin/products') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Package className={`w-5 h-5 ${isActive('/admin/products') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            <span className="font-medium text-[14px]">Produits</span>
          </Link>
          <Link to="/admin/customers" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/admin/customers') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Users className={`w-5 h-5 ${isActive('/admin/customers') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            <span className="font-medium text-[14px]">Clients</span>
          </Link>
        </nav>
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
              <div className="ml-2 flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                <span className="text-sm font-medium">Boutique</span>
              </div>
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
              <div className="h-px bg-slate-100 my-4"></div>
              <Link to="/admin/settings" className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><Settings className="w-5 h-5 text-slate-400"/> Paramètres</Link>
              <div className="flex items-center gap-4 text-slate-700 font-medium text-[15px]"><HelpCircle className="w-5 h-5 text-slate-400"/> Centre d'aide</div>
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
      <main className="flex-1 flex flex-col min-w-0 h-screen w-full relative lg:pl-[260px] pb-[70px] lg:pb-0">
        
        {/* HEADER MOBILE & PC */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <img src={siteLogo} alt="Logo" className="h-6 w-auto lg:hidden" />
            <span className="font-bold text-lg lg:hidden">technova</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 bg-slate-50 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 bg-slate-50 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-auto bg-white lg:bg-[#FAFAFA]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
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
