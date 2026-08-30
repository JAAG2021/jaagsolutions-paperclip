import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";
import { trackEvent } from "../hooks/analytics.ts";
import CaligraphaWordmark from "../components/CaligraphaWordmark.tsx";

const CALIGRAPHA_URL =
  "https://www.caligrapha.com/?utm_source=jaagsolutions&utm_medium=product_section&utm_campaign=caligrapha_launch";

const STEPS = [
  { label: "Elige", desc: "Marca, objetivo y red social" },
  { label: "Ajusta", desc: "Luz, encuadre y estilo visual" },
  { label: "Genera", desc: "6 imágenes listas para publicar" },
];

const CHIPS = ["6 imágenes por pack", "9 industrias", "Sin marca de agua", "Sin tarjeta"];

const PACK_IMAGES = [4, 1, 5, 2, 3, 6]; // orden elegido por equilibrio visual

function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path}`;
}

const ArrowRight = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default function CaligraphaSection() {
  const { ref, visible } = useScrollReveal();
  const [imagesFailed, setImagesFailed] = useState(false);

  return (
    <section
      id="caligrapha"
      aria-labelledby="caligrapha-heading"
      className="relative overflow-hidden bg-brand-900 py-14 text-white sm:py-16"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-caligrapha-gold opacity-[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-violet-600 opacity-15 blur-[110px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-caligrapha-gold/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Copy ── */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-caligrapha-gold/30 bg-caligrapha-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-caligrapha-gold-light">
              <CaligraphaWordmark markOnly className="text-[0.8rem]" />
              Nuevo · Nuestro primer producto SaaS
            </span>

            <h2
              id="caligrapha-heading"
              className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-[2.75rem]"
            >
              Caligrapha: tu equipo creativo,{" "}
              <span className="font-caligrapha text-caligrapha-gold-light">
                automatizado
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100/90">
              Genera packs de contenido de marca listos para publicar, en minutos.
              Sin diseñador, sin marca de agua — formateado para cada red social.
            </p>

            {/* Pasos */}
            <ol className="mt-8 grid gap-3 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li
                  key={step.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-caligrapha-gold/20 text-sm font-bold text-caligrapha-gold-light ring-1 ring-inset ring-caligrapha-gold/30">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-1 text-xs leading-snug text-blue-100/70">{step.desc}</p>
                </li>
              ))}
            </ol>

            {/* Chips */}
            <ul className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-gray-300"
                >
                  {chip}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={CALIGRAPHA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("caligrapha_cta_click", {
                    location: "product_section",
                    variant: "primary",
                  })
                }
                className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-lg transition-colors hover:bg-blue-50"
              >
                Probar Caligrapha gratis
                <ArrowRight />
              </a>
              <a
                href={`${CALIGRAPHA_URL}#como-funciona`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("caligrapha_cta_click", {
                    location: "product_section",
                    variant: "secondary",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Ver cómo funciona
              </a>
            </div>

            {/* Puente con la agencia */}
            <p className="mt-8 max-w-xl border-l-2 border-caligrapha-gold/40 pl-4 text-sm leading-relaxed text-blue-100/70">
              Caligrapha nació dentro de JAAGSOLUTIONS. Es la prueba de lo que
              construimos en la{" "}
              <a
                href="#servicios"
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                Línea B
              </a>{" "}
              — SaaS real, en producción, para PYMEs.
            </p>
          </div>

          {/* ── Visual: ventana de producto con un pack real ── */}
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className={`transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-caligrapha-gold/20 bg-caligrapha-ink shadow-2xl ring-1 ring-white/10">
              {/* Chrome */}
              <div className="flex h-9 items-center gap-1.5 border-b border-white/10 bg-black/40 px-4">
                {["#ff5f57", "#ffbd2e", "#28ca42"].map((c) => (
                  <span
                    key={c}
                    className="h-2.5 w-2.5 rounded-full opacity-70"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <span className="ml-3 truncate text-[0.6875rem] text-white/40">
                  caligrapha.com
                </span>
              </div>

              {/* Cuerpo */}
              <div className="bg-[#0f0e0c] p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <CaligraphaWordmark className="text-xs text-white/90" />
                  <span className="font-mono text-[0.625rem] uppercase tracking-widest text-caligrapha-gold/80">
                    Pack generado
                  </span>
                </div>

                {imagesFailed ? (
                  <div
                    role="img"
                    aria-label="Vista previa de un pack de 6 imágenes generado con Caligrapha"
                    className="grid grid-cols-3 gap-2"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex aspect-[4/5] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-caligrapha-gold/40"
                      >
                        <CaligraphaWordmark markOnly className="text-base" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    role="img"
                    aria-label="Ejemplos de imágenes generadas con Caligrapha para distintos rubros: automotriz, gastronomía, fitness, e-commerce y servicios"
                    className="grid grid-cols-3 gap-2"
                  >
                    {PACK_IMAGES.map((n) => (
                      <div
                        key={n}
                        className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                      >
                        <img
                          src={assetUrl(`caligrapha/pack-${n}.webp`)}
                          alt=""
                          width={256}
                          height={320}
                          loading="lazy"
                          decoding="async"
                          onError={() => setImagesFailed(true)}
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[0.6875rem] text-white/45">
                  <span>6 imágenes · listas para publicar</span>
                  <span>sin marca de agua</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
