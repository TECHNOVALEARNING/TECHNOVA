import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Package, Search, MoreVertical, Pencil, Eye, Copy,
  Share2, Link2, Pin, EyeOff, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

type ProductType = "file" | "course" | "license";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  type: ProductType;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
}

type StatusFilter = "all" | "draft" | "published";

const ITEMS_PER_PAGE = 10;

const translations = {
  fr: {
    title: "Produits",
    addProduct: "Ajouter un produit",
    searchPlaceholder: "Rechercher",
    filterAll: "Tout",
    filterDraft: "Brouillon",
    filterPublished: "Publié",
    noProducts: "Aucun produit",
    createFirstProduct: "Créez votre premier produit digital",
    colProduct: "Produit",
    colPrice: "Prix",
    colStatus: "Statut",
    colActions: "Actions",
    edit: "Modifier",
    viewOnSite: "Voir sur le site",
    viewMobile: "Voir",
    duplicate: "Dupliquer",
    share: "Partager",
    link: "Lien",
    unpublish: "Dépublier",
    publish: "Publier",
    delete: "Supprimer",
    confirmDelete: "Supprimer ce produit ?",
    deleteSuccess: "Produit supprimé",
    deleteError: "Erreur lors de la suppression: ",
    unpublishSuccess: "Produit dépublié",
    publishSuccess: "Produit publié",
    duplicateCopy: "(copie)",
    duplicateSuccess: "Produit dupliqué",
    duplicateError: "Erreur lors de la duplication",
    copySuccess: "Lien copié dans le presse-papier",
  },
  en: {
    title: "Products",
    addProduct: "Add a product",
    searchPlaceholder: "Search",
    filterAll: "All",
    filterDraft: "Draft",
    filterPublished: "Published",
    noProducts: "No products",
    createFirstProduct: "Create your first digital product",
    colProduct: "Product",
    colPrice: "Price",
    colStatus: "Status",
    colActions: "Actions",
    edit: "Edit",
    viewOnSite: "View on site",
    viewMobile: "View",
    duplicate: "Duplicate",
    share: "Share",
    link: "Link",
    unpublish: "Unpublish",
    publish: "Publish",
    delete: "Delete",
    confirmDelete: "Delete this product?",
    deleteSuccess: "Product deleted",
    deleteError: "Error during deletion: ",
    unpublishSuccess: "Product unpublished",
    publishSuccess: "Product published",
    duplicateCopy: "(copy)",
    duplicateSuccess: "Product duplicated",
    duplicateError: "Error during duplication",
    copySuccess: "Link copied to clipboard",
  }
};

