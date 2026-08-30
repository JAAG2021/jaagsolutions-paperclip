import { useEffect, useState } from "react";

/** Barra fina fija en el borde superior que refleja el % de scroll de la página. */
export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5" aria-hidden="true">
      <div
        className="h-full bg-brand-500 motion-safe:transition-[width] motion-safe:duration-150 motion-safe:ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
