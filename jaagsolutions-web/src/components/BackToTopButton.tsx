import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Botón flotante (abajo-izquierda) que aparece tras ~1,5 pantallas de scroll. */
export default function BackToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function update() {
      setShow(window.scrollY > window.innerHeight * 1.5);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-900 text-white shadow-lg ring-1 ring-white/10 transition-all duration-200 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
