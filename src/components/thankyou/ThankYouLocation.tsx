import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  BUSINESS_ADDRESS_LINES,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  GOOGLE_MAPS_LINK,
  GOOGLE_MAPS_EMBED_SRC,
} from "@/config/brand";

export function ThankYouLocation() {
  return (
    <section className="pt-10 pb-10 bg-white overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: Content */}
          <motion.div
            className="w-full lg:w-1/2 pl-8 md:pl-16 lg:pl-24"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-7xl font-serif text-gray-900 mb-8 leading-tight">
              Our <br/>
              <span className="text-pink-500">Location</span>
            </h2>

            <div className="space-y-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-pink-100 rounded-full mt-1">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">Visit Us</h4>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {BUSINESS_ADDRESS_LINES.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < BUSINESS_ADDRESS_LINES.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-pink-100 rounded-full mt-1">
                  <Phone className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">Call Us</h4>
                  <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-gray-600 text-lg hover:text-pink-500 transition-colors">
                    {BUSINESS_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-3">
              <Button
                asChild
                variant="ctaOutline"
                size="cta"
                className="min-w-[280px]"
              >
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Direction
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right: Map */}
          <motion.div
            className="w-full lg:w-1/2 md:pr-12 lg:pr-32"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-pink-100 border-4 border-white aspect-square">
              <iframe
                src={GOOGLE_MAPS_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
                className="w-full h-full"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
