import { Zap, TrendingDown, Bot, TrendingUp } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp.ts";

function AnimatedStat({
  target,
  prefix = "",
  suffix = "",
  label,
  icon: Icon,
  iconColor,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  const { ref, count } = useCountUp(target);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex items-center gap-4 px-6 py-6"
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <div>
        <div className="text-2xl font-extrabold text-white leading-none">
          {prefix}
          {count}
          <span className="text-brand-400 text-xl">{suffix}</span>
        </div>
        <div className="text-xs text-blue-300/70 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function StaticStat({
  value,
  label,
  icon: Icon,
  iconColor,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-6">
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <div>
        <div className="text-2xl font-extrabold text-white leading-none">{value}</div>
        <div className="text-xs text-blue-300/70 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <div className="bg-brand-900 border-y border-brand-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-700/50 divide-y lg:divide-y-0">
          <StaticStat
            value="1–4 sem"
            label="de implementación MVP"
            icon={Zap}
            iconColor="text-brand-400"
          />
          <AnimatedStat
            target={60}
            prefix="−"
            suffix="%"
            label="reducción de tareas manuales"
            icon={TrendingDown}
            iconColor="text-green-400"
          />
          <StaticStat
            value="24/7"
            label="operación sin intervención"
            icon={Bot}
            iconColor="text-violet-400"
          />
          <AnimatedStat
            target={40}
            prefix="+"
            suffix="%"
            label="productividad del equipo"
            icon={TrendingUp}
            iconColor="text-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
