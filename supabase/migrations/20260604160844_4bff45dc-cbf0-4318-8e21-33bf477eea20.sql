
-- 1. Attach subscription_plan protection trigger
DROP TRIGGER IF EXISTS trg_protect_subscription_plan ON public.profiles;
CREATE TRIGGER trg_protect_subscription_plan
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_plan();

-- 2. ledger-attachments UPDATE policy
DROP POLICY IF EXISTS "Users can update own ledger attachments" ON storage.objects;
CREATE POLICY "Users can update own ledger attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ledger-attachments' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'ledger-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Logo bucket admin-only policies
DROP POLICY IF EXISTS "Admins can view logo files" ON storage.objects;
CREATE POLICY "Admins can view logo files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'logo' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can upload logo files" ON storage.objects;
CREATE POLICY "Admins can upload logo files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'logo' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update logo files" ON storage.objects;
CREATE POLICY "Admins can update logo files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'logo' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'logo' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete logo files" ON storage.objects;
CREATE POLICY "Admins can delete logo files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'logo' AND public.has_role(auth.uid(), 'admin'));

-- 4. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.protect_subscription_plan() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
