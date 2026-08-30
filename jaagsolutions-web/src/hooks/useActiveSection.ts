import { useEffect, useState } from "react";

/**
 * Scrollspy: devuelve el `id` de la última sección cuyo borde superior ya pasó
 * la línea de lectura (~25 % del viewport), para resaltar el enlace activo del
 * nav durante el scroll. `ids` debe ir en orden de aparición en el DOM.
 *
 * Usa posición de scroll (no IntersectionObserver): con secciones muy altas el
 * IO deja huecos. El nav monta antes que el contenido lazy, así que reintenta
 * hasta que todas las secciones existen.
 */
export function useActiveSection(ids: string[]): string | null {
  const key = ids.join(",");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;

    function compute() {
      raf = 0;
      const doc = document.documentElement;
      const probe = window.scrollY + window.innerHeight * 0.25;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= probe) {
          current = id;
        }
      }
      // Cerca del fondo: fuerza la última sección aunque no cruce la línea.
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        const last = [...ids].reverse().find((id) => document.getElementById(id));
        if (last) current = last;
      }
      setActive(current);
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(compute);
    }

    const ready = setInterval(() => {
      if (ids.every((id) => document.getElementById(id))) {
        clearInterval(ready);
        compute();
      }
    }, 150);
    const stopWaiting = setTimeout(() => clearInterval(ready), 8000);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearInterval(ready);
      clearTimeout(stopWaiting);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
