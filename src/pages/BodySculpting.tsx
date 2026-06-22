import { lazy, Suspense, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { InlineBooking } from "@/components/InlineBooking";
import { StickyCTA } from "@/components/StickyCTA";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { Toaster } from "sonner";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { TreatmentProvider } from "@/context/TreatmentContext";
import { BODY_SCULPTING_TREATMENT } from "@/config/treatments";
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

const BodySculptingInner = () => {
  useEffect(() => { document.title = `${BRAND_NAME} | ${BODY_SCULPTING_TREATMENT.label}`; }, []);
  const { openBooking } = useBookingNavigation();

  return (
    <div className="font-sans antialiased text-gray-900 bg-white">
      <Navbar onBookingClick={openBooking} />
      <main>
        <Hero onBookingClick={openBooking} />
        <section className="py-2 sm:py-12 bg-white" dir="ltr">
          <div className="container mx-auto px-4">
            <InlineBooking />
          </div>
        </section>
        <Suspense fallback={<div className="min-h-[200px]" />}>
          <Results />
          <ProblemSolution />
          <Feedback />
          <Technology onBookingClick={openBooking} />
          <ClientReviews />
          <VisitSteps />
          <Partners />
          <About onBookingClick={openBooking} />
          <Location />
          <Gallery />
          <FAQ />
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

const BodySculpting = () => (
  <TreatmentProvider treatment={BODY_SCULPTING_TREATMENT}>
    <BodySculptingInner />
  </TreatmentProvider>
);

export default BodySculpting;
