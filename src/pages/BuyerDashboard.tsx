import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  ShoppingBag,
  FileText,
  GraduationCap,
  Key,
  Layers,
  LogOut,
  Award,
  Play,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getCompletedLessons } from "@/lib/courseProgressSync";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import { ContactTrainerModal } from "@/components/ContactTrainerModal";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGeoPricing } from "@/contexts/GeoPricingContext";
import { buyerSupabase as supabase } from "@/integrations/supabase/buyer-client";
import { supabase as sellerSupabase } from "@/integrations/supabase/client";

interface OrderWithProduct {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    type: string;
    thumbnail_url: string | null;
    download_url: string | null;
  } | null;
  store_owner: {
    display_name: string | null;
    store_slug: string | null;
  } | null;
}

interface BuyerSession {
  email: string;
  customerName: string;
  customerId: string;
  orders: OrderWithProduct[];
  authenticatedAt: number;
}

const typeFilters = [
  { value: "all", label: "Tout", icon: Package },
  { value: "file", label: "Fichiers", icon: FileText },
  { value: "course", label: "Cours", icon: GraduationCap },
  { value: "license", label: "Licences", icon: Key },
  { value: "bundle", label: "Bundles", icon: Layers },
];

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

const BuyerDashboard = () => {
  const { formatPrice } = useGeoPricing();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<OrderWithProduct["product"] | null>(null);
  const navigate = useNavigate();
  const isPortal =
    window.location.hostname.startsWith("portal.") ||
    window.location.hostname.startsWith("client.");
  const loginPath = isPortal ? "/" : "/buyer-login";

  useEffect(() => {
    const raw = sessionStorage.getItem("buyer_session");
    if (!raw) {
      navigate(loginPath);
      return;
    }
    try {
      const session: BuyerSession = JSON.parse(raw);
      // Check session expiry (30 min)
      if (Date.now() - session.authenticatedAt > SESSION_DURATION) {
        sessionStorage.removeItem("buyer_session");
        supabase.auth.signOut();
        sellerSupabase.auth.signOut();
        navigate(loginPath);
        return;
      }
      setCustomerName(session.customerName);
      setCustomerId(session.customerId);
      setOrders(session.orders || []);

      // Fetch latest orders to make sure we don't miss new purchases
      const fetchLatestOrders = async () => {
        if (!session.customerId) return;
        try {
          const { data, error } = await supabase.rpc("get_buyer_orders", {
            p_customer_id: session.customerId,
          });

          if (data && !error) {
            setOrders(data as any[]);
            session.orders = data as any[];
            sessionStorage.setItem("buyer_session", JSON.stringify(session));
          }
        } catch (err) {
          console.error("Failed to refresh orders", err);
        }
      };

      fetchLatestOrders();
    } catch {
      sessionStorage.removeItem("buyer_session");
      supabase.auth.signOut();
      sellerSupabase.auth.signOut();
      navigate(loginPath);
    }
  }, [navigate]);

  const handleLogout = async () => {
    sessionStorage.removeItem("buyer_session");
    await supabase.auth.signOut();
    try {
      await sellerSupabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    navigate(loginPath);
  };

  const filtered = orders.filter((o) => {
    if (!o.product) return false;
    const matchSearch = o.product.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || o.product.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Tableau de bord : Mes Produits & Formations Achetés — TECHNOVA"
        description="Consultez l'historique de vos commandes, téléchargez vos fichiers numériques et suivez vos formations en ligne achetées."
        noindex
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <a
            href={isPortal ? "https://technovalearning.com" : "/"}
            className="flex items-center gap-2.5"
          >
            <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-foreground">TECHNOVA</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{customerName}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {customerName?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">
            Ravi de vous revoir{customerName ? `, ${customerName}` : ""} !
          </h1>
          <p className="text-muted-foreground mb-8">Voici tous vos achats</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-2xl mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher"
            className="pl-10"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {typeFilters.map((tf) => {
            const Icon = tf.icon;
            const active = typeFilter === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setTypeFilter(tf.value)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Orders grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucun achat trouvé</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Vos achats apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-secondary">
                  {o.product?.thumbnail_url ? (
                    <img
                      src={o.product.thumbnail_url}
                      alt={o.product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {Number(o.amount) > 0
                          ? formatPrice(Number(o.amount))
                          : "Gratuit"}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
                      {o.product?.title || "Produit"}
                    </h3>
                    {o.store_owner?.store_slug && (
                      <p className="text-xs text-muted-foreground mb-3">
                        par{" "}
                        <a
                          href={`https://technovalearning.com/store/${o.store_owner.store_slug}`}
                          className="text-primary hover:underline"
                        >
                          {o.store_owner.display_name || o.store_owner.store_slug}
                        </a>
                      </p>
                    )}
                  </div>
                  {o.product?.type === "course" ? (
                    <CourseCardAction
                      order={o}
                      customerId={customerId}
                      customerName={customerName}
                      isPortal={isPortal}
                    />
                  ) : (
                    <Link to={isPortal ? `/orders/${o.id}` : `/mes-achats/${o.id}`}>
                      <Button className="w-full text-sm" size="sm">
                        Voir la commande
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-6 mt-8">
        <p className="text-center text-xs text-muted-foreground">
          Propulsé par{" "}
          <a
            href={isPortal ? "https://technovalearning.com" : "/"}
            className="text-primary hover:underline font-medium"
          >
            TECHNOVA
          </a>
        </p>
      </footer>

      {selectedProduct && (
        <BuyerContentDialog
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
          product={selectedProduct}
          customerId={customerId}
        />
      )}
    </div>
  );
};

const CourseCardAction = ({
  order,
  customerId,
  customerName,
  isPortal,
}: {
  order: OrderWithProduct;
  customerId: string;
  customerName: string;
  isPortal: boolean;
}) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(1);

  useEffect(() => {
    if (!order.product?.id) return;
    const loadProgress = async () => {
      const completed = await getCompletedLessons(order.product!.id, customerId);
      setCompletedCount(completed.length);

      try {
        const { data } = await sellerSupabase
          .from("course_modules")
          .select("course_lessons(id)")
          .eq("product_id", order.product!.id);

        if (data) {
          const total = data.reduce((acc, m: any) => acc + (m.course_lessons?.length || 0), 0);
          if (total > 0) setTotalCount(total);
        }
      } catch {}
    };
    loadProgress();
  }, [order.product?.id, customerId]);

  const [showContactModal, setShowContactModal] = useState(false);
  const percent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
          <span className="text-muted-foreground">Progression</span>
          <span className="text-primary font-bold">{percent}%</span>
        </div>
        <Progress value={percent} className="h-1.5 w-full" />
      </div>

      <div className="flex flex-col gap-2">
        <Link to={`/learn/${order.product?.id}`} className="w-full">
          <Button size="sm" className="w-full text-xs font-bold gap-1.5">
            <Play className="h-3.5 w-3.5 fill-primary-foreground" />
            <span>{percent > 0 ? "Continuer la formation" : "Démarrer la formation"}</span>
          </Button>
        </Link>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowContactModal(true)}
          className="w-full text-xs font-semibold gap-1.5 border-border"
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Question au formateur</span>
        </Button>

        {percent === 100 && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await generateCertificatePDF({
                studentName: customerName || "Étudiant TECHNOVA",
                courseTitle: order.product?.title || "Formation",
                storeName: order.store_owner?.display_name || "TECHNOVA Academy",
              });
            }}
            className="w-full text-xs font-bold gap-1.5 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Attestation (PDF)</span>
          </Button>
        )}

        <ContactTrainerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          courseTitle={order.product?.title || "Formation"}
          sellerName={order.store_owner?.display_name || "L'Instructeur"}
          sellerId={order.store_owner_id}
        />
      </div>
    </div>
  );
};

export default BuyerDashboard;
