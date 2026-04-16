import SectionHeader from "../components/SectionHeader.tsx";
import FaqItem from "../components/FaqItem.tsx";

const faqs = [
  {
    question: "¿En cuánto tiempo se implementa una solución?",
    answer:
      "Depende del alcance, pero un MVP de automatización suele estar entre 1 y 4 semanas. Los proyectos SaaS tienen un ciclo más largo dependiendo del número de módulos.",
  },
  {
    question: "¿Pueden trabajar con nuestras herramientas actuales?",
    answer:
      "Sí. Priorizamos integraciones con tu stack para acelerar adopción y reducir fricción. Evaluamos tu entorno en la sesión de diagnóstico.",
  },
  {
    question: "¿Cómo se decide entre Automatización y SaaS?",
    answer:
      "Evaluamos tu etapa y objetivo. Normalmente iniciamos con automatización de alto impacto y escalamos a SaaS cuando hay validación de retorno e impacto operativo.",
  },
  {
    question: "¿Ofrecen soporte después de la implementación?",
    answer:
      "Sí. Incluimos acompañamiento, ajustes y evolución de la solución según resultados. El nivel de soporte depende del paquete contratado.",
  },
  {
    question: "¿Necesito conocimientos técnicos para usar las automatizaciones?",
    answer:
      "No. Entregamos documentación clara y capacitamos al equipo operativo para que puedan gestionar, monitorear y ajustar los flujos de forma autónoma.",
  },
  {
    question: "¿Qué pasa si el proceso cambia después de la implementación?",
    answer:
      "Incluimos ajustes durante el período de soporte. Los flujos están diseñados para ser modificables sin reescribir desde cero, por lo que los cambios menores suelen resolverse en horas.",
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
