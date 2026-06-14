import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToolCard } from "./ToolCard";
import { topTools, toolsCategories, ToolCategory } from "@/data/toolsData";

export function ToolsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "All">("All");
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const filteredTools = useMemo(() => {
    return topTools.filter((tool) => {
      // Filter by category
      if (activeCategory !== "All" && !tool.categories.includes(activeCategory)) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.categories.some((c) => c.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {lang === "fr" ? "L'Annuaire des Outils Digitaux" : "Digital Tools Directory"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "fr" 
              ? "Découvrez notre sélection des outils et logiciels indispensables pour développer votre activité." 
              : "Discover our selection of essential tools and software to grow your business."}
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder={lang === "fr" ? "Rechercher un outil (ex: Shopify, Canva, ChatGPT...)" : "Search a tool (e.g. Shopify, Canva, ChatGPT...)"}
            className="pl-10 h-12 rounded-full border-border/50 bg-background/50 focus-visible:bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "All"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {lang === "fr" ? "Tous les outils" : "All tools"}
        </button>
        {toolsCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-lg mb-2">
            {lang === "fr" ? "Aucun outil trouvé" : "No tools found"}
          </p>
          <button 
            onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            className="text-primary font-medium hover:underline"
          >
            {lang === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
          </button>
        </div>
      )}
    </div>
  );
}
