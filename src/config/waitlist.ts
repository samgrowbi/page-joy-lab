// Waitlist settings.

/** Days ahead (including today) that must be fully booked before the waitlist shows. */
export const WAITLIST_WINDOW_DAYS = 7;

/** How far ahead people can pick a preferred date on the waitlist. */
export const WAITLIST_MAX_DAYS_AHEAD = 60;

/** Options for "Preferred time". The label is what lands in the Google Sheet. */
export const WAITLIST_TIME_OPTIONS = [
  "First half of the day",
  "Second half of the day",
  "Either is fine",
] as const;
