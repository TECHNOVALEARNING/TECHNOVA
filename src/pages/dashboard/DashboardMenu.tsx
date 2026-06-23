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
import { useEffect, useState } from "react";

const translations = {
  fr: {
    gestion: "Gestion",
    outils: "Outils",
    compte: "Compte",
    administration: "Administration",
    clients: "Clients",
    licences: "Licences",
    revenus: "Revenus",
    wallet: "Wallet",
    analytiques: "Analytiques",
    badgeVerify: "Badge Verify",
    marketing: "Marketing",
    automations: "Automatisations",
    webhooks: "Webhooks",
    messages: "Messages",
    settings: "Paramètres",
    helpCenter: "Centre d'aide",
    overview: "Vue d'ensemble",
    users: "Utilisateurs",
    withdrawals: "Retraits",
    support: "Support",
    moderation: "Modération",
    kyc: "KYC",
    badges: "Badges",
    activeStores: "boutique active",
    activeStoresPlural: "boutiques actives",
    newStore: "Nouvelle",
    signOut: "Déconnexion",
    creator: "Créateur",
  },
  en: {
    gestion: "Management",
    outils: "Tools",
    compte: "Account",
    administration: "Administration",
    clients: "Customers",
    licences: "Licenses",
    revenus: "Revenue",
    wallet: "Wallet",
    analytiques: "Analytics",
    badgeVerify: "Verify Badge",
    marketing: "Marketing",
    automations: "Automations",
    webhooks: "Webhooks",
    messages: "Messages",
    settings: "Settings",
    helpCenter: "Help Center",
    overview: "Overview",
    users: "Users",
    withdrawals: "Withdrawals",
    support: "Support",
    moderation: "Moderation",
    kyc: "KYC",
    badges: "Badges",
    activeStores: "active store",
    activeStoresPlural: "active stores",
    newStore: "New",
    signOut: "Sign out",
    creator: "Creator",
  }
};

export default function DashboardMenu() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { activeStore, activeStores, setActiveStoreId } = useActiveStore();
  const isAdmin = user?.email === "ancres707@gmail.com";

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  const drawerSections = [
    {
      label: t.gestion,
      items: [
        { title: t.clients, url: "/dashboard/clients", icon: Users },
        { title: t.licences, url: "/dashboard/licenses", icon: Key },
        { title: t.revenus, url: "/dashboard/revenue", icon: DollarSign },
        { title: t.wallet, url: "/dashboard/wallet", icon: Wallet },
        { title: t.analytiques, url: "/dashboard/analytics", icon: BarChart3 },
      ],
    },
    {
      label: t.outils,
      items: [
        { title: t.badgeVerify, url: "/dashboard/badge", icon: BadgeCheck },
        { title: t.marketing, url: "/dashboard/marketing", icon: Megaphone },
        { title: t.automations, url: "/dashboard/automations", icon: Zap },
        { title: t.webhooks, url: "/dashboard/webhooks", icon: Webhook },
        { title: t.messages, url: "/dashboard/support", icon: MessageCircle },
      ],
    },
    {
      label: t.compte,
      items: [
        { title: t.settings, url: "/dashboard/settings", icon: Settings },
        { title: t.helpCenter, url: "/faq", icon: HelpCircle, external: true as const },
      ],
    },
  ];

  const adminItems = [
    { title: t.overview, url: "/dashboard/admin", icon: BarChart3 },
    { title: t.users, url: "/dashboard/admin-users", icon: Users },
    { title: t.withdrawals, url: "/dashboard/admin-withdrawals", icon: Wallet },
    { title: t.support, url: "/dashboard/admin-support", icon: MessageCircle },
    { title: t.moderation, url: "/dashboard/admin-moderation", icon: Package },
    { title: t.kyc, url: "/dashboard/admin-kyc", icon: Shield },
    { title: t.badges, url: "/dashboard/admin-badges", icon: BadgeCheck },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header: store info */}
        {isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-2xl dash-glass relative overflow-hidden transition-all duration-300">
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
                {activeStores.length} {activeStores.length !== 1 ? t.activeStoresPlural : t.activeStores}
              </p>
            </div>
          </div>
        )}

        {/* Switch store */}
        {isAdmin && activeStores.length > 1 && (
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
                      : "border-border bg-card/60 text-muted-foreground hover:bg-card"
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
                <Plus className="h-3 w-3" /> {t.newStore}
              </button>
            )}
          </div>
        )}

        {/* Sections */}
        {drawerSections.map((section) => {
          const filteredItems = section.items.filter(item => isAdmin || item.title !== t.licences);
          return (
            <div key={section.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 px-1">
                {section.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.map((item) => {
                  const content = (
                    <div className="flex items-center gap-2.5 rounded-xl border px-3 py-3 transition-all hover:scale-[1.01] hover:border-primary/30 dash-glass">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-secondary text-foreground shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
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
          );
        })}

        {isAdmin && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent mb-2 px-1">
              {t.administration}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {adminItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className="flex items-center gap-2.5 rounded-xl border px-3 py-3 transition-all hover:scale-[1.01] hover:border-primary/30 dash-glass"
                >
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-accent/15 text-accent shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Profile + signout */}
        <div className="flex items-center gap-3 rounded-2xl dash-glass p-3">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {profile?.display_name || t.creator}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="h-10 w-10 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={t.signOut}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
