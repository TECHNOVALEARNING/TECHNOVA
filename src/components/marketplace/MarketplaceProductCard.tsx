import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Package, Heart } from "lucide-react";
import { getCategoryByKey } from "@/data/marketplaceCategories";
import { useState } from "react";
import { useUserBadge } from "@/hooks/useUserBadge";
import { VerifiedBadge, type BadgeGrade } from "@/components/VerifiedBadge";
import { useGeoPricing } from "@/contexts/GeoPricingContext";

export interface MarketplaceProduct {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  thumbnail_url?: string | null;
  type: string;
  category?: string | null;
  sales_count?: number;
  creator_id?: string | null;
  store?: {
    display_name?: string;
    store_slug?: string;
    store_logo_url?: string;
    avatar_url?: string;
  } | null;
}

interface Props {
  product: MarketplaceProduct;
  index?: number;
  /** when true, prevents card from shrinking inside horizontal scrollers */
  fixedWidth?: boolean;
  /** Optional pre-fetched badge (avoids one query per card) */
  sellerBadge?: BadgeGrade | null;
}

export const MarketplaceProductCard = ({ product, index = 0, fixedWidth, sellerBadge }: Props) => {
  const { formatPrice } = useGeoPricing();
  const navigate = useNavigate();
  const { grade: fetchedGrade } = useUserBadge(
    sellerBadge === undefined ? product.creator_id : null,
  );
  const grade = sellerBadge !== undefined ? sellerBadge : fetchedGrade;
  const cat = getCategoryByKey(product.category);
  const storeSlug = product.store?.store_slug;
  const href = storeSlug ? `/store/${storeSlug}/${product.id}` : `/product/${product.id}`;

  const hasDiscount =
    product.original_price && Number(product.original_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(
        ((Number(product.original_price) - Number(product.price)) /
          Number(product.original_price)) *
          100,
      )
    : 0;

  const [liked, setLiked] = useState(false);

  // Stable hash based on course title to derive a fixed visual mock for stars rating and status
  const hash = product.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratings = ["4.5", "4.8", "5.0", "4.6", "4.7"];
  const rating = ratings[hash % ratings.length];

  const labels = ["bestseller", "nouveau", "populaire", "tendance", "top", "promo"];
  const label = hasDiscount ? "promo" : labels[hash % labels.length];

  const LABEL_MAP: Record<string, { cls: string; label: string }> = {
    bestseller: { cls: "label-bestseller", label: "Bestseller" },
    nouveau: { cls: "label-nouveau", label: "Nouveau" },
    populaire: { cls: "label-populaire", label: "Populaire" },
    promo: { cls: "label-promo", label: "Promo" },
    tendance: { cls: "label-tendance", label: "Tendance" },
    top: { cls: "label-top", label: "Top" },
  };
  const lb = LABEL_MAP[label] || {};

  const renderStars = (r: string) => {
    const ratingNum = parseFloat(r);
    const full = Math.floor(ratingNum);
    const half = ratingNum % 1 >= 0.5;
    let s = "";
    for (let i = 0; i < full; i++) s += "★";
    if (half) s += "½";
    return <span className="stars-sm">{s}</span>;
  };

  const priceMain = formatPrice(Number(product.price));
  const originalPriceFormatted = product.original_price
    ? formatPrice(Number(product.original_price))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={`course-card cursor-pointer ${fixedWidth ? "w-[160px] shrink-0 sm:w-[220px]" : ""}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) return;
        navigate(href);
      }}
    >
      <div className="course-img-wrap relative">
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.title} loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 text-muted-foreground">
            <Package className="h-10 w-10 text-gray-200" />
          </div>
        )}

        <span className="course-badge">{cat ? `${cat.emoji} ${cat.label}` : product.type}</span>

        {lb.cls && (
          <span className={`label-badge ${lb.cls}`}>
            {hasDiscount ? `-${discountPct}%` : lb.label}
          </span>
        )}

        {/* favorite heart button absolute overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked((s) => !s);
          }}
          aria-label="Favori"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-destructive text-destructive" : ""
            }`}
          />
        </button>
      </div>

      <div className="course-body flex-1 flex flex-col justify-between">
        <div>
          <Link to={href}>
            <div className="course-title line-clamp-2 hover:text-[color:var(--blue)] transition-colors">
              {product.title}
            </div>
          </Link>

          {product.store?.display_name && (
            <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground mb-3">
              <span className="truncate">par {product.store.display_name}</span>
              {grade && <VerifiedBadge grade={grade} size="xs" />}
            </p>
          )}

          <div className="course-meta mb-3">
            {(product.sales_count || 0) > 0 && (
              <span className="students">
                <i
                  className="fas fa-shopping-cart"
                  style={{ fontSize: "0.65rem", marginRight: 4 }}
                ></i>
                {product.sales_count} vendus
              </span>
            )}
            {renderStars(rating)}
          </div>
        </div>

        <div>
          <div className="price-row">
            <div>
              <div className="price-main">{priceMain}</div>
            </div>
            {hasDiscount && originalPriceFormatted && (
              <span className="text-[11px] text-muted-foreground line-through">
                {originalPriceFormatted}
              </span>
            )}
          </div>

          <Link className="btn-buy mt-2 text-center text-xs py-2.5" to={href}>
            <i className="fas fa-shopping-cart" style={{ marginRight: 6 }}></i>
            Détails
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
