import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

export default function ComparisonSection() {
  return (
    <section id="comparativa" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="No compiten entre si: se complementan"
          subtitle="Cada solucion tiene su momento ideal. La clave esta en elegir la ruta correcta segun tu etapa."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Automatizacion */}
          <div className="bg-white rounded-2xl border border-blue-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Automatizacion</h3>
            </div>
            <p className="text-gray-600 mb-5">
              Ideal para resolver cuellos de botella puntuales con impacto rapido y menor inversion inicial.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Rapida implementacion (1-4 semanas)", "Impacto puntual y medible", "Menor inversion inicial", "Ideal cuando hay un dolor claro e inmediato"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-brand-600 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* SaaS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">SaaS</h3>
            </div>
            <p className="text-gray-600 mb-5">
              Ideal para estandarizar, escalar y gobernar procesos de forma integral en el largo plazo.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Plataforma integral para un area de negocio", "Escalabilidad con usuarios y roles", "Mayor control y trazabilidad", "Ideal cuando el proceso ya esta validado"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ruta recomendada */}
        <div className="bg-brand-700 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-blue-200 mb-1">Ruta recomendada JAAGSOLUTIONS</p>
            <div className="flex items-center gap-3 text-lg font-bold flex-wrap">
              <span>Automatizacion</span>
              <span className="text-blue-300">→</span>
              <span>Medicion</span>
              <span className="text-blue-300">→</span>
              <span>Escalado SaaS</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Solicitar diagnostico
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
