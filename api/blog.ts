import { IncomingMessage, ServerResponse } from 'http';

// Simple in-memory cache
const cache: { [key: string]: { data: any; expiry: number } } = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper to scrape article details from article page
async function scrapeArticleDetail(id: string) {
  const url = `https://inoutech.net/archives/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch article ${id}: ${res.statusText}`);
  }
  const html = await res.text();

  const titleMatch = html.match(/<h1 class="article-cd-title">([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/&#039;/g, "'").replace(/&amp;/g, '&').trim() : '';

  const catMatch = html.match(/class="article-hero-cat"[^>]*>([^<]+)<\/a>/) || html.match(/class="article-hero-cat">([^<]+)<\/a>/);
  const category = catMatch ? catMatch[1].trim() : 'Actu';

  const imgMatch = html.match(/<div class="article-cd-image">[^]*?<img[^>]+src="([^"]+)"/) || html.match(/<picture>[^]*?<img[^>]+src="([^"]+)"/);
  let image = imgMatch ? imgMatch[1] : '';
  if (image && !image.startsWith('http')) {
    image = 'https://inoutech.net' + image;
  }

  // Extract meta (author, date, reading time)
  // <div class="article-hero-meta" ...> <span>Enzo</span>...<span>5 juin 2024</span>...<span>5 min de lecture</span> </div>
  const metaMatch = html.match(/class="article-hero-meta"[^>]*>([^]+?)<\/div>/);
  let author = 'Enzo';
  let date = '5 juin 2024';
  let readingTime = '5 min';
  if (metaMatch) {
    const metaContent = metaMatch[1];
    const spans = metaContent.split('</span>');
    const authorSpan = spans[0] ? spans[0].match(/<span>([^<]+)$/) || spans[0].match(/>([^<]+)$/) : null;
    author = authorSpan ? authorSpan[1].trim() : 'Enzo';

    const dateSpan = spans[1] ? spans[1].match(/>([^<]+)$/) : null;
    date = dateSpan ? dateSpan[1].trim() : '5 juin 2024';

    const readSpan = spans[2] ? spans[2].match(/>([^<]+)$/) : null;
    readingTime = readSpan ? readSpan[1].replace('de lecture', '').trim() : '5 min';
  }

  // Content extraction: everything inside <div class="article-content"> ... </div>
  let content = '';
  const contentStartStr = '<div class="article-content">';
  const contentStartIndex = html.indexOf(contentStartStr);
  if (contentStartIndex !== -1) {
    const startPos = contentStartIndex + contentStartStr.length;
    const nextSectionIndex = html.indexOf('<div class="article-tags">', startPos);
    if (nextSectionIndex !== -1) {
      content = html.substring(startPos, nextSectionIndex);
      const lastDivIndex = content.lastIndexOf('</div>');
      if (lastDivIndex !== -1) {
        content = content.substring(0, lastDivIndex);
      }
    } else {
      const articleCloseIndex = html.indexOf('</article>', startPos);
      if (articleCloseIndex !== -1) {
        content = html.substring(startPos, articleCloseIndex);
        const lastDivIndex = content.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
          content = content.substring(0, lastDivIndex);
        }
      }
    }
  }

  // Clean relative URLs inside the content
  content = content.replace(/src="\/images\//g, 'src="https://inoutech.net/images/');
  content = content.replace(/href="\/archives\//g, 'href="/blog/');

  // Clean HTML entities
  title.replace(/&quot;/g, '"');

  return { id, title, category, image, content, author, date, readingTime };
}

// Helper to scrape list of articles from home or category HTML
function parseArticlesList(html: string) {
  const articles: any[] = [];
  
  // Split by href="/archives/
  const chunks = html.split('href="/archives/').slice(1);
  
  for (const chunk of chunks) {
    try {
      // 1. Get ID at the start of the chunk
      const idMatch = chunk.match(/^(\d+)/);
      if (!idMatch) continue;
      const id = idMatch[1];
      
      // We only care about chunks that represent article cards or list items
      if (!chunk.includes('class="article-card') && !chunk.includes('class="article-list-item')) {
        continue;
      }
      
      // 2. Extract image
      const imgMatch = chunk.match(/<img[^>]+src="([^"]+)"/);
      let image = imgMatch ? imgMatch[1] : '';
      if (image && !image.startsWith('http')) {
        image = 'https://inoutech.net' + image;
      }
      
      // 3. Extract category/tag
      const tagMatch = chunk.match(/class="article-card-tag">([^<]+)</) || 
                       chunk.match(/class="article-list-tag">([^<]+)</);
      const category = tagMatch ? tagMatch[1].trim() : 'Actu';
      
      // 4. Extract title
      const titleMatch = chunk.match(/<h2><a[^>]*>([^<]+)<\/a><\/h2>/) || 
                         chunk.match(/<h2>([^<]+)<\/h2>/);
      const title = titleMatch ? titleMatch[1]
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim() : '';
        
      // 5. Extract excerpt
      const descMatch = chunk.match(/<p>([^<]+)<\/p>/);
      const excerpt = descMatch ? descMatch[1]
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim() : '';
        
      // 6. Extract date and reading time
      const metaSectionMatch = chunk.match(/class="article-(?:card|list)-meta"[^>]*>([^]+?)<\/div>/) || 
                               chunk.match(/class="article-(?:card|list)-meta"[^>]*>([^]+?)<\/p>/);
      
      let date = '5 juin 2024';
      let readingTime = '5 min';
      
      if (metaSectionMatch) {
        const metaContent = metaSectionMatch[1];
        const spans = metaContent.split('</span>');
        
        const dateSpan = spans[0] ? spans[0].match(/>([^<]+)$/) || spans[0].match(/<span>([^<]+)$/) : null;
        if (dateSpan) date = dateSpan[1].trim();
        
        const readSpan = spans[1] ? spans[1].match(/>([^<&]+)/) || spans[1].match(/<span>([^<&]+)/) : null;
        if (readSpan) readingTime = readSpan[1].replace('de lecture', '').trim();
      }
      
      articles.push({ id, title, image, category, excerpt, date, readingTime });
    } catch (e) {
      console.error("Error parsing article chunk", e);
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

    if (id) {
      // Scrape detailed article
      const article = await scrapeArticleDetail(id as string);
      cache[cacheKey] = { data: article, expiry: now + CACHE_TTL };
      return res.status(200).json(article);
    }

    // Scrape article list
    let targetUrl = 'https://inoutech.net';
    if (category) {
      // mapping category names from navbar to path names if they are different
      // Navbar links: /actu/, /high-tech/, /internet/, /jeux-video/, /marketing/, /materiel/, /smartphones/
      const cleanCat = (category as string).toLowerCase().trim();
      targetUrl = `https://inoutech.net/${cleanCat}/`;
    }

    const scrapeRes = await fetch(targetUrl);
    if (!scrapeRes.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: ${scrapeRes.statusText}`);
    }
    const html = await scrapeRes.text();
    const articles = parseArticlesList(html);

    cache[cacheKey] = { data: articles, expiry: now + CACHE_TTL };
    return res.status(200).json(articles);
  } catch (error: any) {
    console.error('Error in blog API:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
