import { useState } from "react";
import { trackEvent } from "../hooks/analytics.ts";
import CaligraphaWordmark from "./CaligraphaWordmark.tsx";

const STORAGE_KEY = "cg-launch-bar-v1";
const CALIGRAPHA_URL =
  "https://www.caligrapha.com/?utm_source=jaagsolutions&utm_medium=announcement_bar&utm_campaign=caligrapha_launch";

/** Lee el estado de cierre sin provocar parpadeo (SPA sin SSR). */
function initialDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Barra de lanzamiento de Caligrapha. Se muestra encima del `TopNav`, hace
 * scroll con la página (el nav queda fijo debajo) y se puede cerrar; el cierre
 * se recuerda en `localStorage`.
 */
export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(initialDismissed);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* almacenamiento no disponible: se cierra solo por esta sesión */
    }
  }

  return (
    <div
      role="region"
      aria-label="Anuncio"
      className="relative bg-gradient-to-r from-caligrapha-gold via-caligrapha-gold-light to-caligrapha-gold text-caligrapha-ink border-b border-black/10"
    >
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 pr-10 sm:px-6 sm:py-3 lg:px-8">
        <p className="flex flex-1 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-sm leading-snug">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-caligrapha-ink px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-widest text-white">
              Nuevo
            </span>
            <CaligraphaWordmark
              className="text-base"
              sparkleClassName="text-caligrapha-ink"
            />
          </span>
          <span className="hidden text-caligrapha-ink/75 sm:inline">
            — nuestro primer producto SaaS, ya disponible para todo público.
          </span>
          <a
            href={CALIGRAPHA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("caligrapha_cta_click", { location: "announcement_bar" })
            }
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-caligrapha-ink px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-caligrapha-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caligrapha-ink/40"
          >
            Crear pack gratis
            <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar anuncio"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-caligrapha-ink/55 transition-colors hover:bg-black/10 hover:text-caligrapha-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caligrapha-ink/40"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
