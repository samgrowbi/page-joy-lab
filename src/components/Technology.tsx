import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Crosshair, Layers, Shield } from "lucide-react";
import ledDevice from "@/assets/led-device.webp";
import { useTreatment } from "@/context/TreatmentContext";
import { AccentWord } from "./ui/AccentWord";

interface TechnologyProps {
  onBookingClick: () => void;
}

export function Technology({ onBookingClick }: TechnologyProps) {
  const treatment = useTreatment();
  const icons = [Crosshair, Layers, Shield];
  const highlights = treatment.technologyHighlights.map((h, i) => ({
    icon: icons[i % icons.length],
    text: h.text,
    title: h.title,
    description: h.description,
  }));

  const hasExpandedHighlights = highlights.some(h => h.title);
  const hideDevice = treatment.hideDeviceImage;
  const customTitle = treatment.technologyTitle;

  return (
    <section
      id="technology"
      className="py-4 md:py-8 lg:py-16 relative overflow-hidden scroll-mt-24 md:scroll-mt-32"
      style={{ background: "linear-gradient(180deg, #FAFAF8 0%, #F5F3EF 100%)" }}
      dir="ltr"
    >
      {/* Subtle warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(210,195,175,0.15)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-5 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div className="space-y-4">
              <p className="text-xs md:text-sm lg:text-base uppercase tracking-[0.15em] text-gray-400 font-bold text-left">How It Actually Works</p>
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight">
                {customTitle ? (
                  <>
                    {customTitle.main}{" "}
                    <AccentWord className="font-light">{customTitle.highlight}</AccentWord>
                  </>
                ) : (
                   <>
                     Reduce Signs of Aging<br />
                     <AccentWord className="font-light">Without Surgery or Needles</AccentWord>
                   </>
                )}
              </h2>
              <div className="w-16 h-px bg-gray-300" />
            </div>

            <div className="space-y-5 text-gray-700 leading-relaxed text-[17px] md:text-lg lg:text-xl font-light text-left">
              {treatment.technologyDescription.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Desktop CTA - only show when highlights are on the right */}
            {/* Desktop CTA removed */}
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col items-center gap-10"
          >
            {/* Device Image - only for treatments that have it */}
            {!hideDevice && (
              <div className="relative flex justify-center items-center">
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[200px] md:w-[280px] h-[40px] md:h-[50px] bg-black/[0.04] rounded-full blur-[30px]" />
                <motion.img
                  src={ledDevice}
                  alt="Advanced Skin Rejuvenation Device"
                  loading="lazy"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-[220px] md:h-[350px] lg:h-[380px] w-auto object-contain drop-shadow-sm rotate-[15deg] rounded-3xl"
                />
              </div>
            )}

            {/* Highlights */}
            {hasExpandedHighlights ? (
              <div className="space-y-3 w-full">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50/80 rounded-xl px-4 py-3.5 lg:px-6 lg:py-5 border border-gray-100 transition-all duration-300 hover:bg-pink-50/60 hover:border-pink-200 hover:shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]"
                    >
                      <h3 className="text-gray-900 font-sans font-bold text-[15px] md:text-base lg:text-lg mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm lg:text-base font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="space-y-4 w-full max-w-xl">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-4 px-5 lg:py-6 lg:px-7 rounded-xl border border-gray-200/60 bg-white/80"
                    >
                      <div className="text-gray-400 shrink-0"><Icon className="w-6 h-6 lg:w-7 lg:h-7" /></div>
                      <span className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 font-light">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile CTA removed */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
