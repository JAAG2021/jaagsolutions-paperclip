import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const pillarA = [
  "Captacion, calificacion y seguimiento de leads",
  "Cotizacion, aprobacion y cierre comercial",
  "Tickets de soporte y SLA",
  "Automatizacion documental (facturas, contratos, formularios)",
  "Cobranza automatizada y alertas de cartera",
];

const pillarB = [
  "SaaS comercial (pipeline, seguimiento, reportes)",
  "SaaS operativo (tareas, aprobaciones, flujos internos)",
  "SaaS de soporte (tickets, base de conocimiento, tiempos)",
  "SaaS financiero ligero (facturacion, cobranza, dashboard)",
  "Modulos a medida segun proceso y madurez del cliente",
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Servicios para crecer con orden: Automatizacion + SaaS"
          subtitle="Dos lineas de servicio integradas que se complementan segun la etapa y objetivo de tu empresa."
        />
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Pilar A */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Automatizacion de flujos
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Automatizacion de Procesos</h3>
            <p className="text-gray-600 mb-6">
              Disenamos e implementamos automatizaciones de alto impacto para optimizar procesos puntuales o transversales.
            </p>
            <ul className="space-y-3">
              {pillarA.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pilar B */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 bg-gray-800 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
              Desarrollo SaaS
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">SaaS para PYMEs</h3>
            <p className="text-gray-600 mb-6">
              Construimos plataformas SaaS para operar areas clave del negocio con trazabilidad, control y escalabilidad.
            </p>
            <ul className="space-y-3">
              {pillarB.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Hablar con un especialista
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
