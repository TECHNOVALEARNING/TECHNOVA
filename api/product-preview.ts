import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  const { productId } = req.query;

  // 1. Locate and read the index.html file
  let html = '';
  let htmlPath = '';
  try {
    const prodPath = path.join(process.cwd(), 'dist', 'index.html');
    const devPath = path.join(process.cwd(), 'index.html');

    if (fs.existsSync(prodPath)) {
      htmlPath = prodPath;
    } else if (fs.existsSync(devPath)) {
      htmlPath = devPath;
    } else {
      const fallbackPath = path.join(__dirname, '..', 'dist', 'index.html');
      const fallbackDevPath = path.join(__dirname, '..', 'index.html');
      if (fs.existsSync(fallbackPath)) {
        htmlPath = fallbackPath;
      } else if (fs.existsSync(fallbackDevPath)) {
        htmlPath = fallbackDevPath;
      }
    }

    if (!htmlPath) {
      throw new Error('index.html could not be found in any expected location');
    }

    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (err) {
    console.error('Error reading index.html:', err);
    return res.status(500).send('Internal Server Error');
  }

  // If no productId is provided, just return index.html as is
  if (!productId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  try {
    // 2. Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing, returning index.html as-is');
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch product details
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, title, description, thumbnail_url, creator_id')
      .eq('id', productId)
      .eq('is_published', true)
      .maybeSingle();

    if (prodError || !product) {
      console.warn(`Product not found or error fetching product: ${productId}`, prodError);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // 4. Fetch store details for the store name
    let storeName = 'TECHNOVA Learning';
    if (product.creator_id) {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('name')
        .eq('owner_id', product.creator_id)
        .eq('is_archived', false)
        .maybeSingle();

      if (!storeError && store?.name) {
        storeName = store.name;
      }
    }

    // 5. Build dynamic metadata
    const seoTitle = `${product.title} — ${storeName}`;

    // Clean description: remove HTML tags and truncate
    const rawDesc = product.description || '';
    const cleanDesc = rawDesc
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\s+/g, ' ')   // normalize whitespace
      .trim();

    const seoDesc = cleanDesc
      ? (cleanDesc.length > 155 ? cleanDesc.substring(0, 152) + '...' : cleanDesc)
      : `Achetez ${product.title} en ligne. Fichier, formation ou licence numérique de qualité.`;

    const seoImage = product.thumbnail_url || 'https://www.technovalearning.com/og-image.png';
    const seoUrl = `https://www.technovalearning.com/product/${product.id}`;

    // Helper to escape values for HTML attribute inclusion
    const escapeHtmlAttr = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    const escapedTitle = escapeHtmlAttr(seoTitle);
    const escapedDesc = escapeHtmlAttr(seoDesc);
    const escapedImage = escapeHtmlAttr(seoImage);
    const escapedUrl = escapeHtmlAttr(seoUrl);

    // 6. Replace meta tags in index.html
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapedDesc}" />`);

    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapedTitle}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapedDesc}" />`);
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escapedImage}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapedUrl}" />`);

    html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapedTitle}" />`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapedDesc}" />`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${escapedImage}" />`);

    // Cache control header to speed up crawler preview loading and avoid querying Supabase every single time
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error serving product preview:', error);
    // Fall back to original html on any exception
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
}
