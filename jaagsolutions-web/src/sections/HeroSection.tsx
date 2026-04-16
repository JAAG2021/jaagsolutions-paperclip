import CTAButton from "../components/CTAButton.tsx";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative bg-brand-900 text-white overflow-hidden"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Blue glow bottom-right */}
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-600 opacity-20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-600/30 border border-brand-500/40 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Automatizacion + SaaS para PYMEs
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Automatiza hoy.{" "}
              <em className="not-italic text-brand-400">
                Lidera mañana.
              </em>
            </h1>

            <p className="text-lg sm:text-xl text-blue-200 mb-10 leading-relaxed max-w-lg">
              Optimizamos los procesos de tu empresa con automatizaciones de flujo y desarrollo SaaS — para que operes mejor hoy y escales con control mañana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <CTAButton
                href="#contacto"
                variant="primary"
                className="bg-white text-brand-900 hover:bg-blue-50 text-base font-bold px-8 py-4 shadow-lg shadow-brand-900/30"
              >
                Solicitar diagnóstico gratis
              </CTAButton>
              <CTAButton
                href="#servicios"
                variant="secondary"
                className="border-white/40 text-white hover:bg-white/10 text-base px-8 py-4"
              >
                Ver servicios →
              </CTAButton>
            </div>

            <p className="text-sm text-blue-300/70 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sin costo · Sin compromiso · Respuesta en 24 h
            </p>
          </div>

          {/* Right — stat cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { value: "1–4 sem", label: "Tiempo de implementación MVP", icon: "⚡" },
              { value: "−60%", label: "Reducción de tareas manuales", icon: "📉" },
              { value: "3 paquetes", label: "Starter · Growth · Scale", icon: "📦" },
              { value: "2 líneas", label: "Automatización + SaaS", icon: "🔗" },
            ].map(({ value, label, icon }) => (
              <div
                key={label}
                className="bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">{value}</div>
                <div className="text-sm text-blue-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
