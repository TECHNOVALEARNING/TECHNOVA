import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Search, Mail, Phone, User, ShoppingBag, X, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClientWithOrders {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  totalSpent: number;
  orderCount: number;
  orders: { id: string; amount: number; created_at: string; productTitle: string }[];
}

const translations = {
  fr: {
    title: "Clients",
    customer: "client",
    customers: "clients",
    total: "au total",
    searchPlaceholder: "Rechercher par nom, email ou téléphone...",
    noCustomers: "Aucun client pour le moment",
    noCustomersSub: "Vos clients apparaîtront ici après leur premier achat.",
    colCustomer: "Client",
    colPhone: "Téléphone",
    colPurchases: "Achats",
    colTotalSpent: "Total dépensé",
    colSince: "Depuis",
    noResults: "Aucun résultat pour",
    purchase: "achat",
    purchases: "achats",
    detailsTitle: "Détails du client",
    sinceLabel: "Client depuis",
    emailLabel: "Email",
    phoneLabel: "Téléphone",
    totalSpentLabel: "Total dépensé",
    purchaseHistory: "Historique d'achats",
    defaultProduct: "Produit",
  },
  en: {
    title: "Customers",
    customer: "customer",
    customers: "customers",
    total: "in total",
    searchPlaceholder: "Search by name, email or phone...",
    noCustomers: "No customers yet",
    noCustomersSub: "Your customers will appear here after their first purchase.",
    colCustomer: "Customer",
    colPhone: "Phone",
    colPurchases: "Purchases",
    colTotalSpent: "Total spent",
    colSince: "Since",
    noResults: "No results for",
    purchase: "purchase",
    purchases: "purchases",
    detailsTitle: "Customer Details",
    sinceLabel: "Customer since",
    emailLabel: "Email",
    phoneLabel: "Phone",
    totalSpentLabel: "Total spent",
    purchaseHistory: "Purchase History",
    defaultProduct: "Product",
  },
};

const DashboardClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithOrders | null>(null);

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
    const fetchClients = async () => {
      // Get all orders for this store owner with customer + product info
      const { data: orders } = await supabase
        .from("orders")
        .select(
          "id, amount, created_at, customer_id, products(title), customers(id, name, email, phone, created_at)",
        )
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!orders || orders.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Group by customer
      const clientMap = new Map<string, ClientWithOrders>();
      for (const o of orders as any[]) {
        const c = o.customers;
        if (!c) continue;
        const existing = clientMap.get(c.id);
        const orderItem = {
          id: o.id,
          amount: Number(o.amount),
          created_at: o.created_at,
          productTitle: o.products?.title || t.defaultProduct,
        };
        if (existing) {
          existing.totalSpent += Number(o.amount);
          existing.orderCount += 1;
          existing.orders.push(orderItem);
        } else {
          clientMap.set(c.id, {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            created_at: c.created_at,
            totalSpent: Number(o.amount),
            orderCount: 1,
            orders: [orderItem],
          });
        }
      }

      setClients(Array.from(clientMap.values()));
      setLoading(false);
    };
    fetchClients();
  }, [user]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} {clients.length !== 1 ? t.customers : t.customer} {t.total}
          </p>
        </div>

        {clients.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-10"
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t.noCustomers}</p>
            <p className="text-sm text-muted-foreground/60 mt-1">{t.noCustomersSub}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {t.colCustomer}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {t.colPhone}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {t.colPurchases}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {t.colTotalSpent}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {t.colSince}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClient(c)}
                        className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {c.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{c.phone}</td>
                        <td className="p-4 text-foreground font-medium">{c.orderCount}</td>
                        <td className="p-4 font-semibold text-foreground">
                          {c.totalSpent.toLocaleString()} FCFA
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(c.created_at), "dd MMM yyyy", { locale: dateLocale })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && search && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t.noResults} « {search} »
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="rounded-xl border border-border bg-card p-4 cursor-pointer active:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[140px]">{c.phone}</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {c.totalSpent.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>
                      {c.orderCount} {c.orderCount !== 1 ? t.purchases : t.purchase}
                    </span>
                    <span>
                      {format(new Date(c.created_at), "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && search && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t.noResults} « {search} »
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Client detail dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(v) => !v && setSelectedClient(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{t.detailsTitle}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Info */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {selectedClient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.sinceLabel}{" "}
                      {format(new Date(selectedClient.created_at), "MMMM yyyy", {
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.emailLabel}</p>
                      <p className="text-sm font-medium text-foreground">{selectedClient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.phoneLabel}</p>
                      <p className="text-sm font-medium text-foreground">{selectedClient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t.totalSpentLabel}</p>
                      <p className="text-sm font-bold text-foreground">
                        {selectedClient.totalSpent.toLocaleString()} FCFA (
                        {selectedClient.orderCount}{" "}
                        {selectedClient.orderCount !== 1 ? t.purchases : t.purchase})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orders history */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">{t.purchaseHistory}</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedClient.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground truncate max-w-[200px]">
                            {o.productTitle}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-foreground">
                            {Number(o.amount).toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(o.created_at), "dd/MM/yyyy", { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DashboardClients;
