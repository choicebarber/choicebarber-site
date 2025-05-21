 export default {
   async fetch(request, env) {
     const url = new URL(request.url);

     if (
       (url.pathname === "/post-a-job" || url.pathname === "/post-a-job/") &&
       request.method === "POST"
     ) {
       // 1. Parse the JSON body:
       const fields = await request.json();

-      const airtableUrl =
-        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
+      // URL-encode the table name in case there are spaces
+      const table = encodeURIComponent(env.AIRTABLE_TABLE_NAME);
+      const airtableUrl =
+        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${table}`;

       const airtableRes = await fetch(airtableUrl, {
         method: "POST",
         headers: {
-          Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
+          Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ fields }),
       });

       if (!airtableRes.ok) {
         const errorText = await airtableRes.text();
         return new Response(
-          "❌ Couldn’t save your job.",
+          `❌ Airtable error ${airtableRes.status}: ${errorText}`,
           { status: 500 }
         );
       }

       return new Response(
         JSON.stringify({ success: true }),
         { headers: { "Content-Type": "application/json" } }
       );
     }

     return env.ASSETS.fetch(request);
   },
 };
