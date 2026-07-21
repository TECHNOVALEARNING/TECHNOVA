import { useState, useEffect } from "react";
import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import SEOHead from "@/components/SEOHead";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const nonCourseProducts = products.filter(
    (p) => p.category !== "course" && p.category !== "formation" && p.type !== "course",
  );

  const filtered =
    activeCategory === "all"
      ? nonCourseProducts
      : nonCourseProducts.filter((p) => p.category === activeCategory);

  const seoTitle =
    lang === "en"
      ? "Digital Products Catalog — TECHNOVA"
      : "Catalogue de Produits Digitaux — TECHNOVA";
  const seoDesc =
    lang === "en"
      ? "Discover our digital products, courses, templates, and e-books in AI, Data, Cybersecurity, and Design."
      : "Découvrez nos produits digitaux, formations, templates et e-books en IA, Data, Cybersécurité et Design.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoTitle} description={seoDesc} canonicalPath="/products" />
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Catalogue</h1>
        <p className="mb-8 text-muted-foreground">Explorez tous nos produits digitaux</p>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
