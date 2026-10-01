import { checkNext7Days } from "../_shared/next7.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const appointmentTypeID = url.searchParams.get("appointmentTypeID");
  const calendarID = url.searchParams.get("calendarID");
  if (!appointmentTypeID || !/^\d+$/.test(appointmentTypeID)) {
    return json({ error: "appointmentTypeID is required" }, 400);
  }

  try {
    const result = await checkNext7Days(appointmentTypeID, calendarID);
    // Short cache so a newly opened slot shows up within a minute.
    return json(result, 200, { "Cache-Control": "public, max-age=60" });
  } catch (e) {
    console.error("acuity-next7-slots failed", e);
    // Caller must treat errors as "slots may exist" and show the normal calendar.
    return json({ error: "availability_check_failed" }, 502);
  }
});
