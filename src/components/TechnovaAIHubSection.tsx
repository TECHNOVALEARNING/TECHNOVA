import { motion } from "framer-motion";
import {
  ArrowRight,
  LayoutGrid,
  Gift,
  Video,
  Music2,
  Brain,
  CodeXml,
  Flower2,
  Pencil,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

const AI_HUB_URL = "https://www.technovaihub.com";

/* Mêmes logos que le bandeau de technovaihub.com (Simple Icons). OpenAI n'existe plus
   chez Simple Icons : on affiche une icône de remplacement. */
const PROVIDERS: { name: string; slug?: string }[] = [
  { name: "OpenAI" },
  { name: "Anthropic", slug: "anthropic" },
  { name: "Google Gemini", slug: "googlegemini" },
  { name: "Meta", slug: "meta" },
  { name: "Mistral AI", slug: "mistralai" },
  { name: "DeepSeek", slug: "deepseek" },
  { name: "Alibaba Qwen", slug: "alibabacloud" },
  { name: "Hugging Face", slug: "huggingface" },
  { name: "NVIDIA", slug: "nvidia" },
  { name: "Perplexity", slug: "perplexity" },
];

/* Motif géométrique (triangles imbriqués) utilisé comme masque sur les bords */
const PATTERN_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52' fill='none' stroke='black' stroke-width='1.6'>` +
    `<path d='M30 3 L57 49 L3 49Z'/><path d='M30 14 L47 43 L13 43Z'/><path d='M30 25 L38 39 L22 39Z'/>` +
    `<path d='M-27 3 L27 3 L0 49Z'/><path d='M-17 9 L17 9 L0 38Z'/><path d='M-8 15 L8 15 L0 28Z'/>` +
    `<path d='M33 3 L87 3 L60 49Z'/><path d='M43 9 L77 9 L60 38Z'/><path d='M52 15 L68 15 L60 28Z'/>` +
    `</svg>`,
);

