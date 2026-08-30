import { useState } from "react";
import CTAButton from "../components/CTAButton.tsx";
import CaligraphaWordmark from "../components/CaligraphaWordmark.tsx";
import { useActiveSection } from "../hooks/useActiveSection.ts";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

// Todas las secciones principales en orden de aparición (ver AppBelowFold).
// Incluye ids sin enlace en el nav para que el scrollspy no muestre uno
// obsoleto cuando estás en una sección que el nav no lista.
const SPY_IDS = [
  "inicio",
  "casos",
  "proceso",
  "servicios",
  "caligrapha",
  "impacto",
  "preguntas",
  "contacto",
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(SPY_IDS);

  return (
    <nav aria-label="Navegación principal" className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#inicio" className="font-bold text-xl text-brand-700 tracking-tight">
            JAAG<span className="text-gray-900">SOLUTIONS</span>
          </a>

          {/* Desktop nav — a partir de lg: entre md y lg no cabían 5 enlaces +
              CTA sin encimarse, y sumar Caligrapha lo empeoraba. Debajo de lg
              se usa el menú hamburguesa (que sí incluye todo). */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-brand-600" : "text-gray-600 hover:text-brand-600"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="#caligrapha"
              aria-current={active === "caligrapha" ? "true" : undefined}
              className={`flex items-center border-l border-gray-200 pl-6 text-sm font-semibold transition-colors ${
                active === "caligrapha"
                  ? "text-caligrapha-gold"
                  : "text-gray-800 hover:text-caligrapha-gold"
              }`}
            >
              <CaligraphaWordmark className="text-sm" />
            </a>
            <CTAButton href="#contacto" variant="primary" className="text-sm px-4 py-2">
              Solicitar diagnostico
            </CTAButton>
          </div>

          {/* Móvil / tablet: CTA siempre visible + hamburguesa */}
          <div className="flex items-center gap-2 lg:hidden">
            <CTAButton href="#contacto" variant="primary" className="text-xs px-3 py-2">
              Diagnóstico
            </CTAButton>
            <button
              className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" aria-label="Menú de navegación móvil" className="lg:hidden border-t border-gray-100 py-3 space-y-2">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`block border-l-2 px-2 py-2 text-sm font-medium ${
                    isActive
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-gray-700 hover:text-brand-600"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="#caligrapha"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg border border-caligrapha-gold/30 bg-caligrapha-gold/5 px-3 py-2.5 text-sm font-semibold text-gray-800"
            >
              <CaligraphaWordmark className="text-sm" />
              <span className="ml-auto text-[0.625rem] font-bold uppercase tracking-wider text-caligrapha-gold">
                Nuevo
              </span>
            </a>
            <div className="pt-2">
              <CTAButton href="#contacto" variant="primary" className="w-full text-sm">
                Solicitar diagnostico
              </CTAButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
