// Waitlist settings. Adjust times to match Pearl's opening hours.

/** Days ahead (including today) that must be fully booked before the waitlist shows. */
export const WAITLIST_WINDOW_DAYS = 7;

/** How far ahead people can pick a preferred date on the waitlist. */
export const WAITLIST_MAX_DAYS_AHEAD = 60;

/** Options for "Preferred time". The label is what lands in the Google Sheet. */
export const WAITLIST_TIME_OPTIONS = [
  "Any time",
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM",
] as const;
