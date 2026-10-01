import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { TreatmentConfig } from "@/config/treatments";
import { useNext7Availability } from "@/hooks/useNext7Availability";
import { WaitlistForm } from "./WaitlistForm";

interface WaitlistPromptProps {
  treatment: TreatmentConfig;
  className?: string;
}

/**
 * Shown above the booking calendar ONLY when Acuity has no bookable slots in
 * the next 7 days. The calendar stays usable; this offers the waitlist as an
 * option and opens the form in a popup.
 */
export function WaitlistPrompt({ treatment, className = "" }: WaitlistPromptProps) {
  const nextWeek = useNext7Availability(treatment.appointmentTypeId, treatment.calendarId);
  const [open, setOpen] = useState(false);

  if (nextWeek.status !== "unavailable") return null;

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 ${className}`}
      >
        <BellRing className="hidden sm:block h-5 w-5 shrink-0 text-pink-500" aria-hidden />
        <p className="flex-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Don't see your preferred date or time?</span>{" "}
          Join the waitlist and we'll contact you as soon as a spot opens.
        </p>
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 bg-pink-500 hover:bg-pink-600 text-white"
        >
          Join the waitlist
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="ltr" className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Join the waitlist</DialogTitle>
          <DialogDescription className="sr-only">
            Leave your details and preferred date and time.
          </DialogDescription>
          <WaitlistForm
            treatment={treatment}
            onSlotsAvailable={() => {
              setOpen(false);
              nextWeek.refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
