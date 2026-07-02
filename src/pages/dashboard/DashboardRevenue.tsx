import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Filter,
  Calendar,
  Wallet,
  Clock,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
  payment_method: string | null;
  products: { title: string } | null;
  customers: { name: string; email: string } | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  operator: string;
  phone_number: string;
  created_at: string;
  processed_at: string | null;
}

type Transaction = {
  id: string;
  type: "sale" | "withdrawal";
  label: string;
  detail: string;
  amount: number;
  netAmount?: number;
  status: string;
  date: string;
  paymentMethod?: string | null;
};

const DEFAULT_COMMISSION_RATE = 0.05;

const translations = {
  fr: {
    title: "Revenus",
    subtitle: "Suivez vos gains, commissions et retraits en détail",
    btnWithdraw: "Demander un retrait",
    netRevenue: "Revenu net",
    netRevenueSub: "Après commission TECHNOVA",
    inTransit: "En transit",
    transitDelay: "délai 3 jours",
    transitSoon: "Disponibles bientôt",
    availableWithdrawal: "Disponible retrait",
    pendingLabel: "en attente",
    readyToWithdraw: "Prêt à retirer",
    totalWithdrawn: "Total retiré",
    withdrawalsCount: "retrait(s)",
    txHistory: "Historique des transactions",
    filterAll: "Tout",
    filterSales: "Ventes",
    filterWithdrawals: "Retraits",
    filter7d: "7 jours",
    filter30d: "30 jours",
    filter90d: "90 jours",
    noTransactions: "Aucune transaction trouvée",
    noTransactionsSub: "Commencez à vendre vos produits pour voir vos transactions ici.",
    defaultProduct: "Produit",
    defaultCustomer: "Client",
    withdrawalLabelPrefix: "Retrait ",
    statusCompleted: "Complété",
    statusPending: "En attente",
    statusFailed: "Échoué",
  },
  en: {
    title: "Revenue",
    subtitle: "Track your earnings, commissions, and withdrawals in detail",
    btnWithdraw: "Request a withdrawal",
    netRevenue: "Net Revenue",
    netRevenueSub: "After TECHNOVA commission",
    inTransit: "In transit",
    transitDelay: "3-day delay",
    transitSoon: "Available soon",
    availableWithdrawal: "Available for withdrawal",
    pendingLabel: "pending",
    readyToWithdraw: "Ready to withdraw",
    totalWithdrawn: "Total withdrawn",
    withdrawalsCount: "withdrawal(s)",
    txHistory: "Transaction History",
    filterAll: "All",
    filterSales: "Sales",
    filterWithdrawals: "Withdrawals",
    filter7d: "7 days",
    filter30d: "30 days",
    filter90d: "90 days",
    noTransactions: "No transactions found",
    noTransactionsSub: "Start selling your products to see your transactions here.",
    defaultProduct: "Product",
    defaultCustomer: "Customer",
    withdrawalLabelPrefix: "Withdrawal ",
    statusCompleted: "Completed",
    statusPending: "Pending",
    statusFailed: "Failed",
  },
};

