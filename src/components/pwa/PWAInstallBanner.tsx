import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { isSnoozed, promptInstall, snooze } from "@/lib/pwa";
import { PWAInstallGuide } from "./PWAInstallGuide";

// Pages où la suggestion ne doit jamais interrompre l'utilisateur
const HIDDEN_ROUTES = /^\/(dashboard|learn|checkout|payment|buyer|admin|login|signup|auth)/;
const ENGAGEMENT_DELAY_MS = 25_000;

/**
 * Suggestion d'installation discrète : une fine barre en bas de l'écran,
 * uniquement sur mobile / tablette, après un temps de visite, une seule fois
 * (puis mise en veille 14 jours si l'utilisateur la ferme).
 */
export const PWAInstallBanner = () => {
  const { canInstall, isMobile, method } = usePWAInstall();
  const { pathname } = useLocation();
  const [engaged, setEngaged] = useState(false);
  const [dismissed, setDismissed] = useState(() => isSnoozed());
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (engaged) return;
    const timer = window.setTimeout(() => setEngaged(true), ENGAGEMENT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [engaged]);

  const visible = canInstall && isMobile && engaged && !dismissed && !HIDDEN_ROUTES.test(pathname);

  const close = () => {
    snooze(14);
    setDismissed(true);
  };

  const install = async () => {
    if (method === "native") {
      const outcome = await promptInstall();
      if (outcome === "dismissed") close();
      if (outcome !== "unavailable") return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {visible && !guideOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-3 z-50 sm:left-auto sm:right-4 sm:w-[360px]"
            style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-2.5 pl-3 text-foreground shadow-xl backdrop-blur-xl">
              <img src="/icons/icon-192x192.png" alt="" className="h-9 w-9 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold leading-tight">Application TECHNOVA</p>
                <p className="truncate text-[11px] text-muted-foreground">Gratuite · plein écran · accès rapide</p>
              </div>
              <button
                type="button"
                onClick={install}
                className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Installer
              </button>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Ne plus afficher"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PWAInstallGuide
        open={guideOpen}
        onClose={() => {
          setGuideOpen(false);
          close();
        }}
      />
    </>
  );
};
