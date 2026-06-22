import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface AccentWordProps {
  children: ReactNode;
  className?: string;
}

/**
 * Pink accent word with an underline that draws in on scroll
 * and a soft glow on hover. Use inside section titles.
 */
export function AccentWord({ children, className = "" }: AccentWordProps) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-block text-pink-500 group ${className}`}>
      <span className="relative z-10 transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_24px_rgba(236,72,153,0.45)]">
        {children}
      </span>
      <motion.span
        aria-hidden="true"
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="absolute left-0 right-0 -bottom-1 h-[3px] origin-left rounded-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-300"
      />
    </span>
  );
}
