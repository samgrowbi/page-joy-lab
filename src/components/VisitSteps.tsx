import { motion } from "framer-motion";
import { useTreatment } from "@/context/TreatmentContext";
import consultationImg from "@/assets/thankyou/consultation.webp";
import preparationImg from "@/assets/thankyou/skin-preparation.webp";
import treatmentInfoImg from "@/assets/thankyou/treatment-session.webp";
import teamPreparationImg from "@/assets/thankyou/post-treatment-care.webp";

const defaultSteps = [
  {
    image: consultationImg,
    title: "Consultation & Skin Analysis",
    step: 1,
    description:
      "A brief, personalized assessment to understand your skin concerns and treatment goals.",
  },
  {
    image: preparationImg,
    title: "Expert Skin Preparation",
    step: 2,
    description:
      "Your skin is gently cleansed and prepared to ensure maximum comfort and effectiveness.",
  },
  {
    image: treatmentInfoImg,
    title: "Treatment Session",
    step: 3,
    description:
      "Advanced, non-invasive technology works beneath the skin to tighten, firm, and stimulate collagen.",
  },
  {
    image: teamPreparationImg,
    title: "Post-Treatment Care & Guidance",
    step: 4,
    description:
      "Soothing skincare is applied, along with clear aftercare guidance to support optimal results.",
  },
];

export function VisitSteps() {
  const treatment = useTreatment();
  const treatmentSteps = treatment.visitSteps;
  const useTextOnly = !!treatmentSteps;

  const steps = treatmentSteps
    ? treatmentSteps.map((s, i) => ({ title: s.title, description: s.description, step: i + 1, image: s.image as string | undefined }))
    : defaultSteps.map((s) => ({ ...s, image: s.image as string | undefined }));

  return (
    <section className="py-4 md:py-8 lg:py-16 bg-white" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="text-center mb-8 md:mb-10 lg:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden sm:block text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight"
          >
            Here's Exactly <span className="text-pink-500">What to Expect</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:border-[#C9A96E] hover:shadow-lg"
            >
              {/* Image */}
              {step.image && (
                <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 md:p-5 lg:p-6 text-left">
                {/* Step Badge */}
                <span className="inline-block bg-gray-900 text-white text-xs md:text-sm lg:text-base font-bold px-3 md:px-3 lg:px-4 py-1 md:py-1 lg:py-1.5 rounded-full mb-3 md:mb-3 lg:mb-4">
                  Step {step.step}
                </span>

                {/* Title */}
                <h3 className="text-base md:text-lg lg:text-2xl font-serif font-medium text-gray-900 mb-3 md:mb-3 lg:mb-4 whitespace-pre-line leading-snug text-left">
                  {step.title}
                </h3>

                {/* Description Box */}
                <div className="border border-[#C9A96E]/40 rounded-lg p-3 md:p-3 lg:p-4 bg-[#C9A96E]/5">
                  <p className="text-sm md:text-sm lg:text-base text-gray-700 leading-relaxed text-left">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
