import { Search, Code2, Rocket } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";

const steps = [
  {
    number: "01",
    Icon: Search,
    title: "Analizamos",
    text: "Entendemos tu operación, detectamos cuellos de botella y priorizamos procesos de alto impacto.",
    tags: ["Entrevistas", "Mapeo de flujos", "Diagnóstico"],
    color: "from-brand-600 to-brand-700",
  },
  {
    number: "02",
    Icon: Code2,
    title: "Implementamos",
    text: "Diseñamos y desplegamos la solución adaptada a tus herramientas, con foco en adopción real.",
    tags: ["Prototipo rápido", "Integración", "QA"],
    color: "from-violet-600 to-purple-700",
  },
  {
    number: "03",
    Icon: Rocket,
    title: "Optimizamos",
    text: "Medimos resultados, ajustamos flujos y acompañamos la mejora continua con métricas claras.",
    tags: ["KPIs", "Iteraciones", "Soporte"],
    color: "from-emerald-500 to-teal-600",
  },
];

export default function ProcessSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="proceso"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-14 sm:py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Nuestro método
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Simple, ágil y{" "}
            <span className="gradient-text">orientado a resultados</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Tres pasos que llevamos a la práctica en cada proyecto, sin importar el tamaño de tu empresa.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Animated connector line (desktop) */}
          <div
            className={`hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-brand-200 via-violet-200 to-emerald-200 z-0 ${visible ? "animate-connector" : "scale-x-0"}`}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}
            >
              {/* Colored top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${step.color}`} />

              <div className="p-7">
                {/* Icon badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                    <step.Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-300 tracking-widest">{step.number}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm mb-5">{step.text}</p>

                <div className="flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
