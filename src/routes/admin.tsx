import { createFileRoute, Outlet, Link, useRouterState, redirect } from '@tanstack/react-router';
import { 
  LayoutDashboard, ShoppingBag, Users, LineChart, Megaphone, 
  Settings, HelpCircle, Package, Command, Bell, Search, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import siteLogo from '@/assets/logo.png';

import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

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

  // Fermer le menu mobile quand on change de page
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
      
      {/* OBSCURE BACKGROUND POUR MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Tiroir sur mobile, Fixe sur PC) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 font-display font-black text-xl text-blue-600 tracking-tight">
            <img src={siteLogo} alt="Logo" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline">TECHNOVA</span> <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium ml-1">Admin</span>
          </div>
          <button className="lg:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store selector */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <button className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition px-3 py-2 rounded-lg text-sm font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px]">
                IE
              </div>
              <span>Boutique Principale</span>
            </div>
            <span className="text-slate-400">▾</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
              <a 
                href="/admin" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive('/admin') && currentPath === '/admin' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${isActive('/admin') && currentPath === '/admin' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-[14px]">Accueil</span>
              </a>

              <a 
                href="/admin/sales" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive('/admin/sales') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${isActive('/admin/sales') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-[14px]">Ventes</span>
              </a>

              <a 
                href="/admin/products" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive('/admin/products') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className={`w-5 h-5 ${isActive('/admin/products') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-[14px]">Produits</span>
              </a>

              <a 
                href="/admin/customers" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive('/admin/customers') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className={`w-5 h-5 ${isActive('/admin/customers') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-[14px]">Clients</span>
              </a>

              <a 
                href="/admin/settings" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive('/admin/settings') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings className={`w-5 h-5 ${isActive('/admin/settings') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-[14px]">Paramètres</span>
              </a>
        </nav>

        {/* Bottom links */}
        <div className="p-4 border-t border-slate-100 space-y-1 shrink-0 bg-slate-50/50">
          <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            Paramètres
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            Centre d'aide
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen w-full relative">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0">
          <div className="flex-1 flex items-center gap-2 sm:gap-4">
            {/* BOUTON MENU MOBILE */}
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* BARRE DE RECHERCHE */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher (Ctrl+K)..." 
                className="w-full bg-slate-100/50 border border-transparent text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/" target="_blank" className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
              Voir la boutique
            </a>
            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-sm cursor-pointer ml-1" />
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-auto bg-[#FAFAFA] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
