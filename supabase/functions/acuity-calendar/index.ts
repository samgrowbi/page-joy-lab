const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACUITY_API_BASE = "https://acuityscheduling.com/api/v1";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const calendarID = url.searchParams.get("calendarID") || "12592007";

    const userId = Deno.env.get("ACUITY_USER_ID");
    const apiKey = Deno.env.get("ACUITY_API_KEY");

    if (!userId || !apiKey) {
      console.error("Missing Acuity credentials");
      return new Response(
        JSON.stringify({ error: "Missing Acuity credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = btoa(`${userId}:${apiKey}`);

    console.log(`Fetching calendar details for calendarID: ${calendarID}`);

    const response = await fetch(`${ACUITY_API_BASE}/calendars`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Acuity API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars from Acuity" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const calendars = await response.json();
    console.log(`Found ${calendars.length} calendars`);

    // Find the calendar matching the ID, or use the first available calendar
    let calendar = calendars.find(
      (cal: { id: number }) => cal.id.toString() === calendarID
    );

    if (!calendar && calendars.length > 0) {
      console.log(`Calendar not found with ID: ${calendarID}, using first available calendar`);
      calendar = calendars[0];
    }

    if (!calendar) {
      console.error(`No calendars available`);
      return new Response(
        JSON.stringify({ error: "No calendars available" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return relevant calendar details
    const calendarDetails = {
      id: calendar.id,
      name: calendar.name,
      timezone: calendar.timezone,
      email: calendar.email,
      location: calendar.location,
      description: calendar.description,
    };

    console.log(`Returning calendar details:`, calendarDetails);

    return new Response(JSON.stringify(calendarDetails), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // 1 hour cache
      },
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
