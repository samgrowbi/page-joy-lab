import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  DEFAULT_ACUITY_TIMEZONE,
  TREATMENT_IMAGE, 
} from "@/config/acuity";
import { TreatmentConfig } from "@/config/treatments";
import { IntakeForm } from "@/components/booking/IntakeFormField";
import { formatDateOnly, parseDateOnly } from "@/lib/dateOnly";
import { Events, track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

// Stable per-tab session id used to dedupe lead rows
const getLeadSessionId = (): string => {
  try {
    const existing = sessionStorage.getItem("leadSessionId");
    if (existing) return existing;
    const id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    sessionStorage.setItem("leadSessionId", id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

export type BookingStep = "treatment" | "date" | "time" | "datetime" | "details" | "confirmation";

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingConfirmation {
  id: number;
  datetime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  confirmationPage?: string;
}

export function useAcuityBooking(onBookingSuccess?: () => void, isMobile?: boolean, treatmentConfig?: TreatmentConfig) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>(isMobile ? "date" : "datetime");
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [selectedDate, setSelectedDateRaw] = useState<Date | undefined>();

  // Auto-advance to time step when date is selected on mobile
  const setSelectedDate = (date: Date | undefined) => {
    setSelectedDateRaw(date);
    if (date) {
      track(Events.BookingDateSelected, {
        treatment: treatmentConfig?.slug,
        date: formatDateOnly(date),
      });
    }
    if (date && currentStep === "date") {
      setSlideDirection("forward");
      setCurrentStep("time");
    }
  };
  const [selectedTime, setSelectedTimeRaw] = useState<string | undefined>();

  // Auto-advance to details when time is selected
  const setSelectedTime = (time: string | undefined) => {
    setSelectedTimeRaw(time);
    if (time) {
      track(Events.BookingTimeSelected, {
        treatment: treatmentConfig?.slug,
        time,
      });
    }
    if (time && (currentStep === "time" || currentStep === "datetime")) {
      setSlideDirection("forward");
      setCurrentStep("details");
    }
  };
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [intakeFields, setIntakeFields] = useState<Record<number, string>>({});
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // ---- Lead capture (every form attempt, successful or abandoned) ----
  const leadSessionIdRef = useRef<string>(getLeadSessionId());
  const leadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upsertLead = async (overrides: Record<string, unknown> = {}) => {
    try {
      const payload: Record<string, unknown> = {
        session_id: leadSessionIdRef.current,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        email: formData.email || null,
        phone: formData.phone ? `+1${formData.phone}` : null,
        treatment_slug: treatmentConfig?.slug || null,
        appointment_type_id: String(treatmentConfig?.appointmentTypeId || "93509464"),
        selected_datetime: selectedTime || null,
        status: "started",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        ...overrides,
      };
      await (supabase.from("leads") as any).upsert(payload, { onConflict: "session_id" });
    } catch (err) {
      console.warn("Lead capture failed", err);
    }
  };

  // Debounced upsert whenever the user is on the details step and edits fields
  useEffect(() => {
    if (currentStep !== "details") return;
    if (!formData.firstName && !formData.lastName && !formData.email && !formData.phone) return;
    if (leadDebounceRef.current) clearTimeout(leadDebounceRef.current);
    leadDebounceRef.current = setTimeout(() => {
      upsertLead();
    }, 800);
    return () => {
      if (leadDebounceRef.current) clearTimeout(leadDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData.firstName, formData.lastName, formData.email, formData.phone]);


  // Sync initial step when isMobile detection completes
  useEffect(() => {
    if (currentStep === "datetime" && isMobile) {
      setCurrentStep("date");
    } else if (currentStep === "date" && isMobile === false) {
      setCurrentStep("datetime");
    }
  }, [isMobile]);

  // Track booking step views
  useEffect(() => {
    track(Events.BookingStepViewed, {
      treatment: treatmentConfig?.slug,
      step: currentStep,
    });
  }, [currentStep, treatmentConfig?.slug]);

  const appointmentTypeID = treatmentConfig?.appointmentTypeId || "93509464";
  const calendarID = treatmentConfig?.calendarId || "14112013";

  const filterIntakeForms = (forms: IntakeForm[]) =>
    forms
      .filter((form) => !["Private SOAP Notes", "Botox Questionnaire"].includes(form.name))
      .map((form) => ({
        ...form,
        fields: form.fields.filter((field) => {
          const fieldNameLower = field.name.toLowerCase();
          return (
            !fieldNameLower.includes("medical conditions") &&
            !fieldNameLower.includes("medications") &&
            !fieldNameLower.includes("allergies")
          );
        }),
      }))
      .filter((form) => form.fields.length > 0);


  // Fetch appointment type details from Acuity
  const appointmentTypeQuery = useQuery({
    queryKey: ["acuity-appointment-type", appointmentTypeID],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-appointment-type?appointmentTypeID=${appointmentTypeID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointment type");
      }
      
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (appointment types rarely change)
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch calendar details (including timezone) from Acuity
  const calendarQuery = useQuery({
    queryKey: ["acuity-calendar", calendarID],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-calendar?calendarID=${calendarID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch calendar details");
      }
      
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour (calendar settings rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Get calendar timezone with fallback
  const calendarTimezone = calendarQuery.data?.timezone || DEFAULT_ACUITY_TIMEZONE;

  // Use Acuity API data, but override name/duration with local treatment config
  const treatmentDetails = appointmentTypeQuery.data
    ? {
        ...appointmentTypeQuery.data,
        name: treatmentConfig?.label || appointmentTypeQuery.data.name,
        duration: treatmentConfig?.duration || appointmentTypeQuery.data.duration,
        image: treatmentConfig?.image || TREATMENT_IMAGE,
        originalPrice: treatmentConfig?.originalPrice || appointmentTypeQuery.data.price,
      }
    : {
        id: parseInt(appointmentTypeID),
        name: treatmentConfig?.label || "Loading...",
        description: "",
        duration: treatmentConfig?.duration || "",
        price: treatmentConfig?.price || "",
        originalPrice: treatmentConfig?.originalPrice || "",
        category: "Treatment",
        color: "#8B5CF6",
        image: treatmentConfig?.image || TREATMENT_IMAGE,
      };

  // Fetch current month availability
  const availabilityQuery = useQuery({
    queryKey: ["acuity-availability", displayedMonth.getMonth(), displayedMonth.getFullYear(), appointmentTypeID],
    queryFn: async () => {
      const month = (displayedMonth.getMonth() + 1).toString();
      const year = displayedMonth.getFullYear().toString();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-availability?month=${month}&year=${year}&appointmentTypeID=${appointmentTypeID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      
      const availableDates = await response.json();
      return availableDates.map((d: { date: string }) => parseDateOnly(d.date));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch next month availability
  const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  const nextMonthAvailabilityQuery = useQuery({
    queryKey: ["acuity-availability", nextMonth.getMonth(), nextMonth.getFullYear(), appointmentTypeID],
    queryFn: async () => {
      const month = (nextMonth.getMonth() + 1).toString();
      const year = nextMonth.getFullYear().toString();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-availability?month=${month}&year=${year}&appointmentTypeID=${appointmentTypeID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      
      const availableDates = await response.json();
      return availableDates.map((d: { date: string }) => parseDateOnly(d.date));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Merge both months' dates
  const allAvailableDates = [
    ...(availabilityQuery.data || []),
    ...(nextMonthAvailabilityQuery.data || []),
  ].sort((a, b) => a.getTime() - b.getTime());

  // Auto-select first available date when dates load (without advancing step)
  useEffect(() => {
    if (allAvailableDates.length > 0 && !selectedDate) {
      setSelectedDateRaw(allAvailableDates[0]);
    }
  }, [allAvailableDates.length]);

  const timesQuery = useQuery({
    queryKey: ["acuity-times", selectedDate ? formatDateOnly(selectedDate) : null, appointmentTypeID],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      // Use date-only formatting to get the calendar day the user clicked
      const dateStr = formatDateOnly(selectedDate);
      
      // Don't pass calendarID - let Acuity auto-select based on appointment type
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-times?date=${dateStr}&appointmentTypeID=${appointmentTypeID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch times");
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!selectedDate,
  });

  const formsQuery = useQuery({
    queryKey: ["acuity-forms", appointmentTypeID],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-forms?appointmentTypeID=${appointmentTypeID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }

      return response.json() as Promise<IntakeForm[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      track(Events.BookingSubmitted, {
        treatment: treatmentConfig?.slug,
      });
      if (!selectedTime || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        throw new Error("Missing required booking information");
      }

      const visibleForms = filterIntakeForms(formsQuery.data || []);
      const allowedFieldIds = new Set(
        visibleForms.flatMap((f) => f.fields.map((field) => field.id))
      );

      const fields = Object.entries(intakeFields)
        .filter(([id, value]) => value !== "" && allowedFieldIds.has(parseInt(id, 10)))
        .map(([id, value]) => ({
          id: parseInt(id, 10),
          value,
        }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            datetime: selectedTime,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: `+1${formData.phone}`,
            appointmentTypeID,
            // Don't pass calendarID - let Acuity auto-select based on appointment type
            fields,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error(
            "This time slot is no longer available. Please pick a different time or contact us for help."
          );
        }
        if (response.status === 409 || /already|conflict|unavailable/i.test(errorData?.error || "")) {
          throw new Error(
            "That time was just booked by someone else. Please choose another available slot."
          );
        }
        throw new Error(
          errorData.error ||
            "We couldn't complete your booking right now. Please try again in a moment, or call us if the issue persists."
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      track(Events.BookingCompleted, {
        treatment: treatmentConfig?.slug,
        appointmentId: data.id,
        datetime: data.datetime,
      });
      // Mark lead as submitted
      upsertLead({
        status: "submitted",
        appointment_id: data.id ? String(data.id) : null,
        selected_datetime: data.datetime || selectedTime || null,
      });
      // Close the dialog first
      onBookingSuccess?.();
      
      // Build URL params for thank you page
      const params = new URLSearchParams({
        appointmentId: data.id?.toString() || "",
        datetime: data.datetime || selectedTime || "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        treatment: treatmentDetails.name,
        slug: treatmentConfig?.slug || "led",
      });

      // Pass timezone and location from Acuity response
      if (data.timezone) params.set("timezone", data.timezone);
      if (data.calendarTimezone) params.set("calendarTimezone", data.calendarTimezone);
      if (data.location) params.set("location", data.location);
      
      // Save current path so the Thank You back button can return here
      const returnTo = window.location.pathname + window.location.search + window.location.hash;
      try {
        sessionStorage.setItem("thankYouReturnPath", returnTo);
      } catch {
        // ignore storage errors
      }

      // Navigate to thank you page
      navigate(`/thank-you?${params.toString()}`, { state: { returnTo } });
    },
    onError: (error: Error) => {
      track(Events.BookingFailed, {
        treatment: treatmentConfig?.slug,
        message: error?.message,
      });
      upsertLead({
        status: "failed",
        error_message: error?.message || "Unknown error",
      });
    },
  });

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
  };

  const goBack = () => {
    setSlideDirection("backward");
    switch (currentStep) {
      case "time":
        setCurrentStep("date");
        break;
      case "details":
        setCurrentStep(isMobile ? "time" : "datetime");
        break;
      case "confirmation":
        setCurrentStep("details");
        break;
    }
  };

  const goNext = () => {
    setSlideDirection("forward");
    switch (currentStep) {
      case "date":
        if (selectedDate) setCurrentStep("time");
        break;
      case "time":
        if (selectedTime) setCurrentStep("details");
        break;
      case "datetime":
        if (selectedDate && selectedTime) setCurrentStep("details");
        break;
      case "details":
        bookingMutation.mutate();
        break;
    }
  };

  const reset = () => {
    setCurrentStep(isMobile ? "date" : "datetime");
    setSlideDirection("forward");
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setFormData({ firstName: "", lastName: "", email: "", phone: "" });
    setIntakeFields({});
    setConfirmation(null);
  };

  // Filter out unwanted forms and fields
  const filteredForms = filterIntakeForms(formsQuery.data || []);

  const canGoNext = () => {
    switch (currentStep) {
      case "date":
        return !!selectedDate;
      case "time":
        return !!selectedTime;
      case "datetime":
        return !!selectedDate && !!selectedTime;
      case "details":
        // Check basic form data including phone
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          return false;
        }
        // Phone must be 10 digits and not start with 1
        if (formData.phone.length < 10 || formData.phone.startsWith("1")) {
          return false;
        }
        // Check required intake fields (only from filtered forms)
        for (const form of filteredForms) {
          for (const field of form.fields) {
            if (field.required && !intakeFields[field.id]) {
              return false;
            }
          }
        }
        return true;
      default:
        return false;
    }
  };

  const updateIntakeField = (fieldId: number, value: string) => {
    setIntakeFields((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  return {
    currentStep,
    slideDirection,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    displayedMonth,
    setDisplayedMonth,
    formData,
    setFormData,
    intakeFields,
    updateIntakeField,
    confirmation,
    treatmentDetails,
    isLoadingTreatment: appointmentTypeQuery.isLoading,
    calendarTimezone,
    availableDates: allAvailableDates,
    isLoadingDates: availabilityQuery.isLoading && nextMonthAvailabilityQuery.isLoading,
    availableTimes: timesQuery.data || [],
    isLoadingTimes: timesQuery.isLoading,
    intakeForms: filteredForms,
    isLoadingForms: formsQuery.isLoading,
    isBooking: bookingMutation.isPending,
    bookingError: bookingMutation.error?.message,
    goToStep,
    goBack,
    goNext,
    reset,
    canGoNext,
  };
}
