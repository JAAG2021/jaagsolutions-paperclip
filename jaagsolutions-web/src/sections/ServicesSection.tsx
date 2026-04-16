import CTAButton from "../components/CTAButton.tsx";

const pillarA = [
  { icon: "🎯", text: "Captación, calificación y seguimiento de leads" },
  { icon: "📄", text: "Cotización, aprobación y cierre comercial" },
  { icon: "🎫", text: "Tickets de soporte y SLA" },
  { icon: "📑", text: "Automatización documental (facturas, contratos)" },
  { icon: "💳", text: "Cobranza automatizada y alertas de cartera" },
];

const pillarB = [
  { icon: "📊", text: "SaaS comercial (pipeline, seguimiento, reportes)" },
  { icon: "⚙️", text: "SaaS operativo (tareas, aprobaciones, flujos)" },
  { icon: "🛠️", text: "SaaS de soporte (tickets, base de conocimiento)" },
  { icon: "💰", text: "SaaS financiero ligero (facturación, cobranza)" },
  { icon: "🧩", text: "Módulos a medida según proceso y madurez" },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Servicios
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Automatización + SaaS:{" "}
            <span className="gradient-text">dos líneas, un objetivo</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Se complementan según la etapa y madurez de tu empresa. Empezamos donde más duele y escalamos con control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Pilar A — Automatización */}
          <div className="card-hover animate-fade-in-up-d1 bg-brand-900 text-white rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-dot-pattern px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-lg">⚡</div>
                <span className="text-sm font-bold text-brand-200 uppercase tracking-widest">Línea A</span>
              </div>
              <h3 className="text-2xl font-extrabold mb-2">Automatización de Procesos</h3>
              <p className="text-brand-200 text-sm leading-relaxed">
                Implementamos flujos que eliminan fricción, aceleran operaciones y reducen errores humanos.
              </p>
            </div>
            <ul className="px-8 py-6 space-y-3">
              {pillarA.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-sm text-blue-100 leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pilar B — SaaS */}
          <div className="card-hover animate-fade-in-up-d2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg">🖥️</div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Línea B</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Desarrollo SaaS para PYMEs</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Construimos plataformas SaaS para gobernar áreas clave del negocio con trazabilidad y escalabilidad.
              </p>
            </div>
            <ul className="px-8 py-6 space-y-3">
              {pillarB.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-sm text-gray-600 leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Hablar con un especialista →
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
