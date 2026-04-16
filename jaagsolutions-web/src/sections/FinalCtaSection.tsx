import { Zap, Target, ShieldCheck } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="relative py-28 bg-brand-900 text-white overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600 opacity-20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600 opacity-15 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          ¿Listo para automatizar?
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Convierte fricción en{" "}
          <span className="gradient-text">crecimiento sostenible.</span>
        </h2>

        <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
          Combinamos estrategia, automatización y SaaS para que operes mejor hoy — y escales con control mañana.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#contacto"
            className="btn-glow inline-flex items-center justify-center gap-2 bg-white text-brand-900 font-bold px-10 py-4 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-xl"
          >
            Hablar con un especialista
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#casos"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-colors"
          >
            Ver casos de uso
          </a>
        </div>

        {/* Mini trust row — Lucide icons */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-300/70">
          {[
            { Icon: Zap, text: "MVP en 1–4 semanas" },
            { Icon: Target, text: "Diagnóstico sin costo" },
            { Icon: ShieldCheck, text: "Sin compromiso" },
          ].map(({ Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-400" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
