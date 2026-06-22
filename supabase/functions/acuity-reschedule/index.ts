import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { appointmentId, datetime } = await req.json();

    if (!appointmentId) {
      return new Response(
        JSON.stringify({ error: 'Appointment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!datetime) {
      return new Response(
        JSON.stringify({ error: 'New datetime is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = Deno.env.get('ACUITY_USER_ID');
    const apiKey = Deno.env.get('ACUITY_API_KEY');

    if (!userId || !apiKey) {
      console.error('Missing Acuity credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auth = btoa(`${userId}:${apiKey}`);

    console.log(`Rescheduling appointment ${appointmentId} to ${datetime}`);

    const response = await fetch(
      `https://acuityscheduling.com/api/v1/appointments/${appointmentId}/reschedule?admin=true&noEmail=false`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datetime }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Acuity API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to reschedule appointment', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Appointment rescheduled successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, appointment: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
