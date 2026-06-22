import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Calendar } from "lucide-react";

interface InlineCTAProps {
  title?: string;
  subtitle?: string;
  variant?: "primary" | "gradient" | "minimal";
  onBookingClick: () => void;
}

export function InlineCTA({ title = "Ready to Get Started?", subtitle = "Book your appointment today!", variant = "primary", onBookingClick }: InlineCTAProps) {
  if (variant === "gradient") {
    return (
      <section className="py-4 px-5" dir="ltr">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="container mx-auto">
          <div className="bg-gradient-to-br from-rose-400 via-pink-300 to-rose-400 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-light font-bold mb-3">{title}</h3>
                <p className="text-white/90 text-lg">{subtitle}</p>
              </div>
              <Button variant="ctaInverted" size="cta" onClick={onBookingClick}>
                Book My Session
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-pink-50">
      <div className="container mx-auto px-5 text-center" dir="ltr">
        <h3 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <Button variant="cta" size="cta" onClick={onBookingClick}>Book My Session</Button>
      </div>
    </section>
  );
}