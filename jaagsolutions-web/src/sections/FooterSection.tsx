import { useState } from "react";
import LegalModal from "../components/LegalModal";
import PrivacyPolicyContent from "../components/PrivacyPolicyContent";
import TermsContent from "../components/TermsContent";
import CaligraphaWordmark from "../components/CaligraphaWordmark";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Caligrapha", href: "#caligrapha" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

export default function FooterSection() {
  const [modal, setModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">
              JAAG<span className="text-brand-400">SOLUTIONS</span>
            </p>
            <p className="text-sm">Automatizacion y SaaS para PYMEs.</p>
            <a
              href="mailto:contacto@jaagsolutions.com"
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors mt-1 inline-block"
            >
              contacto@jaagsolutions.com
            </a>
            <p className="mt-3 text-sm">
              Nuestro producto:{" "}
              <a
                href="https://www.caligrapha.com/?utm_source=jaagsolutions&utm_medium=footer&utm_campaign=caligrapha_launch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-gray-200 transition-colors hover:text-white"
              >
                <CaligraphaWordmark className="text-sm" />
                <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>

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
            <button
              onClick={() => setModal("privacy")}
              className="hover:text-white transition-colors bg-transparent border-0 p-0 cursor-pointer text-sm text-gray-400"
            >
              Política de privacidad
            </button>
            <button
              onClick={() => setModal("terms")}
              className="hover:text-white transition-colors bg-transparent border-0 p-0 cursor-pointer text-sm text-gray-400"
            >
              Términos y condiciones
            </button>
          </div>
        </div>
      </div>

      {modal === "privacy" && (
        <LegalModal title="Política de Privacidad" onClose={() => setModal(null)}>
          <PrivacyPolicyContent />
        </LegalModal>
      )}
      {modal === "terms" && (
        <LegalModal title="Términos y Condiciones" onClose={() => setModal(null)}>
          <TermsContent />
        </LegalModal>
      )}
    </footer>
  );
}
