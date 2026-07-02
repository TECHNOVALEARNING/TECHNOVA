import { useState, useEffect } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const translations = {
  fr: {
    orderNotFoundShort: "Commande introuvable avec cet identifiant court.",
    orderNotFoundLong: "Commande introuvable. Vérifiez l'identifiant.",
    searchError: "Erreur lors de la recherche",
    title: "Recherche de Commande",
    subtitle:
      "Saisissez le numéro de commande complet ou les 8 premiers caractères pour retrouver les détails d'un achat.",
    btnSearch: "Rechercher",
  },
  en: {
    orderNotFoundShort: "Order not found with this short ID.",
    orderNotFoundLong: "Order not found. Check the ID.",
    searchError: "Error searching for order",
    title: "Order Lookup",
    subtitle:
      "Enter the complete order number or the first 8 characters to find the purchase details.",
    btnSearch: "Search",
  },
};

const DashboardOrderLookupTab = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    const searchId = orderId.trim();
    try {
      if (searchId.length === 8) {
        const { data } = await supabase
          .from("orders")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(5000);
        if (data) {
          const found = data.find((o) => o.id.toUpperCase().startsWith(searchId.toUpperCase()));
          if (found) {
            navigate(`/dashboard/sales/${found.id}`);
            return;
          }
        }
        toast.error(t.orderNotFoundShort);
      } else {
        const { data, error } = await supabase
          .from("orders")
          .select("id")
          .eq("id", searchId)
          .maybeSingle();
        if (error || !data) {
          toast.error(t.orderNotFoundLong);
        } else {
          navigate(`/dashboard/sales/${data.id}`);
        }
      }
    } catch (err: any) {
      toast.error(t.searchError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-10 px-4 sm:px-0">
      <div className="text-center space-y-2 mb-8">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Ex: 39E72B99 ou a1b2c3d4-..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 h-12 text-center sm:text-left text-lg font-mono placeholder:text-base placeholder:font-sans"
        />
        <Button type="submit" disabled={!orderId.trim() || loading} className="h-12 px-8 gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t.btnSearch}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default DashboardOrderLookupTab;
