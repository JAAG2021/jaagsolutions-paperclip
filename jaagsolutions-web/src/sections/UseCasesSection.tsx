import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const useCases = [
  {
    title: "Captacion y seguimiento de leads",
    problem: "Se pierden oportunidades por falta de seguimiento oportuno.",
    solution: "Flujo automatico de captacion, scoring, asignacion y agenda.",
    result: "Mayor tasa de contacto y reuniones efectivas.",
  },
  {
    title: "Cotizacion a cierre",
    problem: "Las propuestas tardan y cae la conversion.",
    solution: "Generacion semiautomatica de propuestas y seguimiento de etapas.",
    result: "Menor tiempo de respuesta y mayor cierre.",
  },
  {
    title: "Cuentas por cobrar",
    problem: "Cartera vencida y gestion manual ineficiente.",
    solution: "Recordatorios, escalamiento y tablero de cobranza.",
    result: "Mejor flujo de caja y menor morosidad.",
  },
  {
    title: "Mesa de ayuda y soporte",
    problem: "Solicitudes dispersas sin trazabilidad.",
    solution: "Ticketing centralizado, prioridades y SLA por tipo de caso.",
    result: "Mejor experiencia y menor tiempo de resolucion.",
  },
];

export default function UseCasesSection() {
  return (
    <section id="casos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Casos de uso frecuentes en PYMEs"
          subtitle="Soluciones concretas para los problemas mas comunes en operaciones empresariales."
        />
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {useCases.map((uc) => (
            <div key={uc.title} className="bg-gray-50 rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{uc.title}</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Problema</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.problem}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Solucion</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.solution}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Resultado esperado</span>
                  <p className="text-sm text-gray-700 mt-1">{uc.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <CTAButton href="#contacto" variant="secondary">
            Ver flujos para mi empresa
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
