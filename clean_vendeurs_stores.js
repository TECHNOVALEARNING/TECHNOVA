import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);
const adminUserId = '9702b3c5-4acf-42e2-828c-8bf2d50dfff8';

async function run() {
  console.log("Deleting non-admin stores...");
  const { data: delData, error: delErr } = await supabase
    .from('stores')
    .delete()
    .neq('owner_id', adminUserId);
  if (delErr) {
    console.error("Error deleting non-admin stores:", delErr);
  } else {
    console.log("Successfully deleted non-admin stores:", delData);
  }

  console.log("Clearing store fields from non-admin profiles...");
  const { data: profData, error: profErr } = await supabase
    .from('profiles')
    .update({
      store_slug: null,
      store_description: null,
      store_brand_color: null,
      store_logo_url: null,
      store_banner_url: null,
      store_button_animation: null,
      store_corner_style: null,
      store_font: null,
      store_keywords: null,
      store_product_layout: null,
      store_show_buy_button: null,
      store_show_featured: null,
      store_show_recommended: null,
      store_sort_order: null,
      store_theme: null
    })
    .neq('id', adminUserId);
  if (profErr) {
    console.error("Error clearing profiles:", profErr);
  } else {
    console.log("Successfully cleared profiles:", profData);
  }
}

run();
