import {
  LayoutDashboard, Package, Key,
  Settings, LogOut, Store, ShoppingCart, Users, DollarSign,
  BarChart3, Megaphone, Link2, Zap, HelpCircle, Wallet, Shield, Webhook, MessageCircle,
  ChevronsUpDown, Plus, Check, BadgeCheck
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Accueil", url: "/dashboard", icon: LayoutDashboard },
  { title: "Produits", url: "/dashboard/products", icon: Package },
  { title: "Ventes", url: "/dashboard/sales", icon: ShoppingCart },
  { title: "Clients", url: "/dashboard/clients", icon: Users },
  { title: "Licences", url: "/dashboard/licenses", icon: Key },
  { title: "Revenus", url: "/dashboard/revenue", icon: DollarSign },
  { title: "Wallet", url: "/dashboard/wallet", icon: Wallet, external: true },
  { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
];

const toolsItems = [
  { title: "Badge Verify", url: "/dashboard/badge", icon: BadgeCheck },
  { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
  { title: "Affiliation", url: "/dashboard/affiliation", icon: Link2 },
  { title: "Automatisations", url: "/dashboard/automations", icon: Zap },
  { title: "Webhooks", url: "/dashboard/webhooks", icon: Webhook },
  { title: "Messages", url: "/dashboard/support", icon: MessageCircle },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { stores, activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const isAdmin = user?.email === "isidoreagonan@gmail.com";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="dashboard-shell-scope border-r border-border bg-white">
      {/* Store Switcher Header */}
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full rounded-xl p-2 hover:bg-sidebar-accent transition-colors text-left group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                {activeStore?.logo_url ? (
                  <img src={activeStore.logo_url} alt="" className="h-9 w-9 rounded-xl object-cover" />
                ) : (
                  <img src={logo} alt="TECHNOVA" className="h-5 w-5 object-contain" />
                )}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-sidebar-foreground block truncate">
                      {activeStore?.name || "TECHNOVA"}
                    </span>
                    <span className="text-[10px] text-sidebar-foreground/40 leading-none uppercase tracking-wider">
                      {activeStores.length} boutique{activeStores.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70 transition-colors shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]"
          >
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Vos boutiques
            </DropdownMenuLabel>
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
                  <p className="text-[10px] text-muted-foreground truncate">{store.slug}.technova.app</p>
                </div>
                {store.id === activeStore?.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
            {stores.filter(s => s.is_archived).length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Archivées
                </DropdownMenuLabel>
                {stores.filter(s => s.is_archived).map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => setActiveStoreId(store.id)}
                    className="flex items-center gap-2.5 cursor-pointer opacity-50"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-sm truncate">{store.name}</p>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {activeStores.length < 3 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/stores")}
                  className="flex items-center gap-2.5 cursor-pointer text-primary"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/40">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">Créer une boutique</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="py-1 px-1 overflow-y-auto">
        {/* Main nav */}
        <SidebarGroup className="py-0.5">
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-2 mb-0 h-6">Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={!item.external && isActive(item.url)}
                    className="dash-menu-item"
                  >
                    {item.external ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <item.icon className="h-3.5 w-3.5" />
                        {!collapsed && <span>{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink to={item.url} end={item.url === "/dashboard"}>
                        <item.icon className="h-3.5 w-3.5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="my-1 bg-sidebar-border/50" />}

        {/* Tools */}
        <SidebarGroup className="py-0.5">
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-2 mb-0 h-6">Outils</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {toolsItems.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="my-1 bg-sidebar-border/50" />}

        {/* Settings & help */}
        <SidebarGroup className="py-0.5">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")} className="dash-menu-item">
                  <NavLink to="/dashboard/settings">
                    <Settings className="h-3.5 w-3.5" />
                    {!collapsed && <span>Paramètres</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="dash-menu-item">
                  <a href="/faq" target="_blank">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {!collapsed && <span>Centre d'aide</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <>
                  {!collapsed && <Separator className="my-1 bg-sidebar-border/50" />}
                  {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-2 mb-0 h-6">Administration</SidebarGroupLabel>}
                  {[
                    { title: "Vue d'ensemble", url: "/dashboard/admin", icon: BarChart3 },
                    { title: "Utilisateurs", url: "/dashboard/admin-users", icon: Users },
                    { title: "Retraits", url: "/dashboard/admin-withdrawals", icon: Wallet },
                    { title: "Support", url: "/dashboard/admin-support", icon: MessageCircle },
                    { title: "Modération", url: "/dashboard/admin-moderation", icon: Package },
                    { title: "KYC", url: "/dashboard/admin-kyc", icon: Shield },
                    { title: "Badges Verify", url: "/dashboard/admin-badges", icon: BadgeCheck },
                  ].map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="dash-menu-item">
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

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-[10px] font-medium">
              {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
                {profile?.display_name || "Créateur"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate leading-tight">
                {user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={signOut}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent/50"
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
