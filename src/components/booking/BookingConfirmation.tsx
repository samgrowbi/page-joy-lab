import { CheckCircle, Calendar, Clock, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingConfirmation as BookingConfirmationType } from "@/hooks/useAcuityBooking";
import { format, parseISO } from "date-fns";

interface BookingConfirmationProps {
  confirmation: BookingConfirmationType;
  onClose: () => void;
}

export function BookingConfirmation({ confirmation, onClose }: BookingConfirmationProps) {
  const formatDateTime = (datetime: string) => {
    try {
      const date = parseISO(datetime);
      return {
        date: format(date, "EEEE, MMMM d, yyyy"),
        time: format(date, "h:mm a"),
      };
    } catch {
      return { date: datetime, time: "" };
    }
  };

  const { date, time } = formatDateTime(confirmation.datetime);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="mb-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-20" />
        </div>
      </div>
      
      <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
        Booking Confirmed!
      </h3>
      <p className="text-muted-foreground mb-6">
        Your appointment has been successfully scheduled.
      </p>
      
      <div className="w-full max-w-sm bg-muted/30 rounded-lg p-4 space-y-3 text-left mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-pink-500" />
          <span className="text-sm">{date}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-pink-500" />
          <span className="text-sm">{time}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-pink-500" />
          <span className="text-sm">{confirmation.firstName} {confirmation.lastName}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-pink-500" />
          <span className="text-sm">{confirmation.email}</span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        A confirmation email has been sent to your email address.
      </p>
      
      <Button 
        onClick={onClose}
        className="bg-pink-500 hover:bg-pink-600 text-white"
      >
        Close
      </Button>
    </div>
  );
}
