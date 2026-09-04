import LottieAnimation from "../components/LottieAnimation.tsx";

const TECH_BADGES = [
  "Make",
  "n8n",
  "OpenAI",
  "Google Workspace",
  "Zapier",
  "WhatsApp API",
];

/** Descripción de la animación del hero (accesibilidad y respaldo SVG). */
const HERO_VISUAL_ALT =
  "Animación de flujos automatizados: tareas que viajan entre aplicaciones conectadas y se resuelven solas.";

/**
 * La animación dura 125 frames, pero su contenido baja de opacidad 100 → 0
 * entre el frame 100 y el 112, y del 112 al 125 el lienzo queda vacío. El bucle
 * corta en 100 —justo antes del fundido— para que el flujo nunca se despinte.
 * Sólo afecta a la duración: ni el tamaño ni el encuadre cambian.
 */
const HERO_FLOW_SEGMENT: [number, number] = [0, 100];

/** Descripción de los nodos interactivos que acompañan al disco. */
const WORKFLOW_NODES_ALT =
  "Nodos de un flujo automatizado: correo, webhook, disparador y plantilla.";

/**
 * Los nombres son los que espera la state machine del `.lottie` (input `Hover`).
 * Sin este recorrido la fila se ve congelada hasta que alguien pasa el cursor
 * —y en móvil, donde no hay hover, no se movería nunca.
 */
const WORKFLOW_NODE_CYCLE = {
  inputName: "Hover",
  values: ["Email", "Webhook", "Trigger", "Templates"],
};

export default function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className="relative bg-brand-900 text-white overflow-hidden lg:flex lg:items-center"
    >
      {/* ── Decorative background ── */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600 opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600 opacity-15 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-500 opacity-10 blur-[100px] pointer-events-none animate-aurora-1" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-500 opacity-10 blur-[90px] pointer-events-none animate-aurora-2" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-8 xl:py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-10 xl:gap-14 items-center">
          {/* ── Left: Copy ── */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-brand-600/25 border border-brand-500/35 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 lg:mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              Automatización + SaaS para PYMEs
            </div>

            <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 lg:mb-4">
              Liberamos a tu equipo de las tareas manuales para que te enfoques en escalar.
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-7 lg:mb-5 leading-relaxed max-w-xl">
              Optimizamos tu PYME con flujos inteligentes y SaaS a medida. Recupera el control del tiempo operativo y reduce costos desde el primer mes — sin cambiar tus herramientas por un “software genérico”.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 lg:mb-5">
              <a
                href="#contacto"
                className="btn-glow inline-flex items-center justify-center gap-2 bg-white text-brand-900 font-bold px-8 py-4 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg"
              >
                Solicitar diagnóstico gratis
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#impacto"
                className="inline-flex items-center justify-center gap-2 border border-white/35 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Descubre tu potencial de ahorro
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </a>
            </div>

            <div className="mb-6 lg:mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-300/70 mb-3">
                Integraciones y stack habitual
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {TECH_BADGES.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-gray-300 grayscale hover:grayscale-0 transition-[filter,color] duration-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-blue-300/60 max-w-lg">
                Trabajamos con las herramientas que ya usas · Sin lock-in mágico
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200/90">
              <span className="flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sin costo inicial
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Respuesta en 24 h
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MVP en 1–4 semanas
              </span>
            </div>
          </div>

          {/* ── Right: dos animaciones dotLottie como un solo bloque — el disco
              del flujo arriba y, debajo, los nodos interactivos. Reemplazan al
              vídeo de 3,2 MB y, a diferencia de él, también se ven en móvil. ── */}
          <div className="animate-fade-in-up-d2 flex w-full flex-col items-center gap-3 sm:gap-4 xl:items-end min-h-0">
            {/* Variante `-nobg`: sin el disco blanco que traía el original, el
                flujo queda directamente sobre el degradado. Se amplía al 132 %
                con el anclaje corrido (61 %/57 % en vez de 50 %/50 %) porque el
                flujo no está centrado en su propio lienzo. */}
            <div className="relative aspect-square w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[560px] xl:max-w-[600px] overflow-hidden">
              <LottieAnimation
                src="lottie/automated-workflows-nobg.lottie"
                segment={HERO_FLOW_SEGMENT}
                ariaLabel={HERO_VISUAL_ALT}
                className="absolute left-[61%] top-[57%] h-[132%] w-[132%] -translate-x-1/2 -translate-y-1/2"
                fallback={
                  // Placeholder neutro a propósito: antes iba acá la ilustración
                  // del hub, y alcanzaba a asomar mientras cargaba el player —
                  // se veía como un resto del arte anterior.
                  <div className="h-full w-full" aria-hidden />
                }
              />
            </div>

            {/* Nodos interactivos: la state machine del `.lottie` reacciona al
                hover sobre cada uno. Se usa la variante `-nobg`, sin la placa
                negra del original, para que floten sobre el degradado. El
                recorte vertical elimina el aire sobrante del lienzo. */}
            <div className="relative aspect-[1080/210] w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[560px] xl:max-w-[600px] overflow-hidden">
              <LottieAnimation
                src="lottie/hover-interaction-nobg.lottie"
                stateMachineId="StateMachine1"
                autoCycle={WORKFLOW_NODE_CYCLE}
                ariaLabel={WORKFLOW_NODES_ALT}
                className="absolute left-0 top-1/2 h-[328%] w-full -translate-y-1/2"
                fallback={<div className="h-full w-full" aria-hidden />}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
