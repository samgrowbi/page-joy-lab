import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const sessionId =
      req.headers.get("x-session-id") ??
      (await req.json().catch(() => ({}))).sessionId;

    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid session id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: convo } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!convo?.id) {
      return new Response(
        JSON.stringify({ messages: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("id, role, parts, created_at")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });

    return new Response(
      JSON.stringify({ messages: msgs ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("chat-history error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
