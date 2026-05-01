const benefits = [
  {
    icon: "⏱",
    eyebrow: "Operaciones",
    tag: "El ladrón de tiempo",
    before: "Procesos manuales lentos y propensos a errores humanos que frenan tu crecimiento.",
    after: "Flujos autónomos que trabajan 24/7. Tu operación no duerme cuando tú descansas.",
    stat: "−80%",
    statLabel: "carga operativa típica",
    color: "from-red-50/90 to-orange-50/95",
    accentColor: "text-red-600",
    accentBorder: "border-red-100/70",
    glassFoot: true,
  },
  {
    icon: "💸",
    eyebrow: "Costos",
    tag: "La fuga de dinero",
    before: "Pagar nomina cara para trabajo repetitivo que una máquina hace más rápido y sin errores.",
    after: "Escala sin inflar tu nómina en tareas repetitivas. Crece manteniendo rentabilidad.",
    stat: "~60%",
    statLabel: "ahorro efectivo típico en ejecución",
    color: "from-amber-50/90 to-yellow-50/95",
    accentColor: "text-amber-700",
    accentBorder: "border-amber-100/80",
    glassFoot: true,
  },
  {
    icon: "📊",
    eyebrow: "Visibilidad",
    tag: "Vuelo a ciegas",
    before: "Decisiones guiadas por intuición o datos viejos dispersos entre hojas y correos.",
    after: "Métricas en tiempo real. El pulso de tu negocio en el celular cuando lo necesites.",
    stat: "3×",
    statLabel: "claridad de KPIs típica post-implementación",
    color: "from-blue-50/90 to-indigo-50/95",
    accentColor: "text-blue-600",
    accentBorder: "border-blue-100/80",
    glassFoot: true,
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-white rounded-full border border-brand-100 shadow-sm">
            De la fricción al resultado
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Tiempo y dinero de vuelta a{" "}
            <span className="gradient-text">tu negocio</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            El dueño no busca “automatizar” por tecnología — busca horas recuperables y márgenes sanos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {benefits.map((b, i) => (
            <div
              key={b.stat + b.eyebrow}
              className={`card-hover animate-fade-in-up-d${Math.min(i + 1, 4)} rounded-3xl overflow-hidden flex flex-col border border-gray-200/90 bg-white/85 backdrop-blur-sm shadow-[0_8px_30px_-12px_rgba(37,99,235,0.08)]`}
            >
              <div className={`bg-gradient-to-br ${b.color} p-7 pb-5 border-b ${b.accentBorder} relative`}>
                <div className="absolute inset-px rounded-[1.375rem] border border-white/50 pointer-events-none" />

                <div className="flex items-start justify-between gap-2 mb-3 relative">
                  <div>
                    <p className={`text-[0.6875rem] font-bold uppercase tracking-widest ${b.accentColor}`}>{b.eyebrow}</p>
                    <p className="text-sm font-semibold text-gray-800">{b.tag}</p>
                  </div>
                  <div className="text-3xl drop-shadow-sm">{b.icon}</div>
                </div>

                <div className="mb-4 rounded-xl bg-white/65 backdrop-blur-sm border border-white/80 p-4 shadow-inner">
                  <div className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">Antes</div>
                  <p className="text-sm text-gray-700 leading-snug">{b.before}</p>
                </div>

                <div className="flex items-center justify-center my-1 relative">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/80 to-transparent" />
                  <div className="mx-3 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    ↓
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/80 to-transparent" />
                </div>

                <div className="mt-4 rounded-xl bg-emerald-50/95 border border-emerald-100 p-4 shadow-sm relative">
                  <div className="text-[0.65rem] font-bold uppercase tracking-wide text-emerald-600 mb-1">Después</div>
                  <p className="text-sm text-gray-800 leading-snug font-medium">{b.after}</p>
                </div>

                {b.glassFoot && (
                  <div className="mt-5 inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl px-4 py-2 bg-white/70 backdrop-blur-md border border-white/90 shadow-sm">
                    <span className="text-[0.7rem] text-gray-500 font-medium leading-tight">{b.statLabel}</span>
                    <span className="text-3xl font-extrabold text-brand-700 tabular-nums">{b.stat}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
