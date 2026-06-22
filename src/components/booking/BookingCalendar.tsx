import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DEFAULT_ACUITY_TIMEZONE } from "@/config/acuity";
import { formatDateOnly } from "@/lib/dateOnly";
import { format } from "date-fns";
import { Flame } from "lucide-react";

const PINK_SOLID = "#F44798";
const PINK_BORDER = "rgba(244, 71, 152, 0.2)";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  availableDates: Date[];
  isLoading: boolean;
  isMobile?: boolean;
  onMonthChange?: (month: Date) => void;
  timezone?: string;
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  availableDates,
  isLoading,
}: BookingCalendarProps) {
  // Group available dates by month
  const groupedByMonth = availableDates.reduce<Record<string, Date[]>>((acc, date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(date);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedByMonth).sort();
  sortedMonths.forEach((key) => {
    groupedByMonth[key].sort((a, b) => a.getTime() - b.getTime());
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-7 w-40 mx-auto" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (availableDates.length === 0) {
    return (
      <div className="flex flex-col items-center p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No available dates found. Please check back later.
        </p>
      </div>
    );
  }

  let globalIndex = 0;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {sortedMonths.map((monthKey) => {
        const dates = groupedByMonth[monthKey];
        const monthLabel = format(dates[0], "MMMM yyyy");

        return (
          <div key={monthKey} className="flex flex-col gap-4 lg:gap-6">
            <h3
              className="font-serif font-normal text-foreground text-center text-[25px] lg:text-[32px] xl:text-[36px]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {monthLabel}
            </h3>
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              {dates.map((date) => {
                const dateStr = formatDateOnly(date);
                const isSelected = selectedDate
                  ? formatDateOnly(selectedDate) === dateStr
                  : false;
                const dayName = format(date, "EEE");
                const dayNum = date.getDate();
                const isFirst = globalIndex === 0;
                globalIndex += 1;

                return (
                  <div key={dateStr} className="relative">
                    {isFirst && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-black text-white text-[0.5rem] lg:text-[0.65rem] font-bold uppercase tracking-wider px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full whitespace-nowrap shadow-sm">
                        <Flame className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                        Earliest
                      </span>
                    )}
                    <button
                      onClick={() => onDateSelect(date)}
                      style={{
                        backgroundColor: isSelected ? PINK_SOLID : "#ffffff",
                        borderColor: isSelected ? "transparent" : PINK_BORDER,
                      }}
                      className={cn(
                        "w-full h-12 lg:h-16 xl:h-20 inline-flex flex-col items-center justify-center rounded-xl border transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "hover:scale-[1.03] hover:shadow-sm",
                        isSelected
                          ? "text-white shadow-md scale-[1.03]"
                          : "text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[0.65rem] lg:text-xs uppercase tracking-wider leading-none",
                          isSelected ? "text-white/80" : "text-muted-foreground"
                        )}
                      >
                        {dayName}
                      </span>
                      <span className="text-lg lg:text-2xl xl:text-3xl font-semibold leading-tight">
                        {dayNum}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
