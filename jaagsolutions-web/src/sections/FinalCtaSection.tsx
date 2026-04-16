import CTAButton from "../components/CTAButton.tsx";

export default function FinalCtaSection() {
  return (
    <section className="py-20 bg-brand-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Convierte procesos manuales en crecimiento sostenible.
        </h2>
        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
          JAAGSOLUTIONS combina estrategia, automatizacion y desarrollo SaaS para ayudarte a operar mejor hoy y escalar con control manana.
        </p>
        <CTAButton
          href="#contacto"
          variant="primary"
          className="bg-white text-brand-700 hover:bg-gray-100 text-base px-10 py-4"
        >
          Hablar con un especialista
        </CTAButton>
      </div>
    </section>
  );
}
