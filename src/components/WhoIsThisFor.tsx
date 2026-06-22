import { motion, type Variants } from "motion/react";
import { AccentWord } from "./ui/AccentWord";
import { Waves, ArrowDownToLine, Sun, CloudMoon, Droplets, CircleDot } from "lucide-react";

const concerns = [
  { text: "Wrinkles & Fine Lines", icon: Waves },
  { text: "Loss of Firmness & Sagging", icon: ArrowDownToLine },
  { text: "Uneven Skin Tone & Pigmentation", icon: Sun },
  { text: "Dull or Tired-Looking Complexion", icon: CloudMoon },
  { text: "Redness & Skin Irritation", icon: Droplets },
  { text: "Enlarged Pores & Rough Texture", icon: CircleDot },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function WhoIsThisFor() {
  return (
    <section className="py-6 md:py-8 lg:py-16 bg-gradient-to-b from-white via-pink-50/30 to-white" dir="ltr">
      <div className="container mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-14"
        >
          <p className="text-xs md:text-sm uppercase tracking-[0.22em] text-pink-500 font-bold mb-3">
            Made For You
          </p>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight">
            Who Is This <AccentWord>For?</AccentWord>
          </h2>
          <p className="text-gray-500 text-base md:text-lg lg:text-xl mt-3 lg:mt-5 max-w-2xl mx-auto font-light">
            Anyone over 35 experiencing visible signs of skin aging
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 max-w-3xl lg:max-w-6xl mx-auto"
        >
          {concerns.map(({ text, icon: Icon }) => (
            <motion.div
              key={text}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 px-5 py-6 lg:px-7 lg:py-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(236,72,153,0.35)] hover:border-pink-200"
            >
              {/* Soft gradient blob — animates in on hover */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-pink-200/40 via-pink-100/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Left accent bar */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[3px] bg-gradient-to-b from-pink-400 to-pink-600 rounded-r-full transition-all duration-500 group-hover:h-3/5" />

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-pink-50 flex items-center justify-center transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-pink-400 group-hover:shadow-lg group-hover:shadow-pink-300/40 group-hover:scale-110">
                  <Icon
                    className="w-5 h-5 lg:w-6 lg:h-6 text-pink-500 transition-colors duration-500 group-hover:text-white"
                    strokeWidth={1.75}
                  />
                </div>

                {/* Text */}
                <p className="text-gray-800 font-medium text-[15px] lg:text-lg leading-snug pt-1.5 lg:pt-2 transition-colors duration-300 group-hover:text-gray-900">
                  {text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
