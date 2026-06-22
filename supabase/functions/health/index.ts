const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({ status: "ok", timestamp: Math.floor(Date.now() / 1000) }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