const DashboardRevenue = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [commissionPct, setCommissionPct] = useState(DEFAULT_COMMISSION_RATE);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "sale" | "withdrawal">("all");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "7d" | "30d" | "90d">("all");

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];
  const dateLocale = lang === "en" ? enUS : fr;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, withdrawalsRes, feeRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, amount, status, created_at, product_id, payment_method, products(title), customers(name, email)",
          )
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("platform_fees")
          .select("value_pct")
          .eq("key", "technova_commission_pct")
          .maybeSingle(),
      ]);
      setOrders((ordersRes.data as any) || []);
      setWithdrawals(withdrawalsRes.data || []);

      const commPct = Number(feeRes.data?.value_pct ?? 5) / 100;
      setCommissionPct(commPct);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.amount), 0);

    // Maturity delay: 3 calendar days for all payments (Moneroo)
    const cutoff3d = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const maturedRevenue = completedOrders
      .filter((o) => new Date(o.created_at) <= cutoff3d)
      .reduce((s, o) => s + Number(o.amount), 0);

    const pendingRevenue = completedOrders
      .filter((o) => new Date(o.created_at) > cutoff3d)
      .reduce((s, o) => s + Number(o.amount), 0);
    const commission = maturedRevenue * commissionPct;
    const pendingCommission = pendingRevenue * commissionPct;
    const netRevenue = maturedRevenue - commission;
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);
    const available = netRevenue - totalWithdrawn - pendingWithdrawals;
    const pendingFunds = pendingRevenue - pendingCommission;
    return {
      totalRevenue,
      netRevenue,
      commission,
      totalWithdrawn,
      pendingWithdrawals,
      available: Math.max(0, available),
      pendingFunds,
      pendingRevenue,
    };
  }, [orders, withdrawals, commissionPct]);

  const transactions = useMemo(() => {
    const items: Transaction[] = [];

    orders.forEach((o) => {
      items.push({
        id: o.id,
        type: "sale",
        label: (o.products as any)?.title || t.defaultProduct,
        detail: (o.customers as any)?.name || (o.customers as any)?.email || t.defaultCustomer,
        amount: Number(o.amount),
        netAmount: Number(o.amount) * (1 - COMMISSION_RATE),
        status: o.status,
        date: o.created_at,
        paymentMethod: o.payment_method,
      });
    });

    withdrawals.forEach((w) => {
      items.push({
        id: w.id,
        type: "withdrawal",
        label: `${t.withdrawalLabelPrefix}${w.operator.toUpperCase()}`,
        detail: w.phone_number,
        amount: Number(w.amount),
        netAmount: Number(w.net_amount),
        status: w.status,
        date: w.created_at,
      });
    });

    // Filter by type
    let filtered = filterType === "all" ? items : items.filter((t) => t.type === filterType);

    // Filter by period
    if (filterPeriod !== "all") {
      const days = filterPeriod === "7d" ? 7 : filterPeriod === "30d" ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.date) >= cutoff);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, withdrawals, filterType, filterPeriod]);

  const statusBadge = (status: string, type: "sale" | "withdrawal") => {
    const map: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      completed: { label: t.statusCompleted, variant: "default" },
      pending: { label: t.statusPending, variant: "secondary" },
      failed: { label: t.statusFailed, variant: "destructive" },
    };
    const s = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const transitSub =
    stats.pendingRevenue > 0
      ? `${formatAmount(stats.pendingRevenue)} (${t.transitDelay})`
      : t.transitSoon;

  const statCards = [
    {
      label: t.netRevenue,
      value: formatAmount(stats.netRevenue),
      icon: TrendingUp,
      sub: `${t.netRevenueSub} ${commissionPct * 100}%`,
    },
    ...(stats.pendingFunds > 0
      ? [
          {
            label: t.inTransit,
            value: formatAmount(stats.pendingFunds),
            icon: Clock,
            sub: transitSub,
          },
        ]
      : []),
    {
      label: t.availableWithdrawal,
      value: formatAmount(stats.available),
      icon: ArrowUpRight,
      sub:
        stats.pendingWithdrawals > 0
          ? `${formatAmount(stats.pendingWithdrawals)} ${t.pendingLabel}`
          : t.readyToWithdraw,
    },
    {
      label: t.totalWithdrawn,
      value: formatAmount(stats.totalWithdrawn),
      icon: Download,
      sub: `${withdrawals.filter((w) => w.status === "completed").length} ${t.withdrawalsCount}`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Link to="/dashboard/withdrawals">
            <Button className="gap-2">
              <Wallet className="h-4 w-4" />
              {t.btnWithdraw}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">{t.txHistory}</h2>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterAll}</SelectItem>
                  <SelectItem value="sale">{t.filterSales}</SelectItem>
                  <SelectItem value="withdrawal">{t.filterWithdrawals}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterAll}</SelectItem>
                  <SelectItem value="7d">{t.filter7d}</SelectItem>
                  <SelectItem value="30d">{t.filter30d}</SelectItem>
                  <SelectItem value="90d">{t.filter90d}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t.noTransactions}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">{t.noTransactionsSub}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      t.type === "sale" ? "bg-emerald-500/10" : "bg-orange-500/10"
                    }`}
                  >
                    {t.type === "sale" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      {t.type === "sale" && (
                        <span className="shrink-0" title="Mobile Money">
                          <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.detail}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        t.type === "sale" ? "text-emerald-600" : "text-orange-600"
                      }`}
                    >
                      {t.type === "sale" ? "+" : "-"}
                      {formatAmount(t.type === "sale" ? t.netAmount! : t.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "dd MMM yyyy, HH:mm", { locale: dateLocale })}
                    </p>
                  </div>

                  <div className="shrink-0">{statusBadge(t.status, t.type)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardRevenue;
