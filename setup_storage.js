import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);

async function setup() {
  console.log("Création des buckets de stockage...");
  
  // Create product_images bucket
  const { data: imagesBucket, error: imagesError } = await supabase.storage.createBucket('product_images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });
  
  if (imagesError) {
    if (imagesError.message.includes('already exists')) {
      console.log('✅ Le bucket "product_images" existe déjà.');
    } else {
      console.error('❌ Erreur création product_images:', imagesError.message);
    }
  } else {
    console.log('✅ Bucket "product_images" créé avec succès.');
  }

  // Create product_files bucket (Private)
  const { data: filesBucket, error: filesError } = await supabase.storage.createBucket('product_files', {
    public: false
  });
  
  if (filesError) {
    if (filesError.message.includes('already exists')) {
      console.log('✅ Le bucket "product_files" existe déjà.');
    } else {
      console.error('❌ Erreur création product_files:', filesError.message);
    }
  } else {
    console.log('✅ Bucket "product_files" créé avec succès.');
  }
}

setup();
