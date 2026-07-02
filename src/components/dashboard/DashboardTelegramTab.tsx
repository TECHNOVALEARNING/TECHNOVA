import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Copy, Loader2, CheckCircle2, Unlink, ExternalLink } from "lucide-react";

interface TelegramLink {
  chat_id: number;
  username: string | null;
  first_name: string | null;
  notify_sales: boolean;
  notify_payouts: boolean;
}

const BOT_USERNAME = "technova_bot";

const translations = {
  fr: {
    generateError: "Impossible de générer le code",
    copiedSuccess: "Copié !",
    unlinkError: "Erreur lors de la suppression",
    unlinkSuccess: "Compte Telegram délié",
    title: "Notifications Telegram",
    subtitle:
      "Recevez vos ventes, retraits et alertes directement sur Telegram, et discutez avec l'assistant IA.",
    linkedAccount: "Compte lié",
    userDefault: "Utilisateur",
    chatIdLabel: "Chat ID : ",
    openBot: "Ouvrir le bot",
    unlinkBtn: "Délier",
    step1Prefix: "Ouvrez notre bot Telegram : ",
    step1Suffix: " et cliquez sur ",
    step1Start: "Démarrer",
    step2: "Générez un code de liaison ci-dessous (valide 15 minutes).",
    step3: "Envoyez au bot : ",
    codeHelpText: "Copiez la commande complète et envoyez-la au bot. Code valide 15 min.",
    generateNewCodeBtn: "Générer un nouveau code",
    generateCodeBtn: "Générer mon code de liaison",
  },
  en: {
    generateError: "Failed to generate link code",
    copiedSuccess: "Copied!",
    unlinkError: "Error unlinking account",
    unlinkSuccess: "Telegram account unlinked",
    title: "Telegram Notifications",
    subtitle:
      "Receive sales, withdrawals, and alerts directly on Telegram, and chat with the AI assistant.",
    linkedAccount: "Linked account",
    userDefault: "User",
    chatIdLabel: "Chat ID: ",
    openBot: "Open bot",
    unlinkBtn: "Unlink",
    step1Prefix: "Open our Telegram bot: ",
    step1Suffix: " and click ",
    step1Start: "Start",
    step2: "Generate a linking code below (valid for 15 minutes).",
    step3: "Send to the bot: ",
    codeHelpText: "Copy the complete command and send it to the bot. Code valid for 15 min.",
    generateNewCodeBtn: "Generate a new code",
    generateCodeBtn: "Generate my linking code",
  },
};

const DashboardTelegramTab = () => {
  const { user } = useAuth();
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("telegram_links")
      .select("chat_id, username, first_name, notify_sales, notify_payouts")
      .eq("user_id", user.id)
      .maybeSingle();
    setLink(data as TelegramLink | null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const generateToken = async () => {
    if (!user) return;
    setGenerating(true);
    const newToken =
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("telegram_link_tokens")
      .insert({ token: newToken, user_id: user.id, expires_at: expires });
    setGenerating(false);
    if (error) {
      toast.error(t.generateError);
      return;
    }
    setToken(newToken);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(t.copiedSuccess);
  };

  const unlink = async () => {
    if (!user) return;
    const { error } = await supabase.from("telegram_links").delete().eq("user_id", user.id);
    if (error) {
      toast.error(t.unlinkError);
      return;
    }
    toast.success(t.unlinkSuccess);
    setLink(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          {t.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {link ? (
        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{t.linkedAccount}</p>
              <p className="text-sm text-muted-foreground truncate">
                {link.first_name ?? t.userDefault}
                {link.username ? ` · @${link.username}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.chatIdLabel}
                {link.chat_id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`https://t.me/${BOT_USERNAME}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                {t.openBot}
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={unlink}>
              <Unlink className="h-3.5 w-3.5 mr-1.5" />
              {t.unlinkBtn}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>
                {t.step1Prefix}
                <a
                  href={`https://t.me/${BOT_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  @{BOT_USERNAME}
                </a>
                {t.step1Suffix}
                <strong>{t.step1Start}</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>{t.step2}</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>
                {t.step3}
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs">/link VOTRE_CODE</code>
              </span>
            </li>
          </ol>

          {token ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-lg tracking-wider justify-between">
                <span>{token}</span>
                <Button size="sm" variant="ghost" onClick={() => copy(`/link ${token}`)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t.codeHelpText}</p>
              <Button variant="link" size="sm" className="px-0" onClick={generateToken}>
                {t.generateNewCodeBtn}
              </Button>
            </div>
          ) : (
            <Button onClick={generateToken} disabled={generating} className="w-full sm:w-auto">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t.generateCodeBtn}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default DashboardTelegramTab;
