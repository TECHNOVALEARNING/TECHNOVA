import { useRef } from "react";
import { motion } from "framer-motion";
import { Phone, Plane, CreditCard, MessageSquareText, PhoneCall } from "lucide-react";

const CONNECT_URL = "https://technova-dwus535v.manus.space";
const HERO_IMAGE = `${CONNECT_URL}/images/hero/airport-travelers.webp`;

const SERVICES = (fr: boolean) => [
  { icon: Phone, label: fr ? "Numéro permanent" : "Permanent number" },
  { icon: Plane, label: fr ? "eSIM voyage" : "Travel eSIM" },
  { icon: CreditCard, label: fr ? "Cartes bancaires" : "Bank cards" },
  { icon: MessageSquareText, label: fr ? "Vérification SMS" : "SMS verification" },
  { icon: PhoneCall, label: fr ? "Voix & SMS" : "Voice & SMS" },
];

/** Section de la page d'accueil qui présente Technova Connect (même gabarit que TechNova AI Hub). */
const TechnovaConnectSection = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";
  const panelRef = useRef<HTMLDivElement>(null);

  // Léger effet de profondeur : l'image suit doucement le curseur
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };
  const handleLeave = () => {
    panelRef.current?.style.setProperty("--px", "0");
    panelRef.current?.style.setProperty("--py", "0");
  };

  return (
    <section
      id="technova-connect"
      className="section-pad-100"
      style={{ position: "relative", zIndex: 1, background: "var(--background)", paddingTop: 0 }}
    >
      <style>{`
        .tnc-panel {
          --px: 0; --py: 0;
          position: relative; overflow: hidden; border-radius: 32px; min-height: 521px;
          display: flex; align-items: center; background: #f4f7fb;
          border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 30px 80px rgba(15,40,90,0.12);
        }
        .tnc-media { position: absolute; top: 0; bottom: 0; right: 0; left: 34%; overflow: hidden; }
        .tnc-parallax { position: absolute; inset: -4%;
          transform: translate3d(calc(var(--px) * -18px), calc(var(--py) * -12px), 0);
          transition: transform 0.6s ease-out; }
        /* Les voyageurs avancent vers nous : zoom lent + dérive, en boucle douce */
        .tnc-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 70% 30%;
          transform-origin: 68% 45%; animation: tncWalk 16s ease-in-out infinite alternate; will-change: transform; }
        @keyframes tncWalk {
          0% { transform: scale(1.02) translate3d(1.5%, 0.5%, 0); }
          100% { transform: scale(1.14) translate3d(-2%, -1%, 0); }
        }
        /* Reflet lumineux qui balaie le hall de l'aéroport */
        .tnc-sweep { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%);
          background-size: 250% 100%; animation: tncSweep 9s ease-in-out infinite; }
        @keyframes tncSweep { 0% { background-position: 120% 0; } 60%,100% { background-position: -60% 0; } }
        /* Fondu blanc à gauche pour la lisibilité du texte */
        .tnc-fade { position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg, #f4f7fb 0%, rgba(244,247,251,0.75) 14%, rgba(244,247,251,0.25) 30%, rgba(244,247,251,0) 45%); }

        .tnc-content { position: relative; z-index: 2; padding: clamp(26px,4.2vw,52px) clamp(28px,5vw,64px) clamp(70px,7vw,96px); max-width: 600px; min-width: 0; }
        .tnc-eyebrow { display: block; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.2em; color: #0066d6; margin-bottom: 18px; }
        .tnc-title { font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif;
          font-weight: 600; font-size: clamp(2.1rem, 3.9vw, 3.4rem); line-height: 1.06; white-space: nowrap; letter-spacing: -0.035em; color: #111827; margin-bottom: 20px; }
        .tnc-desc { font-size: clamp(1rem, 1.5vw, 1.2rem); line-height: 1.55; color: #475569; max-width: 430px; margin-bottom: 30px; }
        .tnc-soon { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 999px;
          background: rgba(0,102,214,0.08); border: 1.5px solid rgba(0,102,214,0.35); color: #0066d6; font-weight: 600; font-size: 0.95rem; }
        .tnc-soon-dot { width: 8px; height: 8px; border-radius: 50%; background: #0066d6; animation: tncPing 1.8s ease-out infinite; }
        @keyframes tncPing { 0% { box-shadow: 0 0 0 0 rgba(0,102,214,0.55); } 80%,100% { box-shadow: 0 0 0 9px rgba(0,102,214,0); } }

        .tnc-marquee { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; overflow: hidden; padding: 14px 0;
          background: rgba(255,255,255,0.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(15,23,42,0.06);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
        .tnc-track { display: flex; width: max-content; animation: tncMarquee 26s linear infinite; }
        .tnc-marquee:hover .tnc-track { animation-play-state: paused; }
        @keyframes tncMarquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        .tnc-item { display: inline-flex; align-items: center; gap: 9px; padding: 0 28px; white-space: nowrap;
          font-weight: 600; font-size: 0.92rem; color: #1e293b; border-right: 1px solid rgba(15,23,42,0.12); }
        .tnc-item svg { color: #0066d6; }

        @media (max-width: 768px) {
          .tnc-panel { min-height: 0; align-items: flex-end; }
          .tnc-soon { padding: 10px 18px; font-size: 0.85rem; }
          .tnc-media { left: 0; }
          .tnc-img { object-position: 72% 20%; }
          .tnc-fade { background: linear-gradient(180deg, rgba(248,250,253,0) 0%, rgba(248,250,253,0.55) 30%, rgba(248,250,253,0.95) 52%, rgba(248,250,253,0.98) 100%); }
          .tnc-content { padding: 200px 22px 84px; width: 100%; max-width: 100%; }
          .tnc-title { font-size: 8.2vw; }
        }
        @media (prefers-reduced-motion: reduce) { .tnc-img, .tnc-sweep, .tnc-track, .tnc-soon-dot { animation: none; } .tnc-parallax { transform: none; } }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 1140, padding: "0 24px" }}>
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="tnc-panel"
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
        >
          <div className="tnc-media" aria-hidden="true">
            <div className="tnc-parallax">
              <img className="tnc-img" src={HERO_IMAGE} alt="" loading="lazy" />
              <div className="tnc-sweep" />
            </div>
            <div className="tnc-fade" />
          </div>

          <div className="tnc-content">
            <span className="tnc-eyebrow">TECHNOVA CONNECT</span>
            <h2 className="tnc-title">
              {fr ? "Votre monde." : "Your world."}
              <br />
              {fr ? "Votre connexion." : "Your connection."}
            </h2>
            <p className="tnc-desc">
              {fr
                ? "Vérifiez vos comptes, préparez vos données mobiles et voyagez l’esprit léger — tout depuis un même espace."
                : "Verify your accounts, get your mobile data ready and travel light — all from one place."}
            </p>
            <span className="tnc-soon">
              <span className="tnc-soon-dot" />
              {fr ? "Bientôt disponible" : "Coming soon"}
            </span>
          </div>

          <div
            className="tnc-marquee"
            aria-label={fr ? "Services Technova Connect" : "Technova Connect services"}
          >
            <div className="tnc-track">
              {[...SERVICES(fr), ...SERVICES(fr), ...SERVICES(fr), ...SERVICES(fr)].map(
                (item, i) => (
                  <span key={i} className="tnc-item" aria-hidden={i >= SERVICES(fr).length}>
                    <item.icon size={17} />
                    {item.label}
                  </span>
                ),
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnovaConnectSection;
