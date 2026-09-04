import { useEffect, useRef, useState } from "react";
import { DotLottieReact, setWasmUrl, type DotLottie } from "@lottiefiles/dotlottie-react";

/**
 * El player descarga su WASM de jsdelivr/unpkg por defecto. Lo servimos desde
 * nuestro propio dominio (`public/lottie/`) para no depender de un CDN externo
 * en runtime — si jsdelivr cae, la animación seguiría funcionando.
 */
const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
setWasmUrl(`${base}lottie/dotlottie-player.wasm`);

/** Cada cuánto salta al siguiente nodo cuando nadie está usando el cursor. */
const AUTO_CYCLE_MS = 1800;

type Props = {
  src: string;
  ariaLabel?: string;
  stateMachineId?: string;
  /** Tramo de frames a reproducir en bucle, para recortar colas muertas. */
  segment?: [number, number];
  /**
   * Valores que se le van pasando al input de la state machine para recorrer
   * los nodos solos. El hover del visitante tiene prioridad: mientras el cursor
   * está encima, el recorrido automático se detiene.
   */
  autoCycle?: { inputName: string; values: string[]; idleEvent?: string };
  onError: () => void;
};

/**
 * Envoltorio fino sobre `DotLottieReact`. Se importa siempre de forma lazy
 * (ver `LottieAnimation`) para que el player quede fuera del bundle inicial.
 */
export default function DotLottiePlayer({
  src,
  ariaLabel,
  stateMachineId,
  segment,
  autoCycle,
  onError,
}: Props) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const hovering = useRef(false);

  useEffect(() => {
    if (!dotLottie) return;

    const onLoadError = () => onError();
    dotLottie.addEventListener("loadError", onLoadError);

    if (!stateMachineId) {
      return () => dotLottie.removeEventListener("loadError", onLoadError);
    }

    // La state machine trae sus propios listeners de puntero (PointerEnter por
    // nodo), así que sólo hay que arrancarla una vez cargada la animación.
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      dotLottie.stateMachineLoad(stateMachineId);
      dotLottie.stateMachineStart();

      // Sin esto la animación se queda quieta: el estado `Idle` no tiene
      // movimiento propio y sólo reacciona al puntero, así que en móvil (donde
      // no hay hover) nunca pasaría nada.
      if (!autoCycle) return;
      let i = 0;
      timer = setInterval(() => {
        if (hovering.current) return;
        dotLottie.stateMachineSetStringInput(autoCycle.inputName, autoCycle.values[i]);
        i = (i + 1) % autoCycle.values.length;
      }, AUTO_CYCLE_MS);
    };

    if (dotLottie.isLoaded) start();
    else dotLottie.addEventListener("load", start);

    return () => {
      if (timer) clearInterval(timer);
      dotLottie.removeEventListener("load", start);
      dotLottie.removeEventListener("loadError", onLoadError);
    };
  }, [dotLottie, stateMachineId, autoCycle, onError]);

  return (
    <DotLottieReact
      src={src}
      className="h-full w-full"
      autoplay
      loop
      segment={segment}
      dotLottieRefCallback={setDotLottie}
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : undefined}
    />
  );
}
