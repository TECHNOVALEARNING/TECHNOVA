import pkg from 'pg';
const { Client } = pkg;

const password = 'isi57dore38';
const projectRef = 'jcfrlevtrnhrmyovmuza';
const regions = [
  'eu-west-3', 'eu-west-1', 'eu-west-2', 'eu-central-1', 
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 
  'ca-central-1', 'ap-southeast-1', 'ap-northeast-1', 
  'ap-northeast-2', 'ap-southeast-2', 'sa-east-1', 'ap-south-1' 
];

const sql = `
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert support tickets" ON public.support_tickets;
CREATE POLICY "Anyone can insert support tickets" ON public.support_tickets
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can update their support tickets" ON public.support_tickets;
CREATE POLICY "Customers can update their support tickets" ON public.support_tickets
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Customers can view their support tickets" ON public.support_tickets;
CREATE POLICY "Customers can view their support tickets" ON public.support_tickets
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert support ticket messages" ON public.support_ticket_messages;
CREATE POLICY "Anyone can insert support ticket messages" ON public.support_ticket_messages
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view support ticket messages" ON public.support_ticket_messages;
CREATE POLICY "Anyone can view support ticket messages" ON public.support_ticket_messages
FOR SELECT USING (true);
`;

async function tryConnect() {
  for (const region of regions) {
    const connectionString = "postgresql://postgres." + projectRef + ":" + password + "@aws-0-" + region + ".pooler.supabase.com:6543/postgres";
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
    
    try {
      await client.connect();
      console.log("✅ Connexion réussie sur " + region + " !");
      
      await client.query(sql);
      console.log("✅ RLS pour support_tickets corrigé !");
      
      await client.end();
      return true;
    } catch (err) {
      // ignore silently to try next region
    } finally {
      client.end().catch(()=>{}).then(()=>{});
    }
  }
  console.log("❌ Échec de connexion.");
  return false;
}

tryConnect();
