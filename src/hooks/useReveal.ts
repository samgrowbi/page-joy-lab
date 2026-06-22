import { useEffect, useRef } from "react";

/**
 * Lightweight reveal-on-scroll using IntersectionObserver.
 * Adds the `is-visible` class to any descendant with `.reveal` once it
 * enters the viewport. One-shot per element. Honors prefers-reduced-motion
 * (CSS handles that side).
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.matches?.(".reveal")
      ? [root, ...Array.from(root.querySelectorAll<HTMLElement>(".reveal"))]
      : Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
