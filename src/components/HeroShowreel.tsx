import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * "Vidéo" motion design du héros : 4 scènes qui racontent TECHNOVA Learning
 * (apprendre → coder → vendre → se certifier), enchaînées comme un showreel.
 *
 * - Enchaînement continu, sans barre de progression : un minuteur CSS invisible
 *   déclenche la scène suivante (pause = animation-play-state: paused)
 * - Pause automatique hors écran / onglet masqué, bouton lecture/pause
 * - Pas de lecture automatique si "réduire les animations" est activé
 */

type Lang = "fr" | "en";

const SCENE_MS = 5200;

const T = {
  fr: {
    scenes: ["Apprenez", "Pratiquez", "Vendez", "Certifiez-vous"],
    course: "Python pour la Data Science",
    lessons: ["Les bases de Python", "Pandas & NumPy", "Visualiser vos données", "Projet final"],
    progress: "Progression",
    trained: "Modèle entraîné — précision",
    accuracy: "Précision du modèle",
    ebook: "Guide UI/UX Design",
    sale: "Nouvelle vente",
    via: "via Mobile Money",
    balance: "Solde disponible",
    certTitle: "Certificat de réussite",
    certFor: "décerné à",
    certCourse: "Data Science & IA",
    certified: "Certifié",
    play: "Lire",
    pause: "Pause",
  },
  en: {
    scenes: ["Learn", "Practice", "Sell", "Get certified"],
    course: "Python for Data Science",
    lessons: ["Python basics", "Pandas & NumPy", "Visualize your data", "Final project"],
    progress: "Progress",
    trained: "Model trained — accuracy",
    accuracy: "Model accuracy",
    ebook: "UI/UX Design Guide",
    sale: "New sale",
    via: "via Mobile Money",
    balance: "Available balance",
    certTitle: "Certificate of completion",
    certFor: "awarded to",
    certCourse: "Data Science & AI",
    certified: "Certified",
    play: "Play",
    pause: "Pause",
  },
};

const ease = [0.22, 1, 0.36, 1] as const;

const sceneVariants = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  exit: { opacity: 0, scale: 1.03, filter: "blur(8px)", transition: { duration: 0.4, ease } },
};

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.55, ease } },
});

/** Compteur animé (0 → value) */
const CountUp = ({ value, duration = 1.6, delay = 0, suffix = "" }: { value: number; duration?: number; delay?: number; suffix?: string }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return (
    <>
      {n.toLocaleString("fr-FR")}
      {suffix}
    </>
  );
};