const Butterfly = ({ size = 30 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7v11" />
    <path d="M12 9C10 4 4 2 3 5c-1 3 2 6 6 6-3 1-5 4-3 6 2 2 5-1 6-4" />
    <path d="M12 9c2-5 8-7 9-4 1 3-2 6-6 6 3 1 5 4 3 6-2 2-5-1-6-4" />
    <path d="M12 7l-1.5-3M12 7l1.5-3" />
  </svg>
);

/* Icônes qui orbitent autour de la sphère : angle en degrés (0 = droite) */
const ORBIT_ICONS: { angle: number; node: ReactNode }[] = [
  { angle: -62, node: <Video size={30} strokeWidth={1.5} /> },
  { angle: -32, node: <Butterfly /> },
  { angle: 0, node: <Brain size={30} strokeWidth={1.5} /> },
  { angle: 38, node: <CodeXml size={30} strokeWidth={1.5} /> },
  { angle: 75, node: <Flower2 size={30} strokeWidth={1.5} /> },
  { angle: 128, node: <Pencil size={28} strokeWidth={1.5} /> },
  { angle: 168, node: <Video size={30} strokeWidth={1.5} /> },
  { angle: 215, node: <Music2 size={30} strokeWidth={1.5} /> },
];

/** Colibri réaliste : vol stationnaire, halo et reflets animés */
const Hummingbird = () => (
  <div className="aihub-bird" aria-hidden="true">
    <div className="aihub-bird-glow" />
    <img src="/images/aihub-hummingbird.webp" alt="" width={112} height={112} />
  </div>
);

/** Section de la page d'accueil qui présente TechNova AI Hub (technovaihub.com). */
const TechnovaAIHubSection = ({ lang }: { lang: string }) => {
  const fr = lang === "fr";

  return (
    <section
      id="ai-hub"
      className="section-pad-100"
      style={{ position: "relative", zIndex: 1, background: "var(--background)" }}
    >
      <style>{`
        .aihub-panel {
          position: relative; overflow: hidden; border-radius: 32px; color: #fff;
          background: radial-gradient(90% 120% at 65% 40%, #17224d 0%, #0b1230 45%, #070b1d 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 30px 80px rgba(10,20,70,0.35);
        }
        /* Motif géométrique coloré visible sur les bords gauche et droit */
        .aihub-pattern-fade {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.55;
          -webkit-mask-image: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.5) 9%, transparent 22%, transparent 74%, rgba(0,0,0,0.6) 86%, #000 100%);
          mask-image: linear-gradient(90deg, #000 0%, rgba(0,0,0,0.5) 9%, transparent 22%, transparent 74%, rgba(0,0,0,0.6) 86%, #000 100%);
        }
        .aihub-pattern {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, #2563eb 0%, #7c3aed 15%, #3b82f6 40%, #a855f7 70%, #f59e0b 88%, #f97316 100%);
          -webkit-mask-image: url("data:image/svg+xml,${PATTERN_SVG}"); -webkit-mask-size: 60px 52px;
          mask-image: url("data:image/svg+xml,${PATTERN_SVG}"); mask-size: 60px 52px;
          animation: aihubPatternDrift 40s linear infinite;
        }
        @keyframes aihubPatternDrift { from { -webkit-mask-position: 0 0; mask-position: 0 0; } to { -webkit-mask-position: 0 520px; mask-position: 0 520px; } }

        .aihub-grid { position: relative; display: grid; grid-template-columns: 1.3fr 1fr; align-items: center; gap: 24px; padding: clamp(24px,4vw,48px) clamp(22px,4vw,56px) 12px; }
        .aihub-grid > * { min-width: 0; }
        @media (max-width: 1024px) { .aihub-grid { grid-template-columns: minmax(0, 1fr); } }

        /* Marque + colibri */
        .aihub-brand { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
        .aihub-bird { position: relative; width: 64px; height: 64px; flex-shrink: 0; animation: aihubBirdHover 3.4s ease-in-out infinite; }
        .aihub-bird img { position: relative; width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 4px 14px rgba(99,102,241,0.55));
          animation: aihubBirdShimmer 6s ease-in-out infinite; }
        .aihub-bird-glow { position: absolute; inset: 14%; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.55), rgba(56,189,248,0.25) 45%, transparent 70%); filter: blur(12px); animation: aihubGlow 3.4s ease-in-out infinite; }
        @keyframes aihubBirdHover { 0%,100% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(2px,-6px) rotate(-3deg); } 50% { transform: translate(-1px,-2px) rotate(1deg); } 75% { transform: translate(-3px,-5px) rotate(-1.5deg); } }
        @keyframes aihubBirdShimmer { 0%,100% { filter: drop-shadow(0 4px 14px rgba(99,102,241,0.55)) saturate(1.2) brightness(1.2); } 50% { filter: drop-shadow(0 4px 20px rgba(236,72,153,0.5)) saturate(1.45) brightness(1.35) hue-rotate(-12deg); } }
        @keyframes aihubGlow { 0%,100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.1); } }
        .aihub-brand-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: clamp(1.35rem, 2.2vw, 1.75rem); letter-spacing: -0.02em; line-height: 1;
          background: linear-gradient(180deg, #ffffff 30%, #b8c0e6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .aihub-brand-sub { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: clamp(0.85rem, 1.4vw, 1.05rem); letter-spacing: 0.32em;
          background: linear-gradient(90deg, #93c5fd, #c4b5fd, #f9a8d4, #93c5fd); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          animation: aihubRainbow 5s linear infinite; }
        .aihub-brand-line { width: 18px; height: 2px; flex-shrink: 0; border-radius: 2px; background: linear-gradient(90deg, #60a5fa, #f472b6); }

        .aihub-chip { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); font-size: 0.76rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .aihub-chip-dot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 10px #a78bfa; animation: aihubGlow 2s ease-in-out infinite; }

        .aihub-title { font-family: 'Outfit', sans-serif; font-size: clamp(1.7rem, 2.7vw, 2.35rem); line-height: 1.12; letter-spacing: -0.03em; margin: 14px 0 14px; }
        @media (max-width: 640px) { .aihub-title { font-size: 5.6vw; } }
        .aihub-title-main { display: block; white-space: nowrap; font-weight: 600;
          background: linear-gradient(180deg, #ffffff 20%, #c9cff0 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .aihub-rainbow { display: inline-block; font-weight: 800; white-space: nowrap;
          background: linear-gradient(90deg, #6d8bff, #a78bfa 20%, #f472b6 40%, #fbbf24 60%, #a78bfa 80%, #6d8bff); background-size: 250% 100%;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 18px rgba(167,139,250,0.45)); animation: aihubRainbow 6s linear infinite; }
        @keyframes aihubRainbow { from { background-position: 0% 50%; } to { background-position: 250% 50%; } }
        .aihub-desc { color: rgba(255,255,255,0.86); font-size: 0.98rem; line-height: 1.6; max-width: 520px; margin-bottom: 24px; }

        .aihub-actions { display: flex; flex-wrap: nowrap; gap: 12px; margin-bottom: 18px; }
        .aihub-btn { white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 10px; border-radius: 999px; padding: 12px 22px; font-weight: 600; font-size: 0.92rem; text-decoration: none; transition: all .25s ease; }
        .aihub-btn-primary { background: linear-gradient(180deg, #ffffff, #dfe3f5); color: #1e2a55; box-shadow: 0 0 0 3px rgba(255,255,255,0.15), 0 10px 30px rgba(120,140,255,0.35); }
        .aihub-btn-primary:hover { transform: translateY(-2px); color: #1e2a55; box-shadow: 0 0 0 4px rgba(255,255,255,0.2), 0 14px 36px rgba(120,140,255,0.5); }
        @media (max-width: 640px) { .aihub-actions { gap: 8px; } .aihub-btn { flex: 1 1 0; min-width: 0; justify-content: center; padding: 10px 8px; font-size: 0.76rem; gap: 5px; } .aihub-btn svg { width: 14px; height: 14px; } .aihub-btn-ghost svg { display: none; } .aihub-label-long { display: none; } .aihub-label-short { display: inline !important; } }
        .aihub-label-short { display: none; }
        .aihub-btn-ghost { border: 1.5px solid rgba(255,255,255,0.5); color: #fff; }
        .aihub-btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* Scène de la sphère */
        .aihub-stage { position: relative; width: min(400px, 78vw); aspect-ratio: 1; margin: 0 auto; }
        .aihub-sphere {
          position: absolute; left: 50%; top: 50%; width: 62%; aspect-ratio: 1; transform: translate(-50%,-50%);
          border-radius: 50%; overflow: hidden; isolation: isolate;
          background: radial-gradient(circle at 32% 28%, #7dd3fc 0%, #2563eb 32%, #1d1fb8 58%, #0b0f5a 85%);
          box-shadow: 0 0 60px rgba(59,130,246,0.75), 0 0 140px rgba(99,102,241,0.45), inset -24px -30px 60px rgba(5,8,40,0.65), inset 10px 10px 40px rgba(255,255,255,0.15);
          animation: aihubPulse 5s ease-in-out infinite;
        }
        @keyframes aihubPulse { 0%,100% { box-shadow: 0 0 60px rgba(59,130,246,0.7), 0 0 140px rgba(99,102,241,0.4), inset -24px -30px 60px rgba(5,8,40,0.65), inset 10px 10px 40px rgba(255,255,255,0.15); } 50% { box-shadow: 0 0 80px rgba(59,130,246,0.95), 0 0 190px rgba(139,92,246,0.55), inset -24px -30px 60px rgba(5,8,40,0.65), inset 10px 10px 40px rgba(255,255,255,0.2); } }
        .aihub-wave-wrap { position: absolute; inset: -25%; transform: rotate(-24deg); }
        .aihub-wave { position: absolute; left: 0; width: 200%; height: 60%; animation: aihubWave 7s linear infinite; mix-blend-mode: screen; filter: blur(7px); opacity: 0.75; }
        .aihub-wave-2 { animation-duration: 11s; animation-direction: reverse; opacity: 0.55; filter: blur(4px); }
        @keyframes aihubWave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .aihub-blob { position: absolute; border-radius: 50%; filter: blur(18px); mix-blend-mode: screen; }
        .aihub-blob-pink { width: 45%; height: 45%; right: -6%; top: 38%; background: radial-gradient(circle, rgba(236,72,153,0.9), transparent 70%); animation: aihubBlobA 9s ease-in-out infinite; }
        .aihub-blob-cyan { width: 55%; height: 40%; left: -5%; top: 45%; background: radial-gradient(circle, rgba(34,211,238,0.8), transparent 70%); animation: aihubBlobB 12s ease-in-out infinite; }
        @keyframes aihubBlobA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25%,-20%); } }
        @keyframes aihubBlobB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30%,10%); } }
        .aihub-gloss { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 30% 22%, rgba(255,255,255,0.55), transparent 22%), radial-gradient(circle at 70% 80%, transparent 55%, rgba(0,0,0,0.35) 100%); }

        .aihub-ring { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }

        .aihub-orbit { position: absolute; inset: 0; animation: aihubSpin 70s linear infinite; }
        .aihub-orbit-item { position: absolute; width: 0; height: 0; }
        .aihub-orbit-icon { position: absolute; transform: translate(-50%,-50%); color: rgba(226,232,255,0.85); filter: drop-shadow(0 0 8px rgba(139,92,246,0.6)); }
        .aihub-orbit-icon > div { animation: aihubSpin 70s linear infinite reverse; }
        .aihub-orbit-icon > div > div { animation: aihubBob 4s ease-in-out infinite; }
        @keyframes aihubSpin { to { transform: rotate(360deg); } }
        @keyframes aihubBob { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.08); } }

        /* Bandeau des modèles */
        .aihub-marquee { position: relative; padding: 16px 0 20px; border-top: 1px solid rgba(255,255,255,0.07); overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .aihub-track { display: flex; width: max-content; animation: aihubMarquee 32s linear infinite; }
        .aihub-marquee:hover .aihub-track { animation-play-state: paused; }
        .aihub-provider { display: inline-flex; align-items: center; gap: 8px; padding: 0 26px; border-right: 1px solid rgba(255,255,255,0.18); white-space: nowrap; font-size: 0.92rem; color: rgba(255,255,255,0.7); }
        .aihub-provider img, .aihub-provider svg { opacity: 0.8; }
        @keyframes aihubMarquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }

        @media (prefers-reduced-motion: reduce) {
          .aihub-panel *, .aihub-panel *::before, .aihub-panel *::after { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 1140, padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="aihub-panel"
        >
          <div className="aihub-pattern-fade" aria-hidden="true">
            <div className="aihub-pattern" />
          </div>

          <div className="aihub-grid">
            {/* Texte */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="aihub-brand">
                <Hummingbird />
                <span className="aihub-brand-name">Technova</span>
                <span className="aihub-brand-line" />
                <span className="aihub-brand-sub">AI HUB</span>
              </div>

              <span className="aihub-chip">
                <span className="aihub-chip-dot" />
                {fr ? "60+ modèles d'IA · Un seul hub" : "60+ AI models · One single hub"}
              </span>

              <h2 className="aihub-title">
                <span className="aihub-title-main">
                  {fr ? "L’intelligence artificielle" : "Artificial intelligence"}
                </span>
                <span className="aihub-rainbow">{fr ? "sans limites" : "without limits"}</span>
              </h2>

              <p className="aihub-desc">
                {fr
                  ? "Accédez à GPT, Claude, Gemini, DeepSeek et plus de 60 modèles depuis une seule plateforme. Payez par Mobile Money et par carte bancaire."
                  : "Access GPT, Claude, Gemini, DeepSeek and 60+ more models from a single platform. Pay with Mobile Money or bank card."}
              </p>

              <div className="aihub-actions">
                <a
                  href={`${AI_HUB_URL}/inscription`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aihub-btn aihub-btn-primary"
                >
                  <span className="aihub-label-long">
                    {fr ? "Commencer gratuitement" : "Start for free"}
                  </span>
                  <span className="aihub-label-short">{fr ? "Commencer" : "Start"}</span>
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`${AI_HUB_URL}/modeles`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aihub-btn aihub-btn-ghost"
                >
                  <LayoutGrid size={18} />
                  {fr ? "Explorer les modèles" : "Explore the models"}
                </a>
              </div>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                <Gift size={18} />
                {fr
                  ? "50 crédits Technova offerts · Sans carte bancaire"
                  : "50 free Technova credits · No credit card"}
              </p>
            </div>

            {/* Sphère animée */}
            <div className="aihub-stage" aria-hidden="true">
              <svg className="aihub-ring" viewBox="0 0 500 500">
                <circle
                  cx="250"
                  cy="250"
                  r="232"
                  fill="none"
                  stroke="rgba(167,139,250,0.22)"
                  strokeWidth="1"
                />
              </svg>

              <div className="aihub-sphere">
                <div className="aihub-blob aihub-blob-cyan" />
                <div className="aihub-wave-wrap">
                  <svg
                    className="aihub-wave"
                    style={{ top: "30%" }}
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="aihubWaveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 90 C50 40 100 40 150 90 S250 140 300 90 S350 40 400 90 L400 200 L0 200 Z"
                      fill="url(#aihubWaveGrad)"
                    />
                  </svg>
                  <svg
                    className="aihub-wave aihub-wave-2"
                    style={{ top: "38%" }}
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 80 C50 120 100 120 150 80 S250 40 300 80 S350 120 400 80 L400 120 C350 160 300 160 250 120 S150 80 100 120 S50 160 0 120 Z"
                      fill="rgba(165,243,252,0.55)"
                    />
                  </svg>
                </div>
                <div className="aihub-blob aihub-blob-pink" />
                <div className="aihub-gloss" />
              </div>

              <div className="aihub-orbit">
                {ORBIT_ICONS.map(({ angle, node }, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <div
                      key={i}
                      className="aihub-orbit-item"
                      style={{
                        left: `${50 + 45 * Math.cos(rad)}%`,
                        top: `${50 + 45 * Math.sin(rad)}%`,
                      }}
                    >
                      <div className="aihub-orbit-icon">
                        <div>
                          <div style={{ animationDelay: `${-i * 0.6}s` }}>{node}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bandeau des modèles (défilement continu) */}
          <div className="aihub-marquee">
            <div className="aihub-track">
              {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
                <span key={i} className="aihub-provider">
                  {p.slug ? (
                    <img
                      src={`https://cdn.simpleicons.org/${p.slug}/ffffff`}
                      alt=""
                      width={18}
                      height={18}
                      loading="lazy"
                    />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnovaAIHubSection;
