import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, DollarSign, Package, Store, Wallet, Shield, MessageCircle, TrendingUp, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  usersCount: number;
  totalRevenue: number;
  totalCommissions: number;
  productsCount: number;
  storesCount: number;
  dailySales: Record<string, number>;
  pendingWithdrawals: number;
  pendingKyc: number;
  openTickets: number;
  totalOrders: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const translations = {
  fr: {
    adminTitle: "Administration",
    adminSub: "Vue d'ensemble de la plateforme",
    unauthorized: "Accès non autorisé",
    users: "Utilisateurs",
    totalRevenue: "Revenu total",
    commissions: "Commissions",
    orders: "Commandes",
    products: "Produits",
    stores: "Boutiques",
    pendingWithdrawals: "Retraits en attente",
    pendingKyc: "KYC en attente",
    openTickets: "Tickets ouverts",
    chartTitle: "Ventes des 30 derniers jours",
    chartLabel: "Ventes"
  },
  en: {
    adminTitle: "Administration",
    adminSub: "Platform overview",
    unauthorized: "Unauthorized access",
    users: "Users",
    totalRevenue: "Total Revenue",
    commissions: "Commissions",
    orders: "Orders",
    products: "Products",
    stores: "Stores",
    pendingWithdrawals: "Pending Withdrawals",
    pendingKyc: "Pending KYC",
    openTickets: "Open Tickets",
    chartTitle: "Sales over the last 30 days",
    chartLabel: "Sales"
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    if (user?.email !== "ancres707@gmail.com") return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "stats" },
      });
      if (!error && data) setStats(data);
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== "ancres707@gmail.com") {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">{t.unauthorized}</div>
      </DashboardLayout>
    );
  }

  const chartData = stats
    ? Object.entries(stats.dailySales)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date: date.slice(5), amount }))
    : [];

  const currencySuffix = lang === 'en' ? ' F' : ' F';

  const statCards = stats ? [
    { label: t.users, value: stats.usersCount, icon: Users, color: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-600 dark:text-blue-400" },
    { label: t.totalRevenue, value: `${(stats.totalRevenue).toLocaleString()}${currencySuffix}`, icon: TrendingUp, color: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-600 dark:text-green-400" },
    { label: t.commissions, value: `${(stats.totalCommissions).toLocaleString()}${currencySuffix}`, icon: DollarSign, color: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-600 dark:text-purple-400" },
    { label: t.orders, value: stats.totalOrders, icon: ShoppingCart, color: "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-600 dark:text-orange-400" },
    { label: t.products, value: stats.productsCount, icon: Package, color: "from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-600 dark:text-pink-400" },
    { label: t.stores, value: stats.storesCount, icon: Store, color: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" },
  ] : [];

  const alertCards = stats ? [
    { label: t.pendingWithdrawals, value: stats.pendingWithdrawals, icon: Wallet, route: "/dashboard/admin-withdrawals", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20" },
    { label: t.pendingKyc, value: stats.pendingKyc, icon: Shield, route: "/dashboard/admin-kyc", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { label: t.openTickets, value: stats.openTickets, icon: MessageCircle, route: "/dashboard/admin-support", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.adminTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.adminSub}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : stats && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className={`rounded-2xl border bg-gradient-to-br ${card.color} p-4 hover:scale-[1.03] transition-all duration-300 backdrop-blur-md shadow-sm`}
                >
                  <card.icon className="h-5 w-5 mb-2 opacity-70" />
                  <p className="text-xl font-bold tracking-tight">{card.value}</p>
                  <p className="text-[11px] opacity-70 mt-0.5 font-medium">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alertCards.map((card, i) => (
                <motion.button
                  key={card.label}
                  custom={i + 6}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  onClick={() => navigate(card.route)}
                  className={`rounded-2xl border ${card.color} p-4 text-left hover:scale-[1.02] transition-all duration-300 dash-glass flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-background/60 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-border/20 shrink-0">
                      <card.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{card.label}</span>
                  </div>
                  {card.value > 0 && (
                    <Badge variant="destructive" className="text-xs px-2.5 py-0.5 rounded-full shrink-0">{card.value}</Badge>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Sales Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border p-5 dash-glass"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">{t.chartTitle}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                        formatter={(v: number) => [`${v.toLocaleString()} FCFA`, t.chartLabel]}
                      />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#adminGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
