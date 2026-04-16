import { useScrollReveal } from "../hooks/useScrollReveal.ts";

const plans = [
  {
    name: "Starter",
    tagline: "Para negocios que quieren empezar a automatizar",
    price: "Desde $499",
    period: "/ proyecto",
    highlight: false,
    color: "border-white/10",
    badge: null,
    features: [
      "1 flujo de automatización",
      "Integración con 2 herramientas",
      "Documentación del proceso",
      "Soporte por 30 días",
      "Entrega en 1–2 semanas",
    ],
    missing: [
      "Dashboard de monitoreo",
      "Automatizaciones ilimitadas",
      "Soporte prioritario",
    ],
    cta: "Solicitar diagnóstico",
    ctaStyle: "border border-white/30 text-white hover:bg-white/10",
  },
  {
    name: "Growth",
    tagline: "El paquete más popular para PYMEs en crecimiento",
    price: "Desde $1,299",
    period: "/ proyecto",
    highlight: true,
    color: "border-brand-500",
    badge: "Más popular",
    features: [
      "Hasta 4 flujos de automatización",
      "Integración con herramientas ilimitadas",
      "Dashboard de monitoreo básico",
      "Documentación + capacitación al equipo",
      "Soporte por 60 días",
      "Entrega en 2–3 semanas",
    ],
    missing: [
      "SaaS personalizado",
    ],
    cta: "Hablar con un especialista",
    ctaStyle: "bg-white text-brand-900 hover:bg-blue-50 btn-glow",
  },
  {
    name: "Scale",
    tagline: "Solución completa con SaaS a medida",
    price: "Personalizado",
    period: "",
    highlight: false,
    color: "border-violet-500/40",
    badge: null,
    features: [
      "Automatizaciones ilimitadas",
      "Desarrollo SaaS personalizado",
      "Dashboard avanzado con reportes",
      "Capacitación completa al equipo",
      "Soporte dedicado 6 meses",
      "Entrega en 3–6 semanas",
      "Consultoría estratégica incluida",
    ],
    missing: [],
    cta: "Cotizar solución",
    ctaStyle: "border border-violet-400/50 text-violet-300 hover:bg-violet-500/10",
  },
];

export default function PricingSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="precios"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-brand-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-700 opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-400 bg-brand-800 rounded-full border border-brand-700">
            Planes y precios
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Inversión clara,{" "}
            <span className="gradient-text">resultados medibles</span>
          </h2>
          <p className="text-blue-200/70 max-w-xl mx-auto">
            Sin costos ocultos. Sin contratos largos. Empezamos con un diagnóstico gratuito.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} relative flex flex-col rounded-2xl border ${plan.color} ${plan.highlight ? "bg-brand-800/80 shadow-[0_0_40px_rgba(37,99,235,0.25)]" : "bg-white/5"} p-7 backdrop-blur-sm`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-blue-300/70 text-sm mb-4">{plan.tagline}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-blue-300/60 text-sm mb-1">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-blue-100">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/30">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className={`text-center text-sm text-blue-300/50 mt-10 transition-all duration-700 delay-500 ${visible ? "opacity-100" : "opacity-0"}`}>
          Todos los proyectos incluyen diagnóstico gratuito · Sin contratos de permanencia · Garantía de satisfacción
        </p>
      </div>
    </section>
  );
}
