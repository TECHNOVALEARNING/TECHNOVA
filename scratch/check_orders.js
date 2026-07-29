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

async function checkOrdersSchema() {
  console.log("Checking orders table columns and sample data...");
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .limit(20);

  if (error) {
    console.error("Error fetching orders:", error);
  } else {
    console.log("Sample orders count:", orders.length);
    if (orders.length > 0) {
      console.log("Order keys:", Object.keys(orders[0]));
      console.table(orders.map(o => ({
        id: o.id,
        amount: o.amount,
        original_amount: o.original_amount,
        status: o.status,
        product_id: o.product_id,
        created_at: o.created_at
      })));
    }
  }
}

checkOrdersSchema();
