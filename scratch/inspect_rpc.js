import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = 'https://fqwquptwvgkvdvwyffhh.supabase.co';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
} catch (e) {
  console.log("Error reading .env.local:", e.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRPC() {
  console.log("Fetching latest orders from Supabase...");
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, amount, original_amount, status, created_at, product_id, customer_id')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error("Error fetching orders:", error);
  } else {
    console.log(`Retrieved ${orders.length} orders:`);
    console.table(orders);
  }
}

inspectRPC();
