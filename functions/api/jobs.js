// functions/api/jobs.js
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // default to 5 most recent
    const maxRecords = params.get("maxRecords") || "5";

    // optional location filter
    let filterSegment = "";
    if (params.has("location")) {
      const loc = params
        .get("location")
        .replace(/"/g, '\\"'); // escape any quotes
      filterSegment = `&filterByFormula=FIND(LOWER("${loc}"),LOWER({Location}))`;
    }

    const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
    const airtableUrl =
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}` +
      `?maxRecords=${maxRecords}` +
      `&sort[0][field]=Created&sort[0][direction]=desc` +
      filterSegment;

    const res = await fetch(airtableUrl, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
    });

    if (!res.ok) {
      throw new Error(`Airtable GET error ${res.status}`);
    }

    const { records } = await res.json();
    return new Response(JSON.stringify(records), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
