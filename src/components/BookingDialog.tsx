import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAcuityBooking } from "@/hooks/useAcuityBooking";
import { useTreatment } from "@/context/TreatmentContext";
import { BookingCalendar } from "./booking/BookingCalendar";
import { TimeSlotPicker } from "./booking/TimeSlotPicker";
import { BookingForm } from "./booking/BookingForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { WaitlistForm } from "./booking/WaitlistForm";
import { useNext7Availability } from "@/hooks/useNext7Availability";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDialog({ isOpen, onClose }: BookingDialogProps) {
  const isMobile = useIsMobile();
  const treatment = useTreatment();
  const booking = useAcuityBooking(onClose, isMobile, treatment);
  const nextWeek = useNext7Availability(treatment.appointmentTypeId, treatment.calendarId);
  const [showCalendarAnyway, setShowCalendarAnyway] = useState(false);
  // Waitlist ONLY when the check confirms zero slots in the next 7 days.
  const showWaitlist = nextWeek.status === "unavailable" && !showCalendarAnyway;
  const isCheckingWeek = nextWeek.status === "loading" && !showCalendarAnyway;

  const getStepTitle = () => {
    if (showWaitlist) return "Join the Waitlist";
    switch (booking.currentStep) {
      case "date":
        return "Select a Date";
      case "time":
        return "Select a Time";
      case "datetime":
        return "Select Date & Time";
      case "details":
        return "Your Details";
      default:
        return "Book Your Appointment";
    }
  };

  const canGoBack =
    !showWaitlist && booking.currentStep !== "date" && booking.currentStep !== "datetime";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="ltr" className="w-[95vw] max-w-4xl max-h-[90vh] rounded-xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 sm:p-5 pb-3 bg-gradient-to-r from-pink-50 to-pink-100 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            {canGoBack && (
              <button
                onClick={booking.goBack}
                className="p-2 hover:bg-pink-200/50 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div className="p-2 bg-pink-100 rounded-full">
              <Calendar className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">
                {getStepTitle()}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {booking.treatmentDetails.name} • ${booking.treatmentDetails.price} • {booking.treatmentDetails.duration} Minutes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isCheckingWeek ? (
            <div className="flex items-center justify-center py-24" aria-label="Checking availability">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : showWaitlist ? (
            <WaitlistForm
              treatment={treatment}
              onViewLaterDates={() => setShowCalendarAnyway(true)}
              onSlotsAvailable={() => { setShowCalendarAnyway(true); nextWeek.refetch(); }}
            />
          ) : (
          <>
          {booking.bookingError && (booking.currentStep === "time" || booking.currentStep === "datetime") && (
            <p className="mx-4 mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
              {booking.bookingError}
            </p>
          )}
          {/* Mobile: Date step */}
          {booking.currentStep === "date" && (
            <BookingCalendar
              selectedDate={booking.selectedDate}
              onDateSelect={booking.setSelectedDate}
              availableDates={booking.availableDates}
              isLoading={booking.isLoadingDates}
              isMobile={isMobile}
              onMonthChange={booking.setDisplayedMonth}
              timezone={booking.calendarTimezone}
            />
          )}

          {/* Mobile: Time step */}
          {booking.currentStep === "time" && (
            <TimeSlotPicker
              selectedDate={booking.selectedDate}
              selectedTime={booking.selectedTime}
              onTimeSelect={booking.setSelectedTime}
              availableTimes={booking.availableTimes}
              isLoading={booking.isLoadingTimes}
              timezone={booking.calendarTimezone}
            />
          )}

          {/* Desktop: Combined date & time */}
          {booking.currentStep === "datetime" && (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 md:border-r">
                <BookingCalendar
                  selectedDate={booking.selectedDate}
                  onDateSelect={booking.setSelectedDate}
                  availableDates={booking.availableDates}
                  isLoading={booking.isLoadingDates}
                  onMonthChange={booking.setDisplayedMonth}
                  timezone={booking.calendarTimezone}
                />
              </div>
              <div className="md:w-1/2">
                <TimeSlotPicker
                  selectedDate={booking.selectedDate}
                  selectedTime={booking.selectedTime}
                  onTimeSelect={booking.setSelectedTime}
                  availableTimes={booking.availableTimes}
                  isLoading={booking.isLoadingTimes}
                  timezone={booking.calendarTimezone}
                />
              </div>
            </div>
          )}

          {/* Details step */}
          {booking.currentStep === "details" && (
            <BookingForm
              formData={booking.formData}
              onFormChange={booking.setFormData}
              intakeForms={booking.intakeForms}
              intakeFields={booking.intakeFields}
              onIntakeFieldChange={booking.updateIntakeField}
              isLoadingForms={booking.isLoadingForms}
              isSubmitting={booking.isBooking}
            />
          )}
          </>
          )}
        </div>

        {/* Footer with navigation */}
        {!showWaitlist && !isCheckingWeek && (booking.currentStep === "date" || booking.currentStep === "details") && (
          <div className="p-4 border-t bg-gray-50 shrink-0">
            {booking.bookingError && (
              <p className="text-sm text-red-600 mb-3 text-center">{booking.bookingError}</p>
            )}
            {booking.currentStep === "details" && !booking.canGoNext() && !booking.isBooking && (
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Still needed: {booking.missingRequirements().join(", ")}
              </p>
            )}

            <Button
              onClick={booking.goNext}
              disabled={!booking.canGoNext() || booking.isBooking}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              {booking.isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : booking.currentStep === "details" ? (
                "Confirm Booking"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
