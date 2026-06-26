import { IncomingMessage, ServerResponse } from 'http';

// Simple in-memory cache
const cache: { [key: string]: { data: any; expiry: number } } = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Siècle Digital category mapping (URL slug → display name)
const CATEGORY_MAP: Record<string, string> = {
  'marketing': 'Marketing',
  'technologie': 'Technologie',
  'intelligence-artificielle': 'Intelligence Artificielle',
  'cybersecurite': 'Cybersécurité',
  'reseaux-sociaux': 'Réseaux Sociaux',
  'business': 'Business',
  'societe': 'Société',
};

// Helper to scrape article details from a siecledigital.fr article page
async function scrapeArticleDetail(slug: string) {
  const url = `https://siecledigital.fr/${slug}/`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'identity',
      'Cache-Control': 'no-cache',
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch article ${slug}: ${res.statusText}`);
  }
  const html = await res.text();

  // Title: <h1 class="...">title</h1> or <title>
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/) || html.match(/<title>([^|<]+)/);
  const title = titleMatch ? titleMatch[1]
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .trim() : '';

  // Category
  const catMatch = html.match(/class="[^"]*entry-category[^"]*"[^>]*>([^<]+)<\/a>/) ||
                   html.match(/class="[^"]*cat-links[^"]*"[^>]*>.*?<a[^>]*>([^<]+)<\/a>/) ||
                   html.match(/rel="category tag">([^<]+)<\/a>/);
  const category = catMatch ? catMatch[1].trim() : 'Technologie';

  // Image: og:image meta tag is most reliable
  const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
                   html.match(/name="twitter:image"\s+content="([^"]+)"/) ||
                   html.match(/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/);
  const image = imgMatch ? imgMatch[1] : '';

  // Author
  const authorMatch = html.match(/class="[^"]*author[^"]*"[^>]*>.*?<a[^>]*>([^<]+)<\/a>/) ||
                      html.match(/class="[^"]*author-name[^"]*"[^>]*>([^<]+)</) ||
                      html.match(/rel="author">([^<]+)</);
  const author = authorMatch ? authorMatch[1].trim() : 'Siècle Digital';

  // Date
  const dateMatch = html.match(/class="[^"]*published[^"]*"[^>]*>([^<]+)</) ||
                    html.match(/datetime="([^"]+)"/) ||
                    html.match(/class="[^"]*entry-date[^"]*"[^>]*>([^<]+)</);
  let date = dateMatch ? dateMatch[1].trim() : '';
  // If datetime format, convert to readable
  if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(date);
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Reading time (estimate from content length)
  const readingTime = '5 min';

  // Content extraction: entry-content div
  let content = '';
  const contentStartStr = 'class="entry-content"';
  const contentStartIndex = html.indexOf(contentStartStr);
  if (contentStartIndex !== -1) {
    const tagStart = html.lastIndexOf('<', contentStartIndex);
    const closingTag = html.indexOf('>', contentStartIndex) + 1;
    // Find the matching closing div
    let depth = 1;
    let pos = closingTag;
    while (depth > 0 && pos < html.length) {
      const nextOpen = html.indexOf('<div', pos);
      const nextClose = html.indexOf('</div>', pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          content = html.substring(closingTag, nextClose);
        }
        pos = nextClose + 6;
      }
    }
  }

  // Fallback: look for article content
  if (!content) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
    if (articleMatch) {
      content = articleMatch[1];
    }
  }

  // Clean relative URLs inside the content
  content = content.replace(/src="\//g, 'src="https://siecledigital.fr/');
  content = content.replace(/href="\//g, 'href="/blog/');

  return { id: slug, title, category, image, content, author, date, readingTime };
}

// Helper to scrape list of articles from siecledigital.fr homepage or category
function parseArticlesList(html: string) {
  const articles: any[] = [];
  
  // WordPress typically uses <article> tags
  const articleBlocks = html.split('<article').slice(1);
  
  for (const block of articleBlocks) {
    try {
      // Close tag
      const fullBlock = '<article' + block.split('</article>')[0] + '</article>';
      
      // Extract link/slug from first <a href="https://siecledigital.fr/slug/">
      const linkMatch = fullBlock.match(/href="https?:\/\/(?:www\.)?siecledigital\.fr\/([^"\/]+)\/?"/);
      if (!linkMatch) continue;
      const slug = linkMatch[1];
      
      // Skip category/tag/page links
      if (['category', 'tag', 'page', 'author', 'wp-content', 'feed'].includes(slug)) continue;
      
      // Extract image
      const imgMatch = fullBlock.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
                       fullBlock.match(/data-src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
      const image = imgMatch ? imgMatch[1] : '';
      
      // Extract category
      const catMatch = fullBlock.match(/rel="category tag">([^<]+)</) ||
                       fullBlock.match(/class="[^"]*category[^"]*"[^>]*>([^<]+)</) ||
                       fullBlock.match(/class="[^"]*cat[^"]*"[^>]*>([^<]+)</);
      const category = catMatch ? catMatch[1].trim() : 'Technologie';
      
      // Extract title from <h2> or <h3>
      const titleMatch = fullBlock.match(/<h[23][^>]*>.*?<a[^>]*>([^<]+)<\/a>/s) ||
                         fullBlock.match(/<h[23][^>]*>([^<]+)<\/h[23]>/) ||
                         fullBlock.match(/title="([^"]+)"/);
      let title = titleMatch ? titleMatch[1]
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, '–')
        .replace(/&#8230;/g, '…')
        .trim() : '';
      
      if (!title) continue;
      
      // Extract excerpt
      const descMatch = fullBlock.match(/<p[^>]*>([^<]{20,})<\/p>/) ||
                        fullBlock.match(/class="[^"]*excerpt[^"]*"[^>]*>([^<]+)</);
      const excerpt = descMatch ? descMatch[1]
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8230;/g, '…')
        .trim() : '';
      
      // Extract date
      const dateMatch = fullBlock.match(/datetime="([^"]+)"/) ||
                        fullBlock.match(/class="[^"]*date[^"]*"[^>]*>([^<]+)</);
      let date = dateMatch ? dateMatch[1].trim() : '';
      if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
        const d = new Date(date);
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
      
      const readingTime = '5 min';
      
      articles.push({ id: slug, title, image, category, excerpt, date, readingTime });
    } catch (e) {
      console.error("Error parsing article block", e);
    }
  }
  
  // If WordPress article tags didn't work, try generic link-based parsing
  if (articles.length === 0) {
    const links = html.split('href="https://siecledigital.fr/').slice(1);
    const seen = new Set<string>();
    
    for (const chunk of links) {
      try {
        const slugMatch = chunk.match(/^([a-z0-9-]+)\/?"/);
        if (!slugMatch) continue;
        const slug = slugMatch[1];
        if (seen.has(slug)) continue;
        if (['category', 'tag', 'page', 'author', 'wp-content', 'feed', 'a-propos', 'contact', 'mentions-legales', 'politique-de-confidentialite'].includes(slug)) continue;
        if (slug.length < 10) continue; // Too short to be an article slug
        
        seen.add(slug);
        
        // Try to extract title from nearby text
        const titleMatch = chunk.match(/title="([^"]+)"/) || chunk.match(/>([^<]{15,})</);
        const title = titleMatch ? titleMatch[1]
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&#8217;/g, "'")
          .trim() : slug.replace(/-/g, ' ');
        
        if (title === slug.replace(/-/g, ' ') && title.length < 15) continue;
        
        articles.push({
          id: slug,
          title,
          image: '',
          category: 'Technologie',
          excerpt: '',
          date: '',
          readingTime: '5 min'
        });
        
        if (articles.length >= 20) break;
      } catch (e) {
        // skip
      }
    }
  }
  
  // Remove duplicates
  return Array.from(new Map(articles.map(item => [item.id, item])).values());
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, category } = req.query;

  try {
    const cacheKey = id ? `article_${id}` : category ? `category_${category}` : 'homepage';
    const now = Date.now();

    if (cache[cacheKey] && cache[cacheKey].expiry > now) {
      return res.status(200).json(cache[cacheKey].data);
    }

    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'identity',
      'Cache-Control': 'no-cache',
    };

    if (id) {
      // Scrape detailed article
      const article = await scrapeArticleDetail(id as string);
      cache[cacheKey] = { data: article, expiry: now + CACHE_TTL };
      return res.status(200).json(article);
    }

    // Scrape article list
    let targetUrl = 'https://siecledigital.fr';
    if (category) {
      const cleanCat = (category as string).toLowerCase().trim();
      // Map category slugs to siecledigital.fr URL paths
      const catPaths: Record<string, string> = {
        'marketing': 'marketing',
        'technologie': 'technologie',
        'intelligence-artificielle': 'intelligence-artificielle',
        'cybersecurite': 'cybersecurite',
        'reseaux-sociaux': 'reseaux-sociaux',
        'business': 'business',
        'societe': 'societe',
      };
      const path = catPaths[cleanCat] || cleanCat;
      targetUrl = `https://siecledigital.fr/category/${path}/`;
    }

    const scrapeRes = await fetch(targetUrl, { headers: fetchHeaders });
    if (!scrapeRes.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: ${scrapeRes.statusText}`);
    }
    const html = await scrapeRes.text();
    
    // Check if we got a Cloudflare challenge page
    if (html.includes('Just a moment') || html.includes('challenge-platform') || html.length < 2000) {
      throw new Error('Cloudflare challenge detected');
    }
    
    const articles = parseArticlesList(html);

    cache[cacheKey] = { data: articles, expiry: now + CACHE_TTL };
    return res.status(200).json(articles);
  } catch (error: any) {
    console.error('Error in blog API:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