// ─── Scène 1 : apprendre ───
const SceneLearn = ({ t }: { t: (typeof T)["fr"] }) => (
  <div className="tn-sr-scene">
    <motion.div className="tn-sr-card tn-sr-player" {...rise(0.1)}>
      <div className="tn-sr-video">
        <div className="tn-sr-video-glow" />
        <motion.div
          className="tn-sr-playbtn"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <i className="fas fa-play" />
        </motion.div>
        <span className="tn-sr-chip tn-sr-chip-dark">
          <i className="fab fa-python" /> 12:48
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div className="tn-sr-title">{t.course}</div>
        <div className="tn-sr-row" style={{ marginTop: 10 }}>
          <span className="tn-sr-muted">{t.progress}</span>
          <span className="tn-sr-strong">
            <CountUp value={72} delay={0.5} duration={2.4} suffix="%" />
          </span>
        </div>
        <div className="tn-sr-bar">
          <motion.div
            className="tn-sr-bar-fill"
            initial={{ width: "0%" }}
            animate={{ width: "72%" }}
            transition={{ delay: 0.5, duration: 2.4, ease }}
          />
        </div>
      </div>
    </motion.div>

    <div className="tn-sr-lessons">
      {t.lessons.map((l, i) => (
        <motion.div key={l} className="tn-sr-card tn-sr-lesson" {...rise(0.6 + i * 0.35)}>
          <motion.span
            className={i < 3 ? "tn-sr-check done" : "tn-sr-check"}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9 + i * 0.35, type: "spring", stiffness: 420, damping: 18 }}
          >
            <i className={i < 3 ? "fas fa-check" : "fas fa-lock"} />
          </motion.span>
          <span>{l}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

// ─── Scène 2 : pratiquer (code + graphique) ───
const CODE = [
  [["kw", "import"], ["tx", " pandas "], ["kw", "as"], ["tx", " pd"]],
  [["kw", "from"], ["tx", " sklearn "], ["kw", "import"], ["fn", " model"]],
  [["tx", "df = pd."], ["fn", "read_csv"], ["st", "('ventes.csv')"]],
  [["tx", "m = model."], ["fn", "fit"], ["tx", "(df)"]],
  [["fn", "print"], ["tx", "(m."], ["fn", "score"], ["tx", "())"]],
];

const ScenePractice = ({ t }: { t: (typeof T)["fr"] }) => (
  <div className="tn-sr-scene">
    <motion.div className="tn-sr-card tn-sr-editor" {...rise(0.1)}>
      <div className="tn-sr-editor-bar">
        <span style={{ background: "#ff5f57" }} />
        <span style={{ background: "#febc2e" }} />
        <span style={{ background: "#28c840" }} />
        <em>main.py</em>
      </div>
      <div className="tn-sr-code">
        {CODE.map((line, i) => (
          <motion.div
            key={i}
            className="tn-sr-code-line"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ delay: 0.4 + i * 0.45, duration: 0.45, ease: "linear" }}
          >
            <span className="tn-sr-ln">{i + 1}</span>
            {line.map(([k, v], j) => (
              <span key={j} className={`tn-sr-${k}`}>
                {v}
              </span>
            ))}
          </motion.div>
        ))}
        <motion.div className="tn-sr-out" {...rise(2.9)}>
          <i className="fas fa-circle-check" /> {t.trained} 94%
        </motion.div>
      </div>
    </motion.div>

    <motion.div className="tn-sr-card tn-sr-chart" {...rise(1.2)}>
      <div className="tn-sr-muted" style={{ marginBottom: 8 }}>
        {t.accuracy}
      </div>
      <div className="tn-sr-bars">
        {[38, 52, 61, 74, 86, 94].map((h, i) => (
          <motion.span
            key={i}
            initial={{ height: "0%" }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 1.5 + i * 0.18, duration: 0.7, ease }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// ─── Scène 3 : vendre (ebook + ventes Mobile Money) ───
const SceneSell = ({ t }: { t: (typeof T)["fr"] }) => (
  <div className="tn-sr-scene">
    <motion.div
      className="tn-sr-card tn-sr-ebook"
      initial={{ opacity: 0, rotateY: -35, x: -30 }}
      animate={{ opacity: 1, rotateY: -12, x: 0, transition: { delay: 0.1, duration: 0.8, ease } }}
    >
      <div className="tn-sr-ebook-cover">
        <i className="fas fa-pen-nib" />
        <strong>{t.ebook}</strong>
        <small>TECHNOVA</small>
      </div>
    </motion.div>

    <div className="tn-sr-sales">
      {[5000, 7500, 3000].map((amount, i) => (
        <motion.div
          key={i}
          className="tn-sr-card tn-sr-sale"
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.7 + i * 0.75, type: "spring", stiffness: 260, damping: 22 }}
        >
          <span className="tn-sr-sale-ico">
            <i className="fas fa-bag-shopping" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="tn-sr-strong">{t.sale}</div>
            <div className="tn-sr-muted">{t.via}</div>
          </div>
          <span className="tn-sr-amount">+{amount.toLocaleString("fr-FR")} F</span>
        </motion.div>
      ))}
      <motion.div className="tn-sr-card tn-sr-balance" {...rise(2.9)}>
        <span className="tn-sr-muted">{t.balance}</span>
        <span className="tn-sr-balance-val">
          <CountUp value={15500} delay={3} duration={1.4} /> FCFA
        </span>
      </motion.div>
    </div>
  </div>
);

// ─── Scène 4 : se certifier ───
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  x: Math.cos((i / 18) * Math.PI * 2) * (110 + (i % 3) * 40),
  y: Math.sin((i / 18) * Math.PI * 2) * (80 + (i % 4) * 25),
  c: ["#0071e3", "#409cff", "#f5a623", "#28c840"][i % 4],
}));

