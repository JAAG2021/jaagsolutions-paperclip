import CTAButton from "../components/CTAButton.tsx";

export default function HeroSection() {
  return (
    <section id="inicio" className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Automatizacion + SaaS para PYMEs
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Automatiza tus procesos y escala tu empresa con soluciones inteligentes.
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              En JAAGSOLUTIONS ayudamos a PYMEs a mejorar su operacion con dos lineas de servicio integradas: Automatizaciones de flujo y desarrollo SaaS orientado a resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton href="#contacto" variant="primary" className="bg-white text-brand-700 hover:bg-gray-50 text-base px-8 py-4">
                Solicitar diagnostico
              </CTAButton>
              <CTAButton href="#servicios" variant="secondary" className="border-white text-white hover:bg-white/10 text-base px-8 py-4">
                Ver servicios
              </CTAButton>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              Implementacion clara, enfoque en retorno y acompanamiento continuo.
            </p>
          </div>

          {/* Visual — stats/trust */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { value: "1–4 sem", label: "Tiempo de implementacion MVP" },
              { value: "−60%", label: "Reduccion de tareas manuales" },
              { value: "3 paquetes", label: "Starter / Growth / Scale" },
              { value: "2 lineas", label: "Automatizacion + SaaS" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-sm text-blue-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
