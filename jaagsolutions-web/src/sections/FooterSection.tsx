const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

const legalLinks = [
  { label: "Politica de privacidad", href: "#" },
  { label: "Terminos y condiciones", href: "#" },
];

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-lg mb-2">
              JAAG<span className="text-brand-400">SOLUTIONS</span>
            </p>
            <p className="text-sm">Automatizacion y SaaS para PYMEs.</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Solicitar diagnostico
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} JAAGSOLUTIONS. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
