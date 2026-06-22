const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const META_PIXEL_ID = "954258890721709";
const META_API_VERSION = "v19.0";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashEmail(email?: string | null): Promise<string | null> {
  if (!email) return null;
  return await sha256Hex(String(email).trim().toLowerCase());
}

async function hashPhone(phone?: string | null): Promise<string | null> {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "").toLowerCase();
  if (!digits) return null;
  return await sha256Hex(digits);
}

function pickPayment(body: Record<string, any>) {
  // Try common Clover shapes
  const amountCents =
    body?.payment?.amount ??
    body?.order?.total ??
    body?.data?.amount ??
    body?.amount ??
    0;
  const value = (Number(amountCents) / 100).toFixed(2);

  const email =
    body?.customer?.email ??
    body?.payment?.customer?.email ??
    body?.order?.customer?.email ??
    body?.email ??
    null;

  const phone =
    body?.customer?.phoneNumber ??
    body?.customer?.phone ??
    body?.payment?.customer?.phoneNumber ??
    body?.order?.customer?.phoneNumber ??
    body?.phone ??
    null;

  return { value, email, phone };
}

function pickCustomer(body: Record<string, any>) {
  const customer = body?.customer ?? body?.data ?? body;
  const email = customer?.email ?? customer?.emailAddresses?.[0]?.emailAddress ?? null;
  const phone =
    customer?.phoneNumber ??
    customer?.phone ??
    customer?.phoneNumbers?.[0]?.phoneNumber ??
    null;
  return { email, phone };
}

function detectEventType(body: Record<string, any>, headers: Headers): "payment" | "customer" | "unknown" {
  const t = String(
    body?.type ?? body?.eventType ?? body?.event ?? headers.get("x-clover-event") ?? ""
  ).toLowerCase();
  if (t.includes("payment") || t.includes("order")) return "payment";
  if (t.includes("customer")) return "customer";
  // Heuristic fallback
  if (body?.payment || body?.order || body?.amount) return "payment";
  if (body?.customer || body?.email) return "customer";
  return "unknown";
}

async function sendPurchaseToMeta(value: string, email: string | null, phone: string | null) {
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!accessToken) {
    console.error("Missing META_CAPI_ACCESS_TOKEN");
    return;
  }

  const user_data: Record<string, string> = {};
  const em = await hashEmail(email);
  const ph = await hashPhone(phone);
  if (em) user_data.em = em;
  if (ph) user_data.ph = ph;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "physical_store",
        user_data,
        custom_data: {
          currency: "USD",
          value,
        },
      },
    ],
    access_token: accessToken,
  };

  console.log("Sending Purchase to Meta CAPI:", JSON.stringify({ ...payload, access_token: "[redacted]" }));

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Meta CAPI error:", res.status, result);
  } else {
    console.log("Meta CAPI response:", result);
  }
}

async function sendCustomerToAudience(email: string | null, phone: string | null) {
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  const audienceId = Deno.env.get("META_CUSTOM_AUDIENCE_ID");
  if (!accessToken || !audienceId) {
    console.error("Missing META_CAPI_ACCESS_TOKEN or META_CUSTOM_AUDIENCE_ID");
    return;
  }

  const em = await hashEmail(email);
  const ph = await hashPhone(phone);

  if (!em && !ph) {
    console.log("No email or phone for customer audience; skipping");
    return;
  }

  const payload = {
    payload: {
      schema: ["EMAIL", "PHONE"],
      data: [[em ?? "", ph ?? ""]],
    },
    access_token: accessToken,
  };

  console.log(
    "Sending customer to Meta Custom Audience:",
    JSON.stringify({ ...payload, access_token: "[redacted]" })
  );

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${audienceId}/users`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Meta Custom Audience error:", res.status, result);
  } else {
    console.log("Meta Custom Audience response:", result);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({} as Record<string, any>));
    console.log("Received Clover webhook:", JSON.stringify(body));

    const eventType = detectEventType(body, req.headers);

    if (eventType === "payment") {
      const { value, email, phone } = pickPayment(body);
      await sendPurchaseToMeta(value, email, phone);
    } else if (eventType === "customer") {
      const { email, phone } = pickCustomer(body);
      await sendCustomerToAudience(email, phone);
    } else {
      console.log("Unhandled Clover event type; acknowledging without forwarding");
    }
  } catch (err) {
    console.error("clover-webhook error:", err);
  }

  // Always 200 so Clover does not retry forever
  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
