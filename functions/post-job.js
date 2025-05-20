// functions/post-job.js
export async function onRequest(context) {
  const { request, env } = context;
  // 1. Parse incoming form data
  const data = await request.json();

  // 2. Read secrets from env
  const AIRTABLE_TOKEN = env.AIRTABLE_TOKEN;
  const BASE_ID        = env.AIRTABLE_BASE_ID;
  const TABLE_NAME     = 'Post%20a%20Job'; // URL-encoded table name

  // 3. Build the Airtable API request
  const airtableResponse = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      },
      body: JSON.stringify({ fields: {
        'Title':            data.title,
        'Description':      data.description,
        'Employment Type':  data.employmentType,
        'Location':         data.location,
        'Compensation':     data.salary,
        'Contact Email':    data.contact
      }})
    }
  );

  // 4. Handle Airtable response
  if (!airtableResponse.ok) {
    const error = await airtableResponse.json().catch(() => ({}));
    return new Response(JSON.stringify({ success: false, error }), {
      status: airtableResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5. Return success
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

