import { CheckCircle2, X, Minus } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";
import FaqItem from "../components/FaqItem.tsx";

/**
 * "Antes de decidir": fusiona la Comparativa y las Preguntas frecuentes —
 * ambas manejaban objeciones y eran contiguas — en una sola sección.
 */

type CellValue = "yes" | "no" | "partial";

const features: { label: string; jaagsolutions: CellValue; solo: CellValue; agency: CellValue }[] = [
  { label: "Implementación < 4 semanas", jaagsolutions: "yes", solo: "no", agency: "no" },
  { label: "Precio accesible para PYME", jaagsolutions: "yes", solo: "partial", agency: "no" },
  { label: "Soporte post-entrega con plan de mantenimiento / evolución claro", jaagsolutions: "yes", solo: "no", agency: "partial" },
  { label: "Capacitación al equipo", jaagsolutions: "yes", solo: "no", agency: "partial" },
  { label: "Automatización + SaaS integrado", jaagsolutions: "yes", solo: "no", agency: "no" },
  { label: "Sin contrato de permanencia", jaagsolutions: "yes", solo: "yes", agency: "no" },
  { label: "Diagnóstico gratuito", jaagsolutions: "yes", solo: "no", agency: "no" },
];

const faqs = [
  {
    question: "¿Cuánto cuesta un proyecto?",
    answer:
      "El precio depende del alcance, que definimos juntos en el diagnóstico gratuito. Sin costos ocultos, sin contratos de permanencia y con propuesta cerrada antes de empezar.",
  },
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

function Cell({ value }: { value: CellValue }) {
  if (value === "yes") return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === "no") return <X className="w-5 h-5 text-red-400/60 mx-auto" />;
  return <Minus className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export default function ObjectionsSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="preguntas"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-14 sm:py-16 bg-gray-50 border-t border-gray-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Antes de decidir
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Compara opciones y resuelve tus{" "}
            <span className="gradient-text">dudas</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cómo se compara JAAGSOLUTIONS con las alternativas — y las preguntas que más nos hacen.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Columna izquierda: comparativa */}
        <div>
        {/* Tabla comparativa */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full border-collapse min-w-[30rem]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 bg-gray-50 w-1/2">Característica</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-white bg-brand-900 w-[calc(50%/3)]">JAAGSOLUTIONS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">Hacerlo solo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">Agencia grande</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {features.map((f, i) => (
                <tr key={f.label} className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{f.label}</td>
                  <td className="px-4 py-3 bg-brand-50/40"><Cell value={f.jaagsolutions} /></td>
                  <td className="px-4 py-3"><Cell value={f.solo} /></td>
                  <td className="px-4 py-3"><Cell value={f.agency} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Incluido</span>
          <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-yellow-500" /> Parcial</span>
          <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-400/60" /> No disponible</span>
        </div>

        <div className="bg-brand-700 text-white rounded-2xl p-5 mt-6">
          <p className="text-sm font-medium text-blue-200 mb-1">Ruta recomendada JAAGSOLUTIONS</p>
          <div className="flex items-center gap-2.5 text-base font-bold flex-wrap">
            <span>Automatización</span>
            <span className="text-blue-300">→</span>
            <span>Medición</span>
            <span className="text-blue-300">→</span>
            <span>Escalado SaaS</span>
          </div>
        </div>
        </div>

        {/* Columna derecha: FAQ */}
        <div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 lg:mt-0">Preguntas frecuentes</h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
