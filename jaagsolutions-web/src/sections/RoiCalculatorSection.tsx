import { useMemo, useState } from "react";
import { TrendingDown, Clock, ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader.tsx";

const fmtMoney = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function RoiCalculatorSection() {
  const [employees, setEmployees] = useState(5);
  const [hoursWeek, setHoursWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(25);

  const { annualLoss, monthlyHours } = useMemo(() => {
    const annual = employees * hoursWeek * hourlyRate * 52;
    const monthlyH = Math.round(employees * hoursWeek * 4.33);
    return { annualLoss: annual, monthlyHours: monthlyH };
  }, [employees, hoursWeek, hourlyRate]);

  return (
    <section id="calculadora-roi" className="py-24 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Calcula el costo de no automatizar"
          subtitle="Números orientativos para dueños de PYME. Ajusta los sliders y ve el impacto anual de las tareas repetitivas."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-8">
            <SliderField
              label="Empleados en tareas repetitivas"
              min={1}
              max={20}
              value={employees}
              onChange={setEmployees}
              suffix=""
            />
            <SliderField
              label="Horas perdidas por empleado / semana"
              min={2}
              max={40}
              step={1}
              value={hoursWeek}
              onChange={setHoursWeek}
              suffix=" h"
            />
            <SliderField
              label="Costo hora cargado (USD)"
              min={15}
              max={50}
              step={1}
              value={hourlyRate}
              onChange={setHourlyRate}
              prefix="$"
            />
            <p className="text-xs text-gray-400 leading-relaxed">
              Fórmula simple: empleados × horas × costo/hora × 52 semanas. No incluye errores, reprocesos ni oportunidad perdida.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-900 to-brand-800 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex items-start gap-3 mb-6">
              <div className="rounded-lg bg-white/10 p-2">
                <TrendingDown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Tu estimación</h3>
                <p className="text-sm text-blue-100/90 mt-1">
                  Con JAAGSOLUTIONS rediriges ese tiempo a ventas, servicio y crecimiento.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-black/20 border border-white/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-1">
                  Pérdida operativa estimada / año
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {fmtMoney.format(annualLoss)}
                </p>
                <p className="text-sm text-blue-100/80 mt-2">en procesos que podrían estar parcial o totalmente automatizados.</p>
              </div>

              <div className="rounded-xl bg-black/20 border border-white/10 px-5 py-4 flex items-center gap-4">
                <Clock className="w-8 h-8 text-violet-300 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-200/80">Horas recuperables / mes</p>
                  <p className="text-2xl font-extrabold">~{monthlyHours} h</p>
                  <p className="text-sm text-blue-100/80">tiempo que tu equipo podría dedicar a ingresos, no a copiar y pegar.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-blue-100 mb-4">
                Lead magnet: al solicitar diagnóstico indica que quieres el PDF{" "}
                <span className="font-semibold text-white">«5 flujos que toda PYME debe automatizar»</span> — te lo enviamos por correo.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-brand-900 font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
              >
                Quiero mi informe y diagnóstico
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
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
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-brand-600 cursor-pointer"
      />
    </div>
  );
}
