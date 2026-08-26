import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register PWA Service Worker
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] Nouvelle version disponible !");
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

