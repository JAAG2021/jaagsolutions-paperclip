import { lazy, Suspense, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import HeroFlowVisual from "../components/HeroFlowVisual.tsx";
import ShaderBackground from "../components/ShaderBackground.tsx";
import { motionTokens, springs } from "../lib/motion-tokens.ts";

/** `three` pesa ~190 KB comprimidos — en su propio chunk, cargado solo si el
 * navegador soporta WebGL, para no inflar el bundle inicial que baja todo el
 * mundo (igual que el reproductor Lottie que reemplazó, ver `HeroFlowVisual`). */
const HeroKnowledgeGraph = lazy(() => import("../components/HeroKnowledgeGraph.tsx"));

const TECH_BADGES = [
  "Make",
  "n8n",
  "OpenAI",
  "Google Workspace",
  "Zapier",
  "WhatsApp API",
];

/** El grafo 3D necesita un contexto WebGL real; si el navegador no lo da
 * (flags deshabilitadas, hardware muy viejo), se cae al diagrama en SVG en
 * vez de dejar el hero con un hueco vacío. */
function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Mientras se descarga el chunk de `three`: una caja neutra, no el diagrama
 * en SVG — mostrar `HeroFlowVisual` ahí alcanzaba a leerse como "la animación
 * vieja" apareciendo antes que la esfera en cada recarga. */
function HeroVisualSkeleton() {
  return (
    <div
      role="img"
      aria-label="Cargando animación"
      className="h-full w-full animate-pulse motion-reduce:animate-none rounded-2xl border border-white/10 bg-white/[0.03]"
    />
  );
}

export default function HeroSection() {
  const reduce = useReducedMotion();
  const [webglOk] = useState(supportsWebGL);
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : motionTokens.distance.lg },
    animate: { opacity: 1, y: 0 },
    transition: { ...springs.gentle, delay: reduce ? 0 : delay },
  });

  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className="relative bg-brand-900 text-white overflow-hidden lg:flex lg:items-center"
    >
      {/* ── Decorative background ── */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
      <ShaderBackground className="opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-8 xl:py-10">
        {/*
          En desktop sigue siendo un grid de 2 columnas (copy | animación).
          En móvil se reordena a 3 bloques — intro, animación, meta — para que
          el diagrama entre en el primer scroll en vez de quedar tras todo el
          texto: `lg:col-start`/`lg:row-start` fijan la posición de escritorio
          sin depender del orden en el DOM, que es el que manda en móvil.
        */}
        <div className="grid gap-8 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:gap-10 xl:gap-14 lg:items-start">
          {/* ── Intro: badge + titular + CTAs ── */}
          <motion.div className="lg:col-start-1 lg:row-start-1" {...enter(0)}>
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
          </motion.div>

          {/* ── Animación: grafo 3D en WebGL (inspirado en graphify.net) con
              los 4 casos de uso reales como nodos, conectados al stack de
              herramientas — en vez del Lottie de stock que tenía etiquetas
              de otro rubro. Si el navegador no da WebGL, cae al diagrama en
              SVG (`HeroFlowVisual`) en vez de dejar el hueco vacío. Va en
              medio del copy en móvil y a la derecha en desktop, ocupando las
              dos filas. ── */}
          <motion.div
            className="viewfinder relative flex w-full flex-col items-center justify-center min-h-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center"
            {...enter(0.12)}
          >
            <span className="vf-bl" aria-hidden="true" />
            <span className="vf-br" aria-hidden="true" />
            {/* Alto fijo por breakpoint (no `aspect-square`) en el
                contenedor, no en cada visual: así ni el que cargue (grafo 3D
                o el respaldo en SVG) provoca un salto de layout al
                reemplazar al otro, ni un cambio de ancho en tiempo de
                ejecución (p. ej. la barra de scroll apareciendo) recalcula
                el alto — `aspect-square` sí lo hacía y terminaba causando el
                mismo salto (CLS) que se quería evitar. */}
            <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[440px] xl:max-w-[480px] h-[420px] sm:h-[480px] lg:h-[440px] xl:h-[480px]">
              {webglOk ? (
                <Suspense fallback={<HeroVisualSkeleton />}>
                  <HeroKnowledgeGraph className="h-full" />
                </Suspense>
              ) : (
                <HeroFlowVisual className="h-full overflow-y-auto" />
              )}
            </div>
          </motion.div>

          {/* ── Meta: stack de integraciones + checklist de confianza ── */}
          <motion.div className="lg:col-start-1 lg:row-start-2" {...enter(0.24)}>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
