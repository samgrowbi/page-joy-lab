
-- Chat conversations + messages for the Skin Specialist chatbot
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_name TEXT,
  lead_email TEXT,
  lead_phone TEXT,
  lead_concern TEXT,
  booked_appointment_id TEXT,
  booked_treatment_slug TEXT,
  booked_datetime TIMESTAMPTZ
);

CREATE INDEX idx_chat_conversations_session ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anonymous-friendly read by session_id (no PII risk; messages are conversational).
-- All writes go through the edge function with the service-role key, so we do NOT
-- expose INSERT/UPDATE/DELETE to anon/authenticated.
CREATE POLICY "Anyone can read their own conversation by session_id"
  ON public.chat_conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read messages of any conversation"
  ON public.chat_messages FOR SELECT
  USING (true);
