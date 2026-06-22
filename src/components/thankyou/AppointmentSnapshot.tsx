import { Calendar, MapPin, Clock, Phone } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_ACUITY_TIMEZONE } from "@/config/acuity";
import {
  BUSINESS_ADDRESS_SINGLELINE,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "@/config/brand";

/** Convert IANA timezone to a readable abbreviation like "PT" or "ET" */
function getTimezoneAbbr(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || tz;
  } catch {
    return tz;
  }
}

interface AppointmentSnapshotProps {
  appointmentId: string | null;
  datetime: string | null;
  treatment?: string;
  duration?: string;
  timezone?: string | null;
  location?: string | null;
}

export function AppointmentSnapshot({
  datetime,
  treatment,
  duration,
  timezone,
  location,
}: AppointmentSnapshotProps) {
  const BUSINESS_TIMEZONE = timezone || DEFAULT_ACUITY_TIMEZONE;

  const formatDate = (datetimeStr: string | null) => {
    if (!datetimeStr) return "Date to be confirmed";
    try {
      return formatInTimeZone(datetimeStr, BUSINESS_TIMEZONE, "EEEE, MMMM do, yyyy");
    } catch {
      return "Date to be confirmed";
    }
  };

  const formatTime = (datetimeStr: string | null) => {
    if (!datetimeStr) return "Time to be confirmed";
    try {
      return formatInTimeZone(datetimeStr, BUSINESS_TIMEZONE, "h:mm a");
    } catch {
      return "Time to be confirmed";
    }
  };

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12">
      <div className="container mx-auto px-5">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">Your Appointment Details</h2>

            <div className="space-y-4">
              {/* Treatment */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treatment</p>
                  <p className="font-medium text-foreground">{treatment || "Treatment"}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">{formatDate(datetime)}</p>
                  <p className="text-muted-foreground">
                    {formatTime(datetime)} · {getTimezoneAbbr(BUSINESS_TIMEZONE)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{location || BUSINESS_ADDRESS_SINGLELINE}</p>
                </div>
              </div>

              {/* Duration */}
              {duration && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">Approximately {duration} minutes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reschedule / Cancel notice */}
          <div className="mt-5 rounded-xl border border-pink-200 bg-pink-50/60 p-5 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-pink-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Need to Reschedule or Cancel?</span>
            </div>
            <p className="text-sm md:text-base text-gray-700">
              To reschedule or cancel your appointment, please give us a call at{" "}
              <a
                href={`tel:${BUSINESS_PHONE_TEL}`}
                className="font-semibold text-pink-600 hover:text-pink-700 underline-offset-2 hover:underline"
              >
                {BUSINESS_PHONE_DISPLAY}
              </a>
              . Kindly notify us at least 24 hours in advance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
