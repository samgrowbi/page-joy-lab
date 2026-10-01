import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { BellRing, CalendarDays, Clock, Phone, Check } from "lucide-react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingDialog } from "@/components/BookingDialog";
import { TreatmentProvider } from "@/context/TreatmentContext";
import { getTreatmentBySlug } from "@/config/treatmentRegistry";
import { BRAND_NAME } from "@/config/brand";
import { ThankYouTestimonials } from "@/components/thankyou/ThankYouTestimonials";
import { ThankYouLocation } from "@/components/thankyou/ThankYouLocation";

type WaitlistState = {
  firstName?: string;
  preferredDate?: string; // YYYY-MM-DD
  preferredTime?: string;
} | null;

const formatDate = (ymd?: string) => {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  });
};

const STEPS = [
  { icon: BellRing, title: "We watch the calendar", text: "Our team checks for openings near your preferred date and time." },
  { icon: Phone, title: "We reach out", text: "As soon as a spot opens, we'll call or email you to offer it." },
  { icon: Check, title: "You confirm", text: "Confirm the time that works for you and your appointment is booked." },
];

export default function WaitlistThankYou() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const [showBooking, setShowBooking] = useState(false);

  const entryId = searchParams.get("id");
  const treatmentConfig = getTreatmentBySlug(searchParams.get("slug"));
  const info = (state as WaitlistState) ?? {};
  const prettyDate = formatDate(info.preferredDate);

  useEffect(() => {
    document.title = `${BRAND_NAME} | You're on the Waitlist`;
    window.scrollTo(0, 0);
  }, []);

  // Meta Pixel: waitlist sign-up = Lead (kept separate from Schedule, which is a booked appointment).
  useEffect(() => {
    const key = `pixel_waitlist_lead_sent_${entryId || "unknown"}`;
    try {
      if (window.fbq && !sessionStorage.getItem(key)) {
        window.fbq(
          "track",
          "Lead",
          { content_name: treatmentConfig.label, content_category: "Waitlist" },
          { eventID: `waitlist_${entryId || Date.now()}` },
        );
        sessionStorage.setItem(key, "1");
      }
    } catch {
      // never block the page on tracking
    }
  }, [entryId, treatmentConfig.label]);

  return (
    <TreatmentProvider treatment={treatmentConfig}>
      <div dir="ltr" className="min-h-screen bg-white font-sans antialiased text-gray-900">
        <Navbar onBookingClick={() => setShowBooking(true)} />

        <main className="pt-20">
          <section className="pt-16 pb-10 md:pt-24 md:pb-14 relative overflow-hidden">
            <div
              className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(253,242,248,0.6) 50%, rgba(252,231,243,0.3) 100%)" }}
            />
            <div className="container mx-auto px-5 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-full mb-8">
                <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                <span className="text-base font-medium text-green-700">You're on the Waitlist</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                {info.firstName ? `Thank you, ${info.firstName}!` : "Thank you!"}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We've added you to the waitlist for {treatmentConfig.label}. We'll contact you as soon as a spot opens.
              </p>
            </div>
          </section>

          {(prettyDate || info.preferredTime) && (
            <section className="pb-12">
              <div className="container mx-auto px-5">
                <div className="max-w-xl mx-auto rounded-2xl border border-pink-100 bg-pink-50/60 p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-pink-600 mb-4">Your preference</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {prettyDate && (
                      <div className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-pink-500 mt-0.5" aria-hidden />
                        <div>
                          <p className="text-xs text-muted-foreground">Preferred date</p>
                          <p className="font-medium">{prettyDate}</p>
                        </div>
                      </div>
                    )}
                    {info.preferredTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-pink-500 mt-0.5" aria-hidden />
                        <div>
                          <p className="text-xs text-muted-foreground">Preferred time</p>
                          <p className="font-medium">{info.preferredTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="pb-16">
            <div className="container mx-auto px-5">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-8">What happens next</h2>
              <ol className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-semibold">{i + 1}</span>
                      <Icon className="h-5 w-5 text-pink-500" aria-hidden />
                    </div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <ThankYouTestimonials />
          <ThankYouLocation />
        </main>

        <Footer />
        <BookingDialog isOpen={showBooking} onClose={() => setShowBooking(false)} />
        <Toaster position="top-center" />
      </div>
    </TreatmentProvider>
  );
}
