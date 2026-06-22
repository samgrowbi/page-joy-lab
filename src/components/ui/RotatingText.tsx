import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface RotatingTextProps {
  messages: string[];
  intervalMs?: number;
  className?: string;
}

export function RotatingText({ messages, intervalMs = 3500, className = "" }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || messages.length <= 1) return;
    let timer: number | undefined;
    const tick = () => setIndex((i) => (i + 1) % messages.length);
    const start = () => { timer = window.setInterval(tick, intervalMs); };
    const stop = () => { if (timer) window.clearInterval(timer); };
    const onVis = () => { stop(); if (!document.hidden) start(); };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); document.removeEventListener("visibilitychange", onVis); };
  }, [messages.length, intervalMs, reduce]);

  if (reduce) {
    return <span className={className}>{messages[0]}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Invisible sizer to reserve max width and prevent CLS */}
      <span className="invisible block" aria-hidden="true">
        {messages.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 block"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
