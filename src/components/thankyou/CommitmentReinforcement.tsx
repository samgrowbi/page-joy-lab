import teamPreparationImage from "@/assets/thankyou/team-preparation.webp";

export function CommitmentReinforcement() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={teamPreparationImage} 
          alt="Our team preparing for your appointment"
          className="w-full h-full object-cover"
         loading="lazy" decoding="async"/>
        <div className="absolute inset-0 bg-rose-900/70" />
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">
            We Are Preparing for You
          </h2>
          
          <p className="text-rose-100 leading-relaxed mb-4">
            Once your appointment is booked, our team begins preparing your room, equipment, and staffing specifically for your visit.
          </p>
          
          <p className="text-rose-100 leading-relaxed">
            We appreciate your commitment to arriving on time or notifying us in advance if changes are needed.
          </p>
        </div>
      </div>
    </section>
  );
}
