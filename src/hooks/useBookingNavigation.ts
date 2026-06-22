import { useNavigate } from "react-router-dom";
import { useTreatment } from "@/context/TreatmentContext";
import { Events, track } from "@/lib/analytics";

export function useBookingNavigation() {
  const navigate = useNavigate();
  const treatment = useTreatment();

  const openBooking = (source?: string) => {
    track(Events.BookCtaClicked, {
      treatment: treatment.slug,
      source: source ?? "unknown",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    navigate(`/book/${treatment.slug}`);
  };

  return { openBooking };
}
