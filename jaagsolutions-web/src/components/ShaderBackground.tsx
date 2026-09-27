import { useEffect, useRef } from "react";

type Blob = {
  /** Posición base, en fracción del tamaño del canvas (0–1). */
  x: number;
  y: number;
  /** Radio, en fracción del lado más largo del canvas. */
  r: number;
  color: string;
  /** Velocidad y fase del recorrido — cada blob dibuja una figura de Lissajous
   * lenta y distinta, para que el conjunto no se sienta repetitivo. */
  speed: number;
  phase: number;
  ampX: number;
  ampY: number;
};

const BLOBS: Blob[] = [
  { x: 0.18, y: 0.28, r: 0.32, color: "37,99,235", speed: 0.05, phase: 0, ampX: 0.10, ampY: 0.07 },
  { x: 0.82, y: 0.68, r: 0.28, color: "124,58,237", speed: 0.045, phase: 2.1, ampX: 0.08, ampY: 0.09 },
  { x: 0.62, y: 0.22, r: 0.22, color: "59,130,246", speed: 0.06, phase: 4.2, ampX: 0.07, ampY: 0.06 },
  { x: 0.30, y: 0.78, r: 0.20, color: "139,92,246", speed: 0.055, phase: 1.4, ampX: 0.06, ampY: 0.08 },
];

/**
 * Fondo animado tipo shader para el hero: un canvas 2D con manchas de color
 * que se desplazan lento en trayectorias de Lissajous, dibujadas con
 * gradientes radiales (no WebGL — no hace falta para este efecto, y así no
 * suma una librería). Reemplaza los 4 blobs CSS estáticos/aurora anteriores.
 *
 * Respeta `prefers-reduced-motion` (no monta nada, el degradado de fondo del
 * hero ya es suficiente) y se pausa cuando la pestaña no está visible.
 */
export default function ShaderBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    const start = performance.now();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas!.width = width;
      canvas!.height = height;
    }

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;

      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (const b of BLOBS) {
        const cx = (b.x + Math.sin(t * b.speed + b.phase) * b.ampX) * width;
        const cy = (b.y + Math.cos(t * b.speed * 0.8 + b.phase) * b.ampY) * height;
        const radius = b.r * Math.max(width, height);
        const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(${b.color},0.35)`);
        gradient.addColorStop(1, `rgba(${b.color},0)`);
        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, width, height);
      }
    }

    resize();
    raf = requestAnimationFrame(draw);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full blur-3xl ${className}`}
    />
  );
}
