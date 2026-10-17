import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  Check,
  Copy,
  Download,
  EllipsisVertical,
  ExternalLink,
  MonitorDown,
  PlusSquare,
  Share,
  X,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { androidChromeIntentUrl } from "@/lib/pwa";

type Step = { icon: ReactNode; text: ReactNode };

const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 align-middle text-[0.8em] font-semibold text-foreground">
    {children}
  </span>
);

/**
 * Panneau d'installation (bottom sheet sur mobile, carte en bas à droite sur ordinateur)
 * avec des étapes adaptées au système et au navigateur détectés.
 */
export const PWAInstallGuide = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { method, isIPad, browser } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papiers indisponible : le lien reste visible dans la barre d'adresse
    }
  };

  const shareIcon = <Share className="h-4 w-4" />;
  const addIcon = <PlusSquare className="h-4 w-4" />;
  const menuIcon = <EllipsisVertical className="h-4 w-4" />;

  let title = "Installer TECHNOVA";
  let steps: Step[] = [];
  let footer: ReactNode = null;
  // Flèche animée qui pointe vers le bouton Partager de Safari sur iPhone
  const showSafariArrow = method === "ios-safari" && !isIPad;

  switch (method) {
    case "ios-safari":
      steps = [
        {
          icon: shareIcon,
          text: (
            <>
              Touchez <Kbd>{shareIcon} Partager</Kbd>{" "}
              {isIPad ? "en haut à droite de Safari" : "en bas de l'écran"}{" "}
              <span className="text-muted-foreground">(ou <Kbd>•••</Kbd> puis Partager)</span>
            </>
          ),
        },
        { icon: addIcon, text: <>Choisissez <Kbd>{addIcon} Sur l'écran d'accueil</Kbd></> },
        { icon: <Check className="h-4 w-4" />, text: <>Touchez <Kbd>Ajouter</Kbd> en haut à droite</> },
      ];
      break;
    case "ios-other":
      steps = [
        {
          icon: shareIcon,
          text: (
            <>
              Touchez <Kbd>{shareIcon} Partager</Kbd>{" "}
              {browser === "chrome" ? "dans la barre d'adresse, en haut à droite" : "dans le menu du navigateur"}
            </>
          ),
        },
        { icon: addIcon, text: <>Choisissez <Kbd>{addIcon} Sur l'écran d'accueil</Kbd></> },
        { icon: <Check className="h-4 w-4" />, text: <>Confirmez avec <Kbd>Ajouter</Kbd></> },
      ];
      break;
    case "ios-open-safari":
      title = "Ouvrez TECHNOVA dans Safari";
      steps = [
        {
          icon: menuIcon,
          text: (
            <>
              Touchez <Kbd>•••</Kbd> ou <Kbd>{shareIcon}</Kbd> puis <Kbd>Ouvrir dans Safari</Kbd>
            </>
          ),
        },
        {
          icon: shareIcon,
          text: (
            <>
              Dans Safari : <Kbd>{shareIcon} Partager</Kbd> → <Kbd>Sur l'écran d'accueil</Kbd>
            </>
          ),
        },
      ];
      footer = (
        <button type="button" onClick={copyLink} className="tn-pwa-secondary">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Lien copié" : "Copier le lien pour Safari"}
        </button>
      );
      break;
    case "android-open-browser":
      title = "Ouvrez TECHNOVA dans Chrome";
      steps = [
        {
          icon: <ExternalLink className="h-4 w-4" />,
          text: <>Cette application ne permet pas l'installation : ouvrez la page dans votre navigateur.</>,
        },
        {
          icon: menuIcon,
          text: (
            <>
              Puis menu <Kbd>⋮</Kbd> → <Kbd>Installer l'application</Kbd>
            </>
          ),
        },
      ];
      footer = (
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={androidChromeIntentUrl()} className="tn-pwa-primary">
            <ExternalLink className="h-4 w-4" /> Ouvrir dans Chrome
          </a>
          <button type="button" onClick={copyLink} className="tn-pwa-secondary">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      );
      break;
    case "android-menu":
      steps = [
        {
          icon: menuIcon,
          text: (
            <>
              Touchez le menu <Kbd>⋮</Kbd>
              {browser === "samsung" || browser === "firefox" ? (
                <>
                  {" "}
                  ou <Kbd>☰</Kbd>
                </>
              ) : null}{" "}
              du navigateur
            </>
          ),
        },
        {
          icon: <Download className="h-4 w-4" />,
          text: (
            <>
              Choisissez <Kbd>Installer l'application</Kbd> ou <Kbd>Ajouter à l'écran d'accueil</Kbd>
            </>
          ),
        },
        { icon: <Check className="h-4 w-4" />, text: <>Confirmez avec <Kbd>Installer</Kbd></> },
      ];
      break;
    case "desktop-menu":
      steps = [
        {
          icon: <MonitorDown className="h-4 w-4" />,
          text: (
            <>
              Cliquez sur l'icône <Kbd><MonitorDown className="h-3.5 w-3.5" /></Kbd> à droite de la barre d'adresse
            </>
          ),
        },
        {
          icon: menuIcon,
          text: (
            <>
              Ou menu <Kbd>⋮</Kbd> / <Kbd>…</Kbd> → <Kbd>Installer TECHNOVA</Kbd>
              {browser === "edge" ? " (dans « Applications »)" : " (dans « Enregistrer et partager »)"}
            </>
          ),
        },
      ];
      break;
    case "mac-safari":
      steps = [
        { icon: shareIcon, text: <>Menu <Kbd>Fichier</Kbd> → <Kbd>Ajouter au Dock</Kbd></> },
        { icon: <Check className="h-4 w-4" />, text: <>Confirmez avec <Kbd>Ajouter</Kbd></> },
      ];
      break;
    default:
      title = "Installation non disponible";
      steps = [
        {
          icon: <ExternalLink className="h-4 w-4" />,
          text: <>Ce navigateur ne permet pas d'installer d'application web. Utilisez Chrome, Edge ou Safari.</>,
        },
      ];
  }

  // Portail dans <body> : un parent transformé (menu animé) casserait position: fixed
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <style>{GUIDE_CSS}</style>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] sm:bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-[91] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 80 && onClose()}
          >
            <div
              className="rounded-t-3xl border border-border bg-card px-5 pt-3 text-foreground shadow-2xl sm:rounded-3xl sm:pb-5"
              style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted sm:hidden" />
              <div className="mb-4 flex items-center gap-3">
                <img src="/icons/icon-192x192.png" alt="" className="h-11 w-11 rounded-xl shadow-sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold leading-tight">{title}</p>
                  <p className="text-xs text-muted-foreground">Plein écran, accès en un geste, sans store</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-[13px] leading-snug"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.07 }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="min-w-0">{s.text}</span>
                  </motion.li>
                ))}
              </ol>

              {footer && <div className="mt-4">{footer}</div>}
            </div>
          </motion.div>

          {showSafariArrow && (
            <motion.div
              className="pointer-events-none fixed bottom-1 left-1/2 z-[92] -translate-x-1/2 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ y: { duration: 1.2, repeat: Infinity }, opacity: { delay: 0.4 } }}
            >
              <ArrowDown className="h-7 w-7 drop-shadow" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const GUIDE_CSS = `
.tn-pwa-primary, .tn-pwa-secondary {
  display:flex; width:100%; align-items:center; justify-content:center; gap:8px;
  border-radius:14px; padding:11px 14px; font-size:13px; font-weight:700; transition:opacity .2s;
}
.tn-pwa-primary { background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); }
.tn-pwa-secondary { border:1px solid hsl(var(--border)); color:hsl(var(--foreground)); background:transparent; }
.tn-pwa-primary:hover, .tn-pwa-secondary:hover { opacity:.88; }
`;
