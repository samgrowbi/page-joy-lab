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
    const appointmentTypeID = url.searchParams.get('appointmentTypeID') || '93509464';

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

    console.log('Fetching forms for appointment type:', appointmentTypeID);

    const response = await fetch(
      `https://acuityscheduling.com/api/v1/forms?appointmentTypeID=${appointmentTypeID}`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Acuity forms error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: errorData.message || 'Failed to fetch forms', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const forms = await response.json();

    const appointmentTypeIdNum = Number.parseInt(appointmentTypeID, 10);
    const filteredForms = Array.isArray(forms)
      ? forms.filter((f: any) =>
          Array.isArray(f?.appointmentTypeIDs)
            ? f.appointmentTypeIDs.includes(appointmentTypeIdNum)
            : false
        )
      : [];

    console.log('Forms fetched successfully:', filteredForms.length, 'forms');

    return new Response(
      JSON.stringify(filteredForms),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } }
    );
  } catch (error) {
    console.error('Error in acuity-forms:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
