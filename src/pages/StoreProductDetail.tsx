import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Key,
  Package,
  ShoppingBag,
  Share2,
  MessageCircle,
  Flag,
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  Star,
  CheckCircle2,
  Users,
  Clock,
  Lock,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useGeoPricing } from "@/contexts/GeoPricingContext";
import SEOHead from "@/components/SEOHead";

import ProductReportDialog from "@/components/store/ProductReportDialog";
import { processDescriptionWithVideos } from "@/components/RichTextEditor";
import { trackEvent } from "@/hooks/useTrackingPixels";
import { toast } from "sonner";
import { useUserBadge } from "@/hooks/useUserBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import ProductReviewsSection from "@/components/store/ProductReviewsSection";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  store_slug: string | null;
  store_description: string | null;
  store_logo_url: string | null;
  contact: string | null;
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
  download_url: string | null;
  course_content_type: string | null;
  sales_count?: number | null;
  category?: string | null;
  file_password?: string | null;
  watermark_enabled?: boolean | null;
  sales_limit?: number | null;
  hide_from_store?: boolean | null;
  collect_shipping_address?: boolean | null;
  hide_sales_count?: boolean | null;
  marketing_sections?: any;
}

interface StoreInfo {
  brand_color: string | null;
  logo_url: string | null;
  name: string | null;
  footer_disclaimer?: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  file: <Download className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  license: <Key className="h-4 w-4" />,
  bundle: <Package className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  file: "Téléchargeable",
  course: "Formation",
  license: "Licence",
  bundle: "Bundle",
};

