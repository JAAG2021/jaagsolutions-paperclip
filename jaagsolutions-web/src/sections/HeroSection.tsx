import { useState } from "react";
import HeroAutomationHubIllustration from "../components/HeroAutomationHubIllustration.tsx";

const TECH_BADGES = [
  "Make",
  "n8n",
  "OpenAI",
  "Google Workspace",
  "Zapier",
  "WhatsApp API",
];

const HERO_VIDEO_FILENAME = "hero-automation-hub.mp4";

/** Descripción del vídeo / arte del hero (accesibilidad y respaldo SVG). Marco 448×600 (56:75); exporta en esa proporción p. ej. 896×1200. object-cover evita huecos si el mp4 es 9:16. */
const HERO_VISUAL_ALT =
  "Dashboard digital isométrico en 3D: hub luminoso tipo CPU, líneas tipo circuito en cian hasta iconos WhatsApp, correo Gmail, Google y centro estilo IA OpenAI; paneles cristal con gráficas y datos en tiempo real. Estilo B2B azul tecnológico.";

function heroVideoSrc(): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${HERO_VIDEO_FILENAME}`;
}

export default function HeroSection() {
  const [hubVideoFailed, setHubVideoFailed] = useState(false);

  return (
    <section
      id="inicio"
      className="relative bg-brand-900 text-white overflow-hidden lg:min-h-[calc(100svh-4rem)] lg:flex lg:items-center"
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

            <h1 className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 lg:mb-4">
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#calculadora-roi"
                className="inline-flex items-center justify-center gap-2 border border-white/35 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Descubre tu potencial de ahorro
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sin costo inicial
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Respuesta en 24 h
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MVP en 1–4 semanas
              </span>
            </div>
          </div>

          {/* ── Right: marco original 448×600 (más ancho que 360×640); 56:75 = export vídeo 896×1200 etc. ── */}
          <div className="hidden lg:flex animate-fade-in-up-d2 w-full justify-center xl:justify-end min-h-0">
            <div className="relative w-[448px] h-[600px] shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-black shadow-2xl ring-1 ring-white/10">
              {!hubVideoFailed ? (
                <video
                  src={heroVideoSrc()}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={HERO_VISUAL_ALT}
                  onError={() => setHubVideoFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center min-h-0 bg-brand-950/50 p-2">
                  <HeroAutomationHubIllustration
                    aria-hidden
                    className="max-h-full max-w-full w-auto h-auto text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
