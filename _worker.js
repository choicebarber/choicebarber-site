// 1. Read the JSON body:
const {
  title,
  description,
  employmentType,
  location,
  salary,
  contact
} = await request.json();

// 2. Build the Airtable “fields” object with exact column names:
const airtableFields = {
  "Job Title": title,
  "Job Description": description,
  "Employment Type": employmentType,
  "Location": location,
  "Compensation": salary,
  "Contact Email": contact
};

// 3. URL-encode the table name (just in case):
const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`;

// 4. Send it off to Airtable:
const airtableRes = await fetch(airtableUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ fields: airtableFields }),
});

// 5. Surface any Airtable error text:
if (!airtableRes.ok) {
  const errorText = await airtableRes.text();
  return new Response(
    `❌ Airtable error ${airtableRes.status}: ${errorText}`,
    { status: 500 }
  );
}

// 6. On success, return JSON so your page script can show the confirmation:
return new Response(
  JSON.stringify({ success: true }),
  { headers: { "Content-Type": "application/json" } }
);
