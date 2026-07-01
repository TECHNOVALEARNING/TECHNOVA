import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Users, ShoppingCart, CheckCircle } from "lucide-react";
import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { products } from "@/data/products";
import { useGeoPricing } from "@/contexts/GeoPricingContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const categoryLabels: Record<string, Record<string, string>> = {
  course: { fr: "Cours", en: "Course" },
  formation: { fr: "Formation", en: "Training" },
  ebook: { fr: "E-book", en: "E-book" },
  template: { fr: "Template", en: "Template" },
  business: { fr: "Business & Finance", en: "Business & Finance" },
  design: { fr: "Design & Créativité", en: "Design & Creativity" },
  tech: { fr: "Développement & Tech", en: "Development & Tech" },
  marketing: { fr: "Marketing Digital", en: "Digital Marketing" },
  education: { fr: "Éducation & Apprentissage", en: "Education & Learning" },
  lifestyle: { fr: "Lifestyle", en: "Lifestyle" },
  creative: { fr: "Créatif", en: "Creative" },
  divertissement: { fr: "Divertissement", en: "Entertainment" },
  sante_bien_etre: { fr: "Santé et bien être", en: "Health & Well-being" },
  developpement_personnel: { fr: "Développement personnel", en: "Personal Development" },
};

const SUBCAT_LABELS: Record<string, Record<string, string>> = {
  notion: { fr: "Notion", en: "Notion" },
  canva: { fr: "Canva", en: "Canva" },
  excel: { fr: "Excel", en: "Excel" },
  dev: { fr: "Dev", en: "Dev" },
  marketing: { fr: "Marketing", en: "Marketing" },
  other: { fr: "Autre", en: "Other" }
};

const translations = {
  fr: {
    notFound: "Produit introuvable",
    backToCatalog: "Retour au catalogue",
    students: "étudiants",
    alreadyInCart: "Déjà dans le panier",
    addToCart: "Ajouter au panier",
    features: ["Accès à vie", "Téléchargement immédiat", "Paiement sécurisé"]
  },
  en: {
    notFound: "Product not found",
    backToCatalog: "Back to catalog",
    students: "students",
    alreadyInCart: "Already in cart",
    addToCart: "Add to cart",
    features: ["Lifetime access", "Immediate download", "Secure payment"]
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const { formatPrice } = useGeoPricing();
  const product = products.find((p) => p.id === id);
  const { addToCart, items } = useCart();
  const inCart = product ? items.some((i) => i.product.id === product.id) : false;

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t.notFound}</h1>
          <Link to="/products" className="mt-4 inline-block text-primary underline">
            {t.backToCatalog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToCatalog}
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/10"
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-8xl">
                {product.category === "course" && "📚"}
                {product.category === "formation" && "🎓"}
                {product.category === "ebook" && "📄"}
                {(product.category === "template" || product.category?.startsWith("template:")) && "📋"}
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {product.category?.startsWith("template:")
                  ? `Template ${SUBCAT_LABELS[product.category.split(":")[1]]?.[lang] || product.category.split(":")[1]}`
                  : (categoryLabels[product.category]?.[lang] || product.category)}
              </span>
              {product.badge && (
                <span className="rounded-full bg-gold-gradient px-3 py-1 text-sm font-semibold text-accent-foreground">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-foreground">{product.title}</h1>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-1 text-accent">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-medium text-foreground">{product.rating}</span>
              </div>
              {product.students && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{product.students} {t.students}</span>
                </div>
              )}
            </div>

            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mb-8 rounded-xl border border-border bg-card p-6">
              <div className="mb-4 text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
              <Button
                size="lg"
                className={`w-full py-6 text-base font-semibold ${
                  inCart
                    ? "bg-muted text-muted-foreground"
                    : "bg-gold-gradient text-accent-foreground hover:opacity-90"
                }`}
                onClick={() => addToCart(product)}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {t.alreadyInCart}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t.addToCart}
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {t.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
