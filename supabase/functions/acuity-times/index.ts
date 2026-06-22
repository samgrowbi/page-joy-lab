import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const appointmentTypeID = url.searchParams.get('appointmentTypeID') || '93509464';
    const calendarID = url.searchParams.get('calendarID'); // Optional - let Acuity auto-select if not provided

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Missing date parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = Deno.env.get('ACUITY_USER_ID');
    const apiKey = Deno.env.get('ACUITY_API_KEY');

    if (!userId || !apiKey) {
      console.error('Missing Acuity credentials');
      return new Response(
        JSON.stringify({ error: 'Acuity credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = btoa(`${userId}:${apiKey}`);
    
    const calendarParam = calendarID ? `&calendarID=${calendarID}` : '';
    const acuityUrl = `https://acuityscheduling.com/api/v1/availability/times?date=${date}&appointmentTypeID=${appointmentTypeID}${calendarParam}`;
    
    console.log('Fetching times from:', acuityUrl);

    const response = await fetch(acuityUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Acuity API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch times', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Times data:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' } }
    );
  } catch (error) {
    console.error('Error in acuity-times:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
