import { NavLink, useNavigate } from "react-router-dom";
import {
  Users, Key, DollarSign, Wallet, BarChart3, BadgeCheck, Megaphone,
  Zap, Webhook, MessageCircle, Settings, HelpCircle, LogOut, Shield,
  Store, Plus, Check, Package,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";

const drawerSections = [
  {
    label: "Gestion",
    items: [
      { title: "Clients", url: "/dashboard/clients", icon: Users },
      { title: "Licences", url: "/dashboard/licenses", icon: Key },
      { title: "Revenus", url: "/dashboard/revenue", icon: DollarSign },
      { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
      { title: "Analytiques", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Outils",
    items: [
      { title: "Badge Verify", url: "/dashboard/badge", icon: BadgeCheck },
      { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
      { title: "Automatisations", url: "/dashboard/automations", icon: Zap },
      { title: "Webhooks", url: "/dashboard/webhooks", icon: Webhook },
      { title: "Messages", url: "/dashboard/support", icon: MessageCircle },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
      { title: "Centre d'aide", url: "/faq", icon: HelpCircle, external: true as const },
    ],
  },
];

const adminItems = [
  { title: "Vue d'ensemble", url: "/dashboard/admin", icon: BarChart3 },
  { title: "Utilisateurs", url: "/dashboard/admin-users", icon: Users },
  { title: "Retraits", url: "/dashboard/admin-withdrawals", icon: Wallet },
  { title: "Support", url: "/dashboard/admin-support", icon: MessageCircle },
  { title: "Modération", url: "/dashboard/admin-moderation", icon: Package },
  { title: "KYC", url: "/dashboard/admin-kyc", icon: Shield },
  { title: "Badges", url: "/dashboard/admin-badges", icon: BadgeCheck },
];

export default function DashboardMenu() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const isAdmin = user?.email === "ancres707@gmail.com" || user?.email === "isidoreagonan@gmail.com";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header: store info */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            {activeStore?.logo_url ? (
              <img src={activeStore.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <img src={logo} alt="TECHNOVA" className="h-6 w-6 object-contain" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate">
              {activeStore?.name || "TECHNOVA"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {activeStores.length} boutique{activeStores.length !== 1 ? "s" : ""} active{activeStores.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Switch store */}
        {activeStores.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {activeStores.map((s) => {
              const sel = s.id === activeStore?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStoreId(s.id)}
                  className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    sel
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Store className="h-3 w-3" />
                  {s.name}
                  {sel && <Check className="h-3 w-3" />}
                </button>
              );
            })}
            {activeStores.length < 3 && (
              <button
                onClick={() => navigate("/dashboard/stores")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Plus className="h-3 w-3" /> Nouvelle
              </button>
            )}
          </div>
        )}

        {/* Sections */}
        {drawerSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 px-1">
              {section.label}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {section.items.map((item) => {
                const content = (
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-3 transition-all hover:border-primary/30">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-secondary text-foreground">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  </div>
                );
                return "external" in item && item.external ? (
                  <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <NavLink key={item.title} to={item.url}>
                    {content}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent mb-2 px-1">
              Administration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {adminItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-3"
                >
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-accent/15 text-accent">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Profile + signout */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {profile?.display_name || "Créateur"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="h-10 w-10 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10"
            aria-label="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
