import CTAButton from "../components/CTAButton.tsx";

type FlowStep = { icon: string; label: string; color: string };

type UseCase = {
  title: string;
  emoji: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  flow: FlowStep[];
  result: string;
  resultIcon: string;
};

const useCases: UseCase[] = [
  {
    title: "Captación de Leads",
    emoji: "🎯",
    accentClass: "text-blue-600",
    borderClass: "border-blue-200",
    bgClass: "bg-blue-50",
    flow: [
      { icon: "📝", label: "Formulario / Ad", color: "bg-blue-100 text-blue-700" },
      { icon: "🤖", label: "Scoring IA", color: "bg-indigo-100 text-indigo-700" },
      { icon: "📅", label: "Agenda auto", color: "bg-violet-100 text-violet-700" },
      { icon: "👤", label: "CRM actualizado", color: "bg-purple-100 text-purple-700" },
    ],
    result: "+35% tasa de contacto",
    resultIcon: "📈",
  },
  {
    title: "Cotización a Cierre",
    emoji: "💼",
    accentClass: "text-emerald-600",
    borderClass: "border-emerald-200",
    bgClass: "bg-emerald-50",
    flow: [
      { icon: "🔍", label: "Necesidad detectada", color: "bg-emerald-100 text-emerald-700" },
      { icon: "📄", label: "Propuesta auto", color: "bg-teal-100 text-teal-700" },
      { icon: "✅", label: "Aprobación digital", color: "bg-cyan-100 text-cyan-700" },
      { icon: "🎉", label: "Contrato cerrado", color: "bg-green-100 text-green-700" },
    ],
    result: "−50% tiempo de cierre",
    resultIcon: "⚡",
  },
  {
    title: "Cobranza Automatizada",
    emoji: "💰",
    accentClass: "text-orange-600",
    borderClass: "border-orange-200",
    bgClass: "bg-orange-50",
    flow: [
      { icon: "📅", label: "Vencimiento próximo", color: "bg-yellow-100 text-yellow-700" },
      { icon: "📱", label: "Recordatorio WhatsApp", color: "bg-orange-100 text-orange-700" },
      { icon: "🔄", label: "Escalado automático", color: "bg-red-100 text-red-700" },
      { icon: "💳", label: "Pago registrado", color: "bg-green-100 text-green-700" },
    ],
    result: "−40% cartera vencida",
    resultIcon: "💹",
  },
  {
    title: "Mesa de Ayuda",
    emoji: "🛠️",
    accentClass: "text-purple-600",
    borderClass: "border-purple-200",
    bgClass: "bg-purple-50",
    flow: [
      { icon: "📥", label: "Ticket recibido", color: "bg-purple-100 text-purple-700" },
      { icon: "🏷️", label: "Clasificado + prioridad", color: "bg-pink-100 text-pink-700" },
      { icon: "👨‍💻", label: "Asignado al agente", color: "bg-rose-100 text-rose-700" },
      { icon: "⭐", label: "Resuelto + CSAT", color: "bg-green-100 text-green-700" },
    ],
    result: "−55% tiempo resolución",
    resultIcon: "🎯",
  },
];

export default function UseCasesSection() {
  return (
    <section id="casos" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Casos de uso
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Flujos que ya{" "}
            <span className="gradient-text">funcionan en PYMEs</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Así se ve un proceso automatizado en la práctica — desde el disparador hasta el resultado medible.
          </p>
        </div>

        {/* Infographic cards grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {useCases.map((uc, i) => (
            <div
              key={uc.title}
              className={`card-hover animate-fade-in-up-d${Math.min(i + 1, 4)} bg-white rounded-2xl border ${uc.borderClass} shadow-sm overflow-hidden`}
            >
              {/* Card header */}
              <div className={`${uc.bgClass} px-6 py-4 flex items-center gap-3 border-b ${uc.borderClass}`}>
                <span className="text-3xl">{uc.emoji}</span>
                <h3 className={`text-lg font-bold ${uc.accentClass}`}>{uc.title}</h3>
              </div>

              {/* Flow diagram */}
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Flujo del proceso</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {uc.flow.map((step, si) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 ${step.color} min-w-[72px] text-center`}>
                        <span className="text-xl">{step.icon}</span>
                        <span className="text-xs font-semibold leading-tight">{step.label}</span>
                      </div>
                      {si < uc.flow.length - 1 && (
                        <span className="text-gray-300 font-bold text-lg flex-shrink-0">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="mx-6 mb-5 bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">{uc.resultIcon}</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Resultado</p>
                  <p className="text-white font-extrabold text-base">{uc.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Ver el flujo para mi empresa →
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
