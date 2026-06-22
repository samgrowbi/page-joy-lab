import spaReceptionImage from "@/assets/thankyou/spa-reception.webp";
import { useTreatment } from "@/context/TreatmentContext";

const defaultSteps = [
  {
    title: "Check-In",
    duration: "5 minutes",
    description: "Confirm your goals and medical intake.",
  },
  {
    title: "Professional Consultation",
    duration: "10-15 minutes",
    description: "We assess your skin and explain exactly how the treatment works.",
  },
  {
    title: "Your Treatment Session",
    duration: null,
    description: "Comfortable, non-invasive, and guided by a specialist.",
  },
  {
    title: "Optional Next Steps",
    duration: null,
    description: "Only if you want to enhance or extend your results.",
  },
];

const bodySteps = [
  {
    title: "Check-In",
    duration: "5 minutes",
    description: "Confirm your goals and body assessment intake.",
  },
  {
    title: "Body Assessment & Consultation",
    duration: "10-15 minutes",
    description: "We assess your target areas and explain exactly how the body sculpting treatment works.",
  },
  {
    title: "Body Sculpting Session",
    duration: null,
    description: "Advanced non-invasive technology works to tone muscles, reduce fat, and contour your body.",
  },
  {
    title: "Optional Next Steps",
    duration: null,
    description: "Only if you want to enhance or extend your results.",
  },
];

export function VisitTimeline() {
  const treatment = useTreatment();
  const steps = treatment.slug === "body-sculpting" ? bodySteps : defaultSteps;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-5">
        <div className="max-w-4xl mx-auto">
          {/* Header Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-10">
            <img 
              src={spaReceptionImage} 
              alt="Our welcoming spa reception area"
              className="w-full h-48 md:h-64 object-cover"
             loading="lazy" decoding="async"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="hidden sm:block text-2xl md:text-3xl font-serif font-bold text-white text-center">
                Here's Exactly What to Expect
              </h2>
            </div>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-rose-200 hidden md:block" />
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-4 md:gap-6">
                  {/* Step number */}
                  <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-rose-200 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-sm font-semibold text-rose-600">{index + 1}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      {step.duration && (
                        <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-10 font-medium">
            No pressure. No obligation. Just expert care.
          </p>
        </div>
      </div>
    </section>
  );
}
