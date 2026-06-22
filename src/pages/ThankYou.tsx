import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingDialog } from "@/components/BookingDialog";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { TreatmentProvider } from "@/context/TreatmentContext";
import { getTreatmentBySlug } from "@/config/treatmentRegistry";
import { BRAND_NAME } from "@/config/brand";

// Thank You page components
import { HeroConfirmation } from "@/components/thankyou/HeroConfirmation";
import { AppointmentSnapshot } from "@/components/thankyou/AppointmentSnapshot";
import { TreatmentInfo } from "@/components/thankyou/TreatmentInfo";
import { WhyShowingUpMatters } from "@/components/thankyou/WhyShowingUpMatters";
import { VisitTimeline } from "@/components/thankyou/VisitTimeline";
import { PreparationChecklist } from "@/components/thankyou/PreparationChecklist";
import { CommitmentReinforcement } from "@/components/thankyou/CommitmentReinforcement";
import { ThankYouTestimonials } from "@/components/thankyou/ThankYouTestimonials";
import { ThankYouLocation } from "@/components/thankyou/ThankYouLocation";
import { FooterDisclaimer } from "@/components/thankyou/FooterDisclaimer";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [showBooking, setShowBooking] = useState(false);

  const appointmentId = searchParams.get("appointmentId");
  const datetime = searchParams.get("datetime");
  const firstName = searchParams.get("firstName");
  const treatment = searchParams.get("treatment");
  const duration = searchParams.get("duration");
  const slug = searchParams.get("slug");
  const timezone = searchParams.get("timezone");
  const calendarTimezone = searchParams.get("calendarTimezone");
  const location = searchParams.get("location");

  const treatmentConfig = getTreatmentBySlug(slug);

  const openBooking = () => setShowBooking(true);
  const closeBooking = () => setShowBooking(false);

  // Scroll to top and set title when page loads
  useEffect(() => {
    document.title = `${BRAND_NAME} | Thank You`;
    window.scrollTo(0, 0);
  }, []);

  // Track booking conversion with Meta Pixel (only once per appointment)
  useEffect(() => {
    const eventId = `schedule_${appointmentId || Date.now()}`;
    const storageKey = `pixel_schedule_sent_${appointmentId || 'unknown'}`;
    if (window.fbq && !sessionStorage.getItem(storageKey)) {
      window.fbq('track', 'Schedule', {
        content_name: treatment || treatmentConfig.label,
        content_category: 'Booking',
        appointment_id: appointmentId,
      }, { eventID: eventId });
      sessionStorage.setItem(storageKey, '1');
    }
  }, [treatment, appointmentId, treatmentConfig.label]);

  return (
    <TreatmentProvider treatment={treatmentConfig}>
      <div dir="ltr" className="min-h-screen bg-white font-sans antialiased text-gray-900">
        <Navbar onBookingClick={openBooking} />
        
        <main className="pt-20">
          {/* Back Link */}
          <div className="container mx-auto px-4 py-6">
            <button 
              onClick={() => {
                const isSafeReturn = (p?: string | null): p is string =>
                  !!p && !p.startsWith("/thank-you");

                const stateReturn = (routeLocation.state as { returnTo?: string } | null)?.returnTo;
                if (isSafeReturn(stateReturn)) {
                  navigate(stateReturn);
                  return;
                }

                let storedReturn: string | null = null;
                try {
                  storedReturn = sessionStorage.getItem("thankYouReturnPath");
                } catch {
                  storedReturn = null;
                }
                if (isSafeReturn(storedReturn)) {
                  navigate(storedReturn);
                  return;
                }

                if (document.referrer) {
                  try {
                    const ref = new URL(document.referrer);
                    if (ref.origin === window.location.origin) {
                      const refPath = ref.pathname + ref.search + ref.hash;
                      if (isSafeReturn(refPath)) {
                        navigate(refPath);
                        return;
                      }
                    }
                  } catch {
                    // ignore invalid referrer
                  }
                }

                const slugToPath: Record<string, string> = {
                  led: "/",
                  "instant-lift": "/",
                  "led-cryo": "/led-cryo",
                  "body-sculpting": "/body-sculpting",
                };
                navigate(slugToPath[treatmentConfig.slug] ?? (treatmentConfig.slug ? `/book/${treatmentConfig.slug}` : "/"));
              }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Schedule Another Appointment
            </button>
          </div>

          {/* Section 1: Hero Confirmation */}
          <HeroConfirmation firstName={firstName} />

          {/* Section 2: Appointment Snapshot */}
          <AppointmentSnapshot 
            appointmentId={appointmentId}
            datetime={datetime} 
            treatment={treatment || treatmentConfig.label}
            duration={duration || treatmentConfig.duration.toString()}
            timezone={calendarTimezone || timezone}
            location={location}
          />

          {/* Section 3: Treatment Info */}
          <TreatmentInfo />

          {/* Section 4: Why Showing Up Matters */}
          <WhyShowingUpMatters />

          {/* Section 5: Visit Timeline */}
          <VisitTimeline />

          {/* Section 6: Preparation Checklist */}
          <PreparationChecklist />

          {/* Section 7: Commitment Reinforcement */}
          <CommitmentReinforcement />

          {/* Section 8: Testimonials */}
          <ThankYouTestimonials />

          {/* Section 9: Location */}
          <ThankYouLocation />

          {/* Section 10: Footer Disclaimer */}
          <FooterDisclaimer />
        </main>

        <Footer />
        <BookingDialog isOpen={showBooking} onClose={closeBooking} />
        <Toaster position="top-center" />
      </div>
    </TreatmentProvider>
  );
}
