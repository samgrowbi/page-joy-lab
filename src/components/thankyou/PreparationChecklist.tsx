import { Check } from "lucide-react";
import preparationImage from "@/assets/thankyou/preparation.webp";
import { useTreatment } from "@/context/TreatmentContext";

const facialChecklist = [
  "Arrive 5-10 minutes early",
  "Stay hydrated",
  "Avoid heavy lotions on the treatment area",
  "Bring any questions you may have",
];

const bodyChecklist = [
  "Arrive 5-10 minutes early",
  "Stay hydrated before and after your session",
  "Wear comfortable, loose-fitting clothing",
  "Avoid heavy meals right before your appointment",
  "Bring any questions you may have",
];

export function PreparationChecklist() {
  const treatment = useTreatment();
  const items = treatment.slug === "body-sculpting" ? bodyChecklist : facialChecklist;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 text-center">
            How to Prepare
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Checklist */}
            <div className="order-2 md:order-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
                <ul className="space-y-4">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-6">
                If you are running late, please call us so we can best assist you.
              </p>
            </div>

            {/* Image */}
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={preparationImage} 
                  alt="Preparing for your treatment appointment"
                  className="w-full h-64 md:h-80 object-cover"
                 loading="lazy" decoding="async"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
