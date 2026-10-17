-- ==============================================================================
-- Migration : durcissement RLS (audit sécurité du 17/10/2026)
-- Les policies "USING (true)" / "WITH CHECK (true)" sans clause TO s'appliquaient
-- aussi aux rôles anon et authenticated (clé publique du site). Les Edge Functions
-- utilisent la clé service_role, qui contourne RLS : elles ne sont pas impactées.
--
-- Idempotente et tolérante : une table absente de la base en ligne est ignorée
-- (NOTICE), et la migration peut être relancée sans erreur.
-- ==============================================================================

-- 1. buyer_otps : plus aucun accès anon/authenticated (codes OTP lisibles par tous)
DO $$
BEGIN
  IF to_regclass('public.buyer_otps') IS NULL THEN
    RAISE NOTICE 'public.buyer_otps absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "System can manage buyer otps" ON public.buyer_otps;
  DROP POLICY IF EXISTS "Service role manages buyer otps" ON public.buyer_otps;
  CREATE POLICY "Service role manages buyer otps" ON public.buyer_otps
    FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- 2. licenses : insertion réservée au serveur
DO $$
BEGIN
  IF to_regclass('public.licenses') IS NULL THEN
    RAISE NOTICE 'public.licenses absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "System can insert licenses" ON public.licenses;
  DROP POLICY IF EXISTS "Service role inserts licenses" ON public.licenses;
  CREATE POLICY "Service role inserts licenses" ON public.licenses
    FOR INSERT TO service_role WITH CHECK (true);
END $$;

-- 3. license_activations : insertion / mise à jour réservées au serveur,
--    le vendeur garde la possibilité de désactiver les activations de ses licences
DO $$
BEGIN
  IF to_regclass('public.license_activations') IS NULL THEN
    RAISE NOTICE 'public.license_activations absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "System can insert activations" ON public.license_activations;
  DROP POLICY IF EXISTS "System can update activations" ON public.license_activations;
  DROP POLICY IF EXISTS "Service role inserts activations" ON public.license_activations;
  DROP POLICY IF EXISTS "Service role updates activations" ON public.license_activations;
  DROP POLICY IF EXISTS "Store owners can update activations" ON public.license_activations;
  CREATE POLICY "Service role inserts activations" ON public.license_activations
    FOR INSERT TO service_role WITH CHECK (true);
  CREATE POLICY "Service role updates activations" ON public.license_activations
    FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  IF to_regclass('public.licenses') IS NOT NULL THEN
    CREATE POLICY "Store owners can update activations" ON public.license_activations
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.licenses l
        WHERE l.id = license_activations.license_id AND l.store_owner_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.licenses l
        WHERE l.id = license_activations.license_id AND l.store_owner_id = auth.uid()
      ));
  END IF;
END $$;

-- 4. payment_events : mise à jour réservée au serveur
DO $$
BEGIN
  IF to_regclass('public.payment_events') IS NULL THEN
    RAISE NOTICE 'public.payment_events absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "Anyone can update payment events by session" ON public.payment_events;
  DROP POLICY IF EXISTS "Service role updates payment events" ON public.payment_events;
  CREATE POLICY "Service role updates payment events" ON public.payment_events
    FOR UPDATE TO service_role USING (true) WITH CHECK (true);
END $$;

-- 5. notifications : le serveur insère librement ; un utilisateur connecté peut
--    s'en créer pour lui-même, un admin pour n'importe qui, et un acheteur peut
--    notifier un vendeur chez qui il a commandé (ticket de support).
DO $$
DECLARE
  buyer_clause text := '';
BEGIN
  IF to_regclass('public.notifications') IS NULL THEN
    RAISE NOTICE 'public.notifications absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Service role inserts notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users insert allowed notifications" ON public.notifications;
  CREATE POLICY "Service role inserts notifications" ON public.notifications
    FOR INSERT TO service_role WITH CHECK (true);

  IF to_regclass('public.customers') IS NOT NULL
     AND to_regprocedure('public.customer_has_order_with_store(uuid, uuid)') IS NOT NULL THEN
    buyer_clause := ' OR EXISTS (SELECT 1 FROM public.customers c WHERE c.auth_id = auth.uid()'
                 || ' AND public.customer_has_order_with_store(c.id, notifications.user_id))';
  END IF;

  EXECUTE 'CREATE POLICY "Users insert allowed notifications" ON public.notifications'
       || ' FOR INSERT TO authenticated WITH CHECK ('
       || ' user_id = auth.uid()'
       || ' OR (auth.jwt() ->> ''email'') = ''ancres707@gmail.com'''
       || ' OR (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'''
       || buyer_clause || ')';
END $$;

-- 6. community_memberships : insertion / mise à jour réservées au serveur
DO $$
BEGIN
  IF to_regclass('public.community_memberships') IS NULL THEN
    RAISE NOTICE 'public.community_memberships absente : ignorée';
    RETURN;
  END IF;
  DROP POLICY IF EXISTS "System inserts memberships" ON public.community_memberships;
  DROP POLICY IF EXISTS "System updates memberships" ON public.community_memberships;
  DROP POLICY IF EXISTS "Service role inserts memberships" ON public.community_memberships;
  DROP POLICY IF EXISTS "Service role updates memberships" ON public.community_memberships;
  CREATE POLICY "Service role inserts memberships" ON public.community_memberships
    FOR INSERT TO service_role WITH CHECK (true);
  CREATE POLICY "Service role updates memberships" ON public.community_memberships
    FOR UPDATE TO service_role USING (true) WITH CHECK (true);
END $$;

-- 7. RPC process_free_order : ne vérifiait pas que le produit est gratuit.
--    Le front passe désormais par l'Edge Function process-free-order (prix contrôlé
--    en base) : on retire l'exécution aux rôles publics, quelle que soit la signature.
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'process_free_order'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
