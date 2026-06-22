import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_ACUITY_TIMEZONE } from "@/config/acuity";

const PINK_SELECTED = "#F44798";
const PINK_BORDER = "rgba(244, 71, 152, 0.2)";

interface TimeSlot {
  time: string;
  slotsAvailable: number;
}

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  availableTimes: TimeSlot[];
  isLoading: boolean;
  timezone?: string;
}

const getTimezoneName = (timezone: string): string => {
  const timezoneNames: Record<string, string> = {
    "America/New_York": "Eastern Time (ET)",
    "America/Chicago": "Central Time (CT)",
    "America/Denver": "Mountain Time (MT)",
    "America/Los_Angeles": "Pacific Time (PT)",
    "America/Phoenix": "Arizona Time (AZ)",
    "America/Anchorage": "Alaska Time (AK)",
    "Pacific/Honolulu": "Hawaii Time (HT)",
  };
  return timezoneNames[timezone] || timezone;
};

export function TimeSlotPicker({
  selectedDate,
  selectedTime,
  onTimeSelect,
  availableTimes,
  isLoading,
  timezone,
}: TimeSlotPickerProps) {
  const displayTimezone = timezone || DEFAULT_ACUITY_TIMEZONE;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <Skeleton className="h-7 w-40 mx-auto" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Loading available times...
      </div>
    );
  }

  if (availableTimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No available times for this date.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please select a different date.
        </p>
      </div>
    );
  }

  const formatTimeDisplay = (timeString: string) => {
    try {
      return formatInTimeZone(timeString, displayTimezone, "h:mm a");
    } catch {
      return timeString;
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 p-4 sm:p-6 lg:p-8">
      <h3
        className="font-serif font-normal text-foreground text-center text-[25px] lg:text-[32px] xl:text-[36px]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Available times
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
        {availableTimes.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time)}
              style={{
                backgroundColor: isSelected ? PINK_SELECTED : "#ffffff",
                borderColor: isSelected ? "transparent" : PINK_BORDER,
              }}
              className={cn(
                "h-12 lg:h-14 xl:h-16 rounded-xl border text-sm lg:text-base xl:text-lg font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "hover:scale-[1.03] hover:shadow-sm",
                isSelected
                  ? "text-white shadow-md scale-[1.03]"
                  : "text-foreground"
              )}
            >
              {formatTimeDisplay(slot.time)}
            </button>
          );
        })}
      </div>
      <p className="text-xs lg:text-sm xl:text-base text-muted-foreground text-center">
        All times shown in {getTimezoneName(displayTimezone)}
      </p>
    </div>
  );
}
