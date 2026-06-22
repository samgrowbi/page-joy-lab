import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeImg, afterImg, className }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full aspect-[4/3] overflow-hidden select-none rounded-lg bg-gray-100 touch-none", className)}
      onMouseDown={(e) => { setIsDragging(true); updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); updateFromClientX(e.touches[0].clientX); }}
      dir="ltr"
    >
      <img src={beforeImg} alt="Before" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={afterImg} alt="After" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-white/90 text-gray-700 rounded">Before</span>
      <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-pink-500 text-white rounded">After 3 Sessions</span>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />
      {/* Handle */}
      <div
        className="absolute top-1/2 w-10 h-10 -mt-5 -ml-5 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-pink-500">
          <polyline points="15 18 9 12 15 6" />
          <polyline points="9 18 15 12 9 6" transform="translate(6 0)" />
        </svg>
      </div>
    </div>
  );
}
