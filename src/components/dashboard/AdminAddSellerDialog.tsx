import { useState } from "react";
import { UserPlus, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Result = { email: string; password?: string; created: boolean };

/** Création d'un compte vendeur par l'administrateur (les inscriptions publiques sont fermées). */
export default function AdminAddSellerDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", password: "" });
    setResult(null);
    setCopied(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "create_seller", ...form },
      });
      const message = (data as any)?.error || (error ? await readError(error) : null);
      if (message) throw new Error(message);
      setResult({ email: data.email, password: data.password, created: data.created });
      toast.success(data.created ? "Compte vendeur créé" : "Accès vendeur activé pour ce compte");
    } catch (err: any) {
      toast.error(err?.message || "Impossible de créer le vendeur.");
    } finally {
      setBusy(false);
    }
  };

  const credentials = result
    ? `Connexion vendeur TECHNOVA\nAdresse : ${window.location.origin}/vendeur\nEmail : ${result.email}${
        result.password ? `\nMot de passe provisoire : ${result.password}` : ""
      }`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(credentials);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible, sélectionnez le texte manuellement.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-sm active:scale-95">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Ajouter un vendeur</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un vendeur</DialogTitle>
          <DialogDescription>
            Crée un compte vendeur, ou donne l'accès vendeur à un compte existant avec cet email.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {result.created
                ? "Le compte est prêt. Transmettez ces identifiants au vendeur : il pourra changer son mot de passe ensuite."
                : "Ce compte existait déjà : il a maintenant accès à l'espace vendeur avec son mot de passe habituel."}
            </p>
            <pre className="whitespace-pre-wrap break-all rounded-xl bg-muted p-3 text-xs text-foreground">
              {credentials}
            </pre>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={reset}>
                Ajouter un autre
              </Button>
              <Button onClick={copy}>
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? "Copié" : "Copier"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="seller-first">Prénom</Label>
                <Input id="seller-first" value={form.first_name} onChange={set("first_name")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seller-last">Nom</Label>
                <Input id="seller-last" value={form.last_name} onChange={set("last_name")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seller-email">Email *</Label>
              <Input id="seller-email" type="email" required value={form.email} onChange={set("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seller-phone">Téléphone</Label>
              <Input id="seller-phone" type="tel" placeholder="+229…" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seller-password">Mot de passe provisoire</Label>
              <Input
                id="seller-password"
                type="text"
                minLength={8}
                autoComplete="new-password"
                placeholder="Laisser vide pour en générer un"
                value={form.password}
                onChange={set("password")}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                Créer le vendeur
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

async function readError(error: any): Promise<string> {
  try {
    const body = await error?.context?.json?.();
    if (body?.error) return String(body.error);
  } catch {
    /* corps illisible */
  }
  return error?.message || "Erreur inconnue";
}
