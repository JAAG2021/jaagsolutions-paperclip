import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";

const plans = [
  {
    name: "Starter",
    tagline: "Negocios que quieren su primer flujo con cero sorpresas de precio base",
    price: "$399",
    priceLabel: "Desde",
    period: "/ proyecto",
    priceNote: "Con retainer anual · Sin retainer: $499",
    highlight: false,
    color: "border-white/10",
    badge: null,
    features: [
      "1 flujo de automatización",
      "Integración con 2 herramientas",
      "Documentación del proceso",
      "Soporte inicial 30 días",
      "Mantenimiento opcional mensual después del soporte (no obligatorio)",
      "Entrega en 1–2 semanas",
    ],
    missing: [
      "Dashboard de monitoreo",
      "Automatizaciones ilimitadas",
      "Soporte prioritario",
    ],
    examples: [
      { icon: "💬", text: "Lead de WhatsApp → guardado automático en CRM o Google Sheets" },
      { icon: "📄", text: "Formulario web → factura PDF enviada al cliente al instante" },
      { icon: "🔔", text: "Nuevo pedido en tienda → notificación inmediata al equipo por WhatsApp" },
    ],
    cta: "Solicitar diagnóstico",
    ctaStyle: "border border-white/30 text-white hover:bg-white/10",
  },
  {
    name: "Growth",
    tagline: "Equipo en crecimiento que quiere varios flujos coordinados",
    price: "$1.039",
    priceLabel: "Desde",
    period: "/ proyecto (se ajusta al alcance)",
    priceNote: "Con retainer anual · Sin retainer: $1.299",
    highlight: true,
    color: "border-transparent",
    badge: "Mejor valor · Recomendado PYME",
    features: [
      "Hasta 4 flujos de automatización",
      "Integración con herramientas ilimitadas",
      "Dashboard de monitoreo básico",
      "Documentación + capacitación al equipo",
      "Soporte 60 días + plan de handover claro",
      "Mantenimiento evolutivo opcional (retainer) al cerrar fase activa",
      "Entrega en 2–3 semanas",
    ],
    missing: ["SaaS personalizado"],
    examples: [
      { icon: "🌐", text: "Leads de web + WhatsApp + redes → CRM + email de bienvenida + tarea al vendedor" },
      { icon: "💰", text: "Cierre de venta → factura automática + registro contable + notificación al equipo" },
      { icon: "📊", text: "Reporte semanal de ventas e inventario generado y enviado sin intervención humana" },
    ],
    cta: "Hablar con un especialista",
    ctaStyle: "bg-white text-brand-900 hover:bg-blue-50 btn-glow",
  },
  {
    name: "Scale",
    tagline: "Solución completa con SaaS a medida",
    price: "Personalizado",
    priceLabel: "",
    period: "",
    priceNote: "Cotización según alcance y volumen",
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
      "Mantenimiento integral / evolución opcional bajo contrato",
    ],
    missing: [],
    examples: [
      { icon: "🖥️", text: "Portal de clientes con dashboard propio para ver pedidos y proyectos en tiempo real" },
      { icon: "📝", text: "Onboarding automatizado de nuevos clientes con contratos digitales y seguimiento" },
      { icon: "📈", text: "Reportes consolidados que integran ventas, operaciones y finanzas de toda la empresa" },
    ],
    cta: "Cotizar solución",
    ctaStyle: "border border-violet-400/50 text-violet-300 hover:bg-violet-500/10",
  },
];

export default function PricingSection() {
  const { ref, visible } = useScrollReveal();
  const [openExample, setOpenExample] = useState<string | null>(null);

  function toggleExample(planName: string) {
    setOpenExample((prev) => (prev === planName ? null : planName));
  }

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
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-400 bg-brand-800 rounded-full border border-brand-700">
            Planes y precios
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Inversión clara,{" "}
            <span className="gradient-text">resultados medibles</span>
          </h2>
          <p className="text-blue-100/95 max-w-xl mx-auto">
            Sin costos ocultos. Sin contratos largos. Empezamos con un diagnóstico gratuito.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const isOpen = openExample === plan.name;
            return (
              <div
                key={plan.name}
                style={{
                  transitionDelay: `${i * 120}ms`,
                  boxShadow: plan.highlight
                    ? "0 0 60px rgba(37,99,235,0.35), 0 0 0 1px rgba(99,102,241,0.3)"
                    : undefined,
                }}
                className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} relative flex flex-col rounded-2xl border ${plan.color} ${plan.highlight ? "bg-brand-800/80 backdrop-blur-sm animate-gradient-border" : "bg-white/5"} p-7`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 max-w-[min(92vw,16rem)] bg-brand-600 text-white text-[0.65rem] sm:text-xs font-bold px-3 py-1.5 rounded-full text-center leading-snug shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {/* Price block */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-blue-100/95 text-sm mb-4">{plan.tagline}</p>
                  <div className="flex items-end gap-1 flex-wrap">
                    {plan.priceLabel && (
                      <span className="text-sm text-blue-100/70 mb-1.5">{plan.priceLabel}</span>
                    )}
                    <span className="text-3xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-blue-100 text-sm mb-1">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs text-blue-100/50 mt-1.5">{plan.priceNote}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-5 flex-1">
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

                {/* Accordion: ejemplos */}
                <div className="mb-5">
                  <button
                    onClick={() => toggleExample(plan.name)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors w-full"
                    aria-expanded={isOpen}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    {isOpen ? "Ocultar ejemplos de flujos" : "Ver ejemplos de flujos"}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
                  >
                    <ul className="space-y-2.5">
                      {plan.examples.map((ex) => (
                        <li key={ex.text} className="flex items-start gap-2 text-xs text-blue-100/80 bg-white/5 rounded-lg px-3 py-2.5">
                          <span className="text-base leading-none mt-0.5 flex-shrink-0">{ex.icon}</span>
                          <span>{ex.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
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
            );
          })}
        </div>

        <p className={`text-center text-sm text-blue-300/50 mt-10 transition-all duration-700 delay-500 ${visible ? "opacity-100" : "opacity-0"}`}>
          Todos los proyectos incluyen diagnóstico gratuito · Sin contratos de permanencia · Garantía de satisfacción
        </p>
      </div>
    </section>
  );
}
