import { createClient } from '@supabase/supabase-js';

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const supabase = createClient(url, serviceRoleKey);

async function createAdmin() {
  console.log("Création du compte administrateur...");
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'isidoreagonan@gmail.com',
    password: 'isi57dore38',
    email_confirm: true
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Le compte admin existe déjà.');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } else {
    console.log('✅ Compte administrateur créé avec succès ! ID:', data.user.id);
  }
}

createAdmin();