const SceneCertify = ({ t }: { t: (typeof T)["fr"] }) => (
  <div className="tn-sr-scene tn-sr-center">
    {CONFETTI.map((p, i) => (
      <motion.span
        key={i}
        className="tn-sr-confetti"
        style={{ background: p.c }}
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.6], rotate: 180 }}
        transition={{ delay: 1.6, duration: 1.8, ease: "easeOut" }}
      />
    ))}
    <motion.div
      className="tn-sr-card tn-sr-cert"
      initial={{ opacity: 0, y: 40, rotateX: 25 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, transition: { delay: 0.1, duration: 0.8, ease } }}
    >
      <div className="tn-sr-cert-inner">
        <div className="tn-sr-eyebrow">TECHNOVA Learning</div>
        <div className="tn-sr-cert-title">{t.certTitle}</div>
        <div className="tn-sr-muted">{t.certFor}</div>
        <motion.div
          className="tn-sr-cert-name"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ delay: 0.8, duration: 0.9, ease: "easeInOut" }}
        >
          Aïcha K.
        </motion.div>
        <div className="tn-sr-strong">{t.certCourse}</div>
        <div className="tn-sr-stars">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.i
              key={i}
              className="fas fa-star"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 500, damping: 15 }}
            />
          ))}
        </div>
      </div>
      <motion.div
        className="tn-sr-seal"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 14 }}
      >
        <i className="fas fa-award" />
        <span>{t.certified}</span>
      </motion.div>
    </motion.div>
  </div>
);

const SCENES = [SceneLearn, ScenePractice, SceneSell, SceneCertify];
const SCENE_ICONS = ["fa-graduation-cap", "fa-code", "fa-store", "fa-award"];

