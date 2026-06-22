import { motion } from "motion/react";
import { Clock, Check } from "lucide-react";
import { Button } from "./ui/button";
import bookingWoman from "@/assets/booking-treatment.webp";
import { useTreatment } from "@/context/TreatmentContext";

interface BookingStepsProps {
  onBookingClick: () => void;
}

export function BookingSteps({ onBookingClick }: BookingStepsProps) {
  const treatment = useTreatment();
  const steps = [
    { 
      number: "1", 
      title: "Initiate Booking", 
      text: "Click the 'Book An Appointment' button below to start your journey to relaxation." 
    },
    { 
      number: "2", 
      title: "Select Schedule", 
      text: "Choose your preferred date and time. We recommend booking early as spots fill up quickly." 
    },
    { 
      number: "3", 
      title: "Confirmation", 
      text: "You're all set! Our team will contact you shortly to confirm your exclusive treatment." 
    }
  ];

  return (
    <section className="pt-12 pb-20 bg-gradient-to-b from-white to-pink-50/30 overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 text-center"
            >
              <h2 className="text-4xl font-serif font-normal text-gray-900 leading-tight">
                Ready To Book Your<br />
                <span className="text-pink-500">Appointment?</span>
              </h2>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mb-10 max-w-md"
            >
              Experience world-class treatments tailored to your skin's needs. Your journey to radiance is just a click away.
            </motion.p>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-pink-200 hover:bg-pink-50/30 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center transition-all duration-300 group-hover:from-pink-500 group-hover:to-pink-400">
                    <span className="text-sm font-semibold text-pink-500 transition-colors duration-300 group-hover:text-white">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light text-justify">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-end gap-6 py-6"
            >
              {/* Left Side - Pricing */}
              <div className="text-center sm:text-left sm:mr-8">
                <p className="text-gray-400 text-2xl mb-1">
                  <span className="line-through decoration-2">${treatment.originalPrice}</span>
                </p>
                <p className="text-4xl md:text-5xl font-serif text-pink-500 font-bold">
                  ${treatment.price}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-amber-600 text-sm font-medium">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Only 3 spots left today!</span>
                </div>
              </div>
              
              {/* Right Side - CTA Button */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  <span>100% Risk-Free, No Deposit Required</span>
                </div>
                <Button
                  variant="cta"
                  size="cta"
                  onClick={onBookingClick}
                >
                  Book My Session
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img
                src={bookingWoman}
                alt="Premium skincare experience"
                className="w-full h-auto rounded-3xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
