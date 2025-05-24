export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // 1) Pagination / sorting
  const maxRecords = params.get("maxRecords") || "5";
  const sortByCreatedDesc = "&sort[0][field]=Created&sort[0][direction]=desc";

  // 2) Optional location filter
  let filter = "";
  if (params.has("location")) {
    // Airtable needs quotes around the string in filterByFormula
    const loc = params.get("location")
      .replace(/"/g, '\\"')      // escape internal quotes
      .trim();
    filter = `&filterByFormula=FIND("${loc}",{Location})`;
  }

  // 3) Build Airtable URL
  const tableName = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
  const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${tableName}` +
                      `?maxRecords=${maxRecords}` +
                      sortByCreatedDesc +
                      filter;

  // 4) Fetch from Airtable
  const airtableRes = await fetch(airtableUrl, {
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_API_KEY}`
    }
  });
  if (!airtableRes.ok) {
    return new Response(
      `❌ Airtable error ${airtableRes.status}: ${await airtableRes.text()}`,
      { status: 500 }
    );
  }

  const { records } = await airtableRes.json();

  // 5) Return JSON array of records
  return new Response(JSON.stringify(records), {
    headers: { "Content-Type": "application/json" }
  });
}
