// État global de l'installation PWA.
// `beforeinstallprompt` n'est émis qu'une seule fois, parfois avant le montage de React :
// on l'intercepte dès l'import de ce module (importé tôt dans main.tsx) et on le
// partage entre tous les composants via useSyncExternalStore.

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

/** Manière d'installer l'app sur l'appareil courant */
export type InstallMethod =
  | "native" // bouton natif (Chrome, Edge, Samsung Internet, Opera… sur Android / ordinateur)
  | "ios-safari" // Safari iPhone / iPad : Partager → Sur l'écran d'accueil
  | "ios-other" // Chrome / Edge / Firefox iOS ≥ 16.4 : Partager → Sur l'écran d'accueil
  | "ios-open-safari" // navigateur iOS trop ancien ou navigateur intégré (Facebook, Instagram…)
  | "android-menu" // Firefox, Samsung, Mi Browser… : menu ⋮ → Installer / Ajouter à l'écran d'accueil
  | "android-open-browser" // navigateur intégré Android (Facebook, Instagram, TikTok…)
  | "desktop-menu" // Chrome / Edge ordinateur sans invite native : icône d'installation dans la barre d'adresse
  | "mac-safari" // Safari macOS ≥ 17 : Fichier → Ajouter au Dock
  | "unsupported";

export interface PWAState {
  standalone: boolean;
  installed: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  method: InstallMethod;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isIPad: boolean;
  inApp: boolean;
  browser: string;
}

const listeners = new Set<() => void>();
let state: PWAState = computeState(null, false);

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<PWAState>) {
  const next = { ...state, ...patch };
  next.method = detectMethod(next);
  state = next;
  emit();
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

function iosVersion(ua: string): number {
  const m = ua.match(/OS (\d+)[_.](\d+)/);
  return m ? Number(m[1]) + Number(m[2]) / 100 : 0;
}

function computeState(deferredPrompt: BeforeInstallPromptEvent | null, installed: boolean): PWAState {
  if (typeof window === "undefined") {
    return {
      standalone: false,
      installed,
      deferredPrompt,
      method: "unsupported",
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isIPad: false,
      inApp: false,
      browser: "",
    };
  }
  const ua = navigator.userAgent;
  // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile
  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isIOS = /iPhone|iPod/.test(ua) || isIPad;
  const isAndroid = /Android/i.test(ua);
  const inApp =
    /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|TikTok|musical_ly|Bytedance|Snapchat|LinkedInApp|Pinterest|WhatsApp|GSA\//i.test(ua) ||
    (isAndroid && /; wv\)/.test(ua));

  let browser = "other";
  if (isIOS) {
    if (/CriOS/.test(ua)) browser = "chrome";
    else if (/FxiOS/.test(ua)) browser = "firefox";
    else if (/EdgiOS/.test(ua)) browser = "edge";
    else if (/OPiOS|OPT\//.test(ua)) browser = "opera";
    else if (/Safari/.test(ua) && !inApp) browser = "safari";
  } else if (/SamsungBrowser/.test(ua)) browser = "samsung";
  else if (/MiuiBrowser|XiaoMi/i.test(ua)) browser = "miui";
  else if (/UCBrowser/.test(ua)) browser = "uc";
  else if (/Firefox\//.test(ua)) browser = "firefox";
  else if (/EdgA?\//.test(ua)) browser = "edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "opera";
  else if (/Chrome\//.test(ua)) browser = "chrome";
  else if (/Safari\//.test(ua)) browser = "safari";

  const base: PWAState = {
    standalone: isStandaloneDisplay(),
    installed,
    deferredPrompt,
    method: "unsupported",
    isMobile: isIOS || isAndroid || /Mobi/i.test(ua),
    isIOS,
    isAndroid,
    isIPad,
    inApp,
    browser,
  };
  base.method = detectMethod(base);
  return base;
}

function detectMethod(s: PWAState): InstallMethod {
  if (s.deferredPrompt) return "native";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (s.isIOS) {
    if (s.inApp) return "ios-open-safari";
    if (s.browser === "safari") return "ios-safari";
    return iosVersion(ua) >= 16.4 ? "ios-other" : "ios-open-safari";
  }
  if (s.isAndroid) {
    if (s.inApp) return "android-open-browser";
    // Chrome / Edge / Samsung émettent normalement l'invite native ; en attendant
    // (ou si elle a déjà été refusée), le menu du navigateur fonctionne toujours.
    return "android-menu";
  }
  // Ordinateur
  if (s.browser === "chrome" || s.browser === "edge" || s.browser === "opera") return "desktop-menu";
  if (s.browser === "safari" && /Version\/(1[7-9]|[2-9]\d)/.test(ua)) return "mac-safari";
  return "unsupported";
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setState({ deferredPrompt: e as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => {
    setState({ installed: true, deferredPrompt: null });
    try {
      localStorage.removeItem(DISMISS_KEY);
    } catch {
      // stockage indisponible (navigation privée)
    }
  });
  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", () => {
    setState({ standalone: isStandaloneDisplay() });
  });
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

/** Ouvre l'invite native. Renvoie "accepted", "dismissed" ou "unavailable". */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const evt = state.deferredPrompt;
  if (!evt) return "unavailable";
  try {
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    // L'événement n'est utilisable qu'une fois
    setState({ deferredPrompt: null, installed: outcome === "accepted" || state.installed });
    return outcome;
  } catch {
    setState({ deferredPrompt: null });
    return "unavailable";
  }
}

// ─── Mise en veille de la suggestion automatique ───
export const DISMISS_KEY = "technova_pwa_dismissed_until";

export function isSnoozed(): boolean {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

export function snooze(days: number) {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 86_400_000));
  } catch {
    // stockage indisponible
  }
}

/** Lien "intent" qui rouvre la page courante dans Chrome depuis un navigateur intégré Android */
export function androidChromeIntentUrl(): string {
  const { host, pathname, search, hash } = window.location;
  return `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`;
}
