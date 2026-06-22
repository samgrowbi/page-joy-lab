import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAcuityBooking } from "@/hooks/useAcuityBooking";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { BookingForm } from "@/components/booking/BookingForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { TreatmentConfig } from "@/config/treatments";
import { useEffect } from "react";
import { BRAND_NAME } from "@/config/brand";

interface BookingPageProps {
  treatment: TreatmentConfig;
}

const BookingPage = ({ treatment }: BookingPageProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const booking = useAcuityBooking(undefined, isMobile, treatment);

  useEffect(() => {
    document.title = `${BRAND_NAME} | Book ${treatment.label}`;
  }, [treatment.label]);

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
    <div dir="ltr" className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-50 to-pink-100 border-b shrink-0 sticky top-0 z-10">
        <div className="container mx-auto px-5 pt-3 pb-4">
          {/* Breadcrumb back link */}
          <button
            onClick={() => navigate(`/${treatment.slug === "led" ? "" : treatment.slug}`)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors mb-2 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {treatment.label}</span>
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={canGoBack ? booking.goBack : () => navigate(-1)}
              className="p-2 hover:bg-pink-200/50 rounded-full transition-colors"
              aria-label="Previous step"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="p-2 bg-pink-100 rounded-full">
              <Calendar className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground font-medium">
                {getStepTitle()}
              </h1>
              <p className="text-sm text-muted-foreground">
                {booking.treatmentDetails.name} • ${booking.treatmentDetails.price} • {booking.treatmentDetails.duration} Minutes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-5 py-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg shadow-pink-100/50 overflow-hidden">
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

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            {booking.bookingError && (
              <p className="text-sm text-red-600 mb-3 text-center">{booking.bookingError}</p>
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
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
