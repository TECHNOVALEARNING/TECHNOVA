import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);

const OLD_ADMIN_ID = '9a7bc1fd-3c21-4a8c-b7a3-c60ff2fcf902';
const NEW_ADMIN_ID = '9702b3c5-4acf-42e2-828c-8bf2d50dfff8';

async function updateDb() {
  console.log("Starting DB update via Service Role Client...");

  // 1. Swap store_slug in profiles
  // Set old admin store_slug to something else or null to prevent unique constraint conflict
  console.log("Updating profiles...");
  const { error: errP1 } = await supabase.from('profiles').update({ store_slug: 'easy-tech-old' }).eq('id', OLD_ADMIN_ID);
  if (errP1) console.error("Error updating old admin profile:", errP1);
  else console.log("Old admin profile store_slug updated.");

  const { error: errP2 } = await supabase.from('profiles').update({ store_slug: 'easy-tech' }).eq('id', NEW_ADMIN_ID);
  if (errP2) console.error("Error updating new admin profile:", errP2);
  else console.log("New admin profile store_slug updated.");

  // 2. Transfer stores
  console.log("Updating stores...");
  // Set owner_id for easy-tech to NEW_ADMIN_ID
  const { error: errS1 } = await supabase.from('stores').update({ owner_id: NEW_ADMIN_ID }).eq('slug', 'easy-tech');
  if (errS1) console.error("Error transferring easy-tech store:", errS1);
  else console.log("easy-tech store owner updated to new admin.");

  // Transfer nova-shop to OLD_ADMIN_ID so they both have their store and RLS owner_id limits are respected
  const { error: errS2 } = await supabase.from('stores').update({ owner_id: OLD_ADMIN_ID }).eq('slug', 'nova-shop');
  if (errS2) console.error("Error transferring nova-shop store:", errS2);
  else console.log("nova-shop store owner updated to old admin.");

  // 3. Transfer products
  console.log("Updating products...");
  const { data: updatedProducts, error: errPr } = await supabase.from('products').update({ creator_id: NEW_ADMIN_ID }).eq('creator_id', OLD_ADMIN_ID).select('id, title');
  if (errPr) console.error("Error transferring products:", errPr);
  else console.log("Products transferred successfully:", updatedProducts);

  console.log("DB update completed.");
}

updateDb();
