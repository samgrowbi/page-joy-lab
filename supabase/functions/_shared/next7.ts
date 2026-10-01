// Shared: does this appointment type have ANY bookable slot in the next 7 days?
// "Next 7 days" = today + the following 6 days, in the Acuity calendar's timezone.
// Acuity's availability endpoints already apply min-notice, max-advance and
// blocked-off time, so if a slot shows up here it is genuinely bookable.

const ACUITY_API = "https://acuityscheduling.com/api/v1";
export const WINDOW_DAYS = 7;
const FALLBACK_TZ = "America/Toronto";

export type Next7Result = {
  hasSlots: boolean;
  firstSlot: string | null; // ISO datetime of earliest slot, if any
  windowStart: string; // YYYY-MM-DD
  windowEnd: string; // YYYY-MM-DD (inclusive)
  timezone: string;
};

function authHeader(): string {
  const userId = Deno.env.get("ACUITY_USER_ID");
  const apiKey = Deno.env.get("ACUITY_API_KEY");
  if (!userId || !apiKey) throw new Error("Acuity credentials not configured");
  return `Basic ${btoa(`${userId}:${apiKey}`)}`;
}

async function acuityGet(path: string): Promise<any> {
  const res = await fetch(`${ACUITY_API}${path}`, {
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Acuity ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

// YYYY-MM-DD for "now + offsetDays" in the given IANA timezone
function ymdInTz(tz: string, offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

async function calendarTimezone(calendarID?: string | null): Promise<string> {
  try {
    const calendars = await acuityGet("/calendars");
    const cal = calendars.find((c: any) => String(c.id) === String(calendarID)) ?? calendars[0];
    return cal?.timezone || FALLBACK_TZ;
  } catch (e) {
    console.warn("Calendar timezone lookup failed, using fallback", e);
    return FALLBACK_TZ;
  }
}

export async function checkNext7Days(
  appointmentTypeID: string,
  calendarID?: string | null,
): Promise<Next7Result> {
  const timezone = await calendarTimezone(calendarID);
  const windowStart = ymdInTz(timezone, 0);
  const windowEnd = ymdInTz(timezone, WINDOW_DAYS - 1);

  // The window can span two months.
  const months = Array.from(new Set([windowStart.slice(0, 7), windowEnd.slice(0, 7)]));
  const tzParam = `&timezone=${encodeURIComponent(timezone)}`;

  const dateLists = await Promise.all(
    months.map((m) =>
      acuityGet(`/availability/dates?month=${m}&appointmentTypeID=${appointmentTypeID}${tzParam}`),
    ),
  );

  const candidateDates: string[] = dateLists
    .flat()
    .map((d: any) => String(d.date))
    .filter((d) => d >= windowStart && d <= windowEnd)
    .sort();

  // Confirm with real times — a "date" can come back with zero times left
  // (e.g. today's remaining slots are inside the min-notice window).
  for (const date of candidateDates) {
    const times = await acuityGet(
      `/availability/times?date=${date}&appointmentTypeID=${appointmentTypeID}${tzParam}`,
    );
    const open = (times as any[]).filter((t) => (t.slotsAvailable ?? 1) > 0);
    if (open.length > 0) {
      return { hasSlots: true, firstSlot: open[0].time, windowStart, windowEnd, timezone };
    }
  }

  return { hasSlots: false, firstSlot: null, windowStart, windowEnd, timezone };
}
