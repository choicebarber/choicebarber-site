// functions/post-job.js
export async function onRequest(context) {
  const { request, env } = context;
  const data = await request.json();
  const AIRTABLE_TOKEN = env.AIRTABLE_TOKEN;
  const BASE_ID        = env.AIRTABLE_BASE_ID;
  const TABLE_NAME     = 'Post%20a%20Job';

  const resp = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      },
      body: JSON.stringify({ fields: {
        'Title':           data.title,
        'Description':     data.description,
        'Employment Type': data.employmentType,
        'Location':        data.location,
        'Compensation':    data.salary,
        'Contact Email':   data.contact
      }})
    }
  );

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    return new Response(JSON.stringify({ success: false, error }), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
