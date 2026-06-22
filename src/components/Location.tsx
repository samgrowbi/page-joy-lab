import { Button } from "./ui/button";
import { MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import {
  BUSINESS_ADDRESS_LINES,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  GOOGLE_MAPS_LINK,
  GOOGLE_MAPS_EMBED_SRC,
} from "@/config/brand";

export function Location() {
  return (
    <section className="pt-4 pb-6 lg:py-16 bg-white overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          {/* Left: Content */}
          <motion.div
            className="w-full lg:w-1/2 pl-8 md:pl-16 lg:pl-24"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 mb-5 lg:mb-10 leading-tight">
              Our <span className="text-pink-500">Location</span>
            </h2>

            <div className="space-y-5 lg:space-y-8 mb-6 lg:mb-10">
                <div className="flex items-start gap-3 lg:gap-5">
                    <div className="p-2 lg:p-3 bg-pink-100 rounded-full mt-1">
                        <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" />
                    </div>
                    <div>
                        <h4 className="text-base lg:text-2xl xl:text-3xl font-serif font-bold text-gray-900 mb-0.5 lg:mb-2">Visit Us</h4>
                        <p className="text-gray-600 text-sm lg:text-xl xl:text-2xl leading-relaxed">
                            {BUSINESS_ADDRESS_LINES.map((line, i) => (
                              <span key={i}>
                                {line}
                                {i < BUSINESS_ADDRESS_LINES.length - 1 && <br />}
                              </span>
                            ))}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-5">
                    <div className="p-2 lg:p-3 bg-pink-100 rounded-full mt-1">
                        <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" />
                    </div>
                    <div>
                        <h4 className="text-base lg:text-2xl xl:text-3xl font-serif font-bold text-gray-900 mb-0.5 lg:mb-2">Call Us</h4>
                        <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-gray-600 text-sm lg:text-xl xl:text-2xl hover:text-pink-500 transition-colors">
                            {BUSINESS_PHONE_DISPLAY}
                        </a>
                    </div>
                </div>
            </div>

            <Button
              asChild
              variant="cta"
              size="cta"
            >
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="w-5 h-5 lg:w-8 lg:h-8 mr-2" />
                Get Directions
              </a>
            </Button>
          </motion.div>

          {/* Right: Map — smaller */}
          <motion.div
            className="w-full lg:w-2/5"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-pink-100 border-4 border-white aspect-[4/3]">
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
