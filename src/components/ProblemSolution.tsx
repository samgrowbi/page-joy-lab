import { motion } from "motion/react";
import iconFineLines from "@/assets/icons/icon-fine-lines.webp";
import iconFirmness from "@/assets/icons/icon-firmness.webp";
import iconSoothe from "@/assets/icons/icon-soothe.webp";
import { AccentWord } from "./ui/AccentWord";

const benefitIcons = [iconFineLines, iconFirmness, iconSoothe];

const benefits = [
  {
    title: "Reduces Fine Lines & Wrinkles",
    description: "Boosts collagen for smoother skin and a fresh complexion",
  },
  {
    title: "Firms & Lifts Sagging Skin",
    description: "Restores elasticity for a tighter look with a defined jawline and neck",
  },
  {
    title: "Improves Skin Tone & Texture",
    description: "Refines pores, evens skin tone, and brings back your natural radiance",
  },
];

const problemCopy = `As skin matures, it loses the collagen and elasticity that keep it firm, smooth, and radiant. Fine lines deepen. Skin loses its lift. Your complexion looks tired even when you're not. These aren't signs of neglect, they're biology. And no moisturiser or serum is going to reverse that on its own.`;

const bridgeLine = { text: "Your skin has changed.", highlight: "Your treatment should too." };

export function ProblemSolution() {
  return (
    <section className="py-4 md:py-8 lg:py-16 bg-white" dir="ltr">
      <div className="container mx-auto px-5">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8 lg:mb-12"
        >
           <h2 className="hidden sm:block text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight">
             Feel Comfortable In <AccentWord>Your Skin</AccentWord>
          </h2>
        </motion.div>

        {/* Desktop: 2-col | Mobile: benefits first, then paragraph */}
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left – Problem Copy + Bridge Line */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-gray-700 text-[17px] md:text-lg lg:text-2xl xl:text-[26px] leading-relaxed font-light text-left">
              {problemCopy}
            </p>
            <p className="text-lg md:text-xl lg:text-3xl xl:text-4xl uppercase tracking-[0.2em] text-pink-500 font-medium mt-6 lg:mt-10 text-left">
              {bridgeLine.text} <span className="text-pink-500">{bridgeLine.highlight}</span>
            </p>
          </motion.div>

          {/* Right – Benefit Cards (no icons) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-3 lg:space-y-5"
          >
            {benefits.map((b, i) => {
              const icon = benefitIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3 lg:gap-5 px-1 py-2 lg:py-3"
                >
                  <img src={icon} alt="" className="w-10 h-10 lg:w-16 lg:h-16 flex-shrink-0 mt-0.5" loading="lazy" width={40} height={40} />
                  <div>
                    <h3 className="text-gray-900 font-semibold text-lg md:text-xl lg:text-2xl xl:text-[26px] mb-1.5 lg:mb-2 text-left">
                      {b.title}
                    </h3>
                    <p className="text-gray-700 text-base md:text-lg lg:text-lg xl:text-xl font-light leading-relaxed text-left">
                      {b.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
