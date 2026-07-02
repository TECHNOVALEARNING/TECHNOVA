import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store } from "lucide-react";
import type { StoreData } from "@/hooks/useActiveStore";

interface StoreSelectorProps {
  stores: StoreData[];
  activeStoreId: string | null;
  onSelect: (id: string) => void;
}

const translations = {
  fr: {
    placeholder: "Sélectionner une boutique",
    archived: "(archivée)",
  },
  en: {
    placeholder: "Select a shop",
    archived: "(archived)",
  },
};

const StoreSelector = ({ stores, activeStoreId, onSelect }: StoreSelectorProps) => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  if (stores.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Store className="h-4 w-4 text-muted-foreground" />
      <Select value={activeStoreId || ""} onValueChange={onSelect}>
        <SelectTrigger className="w-[220px] h-9 text-sm">
          <SelectValue placeholder={t.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name} {store.is_archived ? ` ${t.archived}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StoreSelector;