const StoreProductDetail = ({ customSlug }: { customSlug?: string }) => {
  const { slug: urlSlug, productId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useGeoPricing();
  const slug = customSlug || urlSlug;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [lessons, setLessons] = useState<
    {
      title: string;
      description: string | null;
      duration_minutes: number | null;
      position: number;
    }[]
  >([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { grade: ownerBadge, expiresAt: ownerBadgeExpires } = useUserBadge(profile?.id);
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  useEffect(() => {
    const timerConfig = product?.marketing_sections?.countdown_timer;
    if (!timerConfig?.enabled || !timerConfig?.ends_at) {
      return;
    }

    const targetDate = new Date(timerConfig.ends_at);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [product]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let ownerId: string | null = null;
        let prod: any = null;
        let storeData: any = null;
        let prof: any = null;

        if (!slug) {
          // Accessed directly via /product/:productId, so fetch product first to resolve creator and store slug
          const { data: prodData } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .eq("is_published", true)
            .maybeSingle();

          if (!prodData) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          prod = prodData;
          ownerId = prodData.creator_id;

          const { data: sData } = await supabase
            .from("stores")
            .select(
              `
              owner_id, brand_color, logo_url, name, footer_disclaimer,
              custom_domains ( domain )
            `,
            )
            .eq("owner_id", ownerId)
            .eq("is_archived", false)
            .maybeSingle();

          storeData = sData;

          const { data: pData } = await supabase
            .from("profiles")
            .select(
              "id, display_name, avatar_url, store_slug, store_description, store_logo_url, contact",
            )
            .eq("id", ownerId)
            .maybeSingle();

          prof = pData;
        } else {
          // Standard /store/:slug/:productId path
          const { data: sData } = await supabase
            .from("stores")
            .select(
              `
              owner_id, brand_color, logo_url, name, footer_disclaimer,
              custom_domains ( domain )
            `,
            )
            .eq("slug", slug)
            .eq("is_archived", false)
            .maybeSingle();

          storeData = sData;

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
                window.location.replace(`https://${domain}/${productId}`);
                return;
              }
            }
            ownerId = storeData.owner_id;
          }

          const { data: pData } = await supabase
            .from("profiles")
            .select(
              "id, display_name, avatar_url, store_slug, store_description, store_logo_url, contact",
            )
            .eq(storeData ? "id" : "store_slug", storeData ? storeData.owner_id : slug)
            .maybeSingle();

          prof = pData;
          if (!prof) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          ownerId = prof.id;

          // Redirect if accessed via default technova URL but has a custom domain
          if (!customSlug) {
            const { data: cDomain } = await supabase
              .from("custom_domains")
              .select("domain")
              .eq("store_id", prof.id)
              .maybeSingle();

            if (cDomain?.domain) {
              window.location.replace(`https://${cDomain.domain}/${productId}`);
              return;
            }
          }

          const { data: prodData } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .eq("creator_id", ownerId)
            .eq("is_published", true)
            .maybeSingle();

          prod = prodData;
        }

        if (!prod || !prof) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProduct(prod as Product);
        if (storeData) setStoreInfo(storeData as StoreInfo);
        setProfile(prof as Profile);

        trackEvent("ViewContent", {
          content_name: prod.title,
          content_ids: [productId],
          content_type: "product",
          value: prod.price,
          currency: "XOF",
        });

        const { data: faqData } = await supabase
          .from("product_faqs")
          .select("question, answer")
          .eq("product_id", productId)
          .order("position");
        if (faqData) setFaqs(faqData as any);

        if (prod.type === "course") {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("title, description, duration_minutes, position")
            .eq("product_id", productId)
            .order("position");
          if (lessonsData) setLessons(lessonsData as any);
        }

        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("creator_id", ownerId)
          .eq("is_published", true)
          .neq("id", productId);
        if (related) {
          const filteredRelated = (related as Product[])
            .filter(p => p.category !== "discovery")
            .slice(0, 4);
          setRelatedProducts(filteredRelated);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading product detail", err);
        setNotFound(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, productId]);

  const hasFiles =
    product &&
    (product.type === "file" ||
      product.type === "bundle" ||
      product.category === "template" ||
      product.category?.startsWith("template:") ||
      !!product.download_url);

  const getFileName = (url: string | null) => {
    if (!url) return "templates_et_produits.zip";
    try {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1].split("?")[0];
      return decodeURIComponent(lastPart) || "templates_et_produits.zip";
    } catch {
      return "templates_et_produits.zip";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !product || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-500 mb-6">Ce produit n'existe pas ou n'est plus disponible.</p>
        <Link to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}>
          <Button>Retour à la boutique</Button>
        </Link>
      </div>
    );
  }

  const brandColor = storeInfo?.brand_color || "#2563EB";
  const storeName = storeInfo?.name || profile.display_name || "Boutique";
  const logoUrl = storeInfo?.logo_url || profile.store_logo_url || profile.avatar_url || "";
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;
  const salesCount = product.sales_count || 0;
  const hideSales = !!product.hide_sales_count;
  const isBestseller = !hideSales && salesCount >= 10;
  const salesLimit = product.sales_limit || 0;
  const isSoldOut = salesLimit > 0 && salesCount >= salesLimit;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const handleBuy = () => {
    if (isSoldOut) {
      toast.error("Ce produit n'est plus disponible (limite de ventes atteinte).");
      return;
    }
    trackEvent("AddToCart", {
      content_name: product.title,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "XOF",
    });
    const storeRef = profile?.store_slug || slug;
    const url = `/checkout/${product.id}${storeRef ? `?store=${encodeURIComponent(storeRef)}` : ""}`;
    navigate(url);
  };

  const truncateText = (text: string | null, maxLen = 155) => {
    if (!text) return "";
    const plainText = text.replace(/<[^>]*>/g, "");
    if (plainText.length <= maxLen) return plainText;
    return plainText.substring(0, maxLen - 3) + "...";
  };

  const seoTitle = `${product.title} — ${storeName}`;
  const seoDesc =
    truncateText(product.description) ||
    `Achetez ${product.title} en ligne. Fichier, formation ou licence numérique de qualité.`;

  const courseJsonLd =
    product.type === "course"
      ? {
          "@type": "Course",
          name: product.title,
          description: truncateText(product.description, 300),
          provider: {
            "@type": "Organization",
            name: "Technova Learning",
            sameAs: "https://www.technovalearning.com",
          },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            inLanguage: "fr",
          },
          offers: {
            "@type": "Offer",
            category: "Paid",
            price: String(product.price),
            priceCurrency: "XOF",
          },
        }
      : {
          "@type": "Product",
          name: product.title,
          description: truncateText(product.description, 300),
          image: product.thumbnail_url || undefined,
          offers: {
            "@type": "Offer",
            price: String(product.price),
            priceCurrency: "XOF",
            availability: "https://schema.org/InStock",
          },
        };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        jsonLd={courseJsonLd}
        ogImage={product.thumbnail_url || undefined}
        ogType="product"
        canonicalPath={
          customSlug ? `/${product.id}` : `/store/${profile.store_slug || slug}/${product.id}`
        }
      />
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link
            to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}
            className="flex items-center gap-3 min-w-0"
          >
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
            <span className="text-sm font-bold text-foreground truncate">{storeName}</span>
            {ownerBadge && (
              <VerifiedBadge grade={ownerBadge} size="sm" expiresAt={ownerBadgeExpires} />
            )}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <span className="hidden sm:inline">Accueil TECHNOVA</span>
              <span className="sm:hidden">Accueil</span>
            </Link>
            <span className="text-border">|</span>
            <Link
              to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}
              className="hidden sm:block"
            >
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Boutique
              </Button>
            </Link>
            <Link to="/buyer-login">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border text-foreground hover:bg-muted">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mes Achats</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Accueil TECHNOVA
            </Link>
            <span className="text-border">/</span>
            <Link
              to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}
              className="hover:text-foreground transition-colors"
            >
              Boutique
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {product.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 mt-2">
            {/* ─── LEFT: Image + content ─── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Hero image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
              >
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Package className="h-20 w-20 text-gray-300" />
                  </div>
                )}

                {/* Floating badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {isBestseller && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      🔥 Bestseller
                    </span>
                  )}
                  {discount && (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md"
                      style={{ backgroundColor: brandColor }}
                    >
                      -{discount}%
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Title block (mobile shows here) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="lg:hidden"
              >
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                    {typeIcons[product.type]} {typeLabels[product.type] || product.type}
                  </span>
                  {!hideSales && salesCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-foreground leading-tight">
                  {product.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold" style={{ color: brandColor }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: Zap, label: "Livraison instantanée", sub: "Accès immédiat" },
                  { icon: ShieldCheck, label: "Paiement sécurisé", sub: "100% protégé" },
                  { icon: HeadphonesIcon, label: "Support inclus", sub: "Réponse rapide" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="rounded-xl border border-border bg-card p-2.5 sm:p-3 text-center"
                  >
                    <t.icon
                      className="mx-auto h-4 w-4 sm:h-5 sm:w-5 mb-1"
                      style={{ color: brandColor }}
                    />
                    <div className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">
                      {t.label}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                      {t.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Files block */}
              {hasFiles && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-4 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {lang === "fr" ? "Fichiers (1)" : "Files (1)"}
                  </h2>

                  {/* Warning/Alert box */}
                  <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-800 dark:text-amber-200">
                    <Lock
                      className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                      style={{ color: brandColor }}
                    />
                    <div className="text-sm font-medium leading-relaxed">
                      {lang === "fr"
                        ? "Acheter le produit pour l'accès aux fichiers"
                        : "Buy the product to access files"}
                    </div>
                  </div>

                  {/* File row */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {getFileName(product.download_url)}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
                          Zip • Archive
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold shrink-0">
                      <Lock className="h-3.5 w-3.5 animate-pulse" />
                      {lang === "fr" ? "Verrouillé" : "Locked"}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Description */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7"
                >
                  <h2 className="mb-4 text-lg font-bold text-foreground">À propos de ce produit</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processDescriptionWithVideos(product.description),
                    }}
                    className="prose prose-sm max-w-none leading-relaxed text-muted-foreground dark:prose-invert [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-foreground [&_p]:mb-4 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_li]:text-muted-foreground [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_.video-embed]:my-6 [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-border"
                    style={{ "--tw-prose-links": brandColor } as any}
                  />
                </motion.div>
              )}

              {/* What's included */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-2xl border border-border bg-card p-5 sm:p-7"
              >
                <h2 className="mb-4 text-lg font-bold text-foreground">Ce qui est inclus</h2>
                <ul className="space-y-3">
                  {[
                    product.type === "course"
                      ? "Accès à vie aux modules de la formation"
                      : product.type === "license"
                        ? "Clé de licence unique livrée par email"
                        : "Téléchargement immédiat après paiement",
                    "Mises à jour gratuites à vie",
                    "Support direct du créateur",
                    "Accès depuis votre espace « Mes achats »",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        style={{ color: brandColor }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Course content */}
              {product.type === "course" && lessons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.13 }}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Contenu de la formation</h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {lessons.map((l, i) => (
                      <AccordionItem
                        key={i}
                        value={`lesson-${i}`}
                        className="rounded-xl border border-border bg-muted/20 px-4"
                      >
                        <AccordionTrigger className="hover:no-underline py-4 text-left">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="h-7 w-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                              style={{ backgroundColor: brandColor }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {l.title}
                              </div>
                              {l.duration_minutes && (
                                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {l.duration_minutes} min
                                </div>
                              )}
                            </div>
                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </AccordionTrigger>
                        {l.description && (
                          <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed pl-10">
                            {l.description}
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}

              {/* FAQ */}
              {faqs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7"
                >
                  <h2 className="mb-4 text-lg font-bold text-foreground">Questions fréquentes</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`faq-${index}`}
                        className="rounded-xl border border-border bg-muted/20 px-4"
                      >
                        <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}

              {/* Customer reviews */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                <ProductReviewsSection productId={product.id} brandColor={brandColor} />
              </motion.div>

              {/* Seller card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Vendu par
                </h2>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {storeName.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-base font-bold text-foreground truncate">{storeName}</div>
                      {ownerBadge && (
                        <VerifiedBadge
                          grade={ownerBadge}
                          size="sm"
                          showLabel
                          expiresAt={ownerBadgeExpires}
                        />
                      )}
                    </div>
                    {profile.store_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {profile.store_description
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()}
                      </p>
                    )}
                  </div>
                  <Link to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Voir
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* ─── RIGHT: Purchase card ─── */}
            <div className="lg:col-span-2">
              {/* Desktop title */}
              <div className="hidden lg:block mb-5">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                    {typeIcons[product.type]} {typeLabels[product.type] || product.type}
                  </span>
                  {!hideSales && salesCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold text-foreground leading-tight">
                  {product.title}
                </h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:sticky lg:top-20 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm"
              >
                {/* Urgent Countdown Timer */}
                {product.marketing_sections?.countdown_timer?.enabled && !isExpired && (
                  <div className="rounded-xl border border-red-200/50 bg-red-50/50 dark:border-red-950/30 dark:bg-red-950/10 p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {lang === "fr" ? "Offre limitée - Bientôt expiré !" : "Limited time offer - Expiring soon!"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-sm px-2 py-0.5 rounded min-w-[32px] text-center border border-red-200/40">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground mt-1">
                          {lang === "fr" ? "Heures" : "Hours"}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-red-400 -mt-3">:</span>
                      <div className="flex flex-col items-center">
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-sm px-2 py-0.5 rounded min-w-[32px] text-center border border-red-200/40">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground mt-1">
                          Min
                        </span>
                      </div>
                      <span className="text-sm font-bold text-red-400 -mt-3">:</span>
                      <div className="flex flex-col items-center">
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-sm px-2 py-0.5 rounded min-w-[32px] text-center border border-red-200/40 animate-pulse">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground mt-1">
                          Sec
                        </span>
                      </div>
                      <div className="ml-auto text-[10px] text-muted-foreground font-medium max-w-[100px] text-right">
                        {lang === "fr" ? "Bénéficiez du meilleur tarif !" : "Get the best price now!"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-3xl sm:text-4xl font-extrabold"
                      style={{ color: brandColor }}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-base text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                    {discount && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        Économisez {discount}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Paiement unique • Pas d'abonnement
                  </p>
                </div>

                {/* CTA */}
                <button
                  className="w-full text-base font-bold py-4 rounded-xl text-white transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: isSoldOut ? "#9CA3AF" : brandColor,
                    boxShadow: isSoldOut ? "none" : `0 8px 24px -8px ${brandColor}80`,
                  }}
                  onClick={handleBuy}
                  disabled={isSoldOut}
                >
                  {isSoldOut ? "Épuisé" : "Acheter maintenant"}
                </button>

                {product.type === "course" && (
                  <Link to={`/learn/${product.id}`} className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full py-4 text-sm font-bold rounded-xl gap-2 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>{lang === "fr" ? "Accéder au cours en ligne" : "Access Online Course"}</span>
                    </Button>
                  </Link>
                )}

                {/* Quick benefits */}
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" style={{ color: brandColor }} />
                    Livré instantanément après paiement
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: brandColor }} />
                    Transaction 100% sécurisée
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" style={{ color: brandColor }} />
                    Accès à vie depuis « Mes achats »
                  </li>
                </ul>

                <Separator className="bg-border" />

                {/* Payment methods */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Moyens de paiement
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="h-7 w-10 rounded-md bg-[#1A1F71] flex items-center justify-center shadow-sm">
                      <span className="text-[8px] font-bold text-white">VISA</span>
                    </div>
                    <div className="h-7 w-10 rounded-md bg-[#EB001B] flex items-center justify-center shadow-sm">
                      <span className="text-[8px] font-bold text-white">MC</span>
                    </div>
                    <div className="h-7 w-10 rounded-md bg-[#FFCC00] overflow-hidden flex items-center justify-center shadow-sm">
                      <img
                        src="/providers/mtn.svg"
                        alt="MTN"
                        className="h-full w-full object-contain p-0.5"
                      />
                    </div>
                    <div className="h-7 w-10 rounded-md bg-[#FF7900] overflow-hidden flex items-center justify-center shadow-sm">
                      <img
                        src="/providers/orange.svg"
                        alt="Orange"
                        className="h-full w-full object-contain p-0.5"
                      />
                    </div>
                    <div className="h-7 w-10 rounded-md bg-[#0066B3] overflow-hidden flex items-center justify-center shadow-sm">
                      <img
                        src="/providers/moov.svg"
                        alt="Moov"
                        className="h-full w-full object-contain p-0.5"
                      />
                    </div>
                    <div className="h-7 w-10 rounded-md bg-[#1DC8F1] overflow-hidden flex items-center justify-center shadow-sm">
                      <img
                        src="/providers/wave.svg"
                        alt="Wave"
                        className="h-full w-full object-contain p-0.5"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Partager
                  </button>
                  {profile.contact && (
                    <a
                      href={`mailto:${profile.contact}`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Contact
                    </a>
                  )}
                  <button
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Signaler
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-14"
            >
              <h2 className="text-xl font-bold text-foreground mb-5">
                Autres produits de {storeName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.map((rp) => {
                  const rDisc =
                    rp.original_price && rp.original_price > rp.price
                      ? Math.round(((rp.original_price - rp.price) / rp.original_price) * 100)
                      : null;
                  return (
                    <Link
                      key={rp.id}
                      to={
                        customSlug
                          ? `/${rp.id}`
                          : `/store/${profile?.store_slug || slug || ""}/${rp.id}`
                      }
                      className="group border border-border rounded-2xl overflow-hidden bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {rp.thumbnail_url ? (
                          <img
                            src={rp.thumbnail_url}
                            alt={rp.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {rDisc && (
                          <span
                            className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            -{rDisc}%
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                          {rp.title}
                        </h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold" style={{ color: brandColor }}>
                            {formatPrice(rp.price)}
                          </span>
                          {rp.original_price && rp.original_price > rp.price && (
                            <span className="text-[10px] line-through text-muted-foreground">
                              {formatPrice(rp.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Mobile sticky purchase bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Prix</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold truncate" style={{ color: brandColor }}>
                {formatPrice(product.price)}
              </span>
              {discount && (
                <span className="text-[10px] font-bold text-emerald-600">-{discount}%</span>
              )}
            </div>
          </div>
          <button
            className="flex-shrink-0 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: brandColor, boxShadow: `0 6px 20px -6px ${brandColor}` }}
            onClick={handleBuy}
          >
            Acheter
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
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

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Liens
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://www.technovalearning.com/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Voir mes commandes
                  </a>
                </li>
                <li>
                  <Link
                    to={customSlug ? `/` : `/store/${profile?.store_slug || slug || ""}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Boutique
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Légal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to={customSlug ? `/legal` : `/store/${profile?.store_slug || slug || ""}/legal`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link
                    to={customSlug ? `/terms` : `/store/${profile?.store_slug || slug || ""}/terms`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    to={
                      customSlug
                        ? `/privacy`
                        : `/store/${profile?.store_slug || slug || ""}/privacy`
                    }
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {storeInfo?.footer_disclaimer && (
            <p className="mt-10 text-xs leading-relaxed text-muted-foreground max-w-4xl">
              {storeInfo.footer_disclaimer}
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

      <ProductReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        productId={product.id}
        productTitle={product.title}
      />
    </div>
  );
};

export default StoreProductDetail;
