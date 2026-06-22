import { lazy, Suspense, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { InlineBooking } from "@/components/InlineBooking";
import { TrustStrip } from "@/components/TrustStrip";
import { WhoIsThisFor } from "@/components/WhoIsThisFor";
import { StickyCTA } from "@/components/StickyCTA";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { Toaster } from "sonner";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { TreatmentProvider } from "@/context/TreatmentContext";
import { INSTANT_LIFT_TREATMENT } from "@/config/treatments";
import { BRAND_NAME } from "@/config/brand";

const Results = lazy(() => import("@/components/Results").then(m => ({ default: m.Results })));
const ProblemSolution = lazy(() => import("@/components/ProblemSolution").then(m => ({ default: m.ProblemSolution })));
const Gallery = lazy(() => import("@/components/Gallery").then(m => ({ default: m.Gallery })));
const Feedback = lazy(() => import("@/components/Feedback").then(m => ({ default: m.Feedback })));
const Technology = lazy(() => import("@/components/Technology").then(m => ({ default: m.Technology })));
const ClientReviews = lazy(() => import("@/components/ClientReviews").then(m => ({ default: m.ClientReviews })));
const VisitSteps = lazy(() => import("@/components/VisitSteps").then(m => ({ default: m.VisitSteps })));
const Partners = lazy(() => import("@/components/Partners").then(m => ({ default: m.Partners })));
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const Location = lazy(() => import("@/components/Location").then(m => ({ default: m.Location })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const InstantLiftInner = () => {
  useEffect(() => {
    document.title = `${BRAND_NAME} | ${INSTANT_LIFT_TREATMENT.label}`;
  }, []);
  const { openBooking } = useBookingNavigation();

  return (
    <div className="font-sans antialiased text-gray-900 bg-white">
      <Navbar onBookingClick={openBooking} />
      <main>
        <Hero onBookingClick={openBooking} />
        <section className="py-2 sm:py-4 bg-white" dir="ltr">
          <div className="container mx-auto px-4">
            <InlineBooking />
          </div>
        </section>
        <TrustStrip />
        <WhoIsThisFor />
        <Suspense fallback={<div className="min-h-[150px]" />}>
          <Results />
          <ProblemSolution />
          <Technology onBookingClick={openBooking} />
          <VisitSteps />
          <Feedback />
          <ClientReviews />
          <FAQ />
          <About onBookingClick={openBooking} />
          <Partners />
          <Gallery />
          <Location />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyCTA onBookingClick={openBooking} />
      <ExitIntentPopup onBookingClick={openBooking} />
      <Toaster position="top-center" />
    </div>
  );
};

const InstantLift = () => (
  <TreatmentProvider treatment={INSTANT_LIFT_TREATMENT}>
    <InstantLiftInner />
  </TreatmentProvider>
);

export default InstantLift;
