import { useMemo, useState } from "react";
import { Zap, Bot, Blocks, Users, ArrowRight, Calculator } from "lucide-react";

/**
 * Sección "El impacto real": fusiona lo que antes eran tres bandas separadas
 * (Beneficios · Stats · Calculadora ROI) en un solo bloque, para acortar la
 * página sin perder el argumento de valor previo a Precios.
 *
 * Sin cifras de resultado inventadas: la narrativa antes→después es cualitativa,
 * la tira son hechos de capacidad, y el único número (la calculadora) sale de
 * los datos que introduce el visitante.
 */

const benefits = [
  {
    icon: "⏱",
    eyebrow: "Operaciones",
    tag: "El ladrón de tiempo",
    before: "Procesos manuales lentos y propensos a errores que frenan tu crecimiento.",
    after: "Flujos autónomos 24/7. Tu operación no se detiene cuando el equipo descansa.",
    accent: "text-red-600",
  },
  {
    icon: "💸",
    eyebrow: "Costos",
    tag: "La fuga de dinero",
    before: "Pagar nómina cara para trabajo repetitivo que una máquina hace más rápido.",
    after: "Escala sin inflar tu nómina en tareas repetitivas. Crece con margen sano.",
    accent: "text-amber-700",
  },
  {
    icon: "📊",
    eyebrow: "Visibilidad",
    tag: "Vuelo a ciegas",
    before: "Decisiones por intuición o datos viejos dispersos entre hojas y correos.",
    after: "Métricas en tiempo real. El pulso del negocio en el celular cuando lo necesites.",
    accent: "text-blue-600",
  },
];

const fmtMoney = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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

function SliderField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  prefix = "",
  suffix = "",
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        <span className="text-sm font-bold text-brand-600 tabular-nums">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-brand-600 cursor-pointer"
      />
    </div>
  );
}

export default function ImpactSection() {
  const [employees, setEmployees] = useState(5);
  const [hoursWeek, setHoursWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(25);

  const { annualLoss, monthlyHours } = useMemo(() => {
    const annual = employees * hoursWeek * hourlyRate * 52;
    const monthlyH = Math.round(employees * hoursWeek * 4.33);
    return { annualLoss: annual, monthlyHours: monthlyH };
  }, [employees, hoursWeek, hourlyRate]);

  return (
    <section id="impacto" className="py-14 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-white rounded-full border border-brand-100 shadow-sm">
            El impacto real
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Tiempo y dinero de vuelta a{" "}
            <span className="gradient-text">tu negocio</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            El dueño no busca “automatizar” por tecnología — busca horas recuperables y márgenes sanos.
          </p>
        </div>

        {/* Antes → Después */}
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.tag} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-[0.6875rem] font-bold uppercase tracking-widest ${b.accent}`}>{b.eyebrow}</p>
                  <p className="text-sm font-semibold text-gray-800">{b.tag}</p>
                </div>
                <span className="text-2xl leading-none" aria-hidden>{b.icon}</span>
              </div>

              <p className="mt-4 text-sm leading-snug text-gray-400 line-through decoration-gray-300">
                {b.before}
              </p>
              <div className="my-2 flex items-center gap-2 text-brand-600">
                <ArrowRight className="h-4 w-4 rotate-90" />
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <p className="text-sm font-medium leading-snug text-gray-800">{b.after}</p>
            </div>
          ))}
        </div>

        {/* Calculadora — compacta y siempre visible */}
        <div className="mt-6 grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[1fr_20rem]">
          {/* Controles */}
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <Calculator className="h-5 w-5 shrink-0 text-brand-600" />
              <h3 className="text-base font-bold text-gray-900">
                Calcula cuánto te cuestan hoy las tareas repetitivas
              </h3>
            </div>
            <div className="space-y-5">
              <SliderField label="Empleados en tareas repetitivas" min={1} max={20} value={employees} onChange={setEmployees} />
              <SliderField label="Horas perdidas por empleado / semana" min={2} max={40} value={hoursWeek} onChange={setHoursWeek} suffix=" h" />
              <SliderField label="Costo hora cargado (USD)" min={15} max={50} value={hourlyRate} onChange={setHourlyRate} prefix="$" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              Empleados × horas × costo/hora × 52 semanas. No incluye errores, reprocesos ni oportunidad perdida.
            </p>
          </div>

          {/* Resultado */}
          <div className="flex flex-col justify-center gap-4 bg-gradient-to-br from-brand-900 to-brand-800 p-5 text-white sm:p-6">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-blue-200/80">
                Pérdida operativa estimada / año
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums" aria-live="polite">
                {fmtMoney.format(annualLoss)}
              </p>
              <p className="mt-1 text-sm text-blue-100/85">
                <span className="font-semibold text-white tabular-nums">~{monthlyHours} h/mes</span>{" "}
                recuperables para tu equipo.
              </p>
            </div>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-900 transition-colors hover:bg-blue-50"
            >
              Quiero mi informe y diagnóstico
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-xs leading-snug text-blue-200/70">
              Pide el PDF <span className="font-medium text-blue-100">«5 flujos que toda PYME debe automatizar»</span> al solicitarlo.
            </p>
          </div>
        </div>

        {/* Tira de hechos — cómo trabajamos, no resultados de clientes */}
        <div className="mt-6 rounded-2xl bg-brand-900 overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-700/50 divide-y lg:divide-y-0">
            <StaticStat value="1–4 sem" label="primer MVP en producción" icon={Zap} iconColor="text-brand-400" />
            <StaticStat value="Tu stack" label="integramos tus herramientas actuales" icon={Blocks} iconColor="text-green-400" />
            <StaticStat value="24/7" label="los flujos no descansan" icon={Bot} iconColor="text-violet-400" />
            <StaticStat value="Tu equipo" label="opera y ajusta sin depender de nosotros" icon={Users} iconColor="text-blue-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
