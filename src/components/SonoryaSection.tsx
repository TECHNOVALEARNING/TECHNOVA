import { motion } from "framer-motion";
import { ArrowRight, Headphones, Heart, Music2, Sparkle } from "lucide-react";

const SONORYA_URL = "https://www.sonorya.co";

/* Hauteurs (en %) des barres de l'égaliseur ; chaque barre a son propre rythme */
const BARS = [22, 38, 55, 30, 72, 46, 88, 60, 34, 78, 52, 94, 40, 66, 28, 58, 82, 44, 70, 36];

const Equalizer = ({ className }: { className: string }) => (
  <div className={`sono-eq ${className}`} aria-hidden="true">
    {BARS.map((h, i) => (
      <span
        key={i}
        style={{
          height: `${h}%`,
          animationDelay: `${-(i * 0.17) % 1.3}s`,
          animationDuration: `${0.9 + (i % 5) * 0.18}s`,
        }}
      />
    ))}
  </div>
);

/** Section de la page d'accueil qui présente Sonorya (même gabarit que TechNova AI Hub). */
const SonoryaSection = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";

  const features = [
    { icon: Music2, label: fr ? "Chansons personnalisées" : "Personalised songs" },
    { icon: Sparkle, label: fr ? "Créations uniques" : "Unique creations" },
    { icon: Heart, label: fr ? "Émotions en musique" : "Emotions in music" },
  ];

  return (
    <section id="sonorya" className="section-pad-100" style={{ position: "relative", zIndex: 1 }}>
      <style>{`
        .sono-panel {
          position: relative; overflow: hidden; border-radius: 32px; min-height: 521px;
          display: flex; align-items: center;
          background: linear-gradient(120deg, #f7f6fe 0%, #eeecfc 45%, #f3eafb 75%, #fbeaf4 100%);
          border: 1px solid rgba(91,62,214,0.08); box-shadow: 0 30px 80px rgba(76,52,170,0.14);
        }
        /* Vagues de couleur qui dérivent en arrière-plan */
        .sono-blob { position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; }
        .sono-blob-1 { width: 520px; height: 420px; right: -80px; top: -160px; background: rgba(139,122,240,0.35); animation: sonoDrift1 16s ease-in-out infinite; }
        .sono-blob-2 { width: 420px; height: 360px; right: 8%; bottom: -170px; background: rgba(236,120,190,0.28); animation: sonoDrift2 19s ease-in-out infinite; }
        .sono-blob-3 { width: 380px; height: 300px; left: -140px; bottom: -150px; background: rgba(120,110,240,0.22); animation: sonoDrift1 22s ease-in-out infinite reverse; }
        @keyframes sonoDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,40px) scale(1.12); } }
        @keyframes sonoDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(50px,-50px) scale(0.92); } }
        .sono-ribbon { position: absolute; inset: 0; pointer-events: none; opacity: 0.55; }
        .sono-ribbon path { animation: sonoRibbon 12s ease-in-out infinite alternate; transform-origin: center; }
        @keyframes sonoRibbon { from { transform: translateY(0) scaleY(1); } to { transform: translateY(-14px) scaleY(1.08); } }

        /* Égaliseurs animés */
        .sono-eq { position: absolute; display: flex; align-items: center; gap: 5px; pointer-events: none; }
        .sono-eq span { width: 4px; border-radius: 4px; background: linear-gradient(180deg, #7c6cf0, #c86bd8); opacity: 0.7;
          transform-origin: center; animation-name: sonoBar; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
        @keyframes sonoBar { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
        .sono-eq-mid { left: 34%; top: 70%; height: 90px; opacity: 0.5; }
        .sono-eq-right { right: 3%; top: 5%; height: 70px; opacity: 0.6; }

        /* Photo : légère respiration, comme portée par la musique */
        .sono-photo { position: absolute; top: 0; right: 0; bottom: 0; width: 58%; pointer-events: none;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 32%); mask-image: linear-gradient(90deg, transparent 0%, #000 32%); }
        .sono-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 18%;
          animation: sonoGroove 6s ease-in-out infinite; transform-origin: 50% 70%; }
        @keyframes sonoGroove { 0%,100% { transform: scale(1.02) rotate(0deg); } 25% { transform: scale(1.045) rotate(-0.4deg); } 75% { transform: scale(1.035) rotate(0.4deg); } }
        .sono-photo-fade { position: absolute; inset: 0;
          display: none; }

        /* Notes de musique qui s'envolent */
        .sono-note { position: absolute; color: #8b6cf0; opacity: 0; pointer-events: none; animation: sonoNote 7s ease-in infinite; }
        @keyframes sonoNote { 0% { opacity: 0; transform: translate(0,0) rotate(0deg) scale(0.7); } 15% { opacity: 0.7; } 100% { opacity: 0; transform: translate(-40px,-220px) rotate(-25deg) scale(1.1); } }

        .sono-content { position: relative; z-index: 2; padding: clamp(26px,4.2vw,52px) clamp(28px,5vw,64px); max-width: 560px; min-width: 0; }
        .sono-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
        .sono-brand-icon { width: 54px; height: 54px; color: #6d4fe6; filter: drop-shadow(0 6px 14px rgba(109,79,230,0.35)); animation: sonoBeat 1.6s ease-in-out infinite; }
        @keyframes sonoBeat { 0%,100% { transform: scale(1); } 15% { transform: scale(1.08); } 30% { transform: scale(1); } }
        .sono-brand-name { font-family: 'Outfit', sans-serif; font-weight: 500; font-size: clamp(1.5rem, 2.6vw, 2rem); letter-spacing: 0.28em; color: #14122b; }
        .sono-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: clamp(1.8rem, 3vw, 2.65rem); line-height: 1.06; white-space: nowrap; letter-spacing: -0.035em; color: #0f0d2e; margin-bottom: 16px; }
        .sono-title-grad { display: block; white-space: nowrap; background: linear-gradient(90deg, #3b2fd6 0%, #6a32d8 40%, #b23fcf 70%, #e0479e 100%);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: sonoShine 6s ease-in-out infinite alternate; }
        @keyframes sonoShine { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
        .sono-sub { font-size: clamp(1rem, 1.6vw, 1.3rem); color: #3c3a55; line-height: 1.4; max-width: 420px; margin-bottom: 22px; }
        .sono-features { display: flex; margin-bottom: 30px; }
        .sono-feature { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 0 18px; font-size: 0.82rem; color: #3c3a55; line-height: 1.3; max-width: 130px; }
        .sono-feature:first-child { padding-left: 0; }
        .sono-feature + .sono-feature { border-left: 1px solid rgba(60,58,85,0.15); }
        .sono-feature svg { color: #4b3f9a; }
        .sono-btn { display: inline-flex; align-items: center; gap: 12px; padding: 15px 34px; border-radius: 999px; font-weight: 600; font-size: 1.02rem;
          color: #fff; text-decoration: none; background: linear-gradient(90deg, #4a2fe0, #7b3fe8); box-shadow: 0 14px 30px rgba(84,52,224,0.35); transition: all .25s ease; }
        .sono-btn:hover { color: #fff; transform: translateY(-2px); box-shadow: 0 18px 36px rgba(84,52,224,0.45); }
        .sono-btn svg { transition: transform .25s ease; }
        .sono-btn:hover svg { transform: translateX(4px); }

        @media (max-width: 768px) {
          .sono-panel { min-height: 0; align-items: flex-end; }
          .sono-photo { width: 100%; height: 300px; bottom: auto; }
          .sono-photo img { object-position: 50% 15%; }
          .sono-photo { -webkit-mask-image: linear-gradient(180deg, #000 55%, transparent 100%); mask-image: linear-gradient(180deg, #000 55%, transparent 100%); }
          .sono-content { padding: 290px 22px 30px; max-width: 100%; width: 100%; }
          .sono-title { font-size: 7.4vw; }
          .sono-eq-mid { display: none; }
          .sono-eq-right { height: 110px; top: 30px; }
          .sono-feature { padding: 0 10px; font-size: 0.75rem; }
        }
        @media (prefers-reduced-motion: reduce) { .sono-panel *, .sono-panel *::before { animation: none !important; } }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 1140, padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="sono-panel"
        >
          {/* Motion design d'arrière-plan */}
          <div className="sono-blob sono-blob-1" aria-hidden="true" />
          <div className="sono-blob sono-blob-2" aria-hidden="true" />
          <div className="sono-blob sono-blob-3" aria-hidden="true" />
          <svg
            className="sono-ribbon"
            viewBox="0 0 1100 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 470 C220 380 420 520 640 430 S960 300 1100 360 L1100 520 L0 520 Z"
              fill="rgba(160,150,245,0.18)"
            />
            <path
              d="M0 500 C260 430 470 540 700 470 S980 380 1100 420 L1100 520 L0 520 Z"
              fill="rgba(236,150,205,0.14)"
            />
          </svg>
          <Equalizer className="sono-eq-mid" />

          <div className="sono-photo" aria-hidden="true">
            <img src="/images/sonorya-couple.webp" alt="" loading="lazy" />
            <div className="sono-photo-fade" />
          </div>
          <Equalizer className="sono-eq-right" />

          {[
            { left: "48%", top: "70%", delay: "0s", size: 22 },
            { left: "62%", top: "82%", delay: "2.3s", size: 18 },
            { left: "88%", top: "76%", delay: "4.1s", size: 24 },
            { left: "40%", top: "86%", delay: "5.4s", size: 16 },
          ].map((n, i) => (
            <Music2
              key={i}
              className="sono-note"
              size={n.size}
              style={{ left: n.left, top: n.top, animationDelay: n.delay }}
              aria-hidden="true"
            />
          ))}

          <div className="sono-content">
            <div className="sono-brand">
              <Headphones className="sono-brand-icon" strokeWidth={2.2} />
              <span className="sono-brand-name">SONORYA</span>
            </div>

            <h2 className="sono-title">
              {fr ? "Votre histoire mérite" : "Your story deserves"}
              <span className="sono-title-grad">{fr ? "sa propre chanson" : "its own song"}</span>
            </h2>

            <p className="sono-sub">
              {fr
                ? "Transformez vos souvenirs en musique personnalisée"
                : "Turn your memories into personalised music"}
            </p>

            <div className="sono-features">
              {features.map((f) => (
                <div key={f.label} className="sono-feature">
                  <f.icon size={26} strokeWidth={1.5} />
                  {f.label}
                </div>
              ))}
            </div>

            <a href={SONORYA_URL} target="_blank" rel="noopener noreferrer" className="sono-btn">
              {fr ? "Créez votre chanson" : "Create your song"}
              <ArrowRight size={20} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SonoryaSection;
