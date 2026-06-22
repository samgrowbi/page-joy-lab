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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      datetime, 
      fields, 
      appointmentTypeID = '93509464',
      // IMPORTANT: do not default calendarID; only send it if caller explicitly provides one.
      // Sending the wrong calendarID can trigger a 403 Forbidden from Acuity.
      calendarID
    } = body;

    if (!firstName || !lastName || !email || !datetime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: firstName, lastName, email, datetime' }),
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
    
    const bookingData: Record<string, unknown> = {
      appointmentTypeID: typeof appointmentTypeID === 'string' ? parseInt(appointmentTypeID) : appointmentTypeID,
      datetime,
      firstName,
      lastName,
      email,
      phone: phone || '',
      admin: true, // Required for API bookings
    };

    // Only include calendarID if provided
    if (calendarID) {
      bookingData.calendarID = typeof calendarID === 'string' ? parseInt(calendarID) : calendarID;
    }

    // Add intake form fields if provided
    if (fields && Array.isArray(fields) && fields.length > 0) {
      bookingData.fields = fields;
    }

    console.log('Creating booking with data:', bookingData);

    const response = await fetch('https://acuityscheduling.com/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Acuity booking error:', {
        status: response.status,
        statusText: response.statusText,
        acuityResponse: data,
        requestPayload: {
          appointmentTypeID: bookingData.appointmentTypeID,
          calendarID: bookingData.calendarID,
          datetime: bookingData.datetime,
          email: bookingData.email,
        },
      });

      let userMessage = data.message || 'Failed to create booking';
      if (response.status === 403) {
        userMessage =
          'This appointment slot is no longer available. Please choose another time or contact us if you need help.';
      } else if (response.status === 409) {
        userMessage =
          'That time was just booked by someone else. Please pick another available slot.';
      }

      return new Response(
        JSON.stringify({ error: userMessage, status: response.status, details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Booking created successfully:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in acuity-book:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
