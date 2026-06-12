import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const DashboardOrderLookupTab = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    // Find the full UUID if the user entered a short ID
    // or just pass it to SaleDetail if it's the exact UUID.
    // SaleDetail handles lookup by exact ID. But if they enter "39E72B99", we need to find it.
    
    let searchId = orderId.trim();
    try {
      let query = supabase.from("orders").select("id").limit(1);
      
      // Check if it's a short ID (8 chars) or full UUID
      if (searchId.length === 8) {
        // We have to use a text cast or ilike if the database allows it.
        // Actually, Supabase JS doesn't support ilike on uuid.
        // We might have to fetch all orders and filter, or just tell the user to enter the full ID?
        // Let's use an RPC or just fetch the most recent orders and filter locally if it's 8 chars.
        // But for thousands of orders, it's bad.
        // Wait, SaleDetail already uses the short ID in the UI: "#SALE39E72B99"
        
        // As a workaround, we can use eq with a text cast, but Supabase SDK doesn't natively cast.
        // We will try fetching the 100 most recent orders and searching.
        const { data } = await supabase.from("orders").select("id").order("created_at", { ascending: false }).limit(5000);
        if (data) {
          const found = data.find((o) => o.id.toUpperCase().startsWith(searchId.toUpperCase()));
          if (found) {
            navigate(`/dashboard/sales/${found.id}`);
            return;
          }
        }
        toast.error("Commande introuvable avec cet identifiant court.");
      } else {
        // Assume full UUID
        const { data, error } = await supabase.from("orders").select("id").eq("id", searchId).maybeSingle();
        if (error || !data) {
          toast.error("Commande introuvable. Vérifiez l'identifiant.");
        } else {
          navigate(`/dashboard/sales/${data.id}`);
        }
      }
    } catch (err: any) {
      toast.error("Erreur lors de la recherche");
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
        <h2 className="text-2xl font-bold text-foreground">Recherche de Commande</h2>
        <p className="text-sm text-muted-foreground">
          Saisissez le numéro de commande complet ou les 8 premiers caractères pour retrouver les détails d'un achat.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Ex: 39E72B99 ou a1b2c3d4-..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 h-12 text-center sm:text-left text-lg font-mono placeholder:text-base placeholder:font-sans"
        />
        <Button type="submit" disabled={!orderId.trim() || loading} className="h-12 px-8 gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Rechercher"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default DashboardOrderLookupTab;
