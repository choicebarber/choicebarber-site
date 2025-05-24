export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const locQuery = url.searchParams.get('location')?.trim() || ''

  // Construct Airtable URL
  const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME)
  let airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`

  // If a location filter was provided, add a filterByFormula that
  // does a case-insensitive substring match on the {Location} field.
  if (locQuery) {
    const escaped = locQuery.replace(/"/g, '\\"')
    const formula = `SEARCH(LOWER("${escaped}"), LOWER({Location}))`
    airtableUrl += `?filterByFormula=${encodeURIComponent(formula)}`
  }

  // Fetch from Airtable
  const resp = await fetch(airtableUrl, {
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_API_KEY}`
    }
  })

  if (!resp.ok) {
    const txt = await resp.text()
    return new Response(`Airtable error ${resp.status}: ${txt}`, { status: 500 })
  }

  const { records } = await resp.json()
  // Return just the bare array of records
  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json' }
  })
}
