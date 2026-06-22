import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTreatment } from "@/context/TreatmentContext";
import { Events, track } from "@/lib/analytics";

interface StickyCTAProps {
  onBookingClick: () => void;
}

export function StickyCTA({ onBookingClick }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();
  const treatment = useTreatment();
  const savings = (parseFloat(treatment.originalPrice) - parseFloat(treatment.price)).toFixed(0);
  const appointmentTypeID = treatment.appointmentTypeId || "93509464";

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
  };

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [bookingInView, setBookingInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById("inline-booking-section");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBookingInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && !bookingInView && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          dir="ltr"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-pink-200 shadow-[0_-10px_40px_rgba(236,72,153,0.15)]"
        >
          <div className="container mx-auto px-5 py-2 md:py-4">
            <div className="flex flex-col items-center justify-center gap-1">
              <p className="text-xs md:text-sm text-gray-600">100% Risk-Free, No Deposit Required</p>
              <Button 
                variant="cta" 
                size="cta" 
                className="min-w-[220px]"
                onClick={() => {
                  track(Events.StickyCtaClicked, { treatment: treatment.slug });
                  onBookingClick();
                }}
                onMouseEnter={prefetchBookingData}
                onFocus={prefetchBookingData}
              >
                BOOK NOW
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
