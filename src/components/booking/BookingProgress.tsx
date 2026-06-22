import { cn } from "@/lib/utils";
import { BookingStep } from "@/hooks/useAcuityBooking";
import { CalendarClock, Calendar, Clock, User, CheckCircle, Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface BookingProgressProps {
  currentStep: BookingStep;
  isMobile: boolean;
}

const mobileSteps = [
  { id: "date", label: "Date", icon: Calendar },
  { id: "time", label: "Time", icon: Clock },
  { id: "details", label: "Details", icon: User },
  { id: "confirmation", label: "Confirmed", icon: CheckCircle },
] as const;

const desktopSteps = [
  { id: "datetime", label: "Date & Time", icon: CalendarClock },
  { id: "details", label: "Details", icon: User },
  { id: "confirmation", label: "Confirmed", icon: CheckCircle },
] as const;

export function BookingProgress({ currentStep, isMobile }: BookingProgressProps) {
  const steps = isMobile ? mobileSteps : desktopSteps;
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const justAdvanced = currentIndex > prevIndex;

  useEffect(() => {
    const timeout = setTimeout(() => setPrevIndex(currentIndex), 400);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  return (
    <div className="px-2 sm:px-4 py-3 bg-muted/30 overflow-x-auto">
      <div className={cn(
        "flex items-center justify-center gap-0",
        isMobile ? "min-w-fit mx-auto" : "max-w-md mx-auto justify-between"
      )}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const justCompleted = justAdvanced && index === currentIndex - 1;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex flex-col items-center",
                isMobile ? "min-w-[52px]" : "min-w-[60px]"
              )}>
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                    isActive && "bg-pink-500 text-white animate-scale-bounce",
                    isCompleted && "bg-pink-500 text-white",
                    justCompleted && "animate-pulse-once",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check 
                      className={cn(
                        "h-4 w-4",
                        justCompleted && "animate-check-draw"
                      )}
                      style={{ strokeDasharray: 24 }}
                    />
                  ) : (
                    <Icon className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive && "scale-110"
                    )} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs mt-1 transition-all duration-300 text-center whitespace-nowrap",
                    isActive && "text-pink-600 font-medium",
                    isCompleted && "text-pink-600",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "relative h-0.5 bg-muted overflow-hidden shrink-0",
                  isMobile ? "w-4 mx-0.5" : "w-8 sm:w-16 mx-1 sm:mx-3"
                )}>
                  <div
                    className={cn(
                      "absolute inset-0 bg-pink-500 origin-left transition-transform duration-300",
                      index < currentIndex ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
