-- ==============================================================================
-- Migration: Add Admin RLS Policies for Platform Overview
-- Description: Allows the platform administrator (ancres707@gmail.com) to read
-- all orders, store visits, stores, and profiles across all sellers.
-- ==============================================================================

-- 1. Orders: Admin can view all orders across all boutiques
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
CREATE POLICY "Admin view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'ancres707@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 2. Store Visits: Admin can view all visits for platform traffic analytics
DROP POLICY IF EXISTS "Admin view all store_visits" ON public.store_visits;
CREATE POLICY "Admin view all store_visits" ON public.store_visits
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'ancres707@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 3. Stores: Admin can view all stores
DROP POLICY IF EXISTS "Admin view all stores" ON public.stores;
CREATE POLICY "Admin view all stores" ON public.stores
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'ancres707@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 4. Profiles: Admin can view all profiles
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;
CREATE POLICY "Admin view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'ancres707@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. Products: Admin can view all products
DROP POLICY IF EXISTS "Admin view all products" ON public.products;
CREATE POLICY "Admin view all products" ON public.products
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'ancres707@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
