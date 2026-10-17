import { useCallback, useSyncExternalStore } from "react";
import { getState, promptInstall, subscribe } from "@/lib/pwa";

/** État d'installation PWA partagé (voir src/lib/pwa.ts). */
export function usePWAInstall() {
  const s = useSyncExternalStore(subscribe, getState, getState);

  const installApp = useCallback(async () => (await promptInstall()) === "accepted", []);

  return {
    ...s,
    /** L'app peut être installée sur cet appareil (invite native ou instructions) */
    canInstall: !s.standalone && !s.installed && s.method !== "unsupported",
    hasNativePrompt: s.method === "native",
    installApp,
  };
}
