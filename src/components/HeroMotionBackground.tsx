import { useEffect, useRef } from "react";

/**
 * Fond animé de la section héros : réseau neuronal (IA), paquets de données
 * qui circulent entre les nœuds (data), symboles de code qui flottent (dev)
 * et halo qui suit le curseur. Canvas 2D, sans dépendance.
 *
 * - S'adapte au thème clair / sombre (attribut data-theme ou classe .dark)
 * - Image fixe si l'utilisateur a activé "réduire les animations"
 * - Se met en pause quand le héros n'est plus visible
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number };
type Packet = { a: number; b: number; t: number; speed: number };
type Glyph = { x: number; y: number; vy: number; text: string; size: number; alpha: number };

const GLYPHS = [
  "</>",
  "{ }",
  "AI",
  "01",
  "=>",
  "SQL",
  "#",
  "λ",
  "py",
  "∑",
  "[ ]",
  "&&",
  "0x1F",
  "fn()",
  "🔒",
];

const LINK_DIST = 150;

const isDarkTheme = () =>
  document.documentElement.classList.contains("dark") ||
  document.documentElement.getAttribute("data-theme") === "dark";

const HeroMotionBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let glyphs: Glyph[] = [];
    let animationId = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const makeGlyph = (y?: number): Glyph => ({
      x: rand(0, width),
      y: y ?? height + rand(0, 80),
      vy: rand(0.12, 0.35),
      text: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      size: rand(11, 18),
      alpha: rand(0.25, 0.6),
    });

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // setTransform (et non scale) pour ne pas cumuler l'échelle à chaque resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = width * height;
      const nodeCount = Math.max(28, Math.min(90, Math.round(area / 14000)));
      nodes = Array.from({ length: nodeCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.25, 0.25),
        r: rand(1.4, 3),
        pulse: rand(0, Math.PI * 2),
      }));
      packets = [];
      const glyphCount = width < 640 ? 8 : 18;
      glyphs = Array.from({ length: glyphCount }, () => makeGlyph(rand(0, height)));
    };

    const spawnPacket = () => {
      const a = Math.floor(Math.random() * nodes.length);
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        if (i === a) continue;
        const d = Math.hypot(nodes[i].x - nodes[a].x, nodes[i].y - nodes[a].y);
        if (d < LINK_DIST && d < bestDist && Math.random() > 0.3) {
          best = i;
          bestDist = d;
        }
      }
      if (best >= 0) packets.push({ a, b: best, t: 0, speed: rand(0.008, 0.02) });
    };

    const draw = (time: number) => {
      const dark = isDarkTheme();
      const base = dark ? "64,156,255" : "0,113,227";
      const accent = dark ? "245,166,35" : "232,140,10";
      const violet = dark ? "168,85,247" : "124,58,237";

      ctx.clearRect(0, 0, width, height);

      // Halo ambiant qui dérive lentement
      const t = time * 0.00015;
      const gx = width * (0.5 + Math.sin(t) * 0.25);
      const gy = height * (0.45 + Math.cos(t * 1.3) * 0.2);
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(width, height) * 0.6);
      glow.addColorStop(0, `rgba(${base},${dark ? 0.16 : 0.08})`);
      glow.addColorStop(0.5, `rgba(${violet},${dark ? 0.06 : 0.03})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Halo du curseur
      if (mouse.active) {
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        mg.addColorStop(0, `rgba(${base},${dark ? 0.14 : 0.07})`);
        mg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, width, height);
      }

      // Symboles de code qui montent
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const g of glyphs) {
        if (!reduceMotion) g.y -= g.vy;
        if (g.y < -30) Object.assign(g, makeGlyph());
        const fade = Math.min(1, g.y / (height * 0.25), (height - g.y) / (height * 0.25) + 0.2);
        ctx.font = `600 ${g.size}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(${base},${Math.max(0, g.alpha * fade * (dark ? 0.55 : 0.4))})`;
        ctx.fillText(g.text, g.x, g.y);
      }

      // Déplacement des nœuds + attraction douce vers le curseur
      for (const n of nodes) {
        if (!reduceMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (mouse.active) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < 180 && d > 1) {
              n.x += (dx / d) * 0.35;
              n.y += (dy / d) * 0.35;
            }
          }
          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;
        }
      }

      // Connexions
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * (dark ? 0.35 : 0.22);
            ctx.strokeStyle = `rgba(${base},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Paquets de données qui circulent sur les connexions
      if (!reduceMotion && packets.length < nodes.length / 3 && Math.random() < 0.12) spawnPacket();
      packets = packets.filter((p) => {
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b || Math.hypot(a.x - b.x, a.y - b.y) > LINK_DIST * 1.2) return false;
        if (!reduceMotion) p.t += p.speed;
        if (p.t >= 1) {
          b.pulse = 0;
          return false;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const pg = ctx.createRadialGradient(x, y, 0, x, y, 7);
        pg.addColorStop(0, `rgba(${accent},0.95)`);
        pg.addColorStop(1, `rgba(${accent},0)`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Nœuds (avec onde lumineuse quand un paquet arrive)
      for (const n of nodes) {
        if (!reduceMotion) n.pulse += 0.03;
        if (n.pulse < 1.5) {
          const ring = n.r + n.pulse * 10;
          ctx.strokeStyle = `rgba(${accent},${(1 - n.pulse / 1.5) * 0.5})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, ring, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${base},${dark ? 0.85 : 0.6})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion && visible) animationId = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      setup();
      if (reduceMotion) start();
    };

    const handleMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y >= 0 && mouse.y <= rect.height;
    };
    const handleLeave = () => {
      mouse.active = false;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) start();
    });
    observer.observe(canvas);

    // Redessine l'image fixe quand on change de thème (mode animations réduites)
    const themeObserver = new MutationObserver(() => {
      if (reduceMotion) start();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    setup();
    start();
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {/* Grille en perspective qui défile */}
      <div className="tn-hero-grid" />
      {/* Fondu pour garder le texte lisible et raccorder à la section suivante */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, var(--bg) 0%, transparent 70%), linear-gradient(to bottom, transparent 70%, var(--bg) 100%)",
          opacity: 0.85,
        }}
      />
    </div>
  );
};

export default HeroMotionBackground;
