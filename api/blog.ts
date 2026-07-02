import { IncomingMessage, ServerResponse } from "http";

// Simple in-memory cache
const cache: { [key: string]: { data: any; expiry: number } } = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Category mapping: our UI slugs → NewsData.io API category values
const CATEGORY_MAP: Record<string, string> = {
  technology: "technology",
  business: "business",
  science: "science",
  politics: "politics",
  entertainment: "entertainment",
  health: "health",
  sports: "sports",
  world: "world",
};

// Fallback placeholder image by category
const FALLBACK_IMAGES: Record<string, string> = {
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  science: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
  politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
  entertainment: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&q=80",
  health: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcb36?w=800&q=80",
  world: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80",
};

// Format plain text content to HTML paragraphs
function formatContentToHtml(content: string): string {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed;
  }
  const safeContent = trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return safeContent
    .split(/\n\s*\n/)
    .map((para) => `<p class="mb-4">${para.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

// Format a NewsData.io article to our internal format
function formatArticle(item: any): any {
  const category =
    item.category && item.category.length > 0
      ? item.category[0].charAt(0).toUpperCase() + item.category[0].slice(1)
      : "Technology";

  const catSlug =
    item.category && item.category.length > 0 ? item.category[0].toLowerCase() : "technology";

  // Format the date nicely in French
  let date = "";
  if (item.pubDate) {
    try {
      const d = new Date(item.pubDate);
      const months = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];
      date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      date = item.pubDate;
    }
  }

  // Estimate reading time from description/content length
  const textLength = (item.description || "").length + (item.content || "").length;
  const readingTime = Math.max(2, Math.round(textLength / 1000)) + " min";

  let rawContent = item.content || item.description || "";
  let isPaidPlanRestricted = false;

  if (
    rawContent === "ONLY AVAILABLE IN PAID PLANS" ||
    rawContent.includes("ONLY AVAILABLE IN PAID PLANS")
  ) {
    rawContent = item.description || "";
    isPaidPlanRestricted = true;
  }

  let formattedContent = formatContentToHtml(rawContent);

  // If restricted, append a link to read the full article on the original source
  if (isPaidPlanRestricted && item.link) {
    const sourceName = item.source_name || item.source_id || "la source";
    formattedContent += `
      <div class="mt-8 p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-foreground">Lire la suite de l'article</h4>
          <p class="text-xs text-muted-foreground">Cet article est disponible en intégralité sur le site de ${sourceName}.</p>
        </div>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 text-xs font-bold bg-primary hover:bg-primary/95 rounded-xl transition-all shrink-0 shadow-sm shadow-glow text-center inline-block" style="color: #ffffff !important; text-decoration: none !important;">
          Voir l'article complet sur ${sourceName}
        </a>
      </div>
    `;
  }

  return {
    id: item.article_id || item.link || String(Math.random()),
    title: item.title || "Sans titre",
    category,
    image: item.image_url || FALLBACK_IMAGES[catSlug] || FALLBACK_IMAGES.default,
    excerpt: item.description || "",
    date,
    readingTime,
    // For article detail
    content: formattedContent,
    author:
      item.creator && item.creator.length > 0
        ? item.creator[0]
        : item.source_name || item.source_id || "TECHNOVA",
    link: item.link || "",
    source: item.source_name || item.source_id || "",
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

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NEWSDATA_API_KEY not configured" });
  }

  const { id, category } = req.query;

  try {
    // --- Article Detail ---
    if (id) {
      const cacheKey = `article_${id}`;
      const now = Date.now();
      if (cache[cacheKey] && cache[cacheKey].expiry > now) {
        return res.status(200).json(cache[cacheKey].data);
      }

      // Fetch specific article by ID from NewsData.io
      const searchUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&id=${encodeURIComponent(id)}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
          const article = formatArticle(searchData.results[0]);
          cache[cacheKey] = { data: article, expiry: now + CACHE_TTL };
          return res.status(200).json(article);
        }
      }

      // If no result found, return a not-found article
      return res.status(404).json({ error: "Article not found" });
    }

    // --- Articles List ---
    const cacheKey = category ? `category_${category}` : "homepage";
    const now = Date.now();

    if (cache[cacheKey] && cache[cacheKey].expiry > now) {
      return res.status(200).json(cache[cacheKey].data);
    }

    // Build the NewsData.io API URL
    let apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=fr`;

    if (category && category !== "All") {
      const mappedCategory = CATEGORY_MAP[category.toLowerCase()] || category.toLowerCase();
      apiUrl += `&category=${mappedCategory}`;
    } else {
      // Default: fetch technology AND business
      apiUrl += "&category=technology,business";
    }

    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error("NewsData.io API error:", apiRes.status, errBody);
      throw new Error(`NewsData.io API error: ${apiRes.status}`);
    }

    const apiData = await apiRes.json();

    if (!apiData.results || !Array.isArray(apiData.results)) {
      throw new Error("Invalid response from NewsData.io");
    }

    // Format and filter articles (skip those without title)
    const articles = apiData.results
      .filter((item: any) => item.title && item.title.trim().length > 10)
      .map(formatArticle);

    cache[cacheKey] = { data: articles, expiry: now + CACHE_TTL };
    return res.status(200).json(articles);
  } catch (error: any) {
    console.error("Error in blog API:", error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}
