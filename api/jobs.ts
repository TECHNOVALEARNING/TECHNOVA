import { IncomingMessage, ServerResponse } from "http";

// Adzuna API config
const APP_ID = "fec52770";
const APP_KEY = "275c3059d7f7d3a0a6b83a94304ca796";

const CATEGORY_MAP: Record<string, string> = {
  "tech": "it-jobs",
  "design": "creative-design-jobs",
  "marketing": "pr-advertising-marketing-jobs",
  "management": "admin-jobs",
};

// Format plain text or short snippet from Adzuna into the UI model
function formatAdzunaJob(item: any): any {
  // Format contract type
  const contractType = item.contract_time === "full_time" || item.contract_type === "permanent" ? "full-time" : "contract";
  const typeFr = contractType === "full-time" ? "Temps plein" : "Contrat / Mission";
  const typeEn = contractType === "full-time" ? "Full-time" : "Contract / Project";

  // Format published date
  let publishedFr = "Récemment";
  let publishedEn = "Recently";
  if (item.created) {
    try {
      const createdDate = new Date(item.created);
      const diffMs = Date.now() - createdDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        publishedFr = "Aujourd'hui";
        publishedEn = "Today";
      } else if (diffDays === 1) {
        publishedFr = "Hier";
        publishedEn = "Yesterday";
      } else {
        publishedFr = `Il y a ${diffDays} jours`;
        publishedEn = `${diffDays} days ago`;
      }
    } catch {}
  }

  // Format salary
  let salary = "Non spécifié";
  if (item.salary_min || item.salary_max) {
    const min = item.salary_min ? Math.round(item.salary_min).toLocaleString() : "";
    const max = item.salary_max ? Math.round(item.salary_max).toLocaleString() : "";
    if (min && max) {
      salary = `${min} - ${max} EUR / an`;
    } else if (min) {
      salary = `À partir de ${min} EUR / an`;
    } else {
      salary = `Jusqu'à ${max} EUR / an`;
    }
  }

  const desc = item.description || "";
  const categoryLabel = item.category?.label || "Tech";

  // Fake lists based on description snippet
  const reqsFr = [
    "Maîtrise des technologies et outils requis pour le poste",
    "Capacité d'adaptation et de travail en équipe",
    "Bonne communication orale et écrite",
    "Expérience pertinente dans le domaine du poste"
  ];
  const reqsEn = [
    "Proficiency in the technologies and tools required for the position",
    "Ability to adapt and work in a team environment",
    "Strong oral and written communication skills",
    "Relevant experience in the field"
  ];

  const respsFr = [
    "Prendre en charge les tâches quotidiennes du poste",
    "Collaborer avec les différents départements de l'entreprise",
    "Assurer le suivi des indicateurs de performance",
    "Participer à l'amélioration continue des processus"
  ];
  const respsEn = [
    "Manage daily operations and tasks for the position",
    "Collaborate with various company departments",
    "Monitor performance indicators",
    "Contribute to continuous process improvement"
  ];

  return {
    id: item.id || String(Math.random()),
    title: { fr: item.title || "", en: item.title || "" },
    company: item.company?.display_name || "Entreprise confidentielle",
    location: { fr: item.location?.display_name || "France", en: item.location?.display_name || "France" },
    type: { fr: typeFr, en: typeEn },
    category: categoryLabel,
    education: "Bac +3 / Bac +5",
    experience: { fr: "1-3 ans", en: "1-3 years" },
    publishedAt: { fr: publishedFr, en: publishedEn },
    description: { fr: desc, en: desc },
    requirements: { fr: reqsFr, en: reqsEn },
    responsibilities: { fr: respsFr, en: respsEn },
    salary,
    contactEmail: "recrutement@technova.com",
    liveUrl: item.redirect_url || ""
  };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q, location, category, page = "1", country = "fr" } = req.query;

  try {
    // Construct Adzuna API URL
    // Country default is 'fr', search results starting at page number
    let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country.toLowerCase()}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=15`;

    if (q) {
      adzunaUrl += `&what=${encodeURIComponent(q)}`;
    }
    if (location) {
      adzunaUrl += `&where=${encodeURIComponent(location)}`;
    }
    if (category && category !== "All") {
      const mappedCat = CATEGORY_MAP[category.toLowerCase()];
      if (mappedCat) {
        adzunaUrl += `&category=${mappedCat}`;
      }
    }

    const apiRes = await fetch(adzunaUrl);
    if (!apiRes.ok) {
      console.error(`Adzuna API responded with status ${apiRes.status}: ${await apiRes.text()}`);
      throw new Error(`Adzuna API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();
    const results = data.results || [];

    const formattedJobs = results.map(formatAdzunaJob);

    return res.status(200).json({
      jobs: formattedJobs,
      total: data.count || 0
    });
  } catch (error: any) {
    console.error("Error in jobs API:", error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}
