// functions/api/jobs.js

export async function onRequestGet(context) {
  const { request, env } = context
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = env

  // pull maxRecords (or default to 5) and sort by created time desc
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_API_KEY)}`)
  url.searchParams.set('maxRecords', request.url.searchParams.get('maxRecords') || '5')
  url.searchParams.set('sort[0][field]', 'Created')
  url.searchParams.set('sort[0][direction]', 'desc')

  const airtableRes = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!airtableRes.ok) {
    const text = await airtableRes.text()
    return new Response(`❌ Airtable error ${airtableRes.status}: ${text}`, { status: 500 })
  }

  const { records } = await airtableRes.json()
  // only return the array of records
  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json' },
  })
}

