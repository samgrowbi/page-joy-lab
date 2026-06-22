
-- Restrict chat_conversations: remove public read access
DROP POLICY IF EXISTS "Anyone can read their own conversation by session_id" ON public.chat_conversations;

-- Restrict chat_messages: remove public read access
DROP POLICY IF EXISTS "Anyone can read messages of any conversation" ON public.chat_messages;

-- Lock down has_role SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Storage: deny-all default for the private 'nuvera' bucket; restrict 'miliv' writes to service_role only
-- (Public read for the public 'miliv' bucket is implicit via the bucket's public flag for the storage CDN.)
CREATE POLICY "nuvera service role only - select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'nuvera' AND auth.role() = 'service_role');

CREATE POLICY "nuvera service role only - insert"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'nuvera' AND auth.role() = 'service_role');

CREATE POLICY "nuvera service role only - update"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'nuvera' AND auth.role() = 'service_role');

CREATE POLICY "nuvera service role only - delete"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'nuvera' AND auth.role() = 'service_role');

CREATE POLICY "miliv service role write - insert"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'miliv' AND auth.role() = 'service_role');

CREATE POLICY "miliv service role write - update"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'miliv' AND auth.role() = 'service_role');

CREATE POLICY "miliv service role write - delete"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'miliv' AND auth.role() = 'service_role');
