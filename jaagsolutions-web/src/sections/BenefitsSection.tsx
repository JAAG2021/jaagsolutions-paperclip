const benefits = [
  {
    icon: "⏰",
    before: "Procesos manuales lentos y propensos a errores",
    after: "Flujos automatizados que corren 24/7 sin intervención humana",
    stat: "−80%",
    statLabel: "tiempo operativo",
    color: "from-red-50 to-orange-50",
    accentColor: "text-red-500",
  },
  {
    icon: "💸",
    before: "Costos elevados por trabajo repetitivo y reprocesos",
    after: "Reducción de costos con menos dependencia de tareas manuales",
    stat: "−60%",
    statLabel: "costo por tarea",
    color: "from-yellow-50 to-amber-50",
    accentColor: "text-yellow-600",
  },
  {
    icon: "📊",
    before: "Decisiones basadas en datos dispersos o desactualizados",
    after: "Dashboards en tiempo real con métricas clave centralizadas",
    stat: "3×",
    statLabel: "mejor visibilidad",
    color: "from-blue-50 to-indigo-50",
    accentColor: "text-blue-500",
  },
  {
    icon: "🚀",
    before: "Equipos atrapados en tareas de bajo valor",
    after: "Tu equipo enfocado en crecimiento, innovación y clientes",
    stat: "+40%",
    statLabel: "productividad",
    color: "from-purple-50 to-violet-50",
    accentColor: "text-purple-500",
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Por qué automatizar
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            De la fricción al{" "}
            <span className="gradient-text">resultado medible</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Cada proceso manual es una oportunidad de mejora. Así transformamos las operaciones de nuestros clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={b.stat + i}
              className={`card-hover animate-fade-in-up-d${Math.min(i + 1, 4)} relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm`}
            >
              {/* Stat badge */}
              <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow">
                {b.stat}
              </div>

              <div className={`bg-gradient-to-br ${b.color} p-6 pb-4`}>
                <div className="text-3xl mb-3">{b.icon}</div>

                {/* BEFORE */}
                <div className="mb-4">
                  <div className={`text-xs font-bold uppercase tracking-widest ${b.accentColor} mb-1`}>
                    ✗ Antes
                  </div>
                  <p className="text-sm text-gray-600 leading-snug">{b.before}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center my-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="mx-3 w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    ↓
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* AFTER */}
                <div className="bg-white rounded-xl p-3 border border-green-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
                    ✓ Después
                  </div>
                  <p className="text-sm text-gray-700 leading-snug font-medium">{b.after}</p>
                </div>
              </div>

              <div className="bg-white px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{b.statLabel}</span>
                <span className="text-base font-extrabold text-brand-600">{b.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
