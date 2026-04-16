export default function HeroSection() {
  return (
    <section id="inicio" className="relative bg-brand-900 text-white overflow-hidden min-h-[92vh] flex items-center">
      {/* ── Decorative background ── */}
      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      {/* Glow orb top-left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600 opacity-20 blur-[120px] pointer-events-none" />
      {/* Glow orb bottom-right */}
      <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600 opacity-15 blur-[100px] pointer-events-none" />
      {/* Horizontal separator glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Copy ── */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-600/25 border border-brand-500/35 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              Automatización + SaaS para PYMEs
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Automatiza hoy.{" "}
              <br />
              <span className="gradient-text">Lidera mañana.</span>
            </h1>

            {/* Sub */}
            <p className="text-xl text-blue-200 mb-10 leading-relaxed max-w-lg">
              Optimizamos los procesos de tu PYME con automatizaciones de flujo y desarrollo SaaS — para operar mejor hoy y escalar con control.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#contacto"
                className="btn-glow inline-flex items-center justify-center gap-2 bg-white text-brand-900 font-bold px-8 py-4 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg"
              >
                Solicitar diagnóstico gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Ver servicios
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300/80">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sin costo inicial
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Respuesta en 24 h
              </span>
              <span className="text-blue-500/50">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MVP en 1–4 semanas
              </span>
            </div>
          </div>

          {/* ── Right: Visual dashboard mockup ── */}
          <div className="hidden lg:block animate-fade-in-up-d2">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 mx-4 bg-white/10 rounded-md px-3 py-1 text-xs text-blue-200/50 text-center">
                    app.jaagsolutions.com/dashboard
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-6">
                  <p className="text-xs text-blue-300/60 font-semibold uppercase tracking-widest mb-4">Panel de operaciones</p>

                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Leads este mes", value: "142", delta: "+18%", color: "text-green-400" },
                      { label: "Tareas auto.", value: "3,820", delta: "+60%", color: "text-blue-400" },
                      { label: "Tiempo ahorrado", value: "96 h", delta: "este mes", color: "text-violet-400" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="text-xl font-extrabold text-white">{kpi.value}</div>
                        <div className={`text-xs font-semibold ${kpi.color}`}>{kpi.delta}</div>
                        <div className="text-xs text-blue-300/50 mt-0.5">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini flow diagram */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-blue-300/60 mb-3 font-medium">Flujo activo: Captación → CRM</p>
                    <div className="flex items-center gap-2">
                      {[
                        { icon: "📥", label: "Lead", bg: "bg-blue-500/20" },
                        { icon: "🤖", label: "IA score", bg: "bg-violet-500/20" },
                        { icon: "📅", label: "Agenda", bg: "bg-emerald-500/20" },
                        { icon: "✅", label: "CRM", bg: "bg-green-500/20" },
                      ].map((step, i) => (
                        <div key={step.label} className="flex items-center gap-2 flex-1">
                          <div className={`${step.bg} rounded-lg p-2 flex flex-col items-center flex-1`}>
                            <span className="text-sm">{step.icon}</span>
                            <span className="text-xs text-blue-200/70 mt-0.5">{step.label}</span>
                          </div>
                          {i < 3 && <span className="text-blue-400/50 text-xs flex-shrink-0">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-float">
                ✓ Activo 24/7
              </div>
              {/* Floating stat */}
              <div className="absolute -bottom-4 -left-4 bg-brand-700 border border-brand-500/40 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg backdrop-blur animate-float-slow">
                ⚡ 3,820 tareas automatizadas
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
