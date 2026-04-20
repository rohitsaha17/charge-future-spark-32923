import { useEffect, useState } from "react";

/**
 * Mirror the user's OS-level "reduce motion" preference as a boolean.
 *
 * The hook treats "reduced motion" as the default-safe state: it returns
 * `true` until it can read `matchMedia`, so components that gate Framer
 * Motion animations on this hook err on the side of *less* motion during
 * SSR / the first paint, rather than flashing an animation and then
 * killing it.
 *
 * Use it as:
 *   const reduced = usePrefersReducedMotion();
 *   <motion.div animate={reduced ? undefined : { opacity: 1, y: 0 }} />
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);

    // Safari < 14 only supports addListener / removeListener.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return prefersReduced;
}

export default usePrefersReducedMotion;
