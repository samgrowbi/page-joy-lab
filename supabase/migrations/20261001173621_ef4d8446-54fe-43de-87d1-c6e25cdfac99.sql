-- Waitlist for when no Acuity slots are open in the next 7 days.
-- All writes go through the waitlist-join edge function (service role).
-- Anonymous visitors get NO direct access to this table.
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  treatment_slug TEXT,
  treatment_label TEXT,
  appointment_type_id TEXT,
  source_url TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  sheet_synced BOOLEAN NOT NULL DEFAULT false,
  sheet_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_created_at ON public.waitlist (created_at DESC);
CREATE INDEX idx_waitlist_unsynced ON public.waitlist (created_at) WHERE sheet_synced = false;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.waitlist FROM anon;
GRANT SELECT ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;

CREATE POLICY "Admins can read waitlist"
  ON public.waitlist FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
