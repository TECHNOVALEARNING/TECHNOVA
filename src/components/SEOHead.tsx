import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: any;
}

const SITE_NAME = "TECHNOVA Learning";
const SITE_URL = "https://www.technovalearning.com";
const DEFAULT_DESCRIPTION =
  "Plateforme de formations tech, ebooks PLR (Droits de Label Privé) et produits numériques libres de droits : cybersécurité, data, IA, design. Paiement Mobile Money & Visa.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg?v=technova-20260624`;
const DEFAULT_KEYWORDS =
  "TECHNOVA, technova learning, ebooks PLR, produits PLR, droits de label privé, PLR french, formations PLR, droits de revente, formation en ligne intelligence artificielle, formation cybersécurité en ligne certifiante, formation data analyst en ligne, cours en ligne design UX/UI certifiant, formation en ligne paiement Mobile Money, MTN Money, Moov Money, Orange Money, Wave";

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = "/",
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Formations Tech & Ebooks PLR : IA, Data, Cybersécurité`;

  const isPortal =
    typeof window !== "undefined" &&
    (window.location.hostname.startsWith("portal.") ||
      window.location.hostname.startsWith("client."));
  const canonicalUrl =
    isPortal && typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}${canonicalPath}`
      : `${SITE_URL}${canonicalPath}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("keywords", keywords);
    if (noindex) setMeta("robots", "noindex, nofollow");
    else setMeta("robots", "index, follow");

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:image:secure_url", ogImage, true);
    setMeta("og:image:type", ogImage.endsWith(".png") ? "image/png" : "image/jpeg", true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", fullTitle, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "fr_FR", true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Hreflang links for multilingual FR/EN
    const setHreflang = (lang: string, href: string) => {
      let el = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement("link");
        el.rel = "alternate";
        el.hreflang = lang;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    if (!isPortal) {
      const cleanPath = window.location.pathname === "/" ? "" : window.location.pathname;
      setHreflang("fr", `${SITE_URL}${cleanPath}`);
      setHreflang("en", `${SITE_URL}/en${cleanPath}`);
      setHreflang("x-default", `${SITE_URL}${cleanPath}`);
    } else {
      document.querySelectorAll("link[hreflang]").forEach((el) => el.remove());
    }

    // JSON-LD Graph
    const existingLD = document.querySelector("script[data-seo-jsonld]");
    if (existingLD) existingLD.remove();

    const jsonLdElement = document.createElement("script");
    jsonLdElement.type = "application/ld+json";
    jsonLdElement.setAttribute("data-seo-jsonld", "true");

    const graph = [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/products?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png?v=technova-20260624`,
        description: DEFAULT_DESCRIPTION,
        sameAs: [
          "https://www.facebook.com/share/18GYGMg9o8/",
          "https://www.instagram.com/technova.learning?igsh=NGkwbjNocHUwMDE5",
          "https://www.linkedin.com/company/130533963",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: `${SITE_URL}/contact`,
        },
      },
    ];

    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        graph.push(...jsonLd);
      } else {
        graph.push(jsonLd);
      }
    }

    jsonLdElement.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
    });
    document.head.appendChild(jsonLdElement);

    return () => {
      const ld = document.querySelector("script[data-seo-jsonld]");
      if (ld) ld.remove();
    };
  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, noindex, jsonLd]);

  return null;
};

export default SEOHead;
