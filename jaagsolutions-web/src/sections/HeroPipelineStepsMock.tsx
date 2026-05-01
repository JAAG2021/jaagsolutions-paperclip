export const FLOW_DEMO_STEPS = [
  { icon: "📥", label: "Lead", bg: "bg-blue-500/20" },
  { icon: "🤖", label: "IA score", bg: "bg-violet-500/20" },
  { icon: "📅", label: "Agenda", bg: "bg-emerald-500/20" },
  { icon: "✅", label: "CRM", bg: "bg-green-500/20" },
] as const;

export function HeroPipelineStepsMock() {
  return (
    <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
      {FLOW_DEMO_STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 flex-1 min-w-[52px]">
          <div
            className={`${step.bg} rounded-lg p-2 flex flex-col items-center flex-1 border border-white/10 hero-flow-step`}
            style={{ animationDelay: `${i * 0.42}s` }}
          >
            <span className="text-sm">{step.icon}</span>
            <span className="text-xs text-blue-100/85 mt-0.5 font-medium">{step.label}</span>
          </div>
          {i < FLOW_DEMO_STEPS.length - 1 && (
            <span className="text-brand-300/90 text-xs font-bold shrink-0">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
