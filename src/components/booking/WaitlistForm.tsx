import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { TreatmentConfig } from "@/config/treatments";
import { WAITLIST_MAX_DAYS_AHEAD, WAITLIST_TIME_OPTIONS } from "@/config/waitlist";

interface WaitlistFormProps {
  treatment: TreatmentConfig;
  /** Lets the visitor skip the waitlist and book a date beyond the next 7 days. */
  onViewLaterDates?: () => void;
  /** Called if the server finds a slot opened up while they were filling the form. */
  onSlotsAvailable: () => void;
}

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  firstName: "", lastName: "", email: "", phone: "", preferredDate: "", preferredTime: "",
};

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const phoneDigits = (v: string) => {
  let d = v.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
};
const formatPhone = (d: string) => {
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

function validate(f: Fields, minDate: string, maxDate: string): Errors {
  const e: Errors = {};
  if (!f.firstName.trim()) e.firstName = "Enter your first name";
  if (!f.lastName.trim()) e.lastName = "Enter your last name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email";
  if (f.phone.length !== 10) e.phone = "Enter a 10-digit phone number";
  if (!f.preferredDate) e.preferredDate = "Choose a date";
  else if (f.preferredDate < minDate || f.preferredDate > maxDate) e.preferredDate = "Choose a date in the range shown";
  if (!f.preferredTime) e.preferredTime = "Choose a time";
  return e;
}

export function WaitlistForm({ treatment, onViewLaterDates, onSlotsAvailable }: WaitlistFormProps) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const max = new Date();
    max.setDate(today.getDate() + WAITLIST_MAX_DAYS_AHEAD);
    return { minDate: toYmd(today), maxDate: toYmd(max) };
  }, []);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const found = validate(fields, minDate, maxDate);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/waitlist-join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          ...fields,
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          treatmentSlug: treatment.slug,
          treatmentLabel: treatment.label,
          appointmentTypeID: treatment.appointmentTypeId,
          calendarID: treatment.calendarId,
          sourceUrl: window.location.href,
          website: honeypot,
        }),
      });

      if (res.status === 409) {
        // A slot opened up — send them to the calendar instead.
        onSlotsAvailable();
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(() => ({}));
      const params = new URLSearchParams({ slug: treatment.slug });
      if (data?.id) params.set("id", data.id);
      navigate(`/waitlist-thank-you?${params}`, {
        state: {
          firstName: fields.firstName.trim(),
          preferredDate: fields.preferredDate,
          preferredTime: fields.preferredTime,
        },
      });
    } catch {
      setSubmitError("We couldn't add you to the waitlist. Check your connection and try again, or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (k: keyof Fields) => (errors[k] ? "border-red-400 focus-visible:ring-red-300" : "");
  const err = (k: keyof Fields) =>
    errors[k] ? <p id={`wl-${k}-err`} className="text-xs text-red-600 mt-1">{errors[k]}</p> : null;

  return (
    <div className="p-5 sm:p-8">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-serif text-foreground mb-2">The next 7 days are fully booked</h2>
        <p className="text-muted-foreground mb-6">
          Join the waitlist and we'll reach out as soon as a spot opens near your preferred date and time.
        </p>

        <form
          noValidate
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Honeypot — hidden from people, filled by bots */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
          </div>

          <div>
            <Label htmlFor="wl-firstName">First name</Label>
            <Input id="wl-firstName" autoComplete="given-name" value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)} className={fieldClass("firstName")}
              aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "wl-firstName-err" : undefined} />
            {err("firstName")}
          </div>
          <div>
            <Label htmlFor="wl-lastName">Last name</Label>
            <Input id="wl-lastName" autoComplete="family-name" value={fields.lastName}
              onChange={(e) => set("lastName", e.target.value)} className={fieldClass("lastName")}
              aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "wl-lastName-err" : undefined} />
            {err("lastName")}
          </div>
          <div>
            <Label htmlFor="wl-email">Email</Label>
            <Input id="wl-email" type="email" inputMode="email" autoComplete="email" value={fields.email}
              onChange={(e) => set("email", e.target.value)} className={fieldClass("email")}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "wl-email-err" : undefined} />
            {err("email")}
          </div>
          <div>
            <Label htmlFor="wl-phone">Phone number</Label>
            <Input id="wl-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 123-4567"
              value={formatPhone(fields.phone)} onChange={(e) => set("phone", phoneDigits(e.target.value))}
              className={fieldClass("phone")}
              aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "wl-phone-err" : undefined} />
            {err("phone")}
          </div>
          <div>
            <Label htmlFor="wl-preferredDate">Preferred date</Label>
            <Input id="wl-preferredDate" type="date" min={minDate} max={maxDate} value={fields.preferredDate}
              onChange={(e) => set("preferredDate", e.target.value)} className={fieldClass("preferredDate")}
              aria-invalid={!!errors.preferredDate} aria-describedby={errors.preferredDate ? "wl-preferredDate-err" : undefined} />
            {err("preferredDate")}
          </div>
          <div>
            <Label htmlFor="wl-preferredTime">Preferred time</Label>
            <Select value={fields.preferredTime} onValueChange={(v) => set("preferredTime", v)}>
              <SelectTrigger id="wl-preferredTime" className={fieldClass("preferredTime")}
                aria-invalid={!!errors.preferredTime}>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {WAITLIST_TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("preferredTime")}
          </div>

          {submitError && (
            <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <div className="sm:col-span-2 flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={submitting}
              className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white text-base">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Joining…</> : "Join the waitlist"}
            </Button>
            {onViewLaterDates && (
              <button type="button" onClick={onViewLaterDates}
                className="text-sm text-pink-600 hover:text-pink-700 underline underline-offset-4">
                Or book a date after the next 7 days
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
