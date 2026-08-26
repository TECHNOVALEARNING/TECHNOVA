import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Monitor, Share, PlusSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export const PWAInstallButton = ({
  className = "",
  variant = "outline",
  size = "sm",
  showLabel = true,
}: PWAInstallButtonProps) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, hasNativePrompt, installApp } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone mode, hide button
  if (isInstalled || isStandalone || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
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
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isInstalling}
        className={`rounded-xl gap-2 font-bold transition-all shadow-sm ${className}`}
        title="Installer l'application TECHNOVA sur PC / Mobile"
      >
        <Download className="h-4 w-4 text-primary animate-pulse" />
        {showLabel && <span>Installer l'App</span>}
      </Button>

      {/* Installation Instructions Modal adapted to Site Theme */}
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
                  Guide d'installation de l'application progressive TECHNOVA
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
              onClick={() => setShowModal(false)}
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
