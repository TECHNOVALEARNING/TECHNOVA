import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";

// Initialize Vercel Analytics for native traffic and performance monitoring
inject();

// Initialize Google Analytics 4 (GA4) dynamically if measurement ID is set
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-8L88B0Z52P";
if (gaId && typeof window !== "undefined") {
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${gaId}');
  `;
  document.head.appendChild(script2);
}

createRoot(document.getElementById("root")!).render(<App />);

