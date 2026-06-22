import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, X } from "lucide-react";
import { useTreatment } from "@/context/TreatmentContext";
import { Events, track } from "@/lib/analytics";

interface ExitIntentPopupProps {
  onBookingClick: () => void;
}

export const ExitIntentPopup = ({ onBookingClick }: ExitIntentPopupProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const hasTriggeredRef = useRef(false);
  const treatment = useTreatment();

  useEffect(() => {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const lastShownTime = localStorage.getItem("exitPopupLastShown");

    if (lastShownTime) {
      const timeSinceLastShown = Date.now() - parseInt(lastShownTime, 10);
      if (timeSinceLastShown < TWENTY_FOUR_HOURS_MS) {
        hasTriggeredRef.current = true;
        return;
      }
    }

    const trigger = (reason: string) => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setShowPopup(true);
      localStorage.setItem("exitPopupLastShown", Date.now().toString());
      track(Events.ExitIntentShown, { treatment: treatment.slug, reason });
    };

    // Desktop: cursor leaves toward top of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) trigger("desktop_mouse_leave");
    };

    // Mobile: fast scroll-up after the user has scrolled down enough
    let lastY = window.scrollY;
    let lastT = Date.now();
    const SCROLL_UP_VELOCITY_PX_PER_MS = 1.2; // ~1200px/s
    const MIN_SCROLL_DEPTH_PX = 600;

    const handleScroll = () => {
      const y = window.scrollY;
      const t = Date.now();
      const dy = lastY - y; // positive when scrolling up
      const dt = Math.max(t - lastT, 1);
      const velocity = dy / dt;
      if (lastY > MIN_SCROLL_DEPTH_PX && velocity > SCROLL_UP_VELOCITY_PX_PER_MS) {
        trigger("mobile_fast_scroll_up");
      }
      lastY = y;
      lastT = t;
    };

    const isMobile = window.innerWidth < 768;
    const timeout = setTimeout(() => {
      if (isMobile) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      } else {
        document.addEventListener("mouseleave", handleMouseLeave);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [treatment.slug]);

  const handleBooking = () => {
    track(Events.ExitIntentCtaClicked, { treatment: treatment.slug });
    setShowPopup(false);
    onBookingClick();
  };

  const handleDismiss = () => {
    setShowPopup(false);
  };

  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent dir="ltr" className="sm:max-w-lg p-0 overflow-hidden border-pink-300 border-2 rounded-2xl [&>button]:hidden">
        {/* Pink Header */}
        <div className="relative bg-gradient-to-r from-pink-400 via-pink-500 to-pink-400 px-6 py-8 text-center text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <h2 dir="ltr" className="text-2xl md:text-3xl font-playfair font-semibold mb-2">
            Still Thinking It Over?
          </h2>
          <p className="font-heebo text-white/90 text-sm font-medium">
            Your first session is still available at ${treatment.price}
          </p>
        </div>

        {/* White Content */}
        <div className="p-6 bg-white font-heebo">
          {/* Message */}
          <div className="text-center mb-5">
            <p className="text-gray-700 text-base leading-relaxed">
              But spots are limited!
            </p>
            <p className="text-gray-700 text-base leading-relaxed">
              Secure yours before someone else does.
            </p>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Deposit Required
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="cta"
            size="cta"
            className="w-full mb-3"
            onClick={handleBooking}
          >
            Book My Session
          </Button>

          {/* Dismiss Link */}
          <button
            onClick={handleDismiss}
            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
          >
            No thanks, I'll pay full price later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
