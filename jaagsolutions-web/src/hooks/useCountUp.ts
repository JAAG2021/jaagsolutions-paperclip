import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` when the returned ref element
 * enters the viewport. Uses IntersectionObserver + rAF loop.
 *
 * @param target - The target number to animate to (should be a positive integer)
 * @param duration - Animation duration in milliseconds (default: 1000)
 * @returns { ref } — attach to the container element; { count } — current animated value
 */
export function useCountUp(target: number, duration = 1000) {
  const ref = useRef<HTMLElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (duration <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
}
