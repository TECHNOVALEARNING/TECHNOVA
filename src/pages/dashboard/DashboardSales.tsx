import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShoppingCart, TrendingUp, Calendar, Package, Tag, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateOrderNet } from "@/lib/commissionHelper";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface OrderWithProduct {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  promo_code: string | null;
  original_amount: number | null;
  product: { title: string; thumbnail_url: string | null } | null;
  customer: { name: string; email: string } | null;
}

const translations = {
  fr: {
    title: "Ventes",
    subTitle: "Suivez toutes vos transactions",
    totalSales: "Ventes totales",
    thisMonth: "Ce mois",
    growth: "Croissance",
    noSales: "Aucune vente pour le moment",
    noSalesSub: "Les ventes apparaîtront ici automatiquement.",
    colProduct: "Produit",
    colCustomer: "Client",
    colAmount: "Montant",
    colPromo: "Promo",
    colDate: "Date",
    colStatus: "Statut",
    defaultProduct: "Produit",
  },
  en: {
    title: "Sales",
    subTitle: "Track all your transactions",
    totalSales: "Total Sales",
    thisMonth: "This Month",
    growth: "Growth",
    noSales: "No sales yet",
    noSalesSub: "Sales will appear here automatically.",
    colProduct: "Product",
    colCustomer: "Customer",
    colAmount: "Amount",
    colPromo: "Promo",
    colDate: "Date",
    colStatus: "Status",
    defaultProduct: "Product",
  },
};

const DashboardSales = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, growth: "0%" });

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
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select(
          "id, amount, status, created_at, promo_code, original_amount, products(title, price, thumbnail_url, category, type, marketing_sections), customers(name, email)",
        )
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((o: any) => {
        const prodPrice = o.products?.price ? Number(o.products.price) : 0;
        const realAmount = Number(o.amount) > 0 ? Number(o.amount) : prodPrice;
        const realOriginal = o.original_amount ? Number(o.original_amount) : (realAmount > 0 ? realAmount : null);
        return {
          id: o.id,
          amount: realAmount,
          status: o.status,
          created_at: o.created_at,
          promo_code: o.promo_code,
          original_amount: realOriginal,
          product: o.products,
          customer: o.customers,
        };
      });

      setOrders(mapped);

      const totalSales = mapped.reduce((s, o) => s + o.amount, 0);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = mapped
        .filter((o) => new Date(o.created_at) >= monthStart)
        .reduce((s, o) => s + o.amount, 0);
      const lastMonth = mapped
        .filter((o) => {
          const d = new Date(o.created_at);
          return d >= prevMonthStart && d < monthStart;
        })
        .reduce((s, o) => s + o.amount, 0);

      const growth =
        lastMonth > 0
          ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
          : thisMonth > 0
            ? 100
            : 0;
      setStats({ total: totalSales, thisMonth, growth: `${growth >= 0 ? "+" : ""}${growth}%` });
    };
    fetch();
  }, [user]);

  const statCards = [
    {
      label: t.totalSales,
      value: `${stats.total.toLocaleString()} F`,
      icon: ShoppingCart,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary bg-primary/15",
    },
    {
      label: t.thisMonth,
      value: `${stats.thisMonth.toLocaleString()} F`,
      icon: Calendar,
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600 bg-blue-500/15",
    },
    {
      label: t.growth,
      value: stats.growth,
      icon: TrendingUp,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600 bg-emerald-500/15",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.subTitle}</p>
          </div>

          {orders.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (orders.length === 0) return;
                  const headers = [
                    "ID Commande",
                    "Date",
                    "Client",
                    "Email Client",
                    "Produit",
                    "Montant Brut (FCFA)",
                    "Commission %",
                    "Commission (FCFA)",
                    "Revenu Net (FCFA)",
                    "Code Promo",
                    "Statut",
                  ];

                  const rows = orders.map((o) => {
                    const { gross, commission, net, ratePct } = calculateOrderNet(o.amount, o.product);
                    return [
                      `"${o.id}"`,
                      `"${new Date(o.created_at).toLocaleString("fr-FR")}"`,
                      `"${o.customer?.name || "Client"}"`,
                      `"${o.customer?.email || "-"}"`,
                      `"${(o.product?.title || "Produit").replace(/"/g, '""')}"`,
                      gross,
                      `"${ratePct}%"`,
                      commission,
                      net,
                      `"${o.promo_code || "Aucun"}"`,
                      `"${o.status === "completed" ? "Complété" : o.status}"`,
                    ].join(",");
                  });

                  const csvContent =
                    "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `releve_ventes_technova_${new Date().toISOString().slice(0,10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success("Relevé des ventes exporté en CSV !");
                }}
                className="rounded-xl text-xs font-semibold gap-1.5 border-border"
              >
                <Download className="h-4 w-4 text-primary" />
                <span>Exporter CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="rounded-xl text-xs font-semibold gap-1.5 border-border hidden sm:flex"
              >
                <Printer className="h-4 w-4 text-foreground" />
                <span>Imprimer Relevé</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border border-border/50 bg-gradient-to-br ${s.gradient} p-4 sm:p-5`}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.iconColor} mb-3`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t.noSales}</p>
            <p className="text-xs text-muted-foreground">{t.noSalesSub}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden"
          >
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colProduct}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colCustomer}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colAmount}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colPromo}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colDate}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {t.colStatus}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                            {o.product?.thumbnail_url ? (
                              <img
                                src={o.product.thumbnail_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground/40" />
                            )}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {o.product?.title || t.defaultProduct}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{o.customer?.name || "—"}</td>
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-foreground">
                            {o.amount.toLocaleString()} F
                          </span>
                          {o.original_amount && o.original_amount > o.amount && (
                            <span className="block text-xs text-muted-foreground line-through">
                              {o.original_amount.toLocaleString()} F
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {o.promo_code ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                            <Tag className="h-3 w-3" />
                            {o.promo_code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {format(new Date(o.created_at), "dd MMM yyyy HH:mm", {
                          locale: dateLocale,
                        })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {orders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                    {o.product?.thumbnail_url ? (
                      <img
                        src={o.product.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {o.product?.title || t.defaultProduct}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer?.name || "—"} ·{" "}
                      {format(new Date(o.created_at), "dd MMM", { locale: dateLocale })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {o.amount.toLocaleString()} F
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      {o.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSales;
