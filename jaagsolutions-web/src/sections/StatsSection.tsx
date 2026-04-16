const stats = [
  { value: "1–4", unit: "sem", label: "de implementación MVP", icon: "⚡" },
  { value: "−60", unit: "%", label: "reducción de tareas manuales", icon: "📉" },
  { value: "24/7", unit: "", label: "operación sin intervención", icon: "🤖" },
  { value: "+40", unit: "%", label: "productividad del equipo", icon: "🚀" },
];

export default function StatsSection() {
  return (
    <div className="bg-brand-900 border-y border-brand-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-700/50 divide-y lg:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 px-6 py-6">
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div>
                <div className="text-2xl font-extrabold text-white leading-none">
                  {s.value}
                  <span className="text-brand-400 text-xl">{s.unit}</span>
                </div>
                <div className="text-xs text-blue-300/70 mt-1 leading-tight">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
