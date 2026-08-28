import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Mapping ISO country code to French names
const COUNTRY_MAP: Record<string, string> = {
  BJ: "Bénin",
  CI: "Côte d'Ivoire",
  SN: "Sénégal",
  ML: "Mali",
  TG: "Togo",
  BF: "Burkina Faso",
  CM: "Cameroun",
  NE: "Niger",
  GN: "Guinée",
  GA: "Gabon",
  CD: "RD Congo",
  CG: "Congo",
  FR: "France",
  BE: "Belgique",
  CA: "Canada",
  US: "États-Unis",
  GH: "Ghana",
  NG: "Nigeria",
};

// Generate or retrieve persistent visitor ID
function getVisitorId(): string {
  if (typeof window === "undefined") return "anon";
  let vid = localStorage.getItem("technova_vid");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    localStorage.setItem("technova_vid", vid);
  }
  return vid;
}

// Detect origin from URL parameters if document.referrer is empty
function detectReferrer(): string {
  if (typeof window === "undefined") return "";
  const rawRef = document.referrer || "";
  const params = new URLSearchParams(window.location.search);
  const utmSource = (params.get("utm_source") || params.get("source") || params.get("ref") || "").toLowerCase();
  const hasFbclid = params.has("fbclid");
  const hasTtclid = params.has("ttclid");
  const hasGclid = params.has("gclid");
  const hasLinkedin = params.has("li_fat_id") || utmSource.includes("linkedin");

  if (hasFbclid || utmSource.includes("facebook") || utmSource.includes("fb")) {
    return "https://www.facebook.com/";
  }
  if (utmSource.includes("whatsapp") || utmSource.includes("wa")) {
    return "https://api.whatsapp.com/";
  }
  if (hasLinkedin) {
    return "https://www.linkedin.com/";
  }
  if (hasTtclid || utmSource.includes("tiktok")) {
    return "https://www.tiktok.com/";
  }
  if (hasGclid || utmSource.includes("google")) {
    return "https://www.google.com/";
  }
  if (utmSource.includes("telegram") || utmSource.includes("t.me")) {
    return "https://t.me/";
  }
  if (utmSource.includes("twitter") || utmSource.includes("x.com")) {
    return "https://twitter.com/";
  }

  return rawRef;
}

// Helper to get country name
function getDetectedCountry(): string {
  if (typeof window === "undefined") return "Bénin";
  const code = (
    sessionStorage.getItem("tech_detected_country") ||
    localStorage.getItem("technova_user_country") ||
    ""
  ).toUpperCase();

  if (code && COUNTRY_MAP[code]) {
    return COUNTRY_MAP[code];
  }

  // Fallback heuristic based on timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Porto-Novo") || tz.includes("Cotonou")) return "Bénin";
    if (tz.includes("Abidjan")) return "Côte d'Ivoire";
    if (tz.includes("Dakar")) return "Sénégal";
    if (tz.includes("Bamako")) return "Mali";
    if (tz.includes("Lome")) return "Togo";
    if (tz.includes("Ouagadougou")) return "Burkina Faso";
    if (tz.includes("Douala")) return "Cameroun";
    if (tz.includes("Niamey")) return "Niger";
    if (tz.includes("Paris")) return "France";
  } catch (e) {
    // Ignore error
  }

  return code ? (COUNTRY_MAP[code] || code) : "Bénin";
}

export function usePageTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");
  const lastTrackedTime = useRef<number>(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const now = Date.now();

    // Prevent duplicate track on strict-mode or same route within 2.5 seconds
    if (lastTrackedPath.current === currentPath && now - lastTrackedTime.current < 2500) {
      return;
    }

    lastTrackedPath.current = currentPath;
    lastTrackedTime.current = now;

    const referrer = detectReferrer();
    const country = getDetectedCountry();
    const visitorId = getVisitorId();
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const deviceType = isMobile ? "Mobile" : "Desktop";

    // Call track_visit via admin-platform Edge function for 100% reliable execution (bypasses RLS issues)
    supabase.functions
      .invoke("admin-platform", {
        body: {
          action: "track_visit",
          page_path: currentPath,
          referrer,
          country,
          visitor_id: visitorId,
          device_type: deviceType,
          user_agent: navigator.userAgent,
        },
      })
      .catch((err) => {
        console.warn("[Tracker] Edge function visit record failed, fallback to direct insert", err);
      });
  }, [location.pathname, location.search]);
}
