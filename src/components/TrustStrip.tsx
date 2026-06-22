import { useTreatment } from "@/context/TreatmentContext";
import { Clock, Sparkles, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const items = [
  { heading: "Treatment Time", value: (duration: number) => `${duration}`, suffix: "min", Icon: Clock },
  { heading: "Discomfort", value: () => "None", suffix: "", Icon: Sparkles },
  { heading: "Recovery", value: () => "Zero", suffix: "", Icon: Zap },
  { heading: "Results", value: () => "Immediate", suffix: "", Icon: CheckCircle2 },
  { heading: "Safe For", value: () => "All Skin Tones", suffix: "", Icon: ShieldCheck },
];

export function TrustStrip() {
  const treatment = useTreatment();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="relative bg-gradient-to-b from-white via-pink-50/30 to-white">
      {/* Decorative top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />

      <div ref={ref} className="container mx-auto px-5 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-5 reveal">
          {items.map(({ heading, value, suffix, Icon }, i) => (
            <div
              key={heading}
              className="group relative flex flex-col items-center text-center bg-white rounded-2xl px-4 py-7 lg:px-5 lg:py-9 border border-pink-100/70 shadow-[0_2px_20px_-12px_rgba(236,72,153,0.25)] hover:shadow-[0_10px_40px_-15px_rgba(236,72,153,0.35)] hover:-translate-y-1 transition-all duration-500"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {/* Top accent bar */}
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 rounded-full bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300 opacity-70 group-hover:w-16 group-hover:opacity-100 transition-all duration-500" />

              {/* Icon */}
              <div className="relative mt-2 mb-5">
                <div className="absolute inset-0 rounded-full bg-pink-200/40 blur-xl group-hover:bg-pink-300/50 transition-colors duration-500" />
                <div className="relative flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-white to-pink-50 text-pink-500 ring-1 ring-pink-200/80 shadow-sm group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-500">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />
                </div>
              </div>

              {/* Value */}
              <p className="font-serif text-[24px] sm:text-[26px] lg:text-[30px] xl:text-[34px] text-gray-900 font-normal leading-[1.1] tracking-tight">
                {value(treatment.duration)}
                {suffix && (
                  <span className="ml-1.5 text-base lg:text-lg text-pink-400/80 font-sans font-light tracking-normal align-baseline">
                    {suffix}
                  </span>
                )}
              </p>

              {/* Divider */}
              <span className="block w-6 h-px bg-pink-300/60 my-3" />

              {/* Heading */}
              <p className="text-[10px] lg:text-[11px] xl:text-xs text-gray-500 tracking-[0.28em] uppercase font-semibold">
                {heading}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