const DashboardProducts = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type") as ProductType | null;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  const fetchProducts = async () => {
    if (!user) return;
    let query = supabase
      .from("products")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    if (typeFilter) query = query.eq("type", typeFilter);
    const { data } = await query;
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      // Delete related records first (cascade)
      await supabase.from("course_lessons").delete().eq("product_id", id);
      await supabase.from("product_faqs").delete().eq("product_id", id);
      // Delete licenses and their activations
      const { data: licenses } = await supabase.from("licenses").select("id").eq("product_id", id);
      if (licenses && licenses.length > 0) {
        const licenseIds = licenses.map(l => l.id);
        await supabase.from("license_activations").delete().in("license_id", licenseIds);
      }
      await supabase.from("licenses").delete().eq("product_id", id);
      await supabase.from("cart_events").delete().eq("product_id", id);
      await supabase.from("payment_events").delete().eq("product_id", id);
      await supabase.from("orders").delete().eq("product_id", id);
      // Finally delete the product
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success(t.deleteSuccess);
      fetchProducts();
    } catch (err: any) {
      toast.error(t.deleteError + err.message);
    }
  };

  const togglePublish = async (p: Product) => {
    await supabase.from("products").update({ is_published: !p.is_published }).eq("id", p.id);
    toast.success(p.is_published ? t.unpublishSuccess : t.publishSuccess);
    fetchProducts();
  };

  const handleDuplicate = async (p: Product) => {
    const { id, created_at, ...rest } = p;
    const { error } = await supabase.from("products").insert({
      ...rest,
      title: `${p.title} ${t.duplicateCopy}`,
      is_published: false,
      creator_id: user!.id,
    });
    if (error) {
      toast.error(t.duplicateError);
    } else {
      toast.success(t.duplicateSuccess);
      fetchProducts();
    }
  };

  const handleCopyLink = (p: Product) => {
    const slug = profile?.store_slug;
    const url = slug
      ? `${window.location.origin}/store/${slug}/${p.id}`
      : `${window.location.origin}/product/${p.id}`;
    navigator.clipboard.writeText(url);
    toast.success(t.copySuccess);
  };

  const handleShare = (p: Product) => {
    const slug = profile?.store_slug;
    const url = slug
      ? `${window.location.origin}/store/${slug}/${p.id}`
      : `${window.location.origin}/product/${p.id}`;
    if (navigator.share) {
      navigator.share({ title: p.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t.copySuccess);
    }
  };

  // Filter & search
  const filtered = products.filter((p) => {
    if (statusFilter === "published" && !p.is_published) return false;
    if (statusFilter === "draft" && p.is_published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: t.filterAll, value: "all" },
    { label: t.filterDraft, value: "draft" },
    { label: t.filterPublished, value: "published" },
  ];

  const filterDotColor: Record<StatusFilter, string> = {
    all: "bg-primary",
    draft: "bg-amber-500",
    published: "bg-green-500",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <Button onClick={() => navigate("/dashboard/products/new")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> {t.addProduct}
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {filterButtons.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${filterDotColor[f.value]}`} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl border border-dashed border-border"
          >
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.noProducts}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t.createFirstProduct}</p>
            <Button onClick={() => navigate("/dashboard/products/new")}>
              <Plus className="h-4 w-4 mr-2" /> {t.addProduct}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Table header - hidden on mobile */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 border-b border-border bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{t.colProduct}</span>
                <span className="w-28 text-right">{t.colPrice}</span>
                <span className="w-24 text-center">{t.colStatus}</span>
                <span className="w-16 text-center">{t.colActions}</span>
              </div>

              {/* Table rows */}
              {paginated.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                >
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{p.title}</span>
                    </div>
                    <span className="w-28 text-right text-sm font-semibold text-foreground whitespace-nowrap">
                      {p.price.toLocaleString("fr-FR")} FCFA
                    </span>
                    <div className="w-24 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${p.is_published ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.is_published ? "bg-green-500" : "bg-amber-500"}`} />
                        {p.is_published ? t.filterPublished : t.filterDraft}
                      </span>
                    </div>
                    <div className="w-16 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" /> {t.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const slug = profile?.store_slug;
                            if (slug) {
                              window.open(`/store/${slug}/${p.id}`, "_blank");
                            } else {
                              navigate(`/product/${p.id}`);
                            }
                          }}>
                            <Eye className="h-4 w-4 mr-2" /> {t.viewOnSite}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                            <Copy className="h-4 w-4 mr-2" /> {t.duplicate}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(p)}>
                            <Share2 className="h-4 w-4 mr-2" /> {t.share}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(p)}>
                            <Link2 className="h-4 w-4 mr-2" /> {t.link}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => togglePublish(p)}>
                            {p.is_published ? <><EyeOff className="h-4 w-4 mr-2" /> {t.unpublish}</> : <><Eye className="h-4 w-4 mr-2" /> {t.publish}</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> {t.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="sm:hidden flex items-center gap-3 px-3 py-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-foreground">{p.price.toLocaleString("fr-FR")} FCFA</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.is_published ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                          <span className={`h-1 w-1 rounded-full ${p.is_published ? "bg-green-500" : "bg-amber-500"}`} />
                          {p.is_published ? t.filterPublished : t.filterDraft}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" /> {t.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const slug = profile?.store_slug;
                          if (slug) {
                            navigate(`/store/${slug}/${p.id}`);
                          } else {
                            navigate(`/product/${p.id}`);
                          }
                        }}>
                          <Eye className="h-4 w-4 mr-2" /> {t.viewMobile}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                          <Copy className="h-4 w-4 mr-2" /> {t.duplicate}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(p)}>
                          <Share2 className="h-4 w-4 mr-2" /> {t.share}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(p)}>
                          <Link2 className="h-4 w-4 mr-2" /> {t.link}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => togglePublish(p)}>
                          {p.is_published ? <><EyeOff className="h-4 w-4 mr-2" /> {t.unpublish}</> : <><Eye className="h-4 w-4 mr-2" /> {t.publish}</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> {t.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardProducts;
