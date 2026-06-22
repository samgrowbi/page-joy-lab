import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useTreatment } from "@/context/TreatmentContext";
import { RotatingText } from "./ui/RotatingText";
import { AccentWord } from "./ui/AccentWord";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  const treatment = useTreatment();
  const queryClient = useQueryClient();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const attemptPlay = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    const video = container.querySelector("video") as HTMLVideoElement | null;
    if (!video) return;
    video.muted = true;
    // @ts-ignore
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    const playPromise = video.play();
    if (playPromise && typeof (playPromise as Promise<void>).then === "function") {
      (playPromise as Promise<void>).catch(() => {});
    }
  };

  useEffect(() => {
    attemptPlay();
    window.addEventListener("touchstart", attemptPlay, { passive: true, once: true });
    window.addEventListener("click", attemptPlay, { once: true });
    return () => {
      window.removeEventListener("touchstart", attemptPlay as any);
      window.removeEventListener("click", attemptPlay as any);
    };
  }, []);

  const appointmentTypeID = treatment.appointmentTypeId || "93509464";
  const calendarID = treatment.calendarId || "14112013";

  const prefetchBookingData = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const year = now.getFullYear().toString();
    queryClient.prefetchQuery({
      queryKey: ["acuity-availability", now.getMonth(), now.getFullYear(), appointmentTypeID],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-availability?month=${month}&year=${year}&appointmentTypeID=${appointmentTypeID}`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch availability");
        const data = await response.json();
        return data.map((d: { date: string }) => new Date(d.date));
      },
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: ["acuity-forms", appointmentTypeID],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-forms?appointmentTypeID=${appointmentTypeID}`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch forms");
        return response.json();
      },
      staleTime: 60 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: ["acuity-calendar", calendarID],
      queryFn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-calendar?calendarID=${calendarID}`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch calendar");
        return response.json();
      },
      staleTime: 60 * 60 * 1000,
    });
  };

  return (
    <section id="hero" className="relative min-h-[64vh] sm:min-h-[80vh] w-full overflow-hidden flex items-center pt-20 sm:pt-24">
      {/* Background Video */}
      <div ref={videoContainerRef} className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          preload="metadata"
          // @ts-ignore
          fetchpriority="high"
          src={treatment.heroVideoUrl}
        />
        <div className="absolute inset-0 bg-black/[0.15] backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-black/20 to-gray-950/80 motion-safe:animate-ken-burns" />
      </div>

      {/* Content — left-aligned reverse pyramid */}
      <div className="z-10 container mx-auto px-5 py-12 lg:py-16" dir="ltr">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          {/* H1 */}
          <h1 className="font-serif font-normal leading-[1.05] text-white text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">
            Look Years <AccentWord>Younger</AccentWord>
          </h1>

          {/* H2 — rotating value props */}
          <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-sans font-light text-white/90 leading-snug mt-3 sm:mt-5 lg:mt-6 w-full">
            <RotatingText
              messages={[
                treatment.label,
                "Reduce Signs of Aging",
                "Feel Comfortable In Your Skin",
              ]}
            />
          </h2>

          {/* H3 — single inline row on mobile, single line on desktop */}
          <p className="mt-3 sm:mt-4 text-[12px] sm:text-sm lg:text-base xl:text-lg font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-pink-400">
            No Surgery <span className="text-pink-400/60 mx-1.5">·</span> No Pain <span className="text-pink-400/60 mx-1.5">·</span> Zero Downtime
          </p>

          {/* Price — centered with CTA, diagonal strikethrough */}
          <div className="inline-flex flex-col items-center mt-5 sm:mt-10" dir="ltr">
            <div className="flex items-baseline gap-2.5 lg:gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-4xl lg:text-5xl xl:text-6xl font-sans font-bold text-white tracking-tight inline-block"
              >
                ${treatment.price}
              </motion.span>
              <span className="relative text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-gray-300/90">
                ${treatment.originalPrice}
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
                  className="absolute left-0 top-1/2 w-full h-[2px] bg-pink-500 origin-left"
                  style={{ transform: "translateY(-50%) rotate(-12deg)" }}
                />
              </span>
            </div>

            {/* CTA */}
            <Button
              variant="cta"
              size="cta"
              className="mt-4 lg:mt-5 px-8 py-5 text-base sm:text-lg lg:px-12 lg:py-6 lg:text-lg xl:text-xl xl:px-14 xl:py-7"
              onClick={onBookingClick}
              onMouseEnter={prefetchBookingData}
              onFocus={prefetchBookingData}
            >
              Book My Session
            </Button>

            {/* Social proof + scarcity */}
            <div className="mt-3 lg:mt-4 flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 text-white/95 text-sm lg:text-base">
                <span className="text-yellow-400 tracking-tight">★★★★★</span>
                <span className="font-semibold">4.9</span>
                <span className="text-white/60">·</span>
                <span className="text-white/85">200+ Happy Clients</span>
              </div>
              <p className="hidden sm:block text-[11px] lg:text-xs uppercase tracking-[0.2em] text-pink-400 font-bold">
                Limited Spots This Week
              </p>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  );
}
