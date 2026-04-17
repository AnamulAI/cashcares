
-- 1. Drop unused SECURITY DEFINER functions that allow privilege escalation
DROP FUNCTION IF EXISTS public.increment_balance(uuid, numeric);
DROP FUNCTION IF EXISTS public.increment_usage(uuid);

-- 2. Prevent users from self-granting subscription plans
CREATE OR REPLACE FUNCTION public.protect_subscription_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can change subscription_plan';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_subscription_plan ON public.profiles;
CREATE TRIGGER enforce_subscription_plan
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_subscription_plan();

-- 3. Make ledger-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'ledger-attachments';

-- 4. Replace open SELECT policy with owner-scoped policy on storage.objects
DROP POLICY IF EXISTS "Anyone can view ledger attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can view ledger attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ledger attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own ledger attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own ledger attachments" ON storage.objects;

CREATE POLICY "Users can view own ledger attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ledger-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own ledger attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ledger-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own ledger attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ledger-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Tighten entry_attachments RLS policies to authenticated role
DROP POLICY IF EXISTS "Users can select own entry_attachments" ON public.entry_attachments;
DROP POLICY IF EXISTS "Users can insert own entry_attachments" ON public.entry_attachments;
DROP POLICY IF EXISTS "Users can delete own entry_attachments" ON public.entry_attachments;

CREATE POLICY "Users can select own entry_attachments"
ON public.entry_attachments FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entry_attachments"
ON public.entry_attachments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own entry_attachments"
ON public.entry_attachments FOR DELETE TO authenticated
USING (user_id = auth.uid());