const HeroShowreel = ({ lang }: { lang: Lang }) => {
  const t = T[lang] || T.fr;
  const rootRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Pas de lecture automatique si l'utilisateur préfère réduire les animations
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
  }, []);

  // Pause hors écran / onglet masqué
  useEffect(() => {
    const el = rootRef.current;
    let offscreen = false;
    const update = () => setHidden(offscreen || document.hidden);
    const io = el
      ? new IntersectionObserver(([entry]) => {
          offscreen = !entry.isIntersecting;
          update();
        })
      : null;
    if (el && io) io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const paused = userPaused || hidden;
  const Scene = SCENES[scene];
  const next = () => setScene((s) => (s + 1) % SCENES.length);

  return (
    <div ref={rootRef} className="tn-sr" aria-label="TECHNOVA Learning — présentation animée">
      <style>{CSS}</style>

      <div className="tn-sr-screen">
        <div className="tn-sr-aurora" />
        <div className="tn-sr-dots" />

        {/* Libellé de scène */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${scene}`}
            className="tn-sr-label"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.25 } }}
          >
            <span className="tn-sr-label-num">0{scene + 1}</span>
            <i className={`fas ${SCENE_ICONS[scene]}`} />
            {t.scenes[scene]}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          className="tn-sr-toggle"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? t.play : t.pause}
        >
          <i className={userPaused ? "fas fa-play" : "fas fa-pause"} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div key={scene} className="tn-sr-stage" variants={sceneVariants} initial="initial" animate="animate" exit="exit">
            <Scene t={t} />
          </motion.div>
        </AnimatePresence>

        {/* Minuteur invisible : la fin de l'animation CSS enchaîne la scène suivante */}
        <span
          key={`timer-${scene}`}
          className="tn-sr-timer"
          style={{ animationPlayState: paused ? "paused" : "running" }}
          onAnimationEnd={next}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

const CSS = `
.tn-sr { position:relative; width:100%; max-width:560px; margin:0 auto; perspective:1200px; }
.tn-sr-screen {
  position:relative; aspect-ratio: 1 / 0.92; border-radius:28px; overflow:hidden;
  background: linear-gradient(160deg, rgba(0,113,227,0.10), rgba(64,156,255,0.04) 45%, rgba(245,166,35,0.08));
  border:1px solid var(--card-border); box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.25);
  backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
}
[data-theme="dark"] .tn-sr-screen, .dark .tn-sr-screen {
  background: linear-gradient(160deg, rgba(0,113,227,0.22), rgba(20,20,24,0.85) 50%, rgba(245,166,35,0.10));
}
.tn-sr-aurora {
  position:absolute; inset:-30%; pointer-events:none; opacity:0.55;
  background: conic-gradient(from 0deg at 50% 50%, rgba(0,113,227,0.35), rgba(64,156,255,0.05), rgba(245,166,35,0.25), rgba(0,113,227,0.35));
  filter: blur(60px); animation: tnSrSpin 18s linear infinite;
}
.tn-sr-dots {
  position:absolute; inset:0; pointer-events:none; opacity:0.5;
  background-image: radial-gradient(rgba(0,113,227,0.25) 1px, transparent 1px); background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%); mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}
@keyframes tnSrSpin { to { transform: rotate(360deg); } }
.tn-sr-label {
  position:absolute; top:18px; left:18px; z-index:3; display:inline-flex; align-items:center; gap:8px;
  padding:7px 14px 7px 7px; border-radius:50px; background:var(--card); border:1px solid var(--card-border);
  font-family:'Outfit',sans-serif; font-weight:700; font-size:0.82rem; color:var(--text); box-shadow:var(--shadow-sm);
}
.tn-sr-label i { color:var(--blue); }
.tn-sr-label-num { background:var(--blue); color:#fff; border-radius:50px; padding:2px 8px; font-size:0.7rem; }
.tn-sr-toggle {
  position:absolute; top:18px; right:18px; z-index:3; width:34px; height:34px; border-radius:50%;
  background:var(--card); border:1px solid var(--card-border); color:var(--text); font-size:0.75rem;
  display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--shadow-sm);
}
.tn-sr-stage { position:absolute; inset:64px 22px 26px; z-index:2; }
.tn-sr-scene { position:relative; width:100%; height:100%; display:flex; gap:14px; align-items:center; }
.tn-sr-center { justify-content:center; }
.tn-sr-card {
  background:var(--card); border:1px solid var(--card-border); border-radius:16px; box-shadow:var(--shadow-md); color:var(--text);
}
.tn-sr-title { font-family:'Outfit',sans-serif; font-weight:700; font-size:0.95rem; line-height:1.25; }
.tn-sr-muted { color:var(--text-secondary); font-size:0.74rem; }
.tn-sr-strong { font-weight:700; font-size:0.82rem; color:var(--text); }
.tn-sr-row { display:flex; justify-content:space-between; align-items:center; }
.tn-sr-eyebrow { font-size:0.62rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--blue); }
.tn-sr-chip { position:absolute; bottom:10px; right:10px; font-size:0.7rem; font-weight:700; padding:3px 9px; border-radius:50px; display:inline-flex; gap:6px; align-items:center; }
.tn-sr-chip-dark { background:rgba(0,0,0,0.55); color:#fff; }

/* Scène 1 */
.tn-sr-player { flex:1.25; overflow:hidden; }
.tn-sr-video { position:relative; aspect-ratio:16/10; background:linear-gradient(135deg,#0b1f3a,#0071e3 70%,#409cff); display:flex; align-items:center; justify-content:center; overflow:hidden; }
.tn-sr-video-glow { position:absolute; width:70%; height:70%; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%); animation: tnSrPulse 3s ease-in-out infinite; }
@keyframes tnSrPulse { 0%,100% { transform:scale(0.85); opacity:0.6; } 50% { transform:scale(1.1); opacity:1; } }
.tn-sr-playbtn { position:relative; width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.95); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:1.1rem; padding-left:3px; box-shadow:0 10px 30px rgba(0,0,0,0.25); }
.tn-sr-bar { height:8px; border-radius:8px; background:var(--blue-soft); margin-top:6px; overflow:hidden; }
.tn-sr-bar-fill { height:100%; border-radius:8px; background:linear-gradient(90deg,var(--blue),var(--blue-light)); }
.tn-sr-lessons { flex:1; display:flex; flex-direction:column; gap:9px; }
.tn-sr-lesson { display:flex; align-items:center; gap:10px; padding:10px 12px; font-size:0.78rem; font-weight:600; }
.tn-sr-check { width:24px; height:24px; min-width:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.62rem; background:var(--blue-soft); color:var(--text-secondary); }
.tn-sr-check.done { background:#28c840; color:#fff; }

/* Scène 2 */
.tn-sr-editor { flex:1.45; overflow:hidden; background:#0d1117; border-color:rgba(255,255,255,0.08); color:#e6edf3; }
.tn-sr-editor-bar { display:flex; align-items:center; gap:6px; padding:10px 12px; background:#161b22; }
.tn-sr-editor-bar span { width:10px; height:10px; border-radius:50%; }
.tn-sr-editor-bar em { margin-left:8px; font-style:normal; font-size:0.7rem; color:#8b949e; }
.tn-sr-code { padding:12px 12px 14px; font-family: 'JetBrains Mono','Fira Code',ui-monospace,monospace; font-size:0.72rem; line-height:1.9; }
.tn-sr-code-line { white-space:nowrap; }
.tn-sr-ln { display:inline-block; width:18px; color:#484f58; }
.tn-sr-kw { color:#ff7b72; } .tn-sr-fn { color:#d2a8ff; } .tn-sr-st { color:#a5d6ff; } .tn-sr-tx { color:#e6edf3; }
.tn-sr-out { margin-top:10px; padding:7px 10px; border-radius:8px; background:rgba(40,200,64,0.12); color:#3fb950; font-size:0.7rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tn-sr-chart { flex:1; padding:14px; align-self:flex-end; margin-bottom:6%; }
.tn-sr-bars { height:120px; display:flex; align-items:flex-end; gap:7px; }
.tn-sr-bars span { flex:1; border-radius:6px 6px 3px 3px; background:linear-gradient(180deg,var(--blue-light),var(--blue)); }

/* Scène 3 */
.tn-sr-ebook { flex:0.9; padding:8px; transform-style:preserve-3d; }
.tn-sr-ebook-cover { aspect-ratio:3/4; border-radius:10px; background:linear-gradient(150deg,#f5a623,#ff6b00 60%,#d92f21); color:#fff; display:flex; flex-direction:column; justify-content:flex-end; gap:6px; padding:16px; box-shadow: inset 6px 0 0 rgba(0,0,0,0.15); }
.tn-sr-ebook-cover i { font-size:1.6rem; margin-bottom:auto; opacity:0.9; }
.tn-sr-ebook-cover strong { font-family:'Outfit',sans-serif; font-size:1rem; line-height:1.15; }
.tn-sr-ebook-cover small { font-size:0.6rem; letter-spacing:0.15em; opacity:0.85; }
.tn-sr-sales { flex:1.3; display:flex; flex-direction:column; gap:9px; }
.tn-sr-sale { display:flex; align-items:center; gap:10px; padding:10px 12px; }
.tn-sr-sale-ico { width:32px; height:32px; min-width:32px; border-radius:10px; background:#ffcc00; color:#000; display:flex; align-items:center; justify-content:center; font-size:0.8rem; }
.tn-sr-amount { margin-left:auto; font-weight:800; font-size:0.82rem; color:#1f9d3a; white-space:nowrap; }
.tn-sr-balance { padding:12px 14px; display:flex; flex-direction:column; gap:2px; background:linear-gradient(135deg,var(--blue),var(--blue-light)); border:none; }
.tn-sr-balance .tn-sr-muted { color:rgba(255,255,255,0.8); }
.tn-sr-balance-val { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.3rem; color:#fff; }

/* Scène 4 */
.tn-sr-cert { position:relative; width:84%; padding:10px; }
.tn-sr-cert-inner { border:2px solid rgba(0,113,227,0.25); border-radius:12px; padding:22px 18px 18px; text-align:center; display:flex; flex-direction:column; gap:6px; align-items:center; }
.tn-sr-cert-title { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.15rem; }
.tn-sr-cert-name { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.6rem; background:linear-gradient(135deg,var(--blue),var(--blue-light)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.tn-sr-stars { display:flex; gap:4px; color:#f5a623; font-size:0.8rem; margin-top:4px; }
.tn-sr-seal { position:absolute; right:-14px; bottom:-14px; width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#f5a623,#ff6b00); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:1.3rem; box-shadow:0 10px 30px rgba(245,166,35,0.45); border:3px solid var(--card); }
.tn-sr-seal span { font-size:0.55rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; }
.tn-sr-confetti { position:absolute; left:50%; top:50%; width:8px; height:8px; border-radius:2px; z-index:3; }

/* Minuteur de scène (invisible) */
.tn-sr-timer { position:absolute; width:0; height:0; opacity:0; pointer-events:none; animation: tnSrTimer ${SCENE_MS}ms linear forwards; }
@keyframes tnSrTimer { from { opacity:0; } to { opacity:0.01; } }

@media (max-width: 480px) {
  .tn-sr-screen { aspect-ratio: 1 / 1.05; border-radius:22px; }
  .tn-sr-stage { inset:58px 14px 18px; }
  .tn-sr-scene { gap:10px; }
  .tn-sr-code { font-size:0.62rem; }
  .tn-sr-lesson, .tn-sr-sale { padding:8px 10px; font-size:0.7rem; }
  .tn-sr-bars { height:90px; }
}
@media (prefers-reduced-motion: reduce) { .tn-sr-aurora, .tn-sr-video-glow { animation:none; } }
`;

export default HeroShowreel;
