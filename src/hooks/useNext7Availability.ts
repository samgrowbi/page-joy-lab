import { useQuery } from "@tanstack/react-query";

export type Next7Status = "loading" | "available" | "unavailable" | "error";

interface Next7Response {
  hasSlots: boolean;
  firstSlot: string | null;
  windowStart: string;
  windowEnd: string;
  timezone: string;
}

/**
 * Checks whether Acuity has any bookable slot in the next 7 days.
 * The waitlist must ONLY show for status "unavailable". Loading and error
 * both fall back to the normal booking calendar, so a failed check never
 * hides open slots.
 */
export function useNext7Availability(appointmentTypeID: string, calendarID?: string) {
  const query = useQuery({
    queryKey: ["acuity-next7-slots", appointmentTypeID, calendarID],
    queryFn: async (): Promise<Next7Response> => {
      const params = new URLSearchParams({ appointmentTypeID });
      if (calendarID) params.set("calendarID", calendarID);
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acuity-next7-slots?${params}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        },
      );
      if (!res.ok) throw new Error(`next7 check failed: ${res.status}`);
      const data = await res.json();
      if (typeof data?.hasSlots !== "boolean") throw new Error("next7 check: bad response");
      return data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  let status: Next7Status = "loading";
  if (query.isError) status = "error";
  else if (query.data) status = query.data.hasSlots ? "available" : "unavailable";

  return { status, data: query.data, refetch: query.refetch };
}
