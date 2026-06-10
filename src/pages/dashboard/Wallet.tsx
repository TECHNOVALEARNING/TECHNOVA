import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet as WalletIcon, Lock, Loader2, Plus, Trash2, Star, ShieldCheck, ArrowLeft, Check, ChevronDown, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pawapayCountries, providerLogos, type PawaPayCountry, type PawaPayProvider } from "@/data/pawapayProviders";
import SEOHead from "@/components/SEOHead";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WalletRow {
  id: string;
  name: string;
  country: string;
  provider_code: string;
  phone: string;
  holder_first_name: string;
  holder_last_name: string;
  is_default: boolean;
}

const UNLOCK_KEY = "technova_wallet_unlock";

const Wallet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<"loading" | "setup" | "unlock" | "ready">("loading");
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Form state for creating wallet
  const [name, setName] = useState("");
  const [country, setCountry] = useState<PawaPayCountry>(pawapayCountries[0]);
  const [provider, setProvider] = useState<PawaPayProvider>(pawapayCountries[0].deposit[0]);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  useEffect(() => { setProvider(country.deposit[0]); }, [country.code]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const { data } = await supabase.from("wallet_pins").select("user_id").eq("user_id", user.id).maybeSingle();
      const pinExists = !!data;
      setHasPin(pinExists);
      if (!pinExists) { setPhase("setup"); return; }

      const stored = sessionStorage.getItem(UNLOCK_KEY);
      if (stored) {
        try {
          const { token, exp } = JSON.parse(stored);
          if (exp > Date.now()) {
            await loadWallets();
            setPhase("ready");
            return;
          }
        } catch {}
      }
      setPhase("unlock");
    })();
  }, [user, authLoading, navigate]);

  const loadWallets = async () => {
    if (!user) return;
    const { data } = await supabase.from("wallets").select("*").eq("user_id", user.id).order("created_at");
    setWallets((data as WalletRow[]) || []);
  };

  const handleSetup = async () => {
    if (pin.length !== 4) return toast.error("PIN doit faire 4 chiffres");
    if (pin !== confirmPin) return toast.error("Les PIN ne correspondent pas");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-set", { body: { pin } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success("PIN créé !");
      // Auto-unlock
      const { data: vData, error: vErr } = await supabase.functions.invoke("wallet-pin-verify", { body: { pin } });
      if (vErr || vData?.error) throw new Error(vData?.error || vErr?.message);
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({
        token: vData.unlock_token,
        exp: Date.now() + (vData.expires_in * 1000),
      }));
      await loadWallets();
      setPhase("ready");
      setPin(""); setConfirmPin("");
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleUnlock = async () => {
    if (pin.length !== 4) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-verify", { body: { pin } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({
        token: data.unlock_token,
        exp: Date.now() + (data.expires_in * 1000),
      }));
      await loadWallets();
      setPhase("ready");
      setPin("");
    } catch (e: any) { toast.error(e.message); setPin(""); }
    finally { setSubmitting(false); }
  };

  const handleCreateWallet = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error("Nom du wallet requis");
    if (!firstName.trim() || !lastName.trim()) return toast.error("Nom et prénom du titulaire requis");
    if (phone.length < 6) return toast.error("Numéro invalide");
    if (wallets.length >= 3) return toast.error("Maximum 3 wallets");

    setSubmitting(true);
    try {
      const fullPhone = `${country.dial}${phone}`.replace(/\D/g, "");
      const isDefault = wallets.length === 0;
      const { error } = await supabase.from("wallets").insert({
        user_id: user.id,
        name: name.trim(),
        country: country.code,
        provider_code: provider.code,
        phone: `+${fullPhone}`,
        holder_first_name: firstName.trim(),
        holder_last_name: lastName.trim(),
        is_default: isDefault,
      });
      if (error) throw error;
      toast.success("Wallet créé !");
      setCreateOpen(false);
      setName(""); setPhone(""); setFirstName(""); setLastName("");
      await loadWallets();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce wallet ?")) return;
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Wallet supprimé");
    await loadWallets();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("wallets").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("wallets").update({ is_default: true }).eq("id", id);
    await loadWallets();
  };

  const findProviderLabel = (code: string) => {
    for (const c of pawapayCountries) {
      const p = c.deposit.find(d => d.code === code);
      if (p) return { label: p.label, family: p.family };
    }
    return { label: code, family: "mtn" as const };
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // SETUP
  if (phase === "setup") {
    return (
      <>
        <SEOHead title="Créer votre PIN — TECHNOVA Wallet" description="Sécurisez votre wallet" />
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-900 via-violet-700 to-amber-600">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Créez votre PIN</h1>
            <p className="text-sm text-center text-gray-500 mb-6">Un code à 4 chiffres pour protéger votre TECHNOVA Wallet.</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block text-center">Nouveau PIN</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={pin} onChange={setPin}>
                    <InputOTPGroup>
                      {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block text-center">Confirmer le PIN</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                    <InputOTPGroup>
                      {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleSetup}
                disabled={submitting || pin.length !== 4 || confirmPin.length !== 4}
                className="w-full h-12 rounded-xl text-base font-bold"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon PIN"}
              </Button>
              <p className="text-[11px] text-gray-400 text-center">Ne le partagez avec personne. Il vous sera demandé à chaque accès.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // UNLOCK
  if (phase === "unlock") {
    return (
      <>
        <SEOHead title="Déverrouiller — TECHNOVA Wallet" description="Saisissez votre PIN" />
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-900 via-violet-700 to-amber-600">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">TECHNOVA Wallet</h1>
            <p className="text-sm text-center text-gray-500 mb-6">Entrez votre PIN à 4 chiffres</p>

            <div className="flex justify-center mb-5">
              <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); if (v.length === 4) setTimeout(() => handleUnlock(), 100); }}>
                <InputOTPGroup>
                  {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />)}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleUnlock}
              disabled={submitting || pin.length !== 4}
              className="w-full h-12 rounded-xl text-base font-bold"
              style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Déverrouiller"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // READY — wallet management
  return (
    <>
      <SEOHead title="TECHNOVA Wallet" description="Gérez vos comptes Mobile Money pour les retraits" />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-violet-100/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <button onClick={() => (window.history.length > 1 ? navigate(-1) : window.close())} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Retour</span>
            </button>
            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <WalletIcon className="h-4 w-4 text-violet-600" /> TECHNOVA Wallet
            </span>
            <button
              onClick={() => { sessionStorage.removeItem(UNLOCK_KEY); setPhase("unlock"); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900"
            >
              <Lock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Verrouiller</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Hero */}
          <div className="rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden text-white"
            style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #4B1A8A 60%, #C9962E 130%)" }}>
            <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-2">Espace sécurisé</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Vos comptes de retrait</h1>
              <p className="text-sm text-white/70 max-w-md">
                Enregistrez jusqu'à 3 comptes Mobile Money. Vous les utiliserez pour recevoir vos retraits TECHNOVA.
              </p>
            </div>
          </div>

          {/* Wallets list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Mes wallets ({wallets.length}/3)</h2>
            {wallets.length < 3 && (
              <Button onClick={() => setCreateOpen(true)} size="sm" className="rounded-xl gap-1">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            )}
          </div>

          {wallets.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
              <WalletIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-600 mb-4">Aucun wallet pour l'instant.</p>
              <Button onClick={() => setCreateOpen(true)} className="rounded-xl"
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                <Plus className="h-4 w-4 mr-1.5" /> Créer mon premier wallet
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {wallets.map((w) => {
                const p = findProviderLabel(w.provider_code);
                const c = pawapayCountries.find(x => x.code === w.country);
                return (
                  <div key={w.id} className="group relative rounded-2xl bg-white p-4 border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-white p-1.5 ring-1 ring-gray-100 shrink-0">
                        <img src={providerLogos[p.family]} alt={p.label} className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900 truncate">{w.name}</p>
                          {w.is_default && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{p.label} • {c?.name}</p>
                        <p className="text-xs text-gray-700 font-mono mt-1">{w.phone}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{w.holder_first_name} {w.holder_last_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      {!w.is_default && (
                        <button onClick={() => setDefault(w.id)} className="text-[11px] font-semibold text-violet-600 hover:underline">
                          Définir par défaut
                        </button>
                      )}
                      <button onClick={() => handleDelete(w.id)} className="ml-auto text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-violet-50/50 border border-violet-100 p-4 flex gap-3">
            <ShieldCheck className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
            <div className="text-xs text-violet-900/80">
              <p className="font-semibold mb-1">Sécurité TECHNOVA</p>
              <p>Votre PIN est haché et jamais stocké en clair. Après 5 tentatives échouées, le wallet se bloque 15 minutes. La session de déverrouillage expire après 15 min d'inactivité.</p>
            </div>
          </div>
        </main>

        {/* Create wallet dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Nom du wallet</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mon MTN principal" maxLength={40} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Prénom titulaire</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Nom titulaire</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Pays</label>
                <div className="relative">
                  <button type="button" onClick={() => setCountryOpen(!countryOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <img src={country.flag} alt="" className="h-4 w-6 object-cover rounded-sm" />
                      <span className="text-sm">{country.name}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                  </button>
                  {countryOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-xl max-h-48 overflow-y-auto">
                      {pawapayCountries.map((c) => (
                        <button key={c.code} type="button"
                          onClick={() => { setCountry(c); setCountryOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left">
                          <img src={c.flag} alt="" className="h-4 w-6 object-cover rounded-sm" />
                          <span className="text-sm">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Opérateur</label>
                <div className="grid grid-cols-2 gap-2">
                  {country.deposit.map((op) => {
                    const sel = provider.code === op.code;
                    return (
                      <button key={op.code} type="button" onClick={() => setProvider(op)}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 ${sel ? "border-violet-500 bg-violet-50" : "border-gray-200"}`}>
                        <img src={providerLogos[op.family]} alt="" className="h-7 w-7 object-contain" />
                        <span className="text-xs font-semibold flex-1 text-left">{op.label}</span>
                        {sel && <Check className="h-4 w-4 text-violet-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Numéro Mobile Money</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">+{country.dial}</div>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="97 00 00 00" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateWallet} disabled={submitting}
                style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le wallet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Wallet;
