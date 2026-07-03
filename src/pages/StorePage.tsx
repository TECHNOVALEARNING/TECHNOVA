import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, ShoppingBag, ThumbsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useGeoPricing } from "@/contexts/GeoPricingContext";

import StoreContactForm from "@/components/StoreContactForm";
import StoreReviewSection from "@/components/store/StoreReviewSection";
import StoreProductReviewsAggregated from "@/components/store/StoreProductReviewsAggregated";
import { useTrackingPixels, trackEvent } from "@/hooks/useTrackingPixels";
import { useUserBadge } from "@/hooks/useUserBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { processDescriptionWithVideos } from "@/components/RichTextEditor";

interface StoreInfo {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  brand_color: string | null;
  font: string | null;
  corner_style: string | null;
  button_animation: string | null;
  show_buy_button: boolean | null;
  show_featured: boolean | null;
  product_layout: string | null;
  sort_order: string | null;
  theme: string | null;
  keywords: string | null;
  legal_notice?: string | null;
  terms_of_use?: string | null;
  privacy_policy?: string | null;
  footer_disclaimer?: string | null;
}

interface OwnerProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  google_ads_id?: string | null;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  type: string;
  thumbnail_url: string | null;
  is_published: boolean;
}

const typeLabels: Record<string, string> = {
  file: "Fichier",
  course: "Cours",
  license: "Licence",
};

type StoreTab = "products" | "about" | "contact" | "reviews";

