-- ==========================================
-- SQL MIGRATION FOR ADMIN ROLE TRANSFER
-- Drops policies referencing isidoreagonan@gmail.com 
-- and recreates them for ancres707@gmail.com
-- ==========================================

-- 1. DROP EXISTING POLICIES REFERENCING OLD ADMIN

-- Table: public.support_conversations
DROP POLICY IF EXISTS "Admin can view all conversations" ON public.support_conversations;
DROP POLICY IF EXISTS "Admin can update all conversations" ON public.support_conversations;

-- Table: public.support_messages
DROP POLICY IF EXISTS "Users can send messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admin can read all messages" ON public.support_messages;

-- Table: public.verified_badges
DROP POLICY IF EXISTS "Admin views all badges" ON public.verified_badges;
DROP POLICY IF EXISTS "Admin manages badges" ON public.verified_badges;

-- Table: public.badge_subscriptions
DROP POLICY IF EXISTS "Admin views all subscriptions" ON public.badge_subscriptions;

-- Table: public.badge_eligibility_scans
DROP POLICY IF EXISTS "Admin views all scans" ON public.badge_eligibility_scans;

-- Table: public.platform_fees
DROP POLICY IF EXISTS "Admin can manage fees" ON public.platform_fees;


-- 2. CREATE NEW POLICIES REFERENCING NEW ADMIN (ancres707@gmail.com)

-- Table: public.support_conversations
CREATE POLICY "Admin can view all conversations" ON public.support_conversations FOR SELECT USING (auth.email() = 'ancres707@gmail.com');
CREATE POLICY "Admin can update all conversations" ON public.support_conversations FOR UPDATE USING (auth.email() = 'ancres707@gmail.com');

-- Table: public.support_messages
CREATE POLICY "Users can send messages" ON public.support_messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.support_conversations c WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()) OR auth.email() = 'ancres707@gmail.com');

CREATE POLICY "Admin can read all messages" ON public.support_messages FOR SELECT USING (auth.email() = 'ancres707@gmail.com');

-- Table: public.verified_badges
CREATE POLICY "Admin views all badges" ON public.verified_badges FOR SELECT USING (auth.email() = 'ancres707@gmail.com');
CREATE POLICY "Admin manages badges" ON public.verified_badges FOR ALL USING (auth.email() = 'ancres707@gmail.com') WITH CHECK (auth.email() = 'ancres707@gmail.com');

-- Table: public.badge_subscriptions
CREATE POLICY "Admin views all subscriptions" ON public.badge_subscriptions FOR SELECT USING (auth.email() = 'ancres707@gmail.com');

-- Table: public.badge_eligibility_scans
CREATE POLICY "Admin views all scans" ON public.badge_eligibility_scans FOR SELECT USING (auth.email() = 'ancres707@gmail.com');

-- Table: public.platform_fees
CREATE POLICY "Admin can manage fees" ON public.platform_fees FOR ALL TO authenticated USING (auth.email() = 'ancres707@gmail.com') WITH CHECK (auth.email() = 'ancres707@gmail.com');
