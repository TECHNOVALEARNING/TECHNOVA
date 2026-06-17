ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ""Anyone can insert support tickets"" ON public.support_tickets;
CREATE POLICY ""Anyone can insert support tickets"" ON public.support_tickets
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS ""Customers can update their support tickets"" ON public.support_tickets;
CREATE POLICY ""Customers can update their support tickets"" ON public.support_tickets
FOR UPDATE USING (true);

DROP POLICY IF EXISTS ""Customers can view their support tickets"" ON public.support_tickets;
CREATE POLICY ""Customers can view their support tickets"" ON public.support_tickets
FOR SELECT USING (true);

DROP POLICY IF EXISTS ""Anyone can insert support ticket messages"" ON public.support_ticket_messages;
CREATE POLICY ""Anyone can insert support ticket messages"" ON public.support_ticket_messages
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS ""Anyone can view support ticket messages"" ON public.support_ticket_messages;
CREATE POLICY ""Anyone can view support ticket messages"" ON public.support_ticket_messages
FOR SELECT USING (true);
