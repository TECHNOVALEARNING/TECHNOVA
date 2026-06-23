import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import NotificationBell from "./NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Store, ChevronDown, Check, Plus, Store as StoreIcon, User, LogOut, Globe, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";

const translations = {
  fr: {
    marketplaces: "Marketplaces",
    yourStores: "Vos boutiques",
    createStore: "Créer une boutique",
    visitStore: "Visiter la boutique",
    myAccount: "Mon Compte",
    profile: "Profil",
    signOut: "Déconnexion",
    store: "Boutique",
    creator: "Créateur",
  },
  en: {
    marketplaces: "Marketplaces",
    yourStores: "Your stores",
    createStore: "Create a store",
    visitStore: "Visit storefront",
    myAccount: "My Account",
    profile: "Profile",
    signOut: "Sign out",
    store: "Store",
    creator: "Creator",
  }
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const isAdmin = user?.email === "ancres707@gmail.com";

  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_theme") || "light") : "light");
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("technova_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("technova_lang", lang);
    window.dispatchEvent(new Event("technova_lang_changed"));
  }, [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("technova_lang") || "fr");
    };
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  return (
    <SidebarProvider>
      <div className="dashboard-shell min-h-screen flex w-full relative overflow-hidden">
        {/* Floating background glow orbs */}
        <div className="bg-orb orb-1 opacity-20 dark:opacity-10 pointer-events-none absolute z-0" />
        <div className="bg-orb orb-2 opacity-20 dark:opacity-10 pointer-events-none absolute z-0" />
        <div className="bg-orb orb-3 opacity-15 dark:opacity-10 pointer-events-none absolute z-0" />

        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* Header */}
            <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b border-border/50 px-3 sm:px-6 bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
              <div className="flex items-center gap-3 min-w-0 pl-1">
                <SidebarTrigger className="md:hidden" />
                
                {/* Branding Mobile */}
                <div className="md:hidden flex items-center gap-2 ml-1">
                  <img src={logo} alt="TECHNOVA Logo" className="h-7 w-7 object-contain rounded-md" />
                  <span className="font-black text-[15px] tracking-[0.02em] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    TECHNOVA
                  </span>
                </div>
                
                {isAdmin && (
                  <button 
                    onClick={() => navigate('/dashboard/stores')}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <StoreIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t.marketplaces}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                
                {/* Store Switcher */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors bg-background/50">
                        <StoreIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                          {activeStore?.name || t.store}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[220px]">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.yourStores}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {activeStores.map((store) => (
                        <DropdownMenuItem
                          key={store.id}
                          onClick={() => setActiveStoreId(store.id)}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 overflow-hidden">
                            {store.logo_url ? (
                              <img src={store.logo_url} alt="" className="h-6 w-6 object-cover" />
                            ) : (
                              <Store className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{store.name}</p>
                          </div>
                          {store.id === activeStore?.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      ))}
                      {activeStores.length < 3 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/dashboard/stores")} className="flex items-center gap-2.5 cursor-pointer text-primary">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/40">
                              <Plus className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-medium">{t.createStore}</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Visiter la boutique button */}
                {isAdmin && activeStore && (
                  <a 
                    href={`https://${activeStore.slug}.technova.app`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center justify-center px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {t.visitStore}
                  </a>
                )}

                <div className="h-5 w-px bg-border hidden sm:block" />

                {/* Language Switcher */}
                <button 
                  onClick={() => setLang(l => l === "fr" ? "en" : "fr")} 
                  className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted/50 dark:hover:bg-muted/30"
                  title="Switch Language / Changer de langue"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{lang.toUpperCase()}</span>
                </button>

                {/* Theme Switcher */}
                <button 
                  onClick={() => setTheme(t => t === "light" ? "dark" : "light")} 
                  className="p-2 rounded-full hover:bg-muted/50 dark:hover:bg-muted/30 opacity-80 hover:opacity-100 transition-opacity text-foreground"
                  aria-label="Toggle theme"
                  title={theme === "light" ? "Dark Mode" : "Light Mode"}
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>

                <NotificationBell />

                {/* User Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-muted/50 dark:hover:bg-muted/30 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-border">
                      <Avatar className="h-8 w-8 shrink-0 border border-border">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start text-left max-w-[120px]">
                        <span className="text-sm font-medium text-foreground truncate w-full">{profile?.display_name || t.creator}</span>
                        <span className="text-[10px] text-muted-foreground truncate w-full leading-none">{user?.email}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{t.myAccount}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t.profile}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.signOut}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </header>

            {/* Main content */}
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden relative z-10"
            >
              {children}
            </motion.main>
          </div>
        </div>
      </SidebarProvider>
  );
};

export default DashboardLayout;
