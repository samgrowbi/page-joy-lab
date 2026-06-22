import treatmentImage from "@/assets/thankyou/treatment-info.webp";
import bodyImage from "@/assets/thankyou/treatment-info-body.webp";
import { useTreatment } from "@/context/TreatmentContext";

const treatmentDescriptions: Record<string, { noteLine: string; description: string }> = {
  led: {
    noteLine: "It is a real, results-driven treatment performed by trained professionals who specialize in advanced skincare technology.",
    description: "Our LED technology delivers therapeutic light energy to stimulate cellular regeneration, promoting collagen production and tissue repair for visible, lasting results.",
  },
  "instant-lift": {
    noteLine: "It is a real, results-driven treatment performed by trained professionals who specialize in advanced skincare technology.",
    description: "Our Instant Lift & Skin Tightening treatment delivers specific wavelengths of light energy into the skin's deeper layers, activating the body's own natural healing process of collagen production and cellular repair. The facial is entirely non-invasive, without heat, injectables, or foreign substances.",
  },
  "led-cryo": {
    noteLine: "It is a real, results-driven treatment performed by trained professionals who specialize in advanced skincare technology.",
    description: "Our LED + Cryo technology combines therapeutic light energy with cryotherapy to stimulate collagen production, tighten skin, and reduce inflammation for visible, lasting results.",
  },
  "body-sculpting": {
    noteLine: "It is a real, results-driven treatment performed by trained professionals who specialize in advanced body sculpting technology.",
    description: "Our body sculpting technology uses advanced non-invasive methods to tone muscles, reduce stubborn fat, and smooth cellulite for a more sculpted, contoured look.",
  },
};

function getTreatmentInfo(treatment: ReturnType<typeof useTreatment>) {
  return treatmentDescriptions[treatment.slug] || treatmentDescriptions["instant-lift"];
}

export function TreatmentInfo() {
  const treatment = useTreatment();
  const info = getTreatmentInfo(treatment);
  const sectionImage = treatment.slug === "body-sculpting" ? bodyImage : treatmentImage;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 text-center">
            What This Treatment Is Designed to Do
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="order-2 md:order-1 space-y-6">
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed">
                  This is <span className="text-primary font-semibold">not</span> a generic session or demo.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {info.noteLine}
                </p>
              </div>

              <div className="bg-white border border-primary/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="font-semibold text-foreground">{treatment.label}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {info.description}
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={sectionImage} 
                  alt={`${treatment.label} in progress at our medspa`}
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
