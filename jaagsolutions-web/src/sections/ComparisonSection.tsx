import { CheckCircle2, X, Minus } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal.ts";
import CTAButton from "../components/CTAButton.tsx";

type CellValue = "yes" | "no" | "partial";

const features: {
  label: string;
  jaagsolutions: CellValue;
  solo: CellValue;
  agency: CellValue;
}[] = [
  { label: "Implementación < 4 semanas",        jaagsolutions: "yes", solo: "no",      agency: "no"      },
  { label: "Precio accesible para PYME",         jaagsolutions: "yes", solo: "partial", agency: "no"      },
  { label: "Soporte post-entrega",               jaagsolutions: "yes", solo: "no",      agency: "partial" },
  { label: "Capacitación al equipo",             jaagsolutions: "yes", solo: "no",      agency: "partial" },
  { label: "Automatización + SaaS integrado",    jaagsolutions: "yes", solo: "no",      agency: "no"      },
  { label: "Sin contrato de permanencia",        jaagsolutions: "yes", solo: "yes",     agency: "no"      },
  { label: "Diagnóstico gratuito",               jaagsolutions: "yes", solo: "no",      agency: "no"      },
];

function Cell({ value }: { value: CellValue }) {
  if (value === "yes")     return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === "no")      return <X            className="w-5 h-5 text-red-400/60 mx-auto" />;
  return                          <Minus        className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export default function ComparisonSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="comparativa"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Comparativa
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            ¿Por qué{" "}
            <span className="gradient-text">JAAGSOLUTIONS?</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Compara las opciones disponibles para tu PYME y elige con información.
          </p>
        </div>

        {/* Table */}
        <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} overflow-hidden rounded-2xl border border-gray-200 shadow-sm`}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-500 bg-gray-50 w-1/2">
                  Característica
                </th>
                <th className="p-4 text-center text-sm font-bold text-white bg-brand-900 w-[calc(50%/3)]">
                  JAAGSOLUTIONS
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">
                  Hacerlo solo
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50 w-[calc(50%/3)]">
                  Agencia grande
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {features.map((f, i) => (
                <tr
                  key={f.label}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                >
                  <td className="p-4 text-sm text-gray-700 font-medium">{f.label}</td>
                  <td className="p-4 bg-brand-50/40">
                    <Cell value={f.jaagsolutions} />
                  </td>
                  <td className="p-4">
                    <Cell value={f.solo} />
                  </td>
                  <td className="p-4">
                    <Cell value={f.agency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Incluido
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-yellow-500" /> Parcial
          </span>
          <span className="flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 text-red-400/60" /> No disponible
          </span>
        </div>

        {/* Ruta recomendada */}
        <div className="bg-brand-700 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <p className="text-sm font-medium text-blue-200 mb-1">Ruta recomendada JAAGSOLUTIONS</p>
            <div className="flex items-center gap-3 text-lg font-bold flex-wrap">
              <span>Automatización</span>
              <span className="text-blue-300">→</span>
              <span>Medición</span>
              <span className="text-blue-300">→</span>
              <span>Escalado SaaS</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <CTAButton href="#contacto" variant="primary">
            Solicitar diagnóstico
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
