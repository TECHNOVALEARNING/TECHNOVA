import { useEffect, useRef } from "react";

/**
 * Fond animé de la section des chiffres : ruban 3D torsadé (dégradé orange → rose →
 * violet → bleu) qui ondule en continu, avec un second ruban plus discret en contre-phase.
 *
 * - Courbes lissées (pas de 4 à 6 px) : plus d'arêtes en "triangles" sur mobile
 * - Torsion, amplitude et épaisseur proportionnelles à la taille de la section
 * - Pause hors écran / onglet masqué ; image fixe si "réduire les animations"
 */

const isDarkTheme = () =>
  document.documentElement.classList.contains("dark") ||
  document.documentElement.getAttribute("data-theme") === "dark";

type Ribbon = {
  /** position verticale de l'axe (0 → 1) */
  base: number;
  /** pente de l'axe sur la largeur */
  slope: number;
  /** vitesse et phase de l'animation */
  speed: number;
  phase: number;
  /** facteur d'épaisseur / d'opacité */
  scale: number;
  alpha: number;
};

const RIBBONS: Ribbon[] = [
  { base: 0.56, slope: -0.12, speed: 1, phase: 0, scale: 1, alpha: 1 },
  { base: 0.4, slope: 0.1, speed: -0.7, phase: 2.1, scale: 0.6, alpha: 0.45 },
];

const StatsRibbonBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let rafId = 0;
    let visible = true;
    let t = 0;
    let last = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // setTransform (et non scale) : pas de cumul à chaque redimensionnement
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion || !visible) draw();
    };

    const makeGradient = (dark: boolean) => {
      const g = ctx.createLinearGradient(0, 0, width, 0);
      if (dark) {
        g.addColorStop(0, "rgba(245, 166, 35, 0)");
        g.addColorStop(0.15, "rgba(245, 166, 35, 0.85)");
        g.addColorStop(0.38, "rgba(236, 72, 153, 0.9)");
        g.addColorStop(0.62, "rgba(168, 85, 247, 0.9)");
        g.addColorStop(0.85, "rgba(59, 130, 246, 0.85)");
        g.addColorStop(1, "rgba(59, 130, 246, 0)");
      } else {
        g.addColorStop(0, "rgba(245, 124, 0, 0)");
        g.addColorStop(0.15, "rgba(245, 124, 0, 0.8)");
        g.addColorStop(0.38, "rgba(219, 39, 119, 0.85)");
        g.addColorStop(0.62, "rgba(124, 58, 237, 0.85)");
        g.addColorStop(0.85, "rgba(29, 78, 216, 0.8)");
        g.addColorStop(1, "rgba(29, 78, 216, 0)");
      }
      return g;
    };

    const draw = () => {
      if (!width || !height) return;
      const dark = isDarkTheme();
      ctx.clearRect(0, 0, width, height);

      // Halo central qui respire légèrement
      const breathe = 0.85 + Math.sin(t * 0.6) * 0.15;
      const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.6);
      glow.addColorStop(0, dark ? `rgba(168, 85, 247, ${0.13 * breathe})` : `rgba(168, 85, 247, ${0.06 * breathe})`);
      glow.addColorStop(0.5, dark ? "rgba(59, 130, 246, 0.04)" : "rgba(59, 130, 246, 0.02)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = makeGradient(dark);

      // Proportions adaptées à l'écran : moins de torsions sur un écran étroit
      const mobile = width < 640;
      const turns = Math.min(2.4, Math.max(1.1, width / 520));
      const waves = Math.min(2.5, Math.max(1.2, width / 500));
      const amp = Math.min(height * 0.16, 38);
      const depth = Math.min(height * 0.2, 45);
      const thickness = Math.min(80, Math.max(34, Math.min(width, height * 1.4) * 0.11));
      const step = mobile ? 4 : 6;
      const lines = mobile ? 16 : 22;

      for (const r of RIBBONS) {
        const time = t * r.speed + r.phase;
        for (let i = 0; i < lines; i++) {
          const v = -1 + (2 * i) / (lines - 1);
          const centerWeight = 1 - Math.abs(v);
          ctx.beginPath();
          for (let x = -step; x <= width + step; x += step) {
            const u = x / width;
            const spineY =
              height * (r.base + r.slope * (u - 0.5)) + Math.sin(u * Math.PI * waves - time * 0.9) * amp;
            const spineZ = Math.cos(u * Math.PI * waves - time * 0.7) * depth;
            const twist = u * Math.PI * turns + time * 0.8;
            const w = (thickness + Math.sin(u * Math.PI) * thickness * 0.45) * r.scale * (1 - Math.abs(v) * 0.08);
            const y = spineY + v * w * Math.cos(twist) + (v * w * Math.sin(twist) + spineZ) * 0.22;
            if (x === -step) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          // Passe "lueur" puis passe nette
          ctx.lineWidth = 3.5;
          ctx.globalAlpha = r.alpha * (dark ? (0.03 + centerWeight * 0.22) * 0.55 : (0.02 + centerWeight * 0.12) * 0.4);
          ctx.stroke();
          ctx.lineWidth = 1.1;
          ctx.globalAlpha = r.alpha * (dark ? 0.08 + centerWeight * 0.65 : 0.15 + centerWeight * 0.55);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      // Vitesse indépendante de la fréquence d'écran (60 / 120 Hz)
      t += Math.min(0.05, (now - last) / 1000) * 0.55;
      last = now;
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || rafId) return;
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    // Changement de thème clair / sombre
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default StatsRibbonBackground;
