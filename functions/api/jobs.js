export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // how many records? default 5
  const maxRecords = params.get("maxRecords") || "5";

  // optional location filter
  let filterFormula = "";
  if (params.has("location")) {
    const loc = params.get("location").replace(/"/g, '\\"');
    filterFormula = `&filterByFormula=FIND(LOWER("${loc}"),LOWER({Location}))`;
  }

  const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
  const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}` +
                       `?maxRecords=${maxRecords}` +
                       `&sort[0][field]=Created&sort[0][direction]=desc` +
                       filterFormula;

  const res = await fetch(airtableUrl, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` }
  });
  if (!res.ok) {
    return new Response(`Error fetching jobs: ${res.status}`, { status: 502 });
  }
  const { records } = await res.json();
  return new Response(JSON.stringify(records), {
    headers: { "Content-Type": "application/json" }
  });
}
