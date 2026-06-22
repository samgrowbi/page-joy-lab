import { Check } from "lucide-react";
import consultationImage from "@/assets/thankyou/consultation.webp";
import { useTreatment } from "@/context/TreatmentContext";

const facialBenefits = [
  "A professional consultation",
  "A customized treatment session",
  "Personalized recommendations based on your goals",
];

const bodyBenefits = [
  "A professional body assessment",
  "A customized sculpting session",
  "Personalized recommendations for your body goals",
];

export function WhyShowingUpMatters() {
  const treatment = useTreatment();
  const benefits = treatment.slug === "body-sculpting" ? bodyBenefits : facialBenefits;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 text-center">
            Why This Appointment Matters
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-8 text-center max-w-2xl mx-auto">
            Promotional appointments are limited and reserved in advance by our licensed specialists.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={consultationImage} 
                alt="Specialist having a consultation with client in treatment room"
                className="w-full h-64 md:h-80 object-cover"
               loading="lazy" decoding="async"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div>
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-6 mb-6">
                <p className="text-foreground font-medium mb-4">Your visit includes:</p>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-rose-600" />
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-muted-foreground text-sm">
                Missed appointments prevent us from offering this time to another client seeking treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
