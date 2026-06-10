import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, Download, Tag, X, Check, ChevronDown,
  ShieldCheck, Lock, Sparkles, ArrowRight, ArrowLeft,
  Smartphone, User, Mail, Phone, Zap, Crown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  pawapayCountries, providerLogos,
  type PawaPayCountry, type PawaPayProvider,
} from "@/data/pawapayProviders";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Render as a standalone full page (no Dialog wrapper). */
  fullPage?: boolean;
  product: {
    id: string;
    title: string;
    price: number;
    creator_id: string;
    download_url?: string | null;
    type?: string;
    thumbnail_url?: string | null;
    file_password?: string | null;
    watermark_enabled?: boolean | null;
    collect_shipping_address?: boolean | null;
  };
  storeSlug?: string | null;
  brandColor?: string;
}

type PayStatus = "idle" | "processing" | "success" | "failed";

const CheckoutDialog = ({ open, onOpenChange, product, storeSlug, brandColor, fullPage = false }: CheckoutDialogProps) => {
  // Use brand color if provided, else fallback to royal purple
  const accent = brandColor || "#7C2DCC";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeSuccess, setFreeSuccess] = useState(false);

  // Shipping
  const needsShipping = !!product.collect_shipping_address;
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCountry, setShipCountry] = useState("");

  // Country & provider (PawaPay)
  const [country, setCountry] = useState<PawaPayCountry>(
    () => pawapayCountries.find((c) => c.code === "BEN") || pawapayCountries[0]
  );
  const [provider, setProvider] = useState<PawaPayProvider>(country.deposit[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    setProvider(country.deposit[0]);
  }, [country.code]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return pawapayCountries;
    const q = countrySearch.toLowerCase();
    return pawapayCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Promo
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string; discount_percent: number | null; discount_amount: number | null;
  } | null>(null);

  // Pay status (step 3)
  const [payStatus, setPayStatus] = useState<PayStatus>("idle");
  const [depositId, setDepositId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string>("");
  const pollRef = useRef<number | null>(null);

  const effectivePrice = product.price;
  const isFree = effectivePrice === 0;
  const fullName = `${firstName} ${lastName}`.trim();
  const fullPhone = `${country.dial}${phone}`.replace(/\D/g, "");

  const discountedPrice = (() => {
    if (!appliedPromo || isFree) return effectivePrice;
    if (appliedPromo.discount_percent) return Math.max(0, Math.round(effectivePrice * (1 - appliedPromo.discount_percent / 100)));
    if (appliedPromo.discount_amount) return Math.max(0, effectivePrice - appliedPromo.discount_amount);
    return effectivePrice;
  })();
  const savings = effectivePrice - discountedPrice;
  const currency = provider.currency;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase.from("promo_codes").select("*")
        .eq("code", promoCode.trim().toUpperCase()).eq("creator_id", product.creator_id).eq("is_active", true).single();
      if (error || !data) { toast.error("Code promo invalide"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Code expiré"); return; }
      if (data.max_uses && data.current_uses >= data.max_uses) { toast.error("Limite atteinte"); return; }
      const productIds = data.product_ids as string[] | null;
      if (productIds && productIds.length > 0 && !productIds.includes(product.id)) { toast.error("Non applicable"); return; }
      setAppliedPromo({ code: data.code, discount_percent: data.discount_percent, discount_amount: data.discount_amount });
      toast.success(`Code "${data.code}" appliqué !`);
    } catch { toast.error("Erreur de vérification"); }
    finally { setPromoLoading(false); }
  };

  const removePromo = () => { setAppliedPromo(null); setPromoCode(""); };

  const shippingPayload = needsShipping ? {
    address: shipAddress.trim(), city: shipCity.trim(),
    postal_code: shipPostal.trim(), country: shipCountry.trim() || country.name,
  } : null;

  // ─── FREE checkout ───
  const handleFreeCheckout = async () => {
    setLoading(true);
    try {
      const { data: customer, error: custErr } = await supabase.from("customers")
        .upsert({ name: fullName, phone: `+${fullPhone}`, email }, { onConflict: "email" }).select("id").single();
      if (custErr) throw custErr;
      const { error: orderErr } = await supabase.from("orders").insert({
        customer_id: customer.id, product_id: product.id, store_owner_id: product.creator_id,
        amount: 0, status: "completed",
        promo_code: appliedPromo?.code || null, original_amount: appliedPromo ? effectivePrice : null,
        shipping_address: shippingPayload,
      } as any);
      if (orderErr) throw orderErr;
      supabase.functions.invoke("notify-sale", { body: {
        store_owner_id: product.creator_id, product_title: product.title, amount: 0,
        customer_name: fullName, customer_email: email,
        promo_code: appliedPromo?.code || null, original_price: appliedPromo ? effectivePrice : null,
        product_id: product.id, download_url: product.download_url || null,
        product_type: product.type || null, store_slug: storeSlug || null,
        shipping_address: shippingPayload,
      }}).catch(console.error);
      setFreeSuccess(true);
      toast.success("Produit obtenu !");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally { setLoading(false); }
  };

  // ─── Initiate PawaPay deposit ───
  const handleConfirmPay = async () => {
    if (discountedPrice < provider.minAmount) {
      toast.error(`Minimum ${provider.minAmount} ${currency} pour ${provider.label}`);
      return;
    }
    if (discountedPrice > provider.maxAmount) {
      toast.error(`Maximum ${provider.maxAmount.toLocaleString()} ${currency} pour ${provider.label}`);
      return;
    }
    setLoading(true);
    setPayError("");
    try {
      const { data, error } = await supabase.functions.invoke("pawapay-deposit", {
        body: {
          amount: discountedPrice,
          currency,
          provider: provider.code,
          phone: fullPhone,
          customer: { email, name: fullName },
          metadata: {
            product_id: product.id,
            product_title: product.title,
            store_owner_id: product.creator_id,
            promo_code: appliedPromo?.code || null,
            original_price: appliedPromo ? effectivePrice : null,
            shipping_address: shippingPayload,
          },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.depositId) throw new Error("Réponse invalide");

      // Increment promo usage
      if (appliedPromo) {
        const { data: pd } = await supabase.from("promo_codes").select("current_uses")
          .eq("code", appliedPromo.code).eq("creator_id", product.creator_id).single();
        if (pd) await supabase.from("promo_codes").update({ current_uses: (pd.current_uses || 0) + 1 })
          .eq("code", appliedPromo.code).eq("creator_id", product.creator_id);
      }

      setDepositId(data.depositId);
      setPayStatus("processing");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Erreur de paiement");
    } finally { setLoading(false); }
  };

  // ─── Realtime + polling listener for PawaPay deposit ───
  useEffect(() => {
    if (step !== 3 || !depositId) return;

    const channel = supabase
      .channel(`pp-${depositId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "payment_events",
        filter: `pawapay_deposit_id=eq.${depositId}`,
      }, (payload) => {
        const ns = (payload.new as any)?.status;
        if (ns === "success") setPayStatus("success");
        else if (ns === "failed") { setPayStatus("failed"); setPayError("Paiement refusé ou expiré."); }
      })
      .subscribe();

    // Poll fallback every 5s for max ~3min
    let attempts = 0;
    pollRef.current = window.setInterval(async () => {
      attempts++;
      try {
        const { data } = await supabase.functions.invoke("pawapay-status", { body: { depositId, kind: "deposit" } });
        if (data?.status === "COMPLETED") { setPayStatus("success"); }
        else if (data?.status === "FAILED" || data?.status === "REJECTED") {
          setPayStatus("failed"); setPayError("Paiement refusé."); }
      } catch {}
      if (attempts > 36) { // ~3min
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [step, depositId]);

  // Stop polling on terminal states
  useEffect(() => {
    if ((payStatus === "success" || payStatus === "failed") && pollRef.current) {
      clearInterval(pollRef.current); pollRef.current = null;
    }
  }, [payStatus]);

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) { toast.error("Nom complet requis"); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Email valide requis"); return; }
    if (!phone.trim() || phone.length < 6) { toast.error("Téléphone valide requis"); return; }
    if (needsShipping) {
      if (!shipAddress.trim()) { toast.error("Adresse requise"); return; }
      if (!shipCity.trim()) { toast.error("Ville requise"); return; }
    }
    if (isFree) { handleFreeCheckout(); return; }
    setStep(2);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setFreeSuccess(false); setAppliedPromo(null); setPromoCode("");
      setShowPromo(false); setStep(1); setPayStatus("idle"); setDepositId(null);
    }
    onOpenChange(val);
  };

  const handleRetry = () => { setStep(2); setPayStatus("idle"); setDepositId(null); setPayError(""); };

  // Group all available providers across countries for the discreet logo strip
  const providerLogosForStrip = useMemo(() => Object.entries(providerLogos), []);

  const innerContent = (
    <div className={fullPage
      ? "grid md:grid-cols-[1fr_380px] bg-white md:rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100/40 max-w-6xl mx-auto"
      : "grid md:grid-cols-[1fr_360px] bg-white rounded-2xl overflow-hidden max-h-[95vh] sm:max-h-[92vh]"}>
          {/* ─── LEFT: Form ─── */}
          <div className={fullPage ? "p-5 sm:p-8 md:p-10" : "p-5 sm:p-7 overflow-y-auto"}>
            {freeSuccess ? (
              <SuccessFreeView product={product} fullName={fullName} email={email} accent={accent} />
            ) : (
              <>
                {/* Stepper */}
                {!isFree && (
                  <div className="flex items-center gap-3 mb-6">
                    {[
                      { n: 1, label: "Vos infos" },
                      { n: 2, label: "Paiement" },
                      { n: 3, label: "Confirmation" },
                    ].map((s) => (
                      <div key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
                        <motion.div animate={{
                          backgroundColor: step >= s.n ? accent : "#F3F4F6",
                          color: step >= s.n ? "#fff" : "#9CA3AF",
                          scale: step === s.n ? 1.05 : 1,
                        }}
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
                          {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
                        </motion.div>
                        <div className={`text-[11px] font-semibold truncate ${step >= s.n ? "text-gray-900" : "text-gray-400"}`}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }} className="space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {isFree ? "Obtenir gratuitement" : "Vos informations"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">On vous envoie tout par email.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field icon={User} label="Prénom *">
                          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" />
                        </Field>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Nom *</label>
                          <Input value={lastName} onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe" className="h-11 bg-gray-50 border-gray-200 focus:bg-white" />
                        </div>
                      </div>

                      <Field icon={Mail} label="Email *">
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@exemple.com" className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" />
                      </Field>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Téléphone (Mobile Money) *
                        </label>
                        <div className="flex gap-2">
                          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline"
                                className="shrink-0 gap-1.5 px-3 h-11 min-w-[100px] bg-gray-50 border-gray-200">
                                <img src={country.flag} alt={country.code} className="h-4 w-6 object-cover rounded-sm" />
                                <span className="text-xs font-mono">+{country.dial}</span>
                                <ChevronDown className="h-3 w-3 text-gray-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0" align="start">
                              <div className="p-2 border-b">
                                <Input placeholder="Rechercher..." value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)} className="h-8 text-sm" />
                              </div>
                              <ScrollArea className="h-60">
                                <div className="p-1">
                                  {filteredCountries.map((c) => (
                                    <button key={c.code} type="button"
                                      onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-md hover:bg-gray-50 text-left">
                                      <img src={c.flag} alt={c.code} className="h-4 w-6 object-cover rounded-sm shrink-0" />
                                      <span className="truncate">{c.name}</span>
                                      <span className="ml-auto text-gray-400 text-xs">+{c.dial}</span>
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="tel" value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                              placeholder="00 00 00 00"
                              className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white" />
                          </div>
                        </div>
                      </div>

                      {needsShipping && (
                        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                          <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Adresse de livraison</div>
                          <Input value={shipAddress} onChange={(e) => setShipAddress(e.target.value)}
                            placeholder="Adresse (rue, numéro) *" className="h-11 bg-white border-gray-200" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={shipCity} onChange={(e) => setShipCity(e.target.value)}
                              placeholder="Ville *" className="h-11 bg-white border-gray-200" />
                            <Input value={shipPostal} onChange={(e) => setShipPostal(e.target.value)}
                              placeholder="Code postal" className="h-11 bg-white border-gray-200" />
                          </div>
                          <Input value={shipCountry} onChange={(e) => setShipCountry(e.target.value)}
                            placeholder={`Pays (par défaut: ${country.name})`} className="h-11 bg-white border-gray-200" />
                        </div>
                      )}

                      {!isFree && (
                        <div className="pt-1">
                          {!showPromo && !appliedPromo ? (
                            <button type="button" onClick={() => setShowPromo(true)}
                              className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: accent }}>
                              <Tag className="h-4 w-4" /> J'ai un code promo
                            </button>
                          ) : appliedPromo ? (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-emerald-700">{appliedPromo.code}</div>
                                  <div className="text-xs text-emerald-600">-{savings.toLocaleString()} {currency} économisés</div>
                                </div>
                              </div>
                              <button type="button" onClick={removePromo} className="text-emerald-600 hover:text-emerald-800">
                                <X className="h-4 w-4" />
                              </button>
                            </motion.div>
                          ) : (
                            <div className="flex gap-2">
                              <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="CODE PROMO" className="flex-1 h-10 uppercase font-mono bg-gray-50" />
                              <Button type="button" size="sm" onClick={handleApplyPromo}
                                disabled={promoLoading || !promoCode.trim()} className="h-10"
                                style={{ backgroundColor: accent }}>
                                {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "OK"}
                              </Button>
                              <button type="button" onClick={() => { setShowPromo(false); setPromoCode(""); }}
                                className="text-gray-400 hover:text-gray-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <Button onClick={handleNext} disabled={loading}
                        className="w-full h-12 text-sm font-bold rounded-xl group transition-all hover:shadow-lg"
                        style={{ backgroundColor: accent, boxShadow: `0 8px 24px -8px ${accent}80` }}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                          <span className="flex items-center gap-2">
                            {isFree ? "Obtenir gratuitement" : "Continuer vers le paiement"}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
                        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL 256-bit</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Données chiffrées</span>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="space-y-5">
                      <div>
                        <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-3">
                          <ArrowLeft className="h-3.5 w-3.5" /> Modifier mes infos
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Choisir votre opérateur</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Paiement sécurisé via <span className="font-semibold text-gray-700">{country.name}</span>
                        </p>
                      </div>

                      {/* Provider grid - PREMIUM 3D CARDS */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Smartphone className="h-4 w-4 text-gray-700" />
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-700">Mobile Money</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {country.deposit.map((p, i) => {
                            const selected = provider.code === p.code;
                            return (
                              <motion.button
                                key={p.code}
                                type="button"
                                onClick={() => setProvider(p)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className={`relative rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all overflow-hidden bg-white ${
                                  selected ? "shadow-lg" : "border-gray-200 hover:border-gray-300"
                                }`}
                                style={selected ? {
                                  borderColor: accent,
                                  boxShadow: `0 10px 28px -10px ${accent}55, 0 0 0 3px ${accent}15`,
                                } : undefined}
                              >
                                {selected && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: accent }}>
                                    <Check className="h-3 w-3" />
                                  </motion.div>
                                )}
                                <div className="h-12 w-12 rounded-xl bg-white p-1 ring-1 ring-gray-100 flex items-center justify-center">
                                  <img src={providerLogos[p.family]} alt={p.label}
                                    className="h-full w-full object-contain" />
                                </div>
                                <div className="text-[11px] font-bold text-gray-900 text-center leading-tight">
                                  {p.label}
                                </div>
                                <div className="text-[9px] text-gray-400 font-mono">{p.currency}</div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Trust strip */}
                      <div className="rounded-2xl bg-gradient-to-r from-violet-50 via-amber-50/30 to-violet-50 border border-violet-100 p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${accent}, #F0B838)` }}>
                            <ShieldCheck className="h-4.5 w-4.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-900 mb-0.5">
                              Paiement sécurisé par TECHNOVA
                            </div>
                            <div className="text-[11px] text-gray-600 leading-relaxed">
                              Aucune donnée bancaire stockée. Validation directe sur votre téléphone via votre opérateur.
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleConfirmPay} disabled={loading}
                        className="relative w-full h-14 text-base font-bold rounded-xl group transition-all overflow-hidden text-white"
                        style={{
                          background: `linear-gradient(135deg, ${accent} 0%, ${accent} 50%, #C9962E 110%)`,
                          boxShadow: `0 14px 36px -10px ${accent}90, inset 0 1px 0 rgba(255,255,255,0.2)`,
                        }}>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Initiation du paiement…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 relative z-10">
                            <Lock className="h-4 w-4" />
                            Payer {discountedPrice.toLocaleString()} {currency}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </Button>

                      <p className="text-center text-[11px] text-gray-400">
                        Vous recevrez une demande de validation sur le numéro <span className="font-mono font-semibold">+{fullPhone}</span>.
                      </p>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }} className="py-6">
                      <PayProcessingView
                        status={payStatus}
                        provider={provider}
                        accent={accent}
                        phone={fullPhone}
                        amount={discountedPrice}
                        currency={currency}
                        product={product}
                        error={payError}
                        onRetry={handleRetry}
                        onClose={() => handleClose(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* ─── RIGHT: Order summary - Royal violet+gold ─── */}
          <div className="hidden md:flex flex-col text-white p-7 relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${accent} 0%, #4B1A8A 50%, #1F0B3F 130%)` }}>
            {/* Animated 3D blobs */}
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />

            <button onClick={() => handleClose(false)} aria-label="Fermer"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 backdrop-blur">
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-2">
                <Crown className="h-3 w-3" /> Récapitulatif
              </div>

              <h3 className="text-2xl font-bold leading-tight mb-5">{product.title}</h3>

              {product.thumbnail_url && (
                <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  src={product.thumbnail_url} alt={product.title}
                  className="w-full aspect-video rounded-xl object-cover mb-5 ring-1 ring-amber-300/30 shadow-2xl" />
              )}

              <div className="space-y-3 mb-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Sous-total</span>
                  <span className="font-semibold">{effectivePrice.toLocaleString()} {currency}</span>
                </div>
                {appliedPromo && savings > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between text-sm">
                    <span className="text-white/70 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> {appliedPromo.code}
                    </span>
                    <span className="font-semibold text-emerald-300">-{savings.toLocaleString()} {currency}</span>
                  </motion.div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Frais</span>
                  <span className="font-semibold text-amber-300">Inclus</span>
                </div>
              </div>

              <div className="my-5 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-300/80 mb-1">Total</div>
                  <div className="text-3xl font-extrabold leading-none bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                    {isFree ? "Gratuit" : discountedPrice.toLocaleString()}
                  </div>
                </div>
                {!isFree && <div className="text-sm font-semibold text-white/80 mb-1">{currency}</div>}
              </div>

              <ul className="space-y-2 text-xs text-white/85">
                {[
                  { icon: Zap, text: "Livraison instantanée" },
                  { icon: ShieldCheck, text: "Paiement 100% sécurisé" },
                  { icon: Lock, text: "Vendeur vérifié KYC" },
                ].map((b) => (
                  <li key={b.text} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${accent}, #C9962E)` }}>
                      <b.icon className="h-3 w-3" />
                    </div>
                    {b.text}
                  </li>
                ))}
              </ul>

              {/* Provider logos strip */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="text-[9px] uppercase tracking-widest text-white/50 mb-2">Opérateurs supportés</div>
                <div className="flex flex-wrap gap-1.5">
                  {providerLogosForStrip.map(([k, src]) => (
                    <div key={k} className="h-6 w-9 rounded bg-white/95 p-0.5 flex items-center justify-center">
                      <img src={src} alt={k} className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!fullPage && (
            <button onClick={() => handleClose(false)} aria-label="Fermer"
              className="md:hidden absolute top-3 right-3 h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-20">
              <X className="h-4 w-4 text-gray-700" />
            </button>
          )}
        </div>
  );

  if (fullPage) return innerContent;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[940px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl max-h-[95vh] sm:max-h-[92vh]">
        {innerContent}
      </DialogContent>
    </Dialog>
  );
};

// ═══════════ Sub-components ═══════════

const Field = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
      {children}
    </div>
  </div>
);

const SuccessFreeView = ({ product, fullName, email, accent }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 text-center">
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
      className="h-20 w-20 rounded-full flex items-center justify-center mb-5"
      style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}40)` }}>
      <CheckCircle2 className="h-12 w-12" style={{ color: accent }} />
    </motion.div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Bravo, c'est à vous !</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-xs">
      Vous avez obtenu <strong className="text-gray-900">{product.title}</strong> avec succès.
    </p>
    {product.download_url && (
      <Button asChild className="w-full max-w-xs" style={{ backgroundColor: accent }}>
        <a href={product.download_url} target="_blank" rel="noreferrer">
          <Download className="h-4 w-4 mr-2" /> Télécharger
        </a>
      </Button>
    )}
  </motion.div>
);

const PayProcessingView = ({
  status, provider, accent, phone, amount, currency, product, error, onRetry, onClose,
}: any) => {
  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="relative h-24 w-24 mb-5">
          <div className="absolute inset-0 rounded-full"
            style={{ background: `linear-gradient(135deg, ${accent}, #C9962E)`, filter: `drop-shadow(0 12px 30px ${accent}80)` }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h3>
        <p className="text-sm text-gray-500 mb-1">Merci pour votre achat.</p>
        <p className="text-xs text-gray-400 mb-6">Tout est dans votre boîte mail + l'espace « Mes achats ».</p>
        {product.download_url && (
          <Button asChild className="w-full max-w-sm h-12 mb-2"
            style={{ background: `linear-gradient(135deg, ${accent}, #C9962E)` }}>
            <a href={product.download_url} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" /> Télécharger maintenant
            </a>
          </Button>
        )}
        <Button variant="outline" onClick={onClose} className="w-full max-w-sm h-11">Fermer</Button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <X className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement non confirmé</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{error || "La transaction n'a pas été validée."}</p>
        <div className="flex gap-2 w-full max-w-sm">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">Annuler</Button>
          <Button onClick={onRetry} className="flex-1 h-11" style={{ backgroundColor: accent }}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Processing
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated 3D phone */}
      <div className="relative h-32 w-32 mb-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent}, transparent)` }}
        />
        <motion.div
          animate={{ rotateY: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative h-full w-full rounded-3xl flex items-center justify-center"
          style={{
            background: `linear-gradient(145deg, ${accent}, #4B1A8A)`,
            boxShadow: `0 20px 50px -12px ${accent}90, inset 0 2px 0 rgba(255,255,255,0.2)`,
          }}>
          <Smartphone className="h-14 w-14 text-amber-300" />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400"
          />
        </motion.div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        Validez sur votre téléphone
      </h3>
      <p className="text-sm text-gray-500 mb-1">
        Une demande de paiement a été envoyée à
      </p>
      <p className="text-sm font-mono font-bold text-gray-900 mb-5">+{phone}</p>

      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white ring-1 ring-gray-100 p-1 flex items-center justify-center">
            <img src={providerLogos[provider.family]} alt={provider.label} className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs text-gray-500">{provider.label}</div>
            <div className="text-base font-bold text-gray-900">{amount.toLocaleString()} {currency}</div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: accent }} />
        </div>
      </div>

      <ol className="space-y-2 text-left w-full max-w-sm text-xs text-gray-600 mb-4">
        {[
          "Vérifiez les notifications de votre téléphone",
          "Composez votre code PIN Mobile Money pour valider",
          "Cette page se mettra à jour automatiquement",
        ].map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="h-4 w-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: accent }}>
              {i + 1}
            </div>
            {s}
          </li>
        ))}
      </ol>

      <p className="text-[11px] text-gray-400">
        L'attente peut prendre jusqu'à 2 minutes selon votre opérateur.
      </p>
    </div>
  );
};

export default CheckoutDialog;
