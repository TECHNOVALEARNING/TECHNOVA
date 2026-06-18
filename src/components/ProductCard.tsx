import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product, useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";

const categoryLabels: Record<string, string> = {
  course: "Cours",
  formation: "Formation",
  ebook: "E-book",
  template: "Template",
};

const SUBCAT_LABELS: Record<string, string> = {
  notion: "Notion",
  canva: "Canva",
  excel: "Excel",
  dev: "Dev",
  marketing: "Marketing",
  other: "Autre"
};

const getBadgeClass = (b: string) => {
  const badge = b.toLowerCase();
  if (badge.includes("best") || badge.includes("vente")) return "label-bestseller";
  if (badge.includes("nouveau") || badge.includes("new")) return "label-nouveau";
  if (badge.includes("populaire") || badge.includes("top")) return "label-populaire";
  if (badge.includes("promo") || badge.includes("off")) return "label-promo";
  return "label-tendance";
};

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart, items } = useCart();
  const inCart = items.some((i) => i.product.id === product.id);

  const priceFcfa = formatPrice(product.price);
  const priceUsd = (product.price / 563).toFixed(2) + " $";

  const renderStars = (r: number) => {
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    let s = "";
    for (let i = 0; i < full; i++) s += "★";
    if (half) s += "½";
    return <span className="stars-sm">{s}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="course-card"
    >
      <div className="course-img-wrap">
        {product.image ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
            <span className="text-5xl">
              {product.category === "course" && "📚"}
              {product.category === "formation" && "🎓"}
              {product.category === "ebook" && "📄"}
              {(product.category === "template" || product.category?.startsWith("template:")) && "📋"}
            </span>
          </div>
        )}
        <span className="course-badge">
          {product.category?.startsWith("template:")
            ? `Template ${SUBCAT_LABELS[product.category.split(":")[1]] || product.category.split(":")[1]}`
            : (categoryLabels[product.category] || product.category)}
        </span>
        {product.badge && (
          <span className={`label-badge ${getBadgeClass(product.badge)}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="course-body">
        <Link to={`/product/${product.id}`}>
          <div className="course-title line-clamp-2 hover:text-[color:var(--blue)] transition-colors">
            {product.title}
          </div>
        </Link>
        
        <p className="mb-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <div className="course-meta mt-auto">
          {product.students && (
            <span className="students">
              <i className="fas fa-users" style={{ fontSize: "0.65rem", marginRight: 4 }}></i>
              {product.students >= 1000 ? `${(product.students / 1000).toFixed(1)}k` : product.students}
            </span>
          )}
          {renderStars(product.rating || 5)}
        </div>

        <div className="price-row">
          <div>
            <div className="price-main">{priceFcfa}</div>
            <div className="price-usd">{priceUsd}</div>
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={inCart}
          className={inCart ? "btn-buy opacity-60 cursor-not-allowed" : "btn-buy"}
          style={inCart ? { background: "var(--divider)", color: "var(--text-secondary)", boxShadow: "none" } : {}}
        >
          <i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>
          {inCart ? "Ajouté au panier" : "Ajouter au panier"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
