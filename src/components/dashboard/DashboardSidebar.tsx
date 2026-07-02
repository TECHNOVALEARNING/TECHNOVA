import {
  LayoutDashboard,
  Package,
  Key,
  Settings,
  LogOut,
  Store,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  Megaphone,
  Link2,
  Zap,
  HelpCircle,
  Wallet,
  Shield,
  Webhook,
  MessageCircle,
  ChevronsUpDown,
  Plus,
  Check,
  BadgeCheck,
  LayoutGrid,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const translations = {
  fr: {
    principal: "Principal",
    home: "Accueil",
    products: "Produits",
    sales: "Ventes",
    analytics: "Analytiques",
    more: "Autres",
    settings: "Paramètres",
    helpCenter: "Centre d'aide",
    administration: "Administration",
    overview: "Vue d'ensemble",
    users: "Utilisateurs",
    withdrawals: "Retraits",
    support: "Support",
    moderation: "Modération",
    kyc: "KYC",
    badges: "Badges Verify",
  },
  en: {
    principal: "Main",
    home: "Home",
    products: "Products",
    sales: "Sales",
    analytics: "Analytics",
    more: "More",
    settings: "Settings",
    helpCenter: "Help Center",
    administration: "Administration",
    overview: "Overview",
    users: "Users",
    withdrawals: "Withdrawals",
    support: "Support",
    moderation: "Moderation",
    kyc: "KYC",
    badges: "Verify Badges",
  },
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { stores, activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const isAdmin = user?.email === "ancres707@gmail.com";

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const mainItems = [
    { title: t.home, url: "/dashboard", icon: LayoutDashboard },
    { title: t.products, url: "/dashboard/products", icon: Package },
    { title: t.sales, url: "/dashboard/sales", icon: ShoppingCart },
    { title: t.analytics, url: "/dashboard/analytics", icon: BarChart3 },
    { title: t.more, url: "/dashboard/others", icon: LayoutGrid, badge: "New" },
  ];

  const adminItems = [
    { title: t.overview, url: "/admin", icon: BarChart3 },
    { title: t.users, url: "/admin/users", icon: Users },
    { title: t.withdrawals, url: "/admin/withdrawals", icon: Wallet },
    { title: t.support, url: "/admin/support", icon: MessageCircle },
    { title: t.moderation, url: "/admin/moderation", icon: Package },
    { title: t.kyc, url: "/admin/kyc", icon: Shield },
    { title: t.badges, url: "/admin/badges", icon: BadgeCheck },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="dashboard-shell-scope border-r-0 z-20">
      {/* Logo Header */}
      <SidebarHeader
        className={`p-4 border-b border-sidebar-border/20 flex flex-row items-center min-h-[64px] ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="TECHNOVA"
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="text-white font-bold text-xl tracking-tight">TECHNOVA</span>
          </div>
        )}
        <SidebarTrigger className="text-white/70 hover:text-white" />
      </SidebarHeader>

      <SidebarContent className="py-1 px-1 overflow-y-auto">
        {/* Main nav */}
        <SidebarGroup className="py-0.5">
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-2 mb-0 h-6">
              {t.principal}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="dash-menu-item"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white ml-auto">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings & help */}
        <SidebarGroup className="py-0.5">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/settings")}
                  className="dash-menu-item"
                >
                  <NavLink to="/dashboard/settings">
                    <Settings className="h-3.5 w-3.5" />
                    {!collapsed && <span>{t.settings}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="dash-menu-item">
                  <a href="/faq" target="_blank">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {!collapsed && <span>{t.helpCenter}</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <>
                  {!collapsed && <Separator className="my-1 bg-sidebar-border/50" />}
                  {!collapsed && (
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-2 mb-0 h-6">
                      {t.administration}
                    </SidebarGroupLabel>
                  )}
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="dash-menu-item"
                      >
                        <NavLink to={item.url}>
                          <item.icon className="h-3.5 w-3.5" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
