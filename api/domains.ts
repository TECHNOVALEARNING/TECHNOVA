export default async function handler(req: any, res: any) {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return res.status(500).json({ error: "Missing Vercel credentials" });
  }

  const { method } = req;
  const VERCEL_API_URL = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`;

  try {
    if (method === "POST") {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ error: "Domain is required" });

      const response = await fetch(VERCEL_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: domain })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);

    } else if (method === "DELETE") {
      const domain = req.query.domain;
      if (!domain) return res.status(400).json({ error: "Domain is required" });

      const response = await fetch(`${VERCEL_API_URL}/${domain}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`
        }
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);

    } else if (method === "GET") {
      const domain = req.query.domain;
      const url = domain ? `${VERCEL_API_URL}/${domain}` : VERCEL_API_URL;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`
        }
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json(data);

    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err: any) {
    console.error("Vercel Domains API Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
