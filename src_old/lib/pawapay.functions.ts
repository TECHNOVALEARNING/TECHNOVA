export type PayLogo = { name: string; logoUrl: string };

import mtnLogo from "../assets/providers/mtn.png";
import airtelLogo from "../assets/providers/airtel.png";
import vodafoneLogo from "../assets/providers/vodafone.png";
import waveLogo from "../assets/providers/wave.png";
import moovLogo from "../assets/providers/moov.png";
import tigoLogo from "../assets/providers/tigo.png";

/**
 * Fetch active PawaPay payin methods and return their display names + logos.
 * Falls back to a sensible static list if the API is unreachable.
 */
export const getPawapayLogos = async (): Promise<{ logos: PayLogo[]; source: "api" | "fallback" }> => {
  const token = import.meta.env.VITE_PAWAPAY_API_TOKEN;
  const LOGO_OVERRIDES: Record<string, string> = {
    "mtn": mtnLogo,
    "airtel": airtelLogo,
    "vodafone": vodafoneLogo,
    "wave": waveLogo,
    "moov": moovLogo,
    "tigo": tigoLogo
  };

  const fallback: PayLogo[] = [
    { name: "MTN MoMo", logoUrl: mtnLogo },
    { name: "Orange Money", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" },
    { name: "Moov Money", logoUrl: moovLogo },
    { name: "Wave", logoUrl: waveLogo },
    { name: "Vodafone Cash", logoUrl: vodafoneLogo },
    { name: "Airtel Money", logoUrl: airtelLogo },
    { name: "M-Pesa", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" },
    { name: "Tigo Pesa", logoUrl: tigoLogo },
  ];

  if (!token) return { logos: fallback, source: "fallback" };

  try {
    // Try production then sandbox
    const endpoints = [
      "https://api.pawapay.io/v2/active-conf?operationType=DEPOSIT",
      "https://api.sandbox.pawapay.io/v2/active-conf?operationType=DEPOSIT",
    ];
    for (const url of endpoints) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data: any = await res.json();

      const map = new Map<string, PayLogo>();
      const countries: any[] = data?.countries ?? data ?? [];
      for (const c of countries) {
        const providers: any[] = c?.providers ?? c?.correspondents ?? [];
        for (const p of providers) {
          const name: string | undefined =
            p?.displayName || p?.name || p?.provider || p?.correspondent;
          let logo: string | undefined =
            p?.logoUrl || p?.logo || p?.providerLogoUrl || p?.icon;
            
          if (name) {
            const lower = name.toLowerCase();
            for (const [key, overrideUrl] of Object.entries(LOGO_OVERRIDES)) {
              if (lower.includes(key)) {
                logo = overrideUrl;
                break;
              }
            }
          }

          if (name && logo && !map.has(name)) {
            map.set(name, { name, logoUrl: logo });
          }
        }
      }
      if (map.size > 0) {
        return { logos: Array.from(map.values()).slice(0, 20), source: "api" };
      }
    }
  } catch (e) {
    console.error("pawapay fetch failed", e);
  }
  return { logos: fallback, source: "fallback" };
};
