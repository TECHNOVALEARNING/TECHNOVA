import { createClient } from '@supabase/supabase-js';

import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function fix() {
  const { data: products } = await supabase.from('products').select('*');
  for (const product of products) {
    if (product.image_url && product.image_url.includes('https://technovalearning.com/uploads/')) {
      const newUrl = product.image_url.replace('https://technovalearning.com/uploads/', 'https://hq.technovalearning.com/uploads/');
      await supabase.from('products').update({ image_url: newUrl }).eq('id', product.id);
      console.log(`Updated ${product.title}`);
    }
  }
  console.log('Done!');
}
fix();