const StorePage = ({ customSlug }: { customSlug?: string }) => {
  const { slug: urlSlug } = useParams();
  const slug = customSlug || urlSlug;
  const { formatPrice, currency } = useGeoPricing();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<StoreTab>("products");

  useEffect(() => {
    const fetchStore = async () => {
      const { data: storeData } = await supabase
        .from("stores")
        .select(
          `
          *,
          custom_domains ( domain )
        `,
        )
        .eq("slug", slug)
        .eq("is_archived", false)
        .maybeSingle();

      if (storeData) {
        // Redirect if accessed via default technova URL but has a custom domain
        if (
          !customSlug &&
          storeData.custom_domains &&
          Array.isArray(storeData.custom_domains) &&
          storeData.custom_domains.length > 0
        ) {
          const domain = storeData.custom_domains[0].domain;
          if (domain) {
            window.location.replace(`https://${domain}`);
            return;
          }
        }
        setStore(storeData as any);
        const { data: prof } = await supabase
          .from("profiles")
          .select(
            "id, display_name, bio, avatar_url, facebook_pixel_id, tiktok_pixel_id, google_ads_id",
          )
          .eq("id", storeData.owner_id)
          .single();
        if (prof) setOwnerProfile(prof as OwnerProfile);

        supabase
          .from("store_visits")
          .insert({
            store_owner_id: storeData.owner_id,
            page_path: `/store/${slug}`,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
          } as any)
          .then();

        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("creator_id", storeData.owner_id)
          .eq("is_published", true)
          .or("hide_from_store.is.null,hide_from_store.eq.false")
          .order("created_at", { ascending: false });
        const filteredProds = ((prods as Product[]) || []).filter(p => p.category !== "discovery");
        setProducts(filteredProds);
        setLoading(false);
        return;
      }

      // Fallback: profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("store_slug", slug)
        .single();

      if (!prof) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Redirect if accessed via default technova URL but has a custom domain
      if (!customSlug) {
        const { data: cDomain } = await supabase
          .from("custom_domains")
          .select("domain")
          .eq("store_id", prof.id)
          .maybeSingle();
        if (cDomain?.domain) {
          window.location.replace(`https://${cDomain.domain}`);
          return;
        }
      }
      const p = prof as any;
      setStore({
        id: p.id,
        owner_id: p.id,
        name: p.display_name || "Boutique",
        slug: p.store_slug,
        description: p.store_description,
        logo_url: p.store_logo_url,
        banner_url: p.store_banner_url,
        brand_color: p.store_brand_color,
        font: p.store_font,
        corner_style: p.store_corner_style,
        button_animation: p.store_button_animation,
        show_buy_button: p.store_show_buy_button,
        show_featured: p.store_show_featured,
        product_layout: p.store_product_layout,
        sort_order: p.store_sort_order,
        theme: p.store_theme,
        keywords: p.store_keywords,
      });
      setOwnerProfile({
        id: p.id,
        display_name: p.display_name,
        bio: p.bio,
        avatar_url: p.avatar_url,
        facebook_pixel_id: p.facebook_pixel_id,
        tiktok_pixel_id: p.tiktok_pixel_id,
        google_ads_id: p.google_ads_id,
      });

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", p.id)
        .eq("is_published", true)
        .or("hide_from_store.is.null,hide_from_store.eq.false")
        .order("created_at", { ascending: false });
      const filteredProds = ((prods as Product[]) || []).filter(p => p.category !== "discovery");
      setProducts(filteredProds);
      setLoading(false);
    };
    fetchStore();
  }, [slug]);

  const brandColor = store?.brand_color || "#2563EB";
  const storeFont = store?.font || "Inter";
  const showBuyBtn = store?.show_buy_button ?? true;
  const sortOrder = store?.sort_order || "recent";

  useTrackingPixels({
    facebookPixelId: ownerProfile?.facebook_pixel_id,
    tiktokPixelId: ownerProfile?.tiktok_pixel_id,
    googleAdsId: ownerProfile?.google_ads_id,
  });

  const storeOwnerId = store?.owner_id || "";
  const { grade: ownerBadge, expiresAt: ownerBadgeExpires } = useUserBadge(storeOwnerId);

  const sorted = [...products].sort((a, b) => {
    switch (sortOrder) {
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "price_desc":
        return b.price - a.price;
      case "price_asc":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const filtered = sorted.filter((p) => {
    const cat = (p as any).category || "";
    if (cat === "discovery" || cat === "template" || cat.startsWith("template:")) {
      return false;
    }
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: `${brandColor} transparent ${brandColor} ${brandColor}` }}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Boutique introuvable</h1>
          <p className="text-muted-foreground mb-6">
            La boutique que vous recherchez n'existe pas ou a été désactivée.
          </p>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const storeName = store?.name || ownerProfile?.display_name || "Boutique";
  const rawDescription = store?.description || "";
  // Strip HTML tags + entities to detect truly-empty content (e.g. "<p></p>")
  const descriptionTextOnly = rawDescription
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  const hasDescription = descriptionTextOnly.length > 0;
  const storeDescription = hasDescription ? rawDescription : "";
  const logoUrl = store?.logo_url || ownerProfile?.avatar_url || "";
  const bannerUrl = store?.banner_url || "";
  const reviewsEnabled = Boolean(store && store.id !== store.owner_id);
  const navigationTabs: { key: StoreTab; label: string }[] = reviewsEnabled
    ? [
        { key: "products", label: "Produits" },
        { key: "reviews", label: "Avis" },
        { key: "about", label: "À propos" },
        { key: "contact", label: "Contact" },
      ]
    : [
        { key: "products", label: "Produits" },
        { key: "about", label: "À propos" },
        { key: "contact", label: "Contact" },
      ];

  const discount = (p: Product) => {
    if (!p.original_price || p.original_price <= p.price) return null;
    return Math.round(((p.original_price - p.price) / p.original_price) * 100);
  };

  const handleBuyClick = (product: Product) => {
    trackEvent("AddToCart", {
      content_name: product.title,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "XOF",
    });
    const url = `/checkout/${product.id}${slug ? `?store=${encodeURIComponent(slug)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const types = [...new Set(products.map((p) => p.type))];

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: storeFont }}>
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link to={customSlug ? `/` : `/store/${slug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {storeName.charAt(0)?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-bold text-foreground">{storeName}</span>
            {ownerBadge && (
              <VerifiedBadge grade={ownerBadge} size="sm" showLabel expiresAt={ownerBadgeExpires} />
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navigationTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activeTab === tab.key ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
                )}
                style={
                  activeTab === tab.key
                    ? { borderBottom: `2px solid ${brandColor}`, paddingBottom: "2px" }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <span className="hidden sm:inline">Accueil TECHNOVA</span>
              <span className="sm:hidden">Accueil</span>
            </Link>
            <span className="text-border">|</span>
            <a href="https://technovalearning.com/buyer-login">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-border text-foreground hover:bg-muted"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mes achats</span>
              </Button>
            </a>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-5 px-4 pb-2 border-t border-border pt-2 overflow-x-auto">
          {navigationTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                activeTab === tab.key ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ─── BANNER ─── */}
      {bannerUrl && (
        <div className="w-full bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <img
              src={bannerUrl}
              alt={`Bannière ${storeName}`}
              className="w-full h-40 sm:h-56 md:h-72 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* ─── MAIN ─── */}
      <main className="flex-1">
        {activeTab === "contact" ? (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
            <StoreContactForm storeOwnerId={storeOwnerId} storeName={storeName} />
          </div>
        ) : activeTab === "about" ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-20 w-20 rounded-2xl object-cover mx-auto"
              />
            ) : (
              <div
                className="h-20 w-20 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {storeName.charAt(0)?.toUpperCase()}
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground inline-flex items-center gap-2 justify-center">
              {storeName}
              {ownerBadge && (
                <VerifiedBadge
                  grade={ownerBadge}
                  size="md"
                  showLabel
                  expiresAt={ownerBadgeExpires}
                />
              )}
            </h1>
            {storeDescription && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed mx-auto dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: processDescriptionWithVideos(storeDescription) }}
              />
            )}
            <p className="text-sm text-muted-foreground">
              {products.length} produit{products.length !== 1 ? "s" : ""} disponible
              {products.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : activeTab === "reviews" && reviewsEnabled && store ? (
          <>
            <StoreProductReviewsAggregated
              storeOwnerId={storeOwnerId}
              storeSlug={slug || ""}
              brandColor={brandColor}
            />
            <StoreReviewSection storeId={store.id} storeName={storeName} />
          </>
        ) : (
          <>
            {/* Title */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {`Découvrez les produits de ${storeName}`}
              </h1>
            </div>

            {/* Search & Filter */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-card border-border rounded-lg text-foreground focus:ring-1 focus:border-border"
                    style={{ focusRingColor: brandColor } as any}
                  />
                </div>
                {types.length > 1 && (
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-44 h-11 bg-card border-border rounded-lg text-foreground">
                      <SelectValue placeholder="Type de produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {typeLabels[t] || t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filtered.length === 0 ? (
              <div className="max-w-7xl mx-auto px-6 text-center py-20">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((product, i) => {
                    const disc = discount(product);
                    const hash = product.title
                      .split("")
                      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const ratings = ["4.5", "4.8", "5.0", "4.6", "4.7"];
                    const rating = ratings[hash % ratings.length];

                    const labels = [
                      "bestseller",
                      "nouveau",
                      "populaire",
                      "tendance",
                      "top",
                      "promo",
                    ];
                    const label = disc ? "promo" : labels[hash % labels.length];
                    const LABEL_MAP: Record<string, { cls: string; label: string }> = {
                      bestseller: { cls: "label-bestseller", label: "Bestseller" },
                      nouveau: { cls: "label-nouveau", label: "Nouveau" },
                      populaire: { cls: "label-populaire", label: "Populaire" },
                      promo: { cls: "label-promo", label: "Promo" },
                      tendance: { cls: "label-tendance", label: "Tendance" },
                      top: { cls: "label-top", label: "Top" },
                    };
                    const lb = LABEL_MAP[label] || {};

                    const priceMain = formatPrice(product.price);
                    const originalPriceFormatted = product.original_price
                      ? formatPrice(product.original_price)
                      : null;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="course-card cursor-pointer"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest("button") || target.closest("a")) return;
                          navigate(customSlug ? `/${product.id}` : `/store/${slug}/${product.id}`);
                        }}
                      >
                        <Link to={customSlug ? `/${product.id}` : `/store/${slug}/${product.id}`}>
                          <div className="course-img-wrap">
                            {product.thumbnail_url ? (
                              <img src={product.thumbnail_url} alt={product.title} />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
                                <Package className="h-10 w-10 text-gray-200" />
                              </div>
                            )}
                            <span className="course-badge">
                              {typeLabels[product.type] || product.type}
                            </span>
                            {lb.cls && (
                              <span className={`label-badge ${lb.cls}`}>
                                {disc ? `-${disc}%` : lb.label}
                              </span>
                            )}
                          </div>
                        </Link>

                        <div className="course-body flex-1 flex flex-col justify-between">
                          <div>
                            <Link
                              to={customSlug ? `/${product.id}` : `/store/${slug}/${product.id}`}
                            >
                              <div className="course-title line-clamp-2 hover:text-[color:var(--blue)] transition-colors">
                                {product.title}
                              </div>
                            </Link>

                            <div className="course-meta mb-3">
                              <span className="students">
                                <i
                                  className="fas fa-cubes"
                                  style={{ fontSize: "0.65rem", marginRight: 4 }}
                                ></i>
                                {reviewsEnabled ? "Avis publics" : "Produit numérique"}
                              </span>
                              <span className="stars-sm">
                                {"★".repeat(Math.floor(parseFloat(rating))) +
                                  (parseFloat(rating) % 1 >= 0.5 ? "½" : "")}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="price-row">
                              <div>
                                <div className="price-main">{priceMain}</div>
                              </div>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-[11px] text-muted-foreground line-through">
                                  {originalPriceFormatted}
                                </span>
                              )}
                            </div>

                            {showBuyBtn && (
                              <button
                                className="btn-buy mt-2 py-2.5"
                                onClick={() => handleBuyClick(product)}
                              >
                                <i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>
                                Acheter
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                {logoUrl ? (
                  <img src={logoUrl} alt={storeName} className="h-7 w-7 rounded-md object-cover" />
                ) : (
                  <div
                    className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    {storeName.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="text-base font-bold text-foreground">{storeName}</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Liens
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://portal.technovalearning.com/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Voir mes commandes
                  </a>
                </li>
                {navigationTabs.map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => setActiveTab(tab.key)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Légal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to={customSlug ? `/legal` : `/store/${slug}/legal`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link
                    to={customSlug ? `/terms` : `/store/${slug}/terms`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    to={customSlug ? `/privacy` : `/store/${slug}/privacy`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {store?.footer_disclaimer && (
            <p className="mt-10 text-xs leading-relaxed text-muted-foreground max-w-4xl">
              {store.footer_disclaimer}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {storeName} © {new Date().getFullYear()} Tous droits réservés.
            </p>
            <p className="text-xs text-muted-foreground">
              Propulsé par{" "}
              <Link to="/" className="hover:underline font-medium" style={{ color: brandColor }}>
                TECHNOVA
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorePage;
