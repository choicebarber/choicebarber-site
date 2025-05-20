// functions/post-job.js
export async function onRequest({ request, env }) {
  // 1) Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'This endpoint only accepts POST requests' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2) Parse the JSON body
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3) Read your Airtable secrets
  const AIRTABLE_TOKEN = env.AIRTABLE_TOKEN;
  const BASE_ID        = env.AIRTABLE_BASE_ID;
  const TABLE_NAME     = 'Post%20a%20Job';

  // 4) Send to Airtable
  const resp = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      },
      body: JSON.stringify({
        fields: {
          'Title':            data.title,
          'Description':      data.description,
          'Employment Type':  data.employmentType,
          'Location':         data.location,
          'Compensation':     data.salary,
          'Contact Email':    data.contact
        }
      })
    }
  );

  // 5) Forward Airtable’s response
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ success: false, error }),
      { status: resp.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
