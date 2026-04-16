import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

const steps = [
  {
    number: "01",
    title: "Analizamos",
    text: "Entendemos tu operacion y detectamos oportunidades de alto impacto con criterios de negocio.",
  },
  {
    number: "02",
    title: "Implementamos",
    text: "Disenamos y desplegamos soluciones adaptadas a tus procesos, con foco en uso real y adopcion.",
  },
  {
    number: "03",
    title: "Optimizamos",
    text: "Medimos resultados, ajustamos flujos y acompanamos mejoras continuas.",
  },
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Nuestro metodo en 3 pasos" />
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-600 text-white text-xl font-extrabold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <CTAButton href="#contacto" variant="secondary">
            Conocer nuestro metodo
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
