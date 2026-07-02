import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, ThumbsUp, Star, ArrowRight, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ───
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

interface ThemeProps {
  products: Product[];
  brandColor: string;
  cornerStyle: string;
  buttonAnimation: string;
  showBuyBtn: boolean;
  showFeatured: boolean;
  slug: string;
  storeName: string;
  storeDescription: string;
  bannerUrl: string | null;
  onBuy: (product: Product) => void;
}

// ─── HELPERS ───
const discount = (p: Product) => {
  if (!p.original_price || p.original_price <= p.price) return null;
  return Math.round(((p.original_price - p.price) / p.original_price) * 100);
};

const btnAnimClass = (anim: string) => {
  if (anim === "pulse") return "animate-pulse";
  if (anim === "bounce") return "animate-bounce";
  if (anim === "shake") return "animate-[shake_0.5s_ease-in-out_infinite]";
  return "";
};

const radius = (corner: string) => (corner === "square" ? "rounded-none" : "rounded-xl");
const radiusSm = (corner: string) => (corner === "square" ? "rounded-none" : "rounded-lg");

const typeLabels: Record<string, string> = {
  file: "Fichier",
  course: "Cours",
  license: "Licence",
  bundle: "Bundle",
};

// ─────────────────────────────────────────────────────
// THEME 1: FEED — Single column, social-media style
// ─────────────────────────────────────────────────────
export const FeedLayout = ({
  products,
  brandColor,
  cornerStyle,
  buttonAnimation,
  showBuyBtn,
  showFeatured,
  slug,
  storeName,
  storeDescription,
  bannerUrl,
  onBuy,
}: ThemeProps) => {
  const featured = showFeatured ? products.slice(0, 1) : [];
  const rest = showFeatured ? products.slice(1) : products;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Featured product - big hero card */}
      {featured.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "overflow-hidden border border-gray-100 bg-white shadow-sm",
            radius(cornerStyle),
          )}
        >
          <Link to={`/store/${slug}/${product.id}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-200" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  ⭐ Vedette
                </span>
              </div>
              {discount(product) && (
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white">
                  -{discount(product)}%
                </span>
              )}
            </div>
          </Link>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {typeLabels[product.type] || product.type}
              </span>
            </div>
            <Link to={`/store/${slug}/${product.id}`}>
              <h2 className="text-xl font-bold text-gray-900 hover:opacity-70 transition-opacity">
                {product.title}
              </h2>
            </Link>
            {product.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-baseline gap-2">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm line-through text-gray-300">
                    {product.original_price.toLocaleString()} FCFA
                  </span>
                )}
                <span className="text-2xl font-extrabold" style={{ color: brandColor }}>
                  {product.price.toLocaleString()} FCFA
                </span>
              </div>
              {showBuyBtn && (
                <button
                  className={cn(
                    "text-sm font-bold text-white px-6 py-3 transition-all hover:opacity-90 hover:scale-105",
                    radiusSm(cornerStyle),
                    btnAnimClass(buttonAnimation),
                  )}
                  style={{ backgroundColor: brandColor }}
                  onClick={() => onBuy(product)}
                >
                  Acheter maintenant
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Rest: single column cards */}
      {rest.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={cn(
            "flex gap-4 p-4 border border-gray-100 bg-white hover:shadow-md transition-all",
            radius(cornerStyle),
          )}
        >
          <Link to={`/store/${slug}/${product.id}`} className="flex-shrink-0">
            <div
              className={cn(
                "h-28 w-28 sm:h-32 sm:w-32 overflow-hidden bg-gray-50",
                radiusSm(cornerStyle),
              )}
            >
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-200" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-semibold uppercase text-gray-400">
                {typeLabels[product.type] || product.type}
              </span>
              <Link to={`/store/${slug}/${product.id}`}>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:opacity-70 transition-opacity mt-0.5">
                  {product.title}
                </h3>
              </Link>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold" style={{ color: brandColor }}>
                {product.price.toLocaleString()} FCFA
              </span>
              {showBuyBtn && (
                <button
                  className={cn(
                    "text-xs font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90",
                    radiusSm(cornerStyle),
                    btnAnimClass(buttonAnimation),
                  )}
                  style={{ backgroundColor: brandColor }}
                  onClick={() => onBuy(product)}
                >
                  Acheter
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// THEME 2: MINIMAL — Ultra clean 2-column grid
// ─────────────────────────────────────────────────────
export const MinimalLayout = ({
  products,
  brandColor,
  cornerStyle,
  buttonAnimation,
  showBuyBtn,
  slug,
  onBuy,
}: ThemeProps) => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group"
        >
          <Link to={`/store/${slug}/${product.id}`}>
            <div
              className={cn(
                "relative aspect-square overflow-hidden bg-gray-50 mb-4",
                radius(cornerStyle),
              )}
            >
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-200" />
                </div>
              )}
              {discount(product) && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white">
                  -{discount(product)}%
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </Link>
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {typeLabels[product.type] || product.type}
            </span>
            <Link to={`/store/${slug}/${product.id}`}>
              <h3 className="text-base font-semibold text-gray-900 group-hover:opacity-70 transition-opacity">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xs line-through text-gray-300">
                    {product.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-bold" style={{ color: brandColor }}>
                  {product.price.toLocaleString()} FCFA
                </span>
              </div>
              {showBuyBtn && (
                <button
                  className={cn(
                    "text-xs font-semibold text-white px-4 py-2 transition-all hover:opacity-90 hover:scale-105",
                    radiusSm(cornerStyle),
                    btnAnimClass(buttonAnimation),
                  )}
                  style={{ backgroundColor: brandColor }}
                  onClick={() => onBuy(product)}
                >
                  Acheter
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────
// THEME 3: MAGAZINE — Hero feature + editorial grid
// ─────────────────────────────────────────────────────
export const MagazineLayout = ({
  products,
  brandColor,
  cornerStyle,
  buttonAnimation,
  showBuyBtn,
  showFeatured,
  slug,
  storeName,
  storeDescription,
  bannerUrl,
  onBuy,
}: ThemeProps) => {
  const featured = showFeatured && products.length > 0 ? products[0] : null;
  const rest = showFeatured ? products.slice(1) : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero featured product - full width editorial */}
      {featured && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("relative overflow-hidden bg-gray-900", radius(cornerStyle))}
        >
          <div className="grid md:grid-cols-2 min-h-[400px]">
            <div className="relative overflow-hidden">
              {featured.thumbnail_url ? (
                <img
                  src={featured.thumbnail_url}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center bg-gray-800">
                  <Package className="h-16 w-16 text-gray-600" />
                </div>
              )}
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: brandColor }}
              >
                ⭐ Produit vedette
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {featured.description}
                </p>
              )}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-3xl font-extrabold text-white">
                  {featured.price.toLocaleString()} FCFA
                </span>
                {featured.original_price && featured.original_price > featured.price && (
                  <span className="text-lg line-through text-gray-500">
                    {featured.original_price.toLocaleString()}
                  </span>
                )}
              </div>
              {showBuyBtn && (
                <button
                  className={cn(
                    "w-fit text-sm font-bold text-white px-8 py-3 mt-2 transition-all hover:opacity-90 hover:scale-105",
                    radiusSm(cornerStyle),
                    btnAnimClass(buttonAnimation),
                  )}
                  style={{ backgroundColor: brandColor }}
                  onClick={() => onBuy(featured)}
                >
                  Acheter maintenant <ArrowRight className="inline h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Editorial grid - mixed sizes */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: brandColor }} />
          {showFeatured ? "Autres produits" : "Tous les produits"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((product, i) => {
            const disc = discount(product);
            const isLarge = i === 0 || i === 3; // First and fourth items span 2 cols on large
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "group bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300",
                  radius(cornerStyle),
                  isLarge && "sm:col-span-2 lg:col-span-1",
                )}
              >
                <Link to={`/store/${slug}/${product.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-gray-200" />
                      </div>
                    )}
                    {disc && (
                      <span
                        className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        -{disc}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {typeLabels[product.type] || product.type}
                  </span>
                  <Link to={`/store/${slug}/${product.id}`}>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 hover:opacity-70">
                      {product.title}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-extrabold" style={{ color: brandColor }}>
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {showBuyBtn && (
                      <button
                        className={cn(
                          "text-xs font-semibold text-white px-4 py-2 transition-all hover:opacity-90",
                          radiusSm(cornerStyle),
                          btnAnimClass(buttonAnimation),
                        )}
                        style={{ backgroundColor: brandColor }}
                        onClick={() => onBuy(product)}
                      >
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
    </div>
  );
};

// ─────────────────────────────────────────────────────
// THEME 4: STARTER — Split layout (Oreo-like)
// ─────────────────────────────────────────────────────
export const StarterLayout = ({
  products,
  brandColor,
  cornerStyle,
  buttonAnimation,
  showBuyBtn,
  slug,
  storeName,
  storeDescription,
  onBuy,
}: ThemeProps) => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
    {/* Intro section */}
    <div className="text-center space-y-3 pb-4">
      <h1 className="text-3xl font-extrabold text-gray-900">
        {storeDescription || `Bienvenue chez ${storeName}`}
      </h1>
      <p className="text-gray-400 text-sm max-w-lg mx-auto">
        Découvrez notre sélection de produits digitaux de qualité
      </p>
      <div className="h-1 w-16 mx-auto rounded-full" style={{ backgroundColor: brandColor }} />
    </div>

    {/* Alternating split layout */}
    {products.map((product, i) => {
      const disc = discount(product);
      const isReversed = i % 2 !== 0;
      return (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={cn(
            "grid md:grid-cols-2 gap-0 border border-gray-100 overflow-hidden bg-white hover:shadow-lg transition-shadow",
            radius(cornerStyle),
          )}
        >
          <Link
            to={`/store/${slug}/${product.id}`}
            className={cn("relative overflow-hidden bg-gray-50", isReversed && "md:order-2")}
          >
            <div className="aspect-[4/3] md:aspect-auto md:h-full">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="h-full min-h-[250px] flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-200" />
                </div>
              )}
              {disc && (
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white bg-red-500">
                  -{disc}% OFF
                </span>
              )}
            </div>
          </Link>
          <div
            className={cn(
              "p-8 md:p-10 flex flex-col justify-center space-y-4",
              isReversed && "md:order-1",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                {typeLabels[product.type] || product.type}
              </span>
            </div>
            <Link to={`/store/${slug}/${product.id}`}>
              <h2 className="text-2xl font-extrabold text-gray-900 hover:opacity-70 transition-opacity">
                {product.title}
              </h2>
            </Link>
            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-4 w-4 text-gray-300" />
              <span className="text-xs text-gray-400">0 avis vérifiés</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm line-through text-gray-300 block">
                    {product.original_price.toLocaleString()} FCFA
                  </span>
                )}
                <span className="text-2xl font-extrabold" style={{ color: brandColor }}>
                  {product.price.toLocaleString()} FCFA
                </span>
              </div>
              {showBuyBtn && (
                <button
                  className={cn(
                    "text-sm font-bold text-white px-6 py-3 transition-all hover:opacity-90 hover:scale-105 shadow-lg",
                    radiusSm(cornerStyle),
                    btnAnimClass(buttonAnimation),
                  )}
                  style={{ backgroundColor: brandColor, boxShadow: `0 4px 14px ${brandColor}40` }}
                  onClick={() => onBuy(product)}
                >
                  Acheter <ArrowRight className="inline h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────
// THEME 5: STARTER PRO — Hero banner + categories + premium grid
// ─────────────────────────────────────────────────────
export const StarterProLayout = ({
  products,
  brandColor,
  cornerStyle,
  buttonAnimation,
  showBuyBtn,
  showFeatured,
  slug,
  storeName,
  storeDescription,
  bannerUrl,
  onBuy,
}: ThemeProps) => {
  const types = [...new Set(products.map((p) => p.type))];
  const featured = showFeatured && products.length > 2 ? products.slice(0, 3) : [];

  return (
    <div className="space-y-10">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }}
      >
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Banner"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 text-center text-white space-y-5">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            {storeName}
          </motion.h1>
          {storeDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/80 max-w-2xl mx-auto"
            >
              {storeDescription}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6 text-sm text-white/60"
          >
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4" /> {products.length} produits
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4" /> {types.length} catégories
            </span>
          </motion.div>
        </div>
      </div>

      {/* Category pills */}
      {types.length > 1 && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 flex-wrap">
            {types.map((t) => (
              <span
                key={t}
                className={cn(
                  "text-xs font-semibold px-4 py-2 border transition-colors cursor-pointer hover:text-white",
                  radiusSm(cornerStyle),
                )}
                style={{ borderColor: brandColor, color: brandColor }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = brandColor;
                  (e.target as HTMLElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "transparent";
                  (e.target as HTMLElement).style.color = brandColor;
                }}
              >
                {typeLabels[t] || t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured row */}
      {featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Star className="h-5 w-5" style={{ color: brandColor }} /> Produits vedettes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative overflow-hidden border-2 bg-white group",
                  radius(cornerStyle),
                )}
                style={{ borderColor: `${brandColor}30` }}
              >
                <Link to={`/store/${slug}/${product.id}`}>
                  <div className="aspect-video overflow-hidden bg-gray-50">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-200" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link to={`/store/${slug}/${product.id}`}>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold" style={{ color: brandColor }}>
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {showBuyBtn && (
                      <button
                        className={cn(
                          "text-xs font-semibold text-white px-3 py-1.5",
                          radiusSm(cornerStyle),
                          btnAnimClass(buttonAnimation),
                        )}
                        style={{ backgroundColor: brandColor }}
                        onClick={() => onBuy(product)}
                      >
                        Acheter
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    ⭐ Vedette
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main product grid - 3 or 4 columns */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {showFeatured && featured.length > 0
            ? "Tous les produits"
            : `${products.length} produits disponibles`}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {(showFeatured ? products.slice(3) : products).map((product, i) => {
            const disc = discount(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "group bg-white border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300",
                  radius(cornerStyle),
                )}
              >
                <Link to={`/store/${slug}/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-gray-200" />
                      </div>
                    )}
                    {disc && (
                      <span
                        className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        -{disc}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link to={`/store/${slug}/${product.id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:opacity-70 transition-opacity">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp className="h-3.5 w-3.5 text-gray-300" />
                    <span className="text-xs text-gray-400">0% (0 avis)</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs line-through text-gray-300">
                        {product.original_price.toLocaleString()} FCFA
                      </span>
                    )}
                    <span className="text-base font-bold" style={{ color: brandColor }}>
                      {product.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  {showBuyBtn && (
                    <button
                      className={cn(
                        "w-full text-sm font-semibold text-white py-2.5 transition-opacity hover:opacity-90 mt-1",
                        radiusSm(cornerStyle),
                        btnAnimClass(buttonAnimation),
                      )}
                      style={{ backgroundColor: brandColor }}
                      onClick={() => onBuy(product)}
                    >
                      Acheter
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
