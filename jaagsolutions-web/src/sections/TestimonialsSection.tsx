import { useScrollReveal } from "../hooks/useScrollReveal.ts";

const testimonials = [
  {
    quote: "En menos de 3 semanas automatizamos el seguimiento de leads y duplicamos nuestra tasa de contacto. El equipo de JAAGSOLUTIONS entendió nuestro proceso desde el primer día.",
    name: "Carlos Mendoza",
    role: "Director Comercial",
    company: "Inmobiliaria Cenit",
    avatar: "CM",
    color: "from-blue-500 to-brand-600",
  },
  {
    quote: "Teníamos a 2 personas dedicadas 4 horas diarias a conciliar facturas. Hoy ese proceso corre solo. Fue la mejor inversión operativa que hemos hecho este año.",
    name: "Laura Espinoza",
    role: "CFO",
    company: "Distribuidora Apex",
    avatar: "LE",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "Lo que más valoro es que no solo implementaron la automatización — nos enseñaron a operar con ella. Ahora el equipo es autónomo y yo tengo visibilidad total del proceso.",
    name: "Andrés Torres",
    role: "Gerente de Operaciones",
    company: "LogiTech MX",
    avatar: "AT",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function TestimonialsSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 bg-brand-900 relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-48 bg-brand-600 opacity-10 blur-[80px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-400 bg-brand-800 rounded-full border border-brand-700">
            Resultados reales
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">
            Lo que dicen nuestros{" "}
            <span className="gradient-text">clientes</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm flex flex-col gap-5`}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-blue-100 leading-relaxed text-sm flex-1">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-blue-300/70 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className={`mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-center transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {[
            { value: "100%", label: "clientes satisfechos" },
            { value: "+50", label: "flujos implementados" },
            { value: "< 4 sem", label: "tiempo promedio de entrega" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">{value}</span>
              <span className="text-sm text-blue-300/70">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
