const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/pg_meta/default/query';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

const sql = `
  CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  TRUNCATE TABLE public.products;

  INSERT INTO public.products (title, description, price, category, image_url, features)
  VALUES 
  ('Masterclass IA & ChatGPT', 'Apprends à automatiser 80% de ton travail et générer de nouvelles sources de revenus avec l''IA.', 15000, 'Intelligence Artificielle', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', '["Prompt Engineering", "Création d''agents", "Accès à vie"]'),
  ('Pack Cybersécurité Éthique', 'De zéro à hacker éthique : sécurise tes systèmes et ceux des entreprises.', 25000, 'Cybersécurité', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800', '["Tests d''intrusion", "Outils Kali Linux", "Support 7j/7"]'),
  ('Bootcamp Marketing Digital', 'Domine Facebook Ads et le copywriting pour exploser tes ventes.', 12000, 'Marketing', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', '["Stratégie pub", "Tunnel de vente", "Templates inclus"]');

  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'products'
          AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
    END IF;
  END
  $$;
`;

async function executeSql() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + serviceRoleKey
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Succès de pg_meta :', data);
    } else {
      const errorText = await res.text();
      console.log('❌ Erreur pg_meta :', res.status, errorText);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

executeSql();
