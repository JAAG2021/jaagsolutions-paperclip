import { useEffect, useRef } from "react";

type Props = {
  animationData: object;
  /** Red bloqueada, CSP estricto, o JSON incompatible con el motor. */
  onRuntimeError?: () => void;
};

/**
 * Sin dependencia npm: el motor se carga en runtime desde un ESM público.
 * Vite debe ignorar el import (`@vite-ignore`) para no resolver `lottie-web` en node_modules.
 * Producción con CSP muy estricto: permite `connect-src https://esm.sh` o el mock recupera por `onRuntimeError`.
 */
const LOTTIE_ESM =
  "https://esm.sh/lottie-web@5.12.2?standalone&target=es2022";

type LottieWithLoad = {
  loadAnimation: (opts: {
    container: Element;
    renderer: "svg" | "canvas" | "html";
    loop?: boolean;
    autoplay?: boolean;
    animationData: object;
  }) => { destroy: () => void };
};

async function loadLottieModule(): Promise<LottieWithLoad> {
  const mod = await import(/* @vite-ignore */ LOTTIE_ESM);
  const exported = mod as Record<string, unknown>;
  const lib = (exported.default ?? exported) as LottieWithLoad;
  if (typeof lib?.loadAnimation !== "function") {
    throw new Error("lottie-web: loadAnimation no disponible");
  }
  return lib;
}

/** Chunk cargado en lazy desde `HeroWorkflowMedia`. */
export default function HeroLottiePlayer({ animationData, onRuntimeError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const errorCbRef = useRef(onRuntimeError);
  errorCbRef.current = onRuntimeError;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    let destroyed = false;
    let animation: { destroy: () => void } | undefined;

    void (async () => {
      try {
        el.innerHTML = "";
        const lottie = await loadLottieModule();
        if (destroyed || !hostRef.current) return;
        animation = lottie.loadAnimation({
          container: hostRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData,
        });
      } catch (e) {
        console.warn("[HeroLottiePlayer]", e);
        if (!destroyed) errorCbRef.current?.();
      }
    })();

    return () => {
      destroyed = true;
      animation?.destroy();
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, [animationData]);

  return (
    <div className="flex justify-center overflow-hidden rounded-lg">
      <div
        ref={hostRef}
        className="max-h-[220px] w-full max-w-[min(100%,420px)] [&_svg]:block [&_svg]:mx-auto"
        aria-hidden
      />
    </div>
  );
}
