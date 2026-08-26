import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Share, PlusSquare } from "lucide-react";
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
  const { isInstallable, isInstalled, isStandalone, isIOS, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running standalone / installed, hide button
  if (isInstalled || isStandalone || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
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
        title="Installer TECHNOVA sur votre appareil"
      >
        <Download className="h-4 w-4 text-primary animate-pulse" />
        {showLabel && <span>Installer l'App</span>}
      </Button>

      {/* iOS Instructions Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Installer TECHNOVA sur iOS (iPhone / iPad)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Suivez ces 2 étapes simples sur Safari pour installer l'application :
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-secondary/40 border border-border">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Share className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block">1. Touchez le bouton Partager</span>
                <span className="text-muted-foreground">Dans la barre d'outils en bas de Safari.</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-secondary/40 border border-border">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <PlusSquare className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block">2. Sélectionnez « Sur l'écran d'accueil »</span>
                <span className="text-muted-foreground">Appuyez ensuite sur « Ajouter » en haut à droite.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setShowIOSModal(false)}
              className="rounded-xl text-xs font-bold"
            >
              C'est noté !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
