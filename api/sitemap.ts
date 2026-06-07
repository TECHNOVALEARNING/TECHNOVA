import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select('id');

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    const domain = 'https://technovalearning.com';
    
    // Générer le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/courses</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${products.map(product => `
  <url>
    <loc>${domain}/product/${product.id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  `).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache d'un jour sur le CDN Vercel
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du sitemap' });
  }
}
