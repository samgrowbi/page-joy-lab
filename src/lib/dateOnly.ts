/**
 * Date-only utilities for handling Acuity availability dates.
 * These functions avoid timezone shifting by treating dates as calendar days
 * (year/month/day components) rather than absolute instants in time.
 */

/**
 * Formats a Date object to "YYYY-MM-DD" using local date components.
 * This matches how react-day-picker renders calendar day cells.
 */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" string into a local Date object.
 * Creates a Date at midnight local time for the given calendar day.
 * This ensures the Date's getFullYear/getMonth/getDate match the input.
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
