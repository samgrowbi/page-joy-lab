const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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
        JSON.stringify({ error: 'Missing Acuity credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = btoa(`${userId}:${apiKey}`);
    
    const acuityUrl = `https://acuityscheduling.com/api/v1/appointment-types`;
    
    console.log('Fetching appointment types from Acuity');

    const response = await fetch(acuityUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Acuity API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch appointment types', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appointmentTypes = await response.json();
    console.log(`Fetched ${appointmentTypes.length} appointment types`);

    // Find the specific appointment type by ID
    const targetId = parseInt(appointmentTypeID);
    const appointmentType = appointmentTypes.find((type: { id: number }) => type.id === targetId);
    
    if (!appointmentType) {
      console.error(`Appointment type ${appointmentTypeID} not found`);
      return new Response(
        JSON.stringify({ error: 'Appointment type not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return relevant fields
    const result = {
      id: appointmentType.id,
      name: appointmentType.name,
      description: appointmentType.description || '',
      duration: appointmentType.duration,
      price: appointmentType.price || '0',
      category: appointmentType.category || '',
      color: appointmentType.color || '#8B5CF6',
    };

    console.log('Returning appointment type:', result.name);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        } 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching appointment type:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
