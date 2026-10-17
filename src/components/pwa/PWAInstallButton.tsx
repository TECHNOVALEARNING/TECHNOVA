import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { promptInstall } from "@/lib/pwa";
import { PWAInstallGuide } from "./PWAInstallGuide";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

/** Bouton "Installer l'App" : invite native si disponible, sinon instructions adaptées à l'appareil. */
export const PWAInstallButton = ({
  className = "",
  variant = "outline",
  size = "sm",
  showLabel = true,
}: PWAInstallButtonProps) => {
  const { canInstall, method } = usePWAInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (method === "native") {
      setBusy(true);
      const outcome = await promptInstall();
      setBusy(false);
      if (outcome !== "unavailable") return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={busy}
        className={`rounded-xl gap-2 font-bold transition-all shadow-sm ${className}`}
        title="Installer l'application TECHNOVA"
      >
        <Download className="h-4 w-4" />
        {showLabel && <span>Installer l'App</span>}
      </Button>

      <PWAInstallGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
};
