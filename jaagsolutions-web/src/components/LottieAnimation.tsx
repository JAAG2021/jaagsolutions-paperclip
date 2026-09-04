import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";

const DotLottiePlayer = lazy(() => import("./DotLottiePlayer.tsx"));

function publicAssetUrl(relPath: string): string {
  const base = import.meta.env.BASE_URL;
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  const rel = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  return `${withSlash}${rel}`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

type Props = {
  /** Ruta del `.lottie` dentro de `public` (p. ej. `lottie/automated-workflows.lottie`). */
  src: string;
  /** Descripción para lectores de pantalla; sin ella el canvas queda `aria-hidden`. */
  ariaLabel?: string;
  className?: string;
  /** Id de la state machine del `.lottie` (activa la interactividad por hover). */
  stateMachineId?: string;
  /**
   * Tramo de frames a reproducir en bucle. Sirve para recortar el final muerto
   * de una animación (un fade-out que deja el lienzo vacío, p. ej.) sin alterar
   * su tamaño ni su encuadre.
   */
  segment?: [number, number];
  /**
   * Recorre los estados solo mientras nadie pasa el cursor por encima. Necesario
   * cuando la state machine sólo reacciona al puntero: sin esto se ve congelada,
   * y en móvil (sin hover) no se movería nunca.
   */
  autoCycle?: { inputName: string; values: string[] };
  /** Qué mostrar si el player falla o el visitante pidió menos movimiento. */
  fallback: ReactNode;
};

/**
 * Reproductor de animaciones dotLottie (`.lottie`).
 *
 * El player pesa (JS + ~1,2 MB de WASM), así que se carga en un chunk aparte
 * y sólo cuando la animación entra en viewport — el hero deja de bloquearse
 * y las secciones de abajo no descargan nada hasta que se las mira.
 *
 * Con `prefers-reduced-motion` no se carga el player: se muestra el `fallback`
 * estático directamente.
 */
export default function LottieAnimation({
  src,
  ariaLabel,
  className = "",
  stateMachineId,
  segment,
  autoCycle,
  fallback,
}: Props) {
  const prefersReduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!node || inView) return;

    // `IntersectionObserver` existe en todos los navegadores que soportamos,
    // pero si faltara preferimos mostrar la animación a no mostrar nada.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, inView]);

  const showFallback = prefersReduced || failed;

  return (
    <div ref={setNode} className={className}>
      {showFallback ? (
        fallback
      ) : inView ? (
        <Suspense fallback={fallback}>
          <DotLottiePlayer
            src={publicAssetUrl(src)}
            ariaLabel={ariaLabel}
            stateMachineId={stateMachineId}
            segment={segment}
            autoCycle={autoCycle}
            onError={() => setFailed(true)}
          />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
