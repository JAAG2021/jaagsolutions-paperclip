import SectionHeader from "../components/SectionHeader.tsx";
import FaqItem from "../components/FaqItem.tsx";

const faqs = [
  {
    question: "En cuanto tiempo se implementa una solucion?",
    answer: "Depende del alcance, pero un MVP de automatizacion suele estar entre 1 y 4 semanas. Los proyectos SaaS tienen un ciclo mas largo dependiendo del numero de modulos.",
  },
  {
    question: "Pueden trabajar con nuestras herramientas actuales?",
    answer: "Si. Priorizamos integraciones con tu stack para acelerar adopcion y reducir friccion. Evaluamos tu entorno en la sesion de diagnostico.",
  },
  {
    question: "Como se decide entre Automatizacion y SaaS?",
    answer: "Evaluamos tu etapa y objetivo. Normalmente iniciamos con automatizacion de alto impacto y escalamos a SaaS cuando hay validacion de retorno e impacto operativo.",
  },
  {
    question: "Ofrecen soporte despues de la implementacion?",
    answer: "Si. Incluimos acompanamiento, ajustes y evolucion de la solucion segun resultados. El nivel de soporte depende del paquete contratado.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Preguntas frecuentes" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
