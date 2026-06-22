import { Card } from "./ui/card";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { useAcuityBooking } from "@/hooks/useAcuityBooking";
import { BookingCalendar } from "./booking/BookingCalendar";
import { TimeSlotPicker } from "./booking/TimeSlotPicker";
import { BookingForm } from "./booking/BookingForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTreatment } from "@/context/TreatmentContext";

export function InlineBooking() {
  const isMobile = useIsMobile();
  const treatment = useTreatment();
  const booking = useAcuityBooking(undefined, isMobile, treatment);

  const getStepTitle = () => {
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

  const canGoBack = booking.currentStep !== "date" && booking.currentStep !== "datetime";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8"
      id="inline-booking-section"
      dir="ltr"
    >
      {/* Section Header */}
      <div className="text-center mb-4 lg:mb-8">
        <h3 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif text-gray-900 mb-3 lg:mb-5 font-normal tracking-tight leading-[1.05]">
          Secure Your Spot <span className="text-pink-500 font-semibold">in 30 Seconds</span>
        </h3>
        <div className="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-green-50 border border-green-200 rounded-full">
          <Shield className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-green-600" />
          <span className="text-xs lg:text-sm font-medium text-green-700 tracking-wide uppercase">100% Risk-Free · No Deposit Required</span>
        </div>
      </div>

      {/* Booking Card */}
      <Card className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto border-pink-200 shadow-md shadow-pink-100/50 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2.5 lg:px-5 lg:py-4 bg-gradient-to-r from-pink-50 to-pink-100 border-b">
          <div className="flex items-center gap-2 lg:gap-3">
            {canGoBack && (
              <button
                onClick={booking.goBack}
                className="p-1.5 lg:p-2 hover:bg-pink-200/50 rounded-full transition-colors"
              >
                <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h4 className="text-sm lg:text-2xl xl:text-3xl font-serif text-foreground">
                {getStepTitle()}
              </h4>
              <p className="text-xs lg:text-base xl:text-lg text-muted-foreground">
                {booking.treatmentDetails.name} • ${booking.treatmentDetails.price} • {booking.treatmentDetails.duration} Minutes
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[320px]">
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
        </div>

        {/* Footer */}
        {(booking.currentStep === "date" || booking.currentStep === "details") && (
          <div className="px-3 py-2.5 lg:px-5 lg:py-4 border-t bg-gray-50">
            {booking.bookingError && (
              <p className="text-xs lg:text-sm text-red-600 mb-2 text-center">{booking.bookingError}</p>
            )}
            <Button
              onClick={booking.goNext}
              disabled={!booking.canGoNext() || booking.isBooking}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm lg:text-base h-9 lg:h-12"
            >
              {booking.isBooking ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4 animate-spin" />
                  Booking...
                </>
              ) : booking.currentStep === "details" ? (
                "Confirm Booking"
              ) : (
                "Continue"
              )}
            </Button>
            <p className="mt-2.5 lg:mt-3 text-center text-[11px] lg:text-xs text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
              <Shield className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-green-600" />
              <span>Secure</span>
              <span className="text-gray-300">·</span>
              <span>Cancel Anytime</span>
              <span className="text-gray-300">·</span>
              <span>No Charge Today</span>
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
