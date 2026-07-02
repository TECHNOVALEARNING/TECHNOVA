import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet as WalletIcon,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Plus,
  Star,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pawapayCountries, providerLogos } from "@/data/pawapayProviders";
import SEOHead from "@/components/SEOHead";

const UNLOCK_KEY = "technova_wallet_unlock";

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

const translations = {
  fr: {
    seoTitle: "Retrait — TECHNOVA",
    seoDesc: "Retirez vos gains en toute sécurité.",
    back: "Retour",
    headerTitle: "Retrait TECHNOVA",
    secure: "Sécurisé",
    pinTitle: "Confirmation requise",
    pinSub: "Saisissez votre PIN pour valider le retrait",
    cancel: "Annuler",
    confirm: "Confirmer",
    title: "Demander un retrait",
    subtitle: "Sélectionnez un wallet et confirmez avec votre PIN.",
    kycRequired: "Vérifiez votre identité (KYC) avant de pouvoir retirer.",
    receivingWallet: "Wallet de réception",
    manageWallets: "Gérer mes wallets",
    noWallet: "Aucun wallet enregistré",
    createWallet: "Créer un wallet",
    amountLabel: "Montant à retirer (FCFA)",
    withdrawAll: "Retirer tout",
    withdrawBtn: "Retirer",
    disclaimer:
      "Délai : 2 à 11 jours ouvrés selon votre opérateur. Frais inclus dans la commission TECHNOVA (5%).",
    sidebarNetBalance: "Solde net disponible",
    sidebarCommission: "Commission TECHNOVA",
    sidebarCommissionSub: "5% (déjà déduit)",
    sidebarFees: "Frais Mobile Money",
    sidebarFeesSub: "Inclus",
    sidebarMaturity: "Maturité",
    sidebarMaturitySub: "72h après vente",
    sidebarMin: "Minimum retrait",
    sidebarMinSub: "100 FCFA",
    sidebarPinTitle: "Sécurité PIN",
    sidebarPinDesc: "Chaque retrait nécessite votre PIN à 4 chiffres.",
    toastSelectWallet: "Sélectionnez un wallet",
    toastMinAmount: "Minimum 100 FCFA",
    toastInsufficientBalance: "Solde insuffisant",
    toastCreatePin: "Créez d'abord un PIN dans l'espace Wallet",
    toastSuccess: "Demande de retrait envoyée !",
  },
  en: {
    seoTitle: "Withdrawal — TECHNOVA",
    seoDesc: "Withdraw your earnings securely.",
    back: "Back",
    headerTitle: "TECHNOVA Withdrawal",
    secure: "Secure",
    pinTitle: "Confirmation Required",
    pinSub: "Enter your PIN to validate the withdrawal",
    cancel: "Cancel",
    confirm: "Confirm",
    title: "Request a withdrawal",
    subtitle: "Select a wallet and confirm with your PIN.",
    kycRequired: "Verify your identity (KYC) before you can make withdrawals.",
    receivingWallet: "Receiving Wallet",
    manageWallets: "Manage my wallets",
    noWallet: "No wallets registered",
    createWallet: "Create a wallet",
    amountLabel: "Amount to withdraw (FCFA)",
    withdrawAll: "Withdraw all",
    withdrawBtn: "Withdraw",
    disclaimer:
      "Timeframe: 2 to 11 business days depending on your operator. Fees included in the TECHNOVA commission (5%).",
    sidebarNetBalance: "Available net balance",
    sidebarCommission: "TECHNOVA Commission",
    sidebarCommissionSub: "5% (already deducted)",
    sidebarFees: "Mobile Money Fees",
    sidebarFeesSub: "Included",
    sidebarMaturity: "Maturity",
    sidebarMaturitySub: "72h after sale",
    sidebarMin: "Minimum withdrawal",
    sidebarMinSub: "100 FCFA",
    sidebarPinTitle: "PIN Security",
    sidebarPinDesc: "Each withdrawal requires your 4-digit PIN.",
    toastSelectWallet: "Select a wallet",
    toastMinAmount: "Minimum 100 FCFA",
    toastInsufficientBalance: "Insufficient balance",
    toastCreatePin: "Create a PIN first in the Wallet space",
    toastSuccess: "Withdrawal request sent!",
  },
};

