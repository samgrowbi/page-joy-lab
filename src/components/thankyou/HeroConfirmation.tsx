import { Check } from "lucide-react";

interface HeroConfirmationProps {
  firstName: string | null;
}

export function HeroConfirmation({ firstName }: HeroConfirmationProps) {
  return (
    <section className="pt-16 pb-8 md:pt-24 md:pb-12 relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div 
        className="absolute inset-0 -z-10" 
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(253,242,248,0.6) 50%, rgba(252,231,243,0.3) 100%)'
        }}
      />
      <div className="container mx-auto px-5 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-full mb-8 animate-scale-fade-in">
          <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
          <span className="text-base font-medium text-green-700">Appointment Confirmed</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
          Your Personalized Treatment Is Reserved
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {firstName ? `${firstName}, your` : "Your"} appointment has been carefully scheduled with our clinical team and customized for your goals.
        </p>
      </div>
    </section>
  );
}
