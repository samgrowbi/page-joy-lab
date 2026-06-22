import googleMapsLogo from "@/assets/google-maps-logo.webp";
import yelpLogo from "@/assets/yelp-logo.webp";
import trustpilotLogo from "@/assets/trustpilot-logo.webp";
import aboutHero from "@/assets/about-hero.webp";

import { Button } from "@/components/ui/button";
import { useTreatment } from "@/context/TreatmentContext";
import { BRAND_NAME, BUSINESS_CITY } from "@/config/brand";
import { AccentWord } from "./ui/AccentWord";

interface AboutProps {
  onBookingClick: () => void;
}

export function About({ onBookingClick }: AboutProps) {

  return (
    <section id="about" className="py-4 md:py-8 lg:py-16 bg-white relative overflow-hidden" dir="ltr">
      {/* Subtle background - muted rose instead of pink */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-50/40 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-5 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16 relative">

          {/* Video Section - Desktop Only, height driven by text */}
          <div className="hidden lg:block w-full lg:w-1/2 relative self-stretch">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl shadow-rose-100/50 border border-rose-100/60 group">
              <img
                src={aboutHero}
                alt="Facial treatment"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Content Section - tighter width */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-10 lg:justify-center">
            <div>
              <p className="text-[18px] lg:text-base font-bold text-gray-400 tracking-wide uppercase mb-1 lg:mb-3">Who We Are</p>
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 mb-3 lg:mb-6 leading-tight">
                Where Expertise Meets{" "}
                <AccentWord>Results</AccentWord>
              </h2>
              <div className="text-gray-600 text-sm lg:text-lg xl:text-xl leading-relaxed font-light max-w-xl lg:max-w-2xl space-y-2 lg:space-y-4 text-justify">
                <p className="font-semibold">{BRAND_NAME} is a {BUSINESS_CITY}-based aesthetic spa specializing in advanced skin and body treatments backed by clinically proven technology.</p>
                <p>We don't believe in one-size-fits-all skincare. Every client who walks through our doors receives a tailored assessment before treatment begins, ensuring the results you see are the results you came for.</p>
                <p>Our spa is equipped with premium professional products and next-gen devices, operated by certified estheticians who understand both the science and the person behind every visit.</p>
              </div>
            </div>

            {/* Video Section - Mobile Only */}
            <div className="block lg:hidden w-full relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-rose-100/50 border border-rose-100/60 group">
                <img
                  src={aboutHero}
                  alt="Facial treatment"
                  loading="lazy"
                  className="w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />
              </div>
            </div>



            {/* Platform Logos */}
            <div className="flex items-center justify-center gap-5 md:gap-12">
              <img src={googleMapsLogo} alt="Google Maps" loading="lazy" className="h-14 md:h-[104px] object-contain opacity-80" />
              <img src={yelpLogo} alt="Yelp" loading="lazy" className="h-6 md:h-11 object-contain opacity-80" />
              <img src={trustpilotLogo} alt="Trustpilot" loading="lazy" className="h-6 md:h-11 object-contain opacity-80" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
