const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const META_PIXEL_ID = "954258890721709";
const META_API_VERSION = "v20.0";

async function hashData(data: string): Promise<string> {
  if (!data) return "";
  const normalized = data.toLowerCase().trim();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return "1" + digits;
  }
  return digits;
}

// Fetch full appointment details from Acuity API
async function fetchAppointmentDetails(appointmentId: string): Promise<Record<string, any> | null> {
  const userId = Deno.env.get('ACUITY_USER_ID');
  const apiKey = Deno.env.get('ACUITY_API_KEY');

  if (!userId || !apiKey) {
    console.error("Missing Acuity credentials for fetching appointment");
    return null;
  }

  const credentials = btoa(`${userId}:${apiKey}`);

  try {
    const response = await fetch(
      `https://acuityscheduling.com/api/v1/appointments/${appointmentId}`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch appointment:", response.status);
      const text = await response.text();
      console.error("Response:", text);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}

async function sendToMeta(eventData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  appointmentId: string;
  price?: string;
}) {
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");

  if (!accessToken) {
    console.error("META_CAPI_ACCESS_TOKEN not configured");
    return { success: false, error: "Missing access token" };
  }

  const eventTime = Math.floor(Date.now() / 1000);

  const userData: Record<string, string> = {};
  if (eventData.email) userData.em = await hashData(eventData.email);
  if (eventData.phone) userData.ph = await hashData(normalizePhone(eventData.phone));
  if (eventData.firstName) userData.fn = await hashData(eventData.firstName);
  if (eventData.lastName) userData.ln = await hashData(eventData.lastName);
  userData.country = await hashData("us");

  const eventPayload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        action_source: "system_generated",
        event_id: `acuity_checkin_${eventData.appointmentId}_${eventTime}`,
        user_data: userData,
        custom_data: {
          appointment_id: eventData.appointmentId,
          conversion_type: "checked_in",
          currency: "USD",
          value: parseFloat(eventData.price || "0") || 0
        }
      }
    ]
  };

  console.log("Sending event to Meta:", JSON.stringify(eventPayload, null, 2));

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta API error:", result);
      return { success: false, error: result };
    }

    console.log("Meta API response:", result);
    return { success: true, result };
  } catch (error: unknown) {
    console.error("Error sending to Meta:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let webhookData: Record<string, any>;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      webhookData = Object.fromEntries(formData.entries());
    } else if (contentType.includes("application/json")) {
      webhookData = await req.json();
    } else {
      const text = await req.text();
      try {
        webhookData = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        webhookData = Object.fromEntries(params.entries());
      }
    }

    console.log("Received Acuity webhook:", JSON.stringify(webhookData, null, 2));

    const appointmentId = webhookData.id || webhookData.appointmentId;
    const action = webhookData.action || "";

    if (!appointmentId) {
      return new Response(
        JSON.stringify({ message: "No appointment ID found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Acuity webhooks send minimal data (action, id, calendarID, appointmentTypeID).
    // We need to fetch the full appointment to check labels and get contact info.
    // Trigger on "changed" action (label changes) or any action that might indicate check-in.
    if (action === "changed" || action === "checked_in") {
      console.log(`Action "${action}" received, fetching full appointment details...`);

      const appointment = await fetchAppointmentDetails(String(appointmentId));

      if (!appointment) {
        return new Response(
          JSON.stringify({ message: "Could not fetch appointment details" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      console.log("Appointment labels:", appointment.labels);
      console.log("Appointment canceled:", appointment.canceled);
      console.log("Appointment noShow:", appointment.noShow);

      // Check if the appointment has "Checked In" label and is not canceled/noShow
      const labels = Array.isArray(appointment.labels)
        ? appointment.labels.map((l: any) => (typeof l === 'string' ? l : l.name || '')).join(',').toLowerCase()
        : String(appointment.labels || '').toLowerCase();

      const isCanceled = appointment.canceled === true || appointment.canceled === "true";
      const isNoShow = appointment.noShow === true || appointment.noShow === "true";

      const hasArrivedLabel =
        (labels.includes("checked in") || labels.includes("checked-in") || labels.includes("arrived"))
        && !isCanceled && !isNoShow;

      if (hasArrivedLabel) {
        console.log("Appointment marked as Checked In / Arrived, sending Purchase event to Meta...");

        const result = await sendToMeta({
          email: appointment.email,
          phone: appointment.phone,
          firstName: appointment.firstName,
          lastName: appointment.lastName,
          appointmentId: String(appointmentId),
          price: appointment.price || appointment.priceSold,
        });

        return new Response(
          JSON.stringify({ message: "Checked In - Purchase event sent to Meta", metaResult: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      console.log("Appointment fetched but not checked in");
    } else {
      console.log(`Action "${action}" - not processing for check-in`);
    }

    return new Response(
      JSON.stringify({ message: "Webhook received", processed: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