const WithdrawNew = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [availableNet, setAvailableNet] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionPct, setCommissionPct] = useState(0.05);

  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  // PIN gate
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const COMMISSION = 0.05;

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    (async () => {
      const [ordersRes, withdrawalsRes, kycRes, walletsRes, feeRes] = await Promise.all([
        supabase
          .from("orders")
          .select("amount, created_at")
          .eq("store_owner_id", user.id)
          .eq("status", "completed"),
        supabase.from("withdrawals").select("amount, fee, status").eq("user_id", user.id),
        supabase
          .from("identity_verifications")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false }),
        supabase
          .from("platform_fees")
          .select("value_pct")
          .eq("key", "technova_commission_pct")
          .maybeSingle(),
      ]);
      setKycStatus(isAdmin ? "approved" : kycRes.data?.status || null);
      const commPct = Number(feeRes.data?.value_pct ?? 5) / 100;
      setCommissionPct(commPct);

      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
      const matured = (ordersRes.data || [])
        .filter((o) => new Date(o.created_at) <= cutoff)
        .reduce((s, o) => s + Number(o.amount), 0);
      const net = matured * (1 - commPct);
      const withdrawn = (withdrawalsRes.data || [])
        .filter((w) => ["pending", "processing", "completed"].includes(w.status))
        .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);
      setAvailableNet(net - withdrawn);
      const wList = (walletsRes.data as WalletRow[]) || [];
      setWallets(wList);
      if (wList.length > 0) setSelectedWallet(wList[0].id);
      loading && setLoading(false);
    })();
  }, [user, authLoading, isAdmin, navigate]);

  const getUnlockToken = (): string | null => {
    const stored = sessionStorage.getItem(UNLOCK_KEY);
    if (!stored) return null;
    try {
      const { token, exp } = JSON.parse(stored);
      if (exp > Date.now()) return token;
    } catch {}
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedWallet) {
      toast.error(t.toastSelectWallet);
      return;
    }
    if (numAmount < 100) {
      toast.error(t.toastMinAmount);
      return;
    }
    if (numAmount > availableNet) {
      toast.error(t.toastInsufficientBalance);
      return;
    }

    const token = getUnlockToken();
    if (!token) {
      setNeedsPin(true);
      return;
    }
    await doPayout(token);
  };

  const verifyPinAndPayout = async () => {
    if (pin.length !== 4) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-pin-verify", {
        body: { pin },
      });
      if (error || data?.error) {
        if (data?.needs_setup) {
          toast.error(t.toastCreatePin);
          navigate("/dashboard/wallet");
          return;
        }
        throw new Error(data?.error || error?.message);
      }
      sessionStorage.setItem(
        UNLOCK_KEY,
        JSON.stringify({
          token: data.unlock_token,
          exp: Date.now() + data.expires_in * 1000,
        }),
      );
      setNeedsPin(false);
      setPin("");
      await doPayout(data.unlock_token);
    } catch (e: any) {
      toast.error(e.message);
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  const doPayout = async (unlock_token: string) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-payout", {
        body: { wallet_id: selectedWallet, amount: numAmount, unlock_token },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success(t.toastSuccess);
      setTimeout(() => {
        navigate("/dashboard/withdrawals");
      }, 800);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const findProvider = (code: string) => {
    for (const c of pawapayCountries) {
      const p = c.deposit.find((d) => d.code === code);
      if (p) return { label: p.label, family: p.family };
    }
    return { label: code, family: "mtn" as const };
  };

  const canWithdraw = isAdmin || kycStatus === "approved";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // PIN gate overlay
  if (needsPin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-violet-900 via-violet-700 to-amber-600">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-xl">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-1">{t.pinTitle}</h2>
          <p className="text-sm text-center text-gray-500 mb-6">{t.pinSub}</p>
          <div className="flex justify-center mb-5">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={(v) => {
                setPin(v);
                if (v.length === 4) setTimeout(() => verifyPinAndPayout(), 100);
              }}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNeedsPin(false);
                setPin("");
              }}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={verifyPinAndPayout}
              disabled={submitting || pin.length !== 4}
              className="flex-1"
              style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.confirm}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={t.seoTitle} description={t.seoDesc} />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50/40">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-violet-100/60">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <button
              onClick={() =>
                window.history.length > 1 ? navigate(-1) : navigate("/dashboard/withdrawals")
              }
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{t.back}</span>
            </button>
            <span className="text-sm font-bold text-gray-900">{t.headerTitle}</span>
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> SSL
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {t.secure}
              </span>
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-6 py-6 sm:py-10">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_360px] gap-0 bg-white md:rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100/60">
            <div className="p-5 sm:p-8 md:p-10 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
              </div>

              {!canWithdraw && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {t.kycRequired}
                </div>
              )}

              {/* Wallet selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">{t.receivingWallet}</label>
                  <button
                    onClick={() => navigate("/dashboard/wallet")}
                    className="text-[11px] text-violet-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> {t.manageWallets}
                  </button>
                </div>
                {wallets.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50">
                    <WalletIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-3">{t.noWallet}</p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/dashboard/wallet")}
                      style={{ background: "linear-gradient(135deg, #7C2DCC 0%, #C9962E 130%)" }}
                    >
                      {t.createWallet}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wallets.map((w) => {
                      const p = findProvider(w.provider_code);
                      const sel = selectedWallet === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWallet(w.id)}
                          disabled={!canWithdraw}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${sel ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                          <div className="h-10 w-10 rounded-lg bg-white p-1 ring-1 ring-gray-100">
                            <img
                              src={providerLogos[p.family]}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {w.name}
                              </p>
                              {w.is_default && (
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">
                              {w.phone} • {p.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  {t.amountLabel}
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50000"
                  className="h-12 text-lg font-semibold bg-gray-50 border-gray-200"
                  disabled={!canWithdraw || wallets.length === 0}
                />
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(availableNet).toString())}
                  className="text-xs text-violet-600 mt-1 hover:underline"
                >
                  {t.withdrawAll} ({Math.floor(availableNet).toLocaleString("fr")} FCFA)
                </button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !canWithdraw ||
                  availableNet < 100 ||
                  wallets.length === 0 ||
                  !selectedWallet
                }
                className="w-full h-14 text-base font-bold rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #7C2DCC 0%, #4B1A8A 50%, #C9962E 130%)",
                  boxShadow: "0 14px 36px -10px rgba(124,45,204,0.55)",
                }}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <WalletIcon className="h-5 w-5 mr-2" />
                )}
                {t.withdrawBtn} {numAmount > 0 ? numAmount.toLocaleString("fr") : ""} FCFA
              </Button>

              <p className="text-[11px] text-gray-400 text-center">{t.disclaimer}</p>
            </div>

            <div
              className="hidden md:flex flex-col text-white p-7 relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #7C2DCC 0%, #4B1A8A 50%, #1F0B3F 130%)",
              }}
            >
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">
                  {t.sidebarNetBalance}
                </div>
                <div className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  {Math.floor(availableNet).toLocaleString("fr")}
                </div>
                <div className="text-sm text-white/70 mb-6">FCFA</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">{t.sidebarCommission}</span>
                    <span className="font-semibold text-amber-300">
                      {commissionPct * 100}% ({lang === "fr" ? "déjà déduit" : "already deducted"})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">{t.sidebarFees}</span>
                    <span className="font-semibold text-amber-300">{t.sidebarFeesSub}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">{t.sidebarMaturity}</span>
                    <span className="font-semibold">{t.sidebarMaturitySub}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">{t.sidebarMin}</span>
                    <span className="font-semibold">{t.sidebarMinSub}</span>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <div className="rounded-xl bg-white/10 backdrop-blur p-3.5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <ShieldCheck className="h-4 w-4 text-amber-300" /> {t.sidebarPinTitle}
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{t.sidebarPinDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default WithdrawNew;
