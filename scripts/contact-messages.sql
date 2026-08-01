-- ============================================================
-- Contact form messages → dashboard
-- Run once in Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon, authenticated;

-- Anyone can submit the contact form
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Password-gated dashboard reads/manages via anon key
DROP POLICY IF EXISTS "Dashboard read contact messages" ON public.contact_messages;
CREATE POLICY "Dashboard read contact messages"
  ON public.contact_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Dashboard update contact messages" ON public.contact_messages;
CREATE POLICY "Dashboard update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Dashboard delete contact messages" ON public.contact_messages;
CREATE POLICY "Dashboard delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (true);

NOTIFY pgrst, 'reload schema';
