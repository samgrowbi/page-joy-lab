import { motion } from "motion/react";
import affirm from "@/assets/partners/affirm.webp";
import wisetack from "@/assets/partners/wisetack.webp";
import carecredit from "@/assets/partners/carecredit.webp";
import paypal from "@/assets/partners/paypal.webp";
import asa from "@/assets/partners/asa.webp";
import circadia from "@/assets/partners/circadia.webp";
import avologi from "@/assets/partners/avologi.webp";
import juvederm from "@/assets/partners/juvederm.webp";
import amspa from "@/assets/partners/amspa.webp";
import obagi from "@/assets/partners/obagi.webp";

const MARQUEE_DURATION = 40;

const logos = [
  { src: affirm, alt: "Affirm" },
  { src: wisetack, alt: "Wisetack" },
  { src: carecredit, alt: "CareCredit" },
  { src: paypal, alt: "PayPal" },
  { src: asa, alt: "American Skin Association" },
  { src: circadia, alt: "Circadia" },
  { src: avologi, alt: "Avologi Scientific" },
  { src: juvederm, alt: "Juvéderm" },
  { src: amspa, alt: "AmSpa" },
  { src: obagi, alt: "OBAGI" },
];

export function Partners() {
  const REPEAT_COUNT = 3;

  return (
    <section className="pt-4 pb-6 bg-white overflow-hidden select-none" dir="ltr">
      <div className="container mx-auto px-5 mb-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm lg:text-base uppercase tracking-[0.3em] text-gray-900 font-medium"
        >
          Our Partners
        </motion.p>
      </div>

      <div className="flex flex-col relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="relative overflow-hidden w-full">
          <motion.div
            className="flex w-max gap-4 md:gap-5"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: MARQUEE_DURATION,
            }}
          >
            {[...Array(REPEAT_COUNT)].flatMap((_, repeatIdx) =>
              logos.map((logo, i) => (
              <div
                  key={`${repeatIdx}-${i}`}
                  className="shrink-0 flex items-center justify-center w-40 h-[4.608rem] md:w-48 md:h-[5.76rem] px-4 md:px-6 bg-white border border-gray-200 rounded-xl shadow-sm"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-[4.608rem] md:h-[5.76rem] max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
