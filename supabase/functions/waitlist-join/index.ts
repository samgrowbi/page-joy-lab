import { createClient } from "npm:@supabase/supabase-js@2";
import { checkNext7Days } from "../_shared/next7.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

async function pushToSheet(row: Record<string, unknown>): Promise<boolean> {
  const url = Deno.env.get("WAITLIST_SHEET_WEBHOOK_URL");
  const secret = Deno.env.get("WAITLIST_SHEET_SECRET");
  if (!url || !secret) {
    console.error("WAITLIST_SHEET_WEBHOOK_URL / WAITLIST_SHEET_SECRET not set");
    return false;
  }
  try {
    // Apps Script answers with a 302 to googleusercontent; fetch follows it.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, ...row }),
      redirect: "follow",
    });
    const text = await res.text();
    const ok = res.ok && text.includes('"ok":true');
    if (!ok) console.error("Sheet webhook rejected", res.status, text.slice(0, 300));
    return ok;
  } catch (e) {
    console.error("Sheet webhook error", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (clean(body.website)) return json({ ok: true });

  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 160).toLowerCase();
  const phoneDigits = clean(body.phone, 20).replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const preferredDate = clean(body.preferredDate, 10);
  const preferredTime = clean(body.preferredTime, 40);
  const treatmentSlug = clean(body.treatmentSlug, 60);
  const treatmentLabel = clean(body.treatmentLabel, 120);
  const appointmentTypeID = clean(body.appointmentTypeID, 20);
  const calendarID = clean(body.calendarID, 20) || null;

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "required";
  if (!lastName) errors.lastName = "required";
  if (!EMAIL_RE.test(email)) errors.email = "invalid";
  if (phoneDigits.length !== 10) errors.phone = "invalid";
  if (!DATE_RE.test(preferredDate)) errors.preferredDate = "invalid";
  if (!preferredTime) errors.preferredTime = "required";
  if (!/^\d+$/.test(appointmentTypeID)) errors.appointmentTypeID = "invalid";
  if (Object.keys(errors).length) return json({ error: "validation", fields: errors }, 400);

  // Server-side guard: the waitlist is only for when the next 7 days are full.
  // If slots exist (someone cancelled, or the request didn't come from our UI),
  // send them to booking instead. If the check itself fails, accept the entry
  // rather than lose a lead.
  try {
    const avail = await checkNext7Days(appointmentTypeID, calendarID);
    if (avail.hasSlots) {
      return json({ error: "slots_available", firstSlot: avail.firstSlot }, 409);
    }
  } catch (e) {
    console.warn("Availability re-check failed; accepting waitlist entry", e);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const record = {
    first_name: firstName,
    last_name: lastName,
    email,
    phone: `+1${phoneDigits}`,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    treatment_slug: treatmentSlug || null,
    treatment_label: treatmentLabel || null,
    appointment_type_id: appointmentTypeID,
    source_url: clean(body.sourceUrl, 500) || null,
    user_agent: clean(req.headers.get("user-agent"), 300) || null,
  };

  const { data, error } = await supabase.from("waitlist").insert(record).select("id, created_at").single();
  if (error) {
    console.error("waitlist insert failed", error);
    return json({ error: "save_failed" }, 500);
  }

  const synced = await pushToSheet({
    id: data.id,
    submittedAt: data.created_at,
    firstName,
    lastName,
    email,
    phone: record.phone,
    preferredDate,
    preferredTime,
    treatment: treatmentLabel || treatmentSlug,
    sourceUrl: record.source_url,
  });

  await supabase
    .from("waitlist")
    .update({ sheet_synced: synced, sheet_synced_at: synced ? new Date().toISOString() : null })
    .eq("id", data.id);

  // The entry is saved either way; sheet sync failures are retried from the table.
  return json({ ok: true, id: data.id });
});
