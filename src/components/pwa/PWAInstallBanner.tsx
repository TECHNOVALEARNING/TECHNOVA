import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Monitor, X, Share, PlusSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const PWAInstallBanner = () => {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    isIOS,
    isDismissed,
    hasNativePrompt,
    installApp,
    dismissPrompt,
  } = usePWAInstall();

  const [showModal, setShowModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed, running standalone, or dismissed, do not show banner
  if (isInstalled || isStandalone || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      setIsInstalling(true);
      try {
        const success = await installApp();
        if (!success) {
          setShowModal(true);
        }
      } catch {
        setShowModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-primary/20 ring-1 ring-white/10">
            {/* Ambient Gradient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-start gap-3.5">
              {/* App Icon */}
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-0.5 shadow-lg shadow-primary/30 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="TECHNOVA Logo"
                    className="h-full w-full object-cover rounded-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/icons/icon-192x192.png";
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-extrabold text-white items-center justify-center">
                    ✓
                  </span>
                </span>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    Application Officielle
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-foreground tracking-tight line-clamp-1">
                  Installer l'application TECHNOVA
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Accès instantané 1-clic, mode hors-ligne et navigation ultra rapide.
                </p>
              </div>

              {/* Close / Dismiss Button */}
              <button
                type="button"
                onClick={() => dismissPrompt(3)}
                className="absolute top-0 right-0 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/80 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => dismissPrompt(3)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Plus tard
              </button>

              <Button
                size="sm"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5 animate-bounce" />
                <span>Installer l'Application</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Installation Instructions Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card text-foreground border border-border shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                {isIOS ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  {isIOS
                    ? "Installer TECHNOVA sur iOS (iPhone / iPad)"
                    : "Installer l'application TECHNOVA sur votre appareil"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Guide d'installation de l'application TECHNOVA
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isIOS ? (
            /* iOS Instructions */
            <div className="space-y-3 my-2">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/60 border border-border/80 text-foreground">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Share className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">1. Touchez le bouton Partager</span>
                  <span className="text-muted-foreground">Dans la barre d'outils en bas de Safari.</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/60 border border-border/80 text-foreground">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <PlusSquare className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">2. Sélectionnez « Sur l'écran d'accueil »</span>
                  <span className="text-muted-foreground">Appuyez ensuite sur « Ajouter » en haut à droite.</span>
                </div>
              </div>
            </div>
          ) : (
            /* PC / Desktop / Android Instructions */
            <div className="space-y-3 my-2">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/60 border border-border/80 text-foreground">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">
                    Dans la barre d'adresse du navigateur
                  </span>
                  <span className="text-muted-foreground">
                    Cliquez sur l'icône <strong>Installer (⊕)</strong> ou <strong>Ordinateur 💻</strong> tout à droite de la barre URL.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/60 border border-border/80 text-foreground">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">
                    Ou via le menu du navigateur
                  </span>
                  <span className="text-muted-foreground">
                    Cliquez sur les <strong>3 points ⋮</strong> en haut à droite &gt; <strong>« Installer TECHNOVA »</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setShowModal(false);
                dismissPrompt(3);
              }}
              className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> J'ai compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
