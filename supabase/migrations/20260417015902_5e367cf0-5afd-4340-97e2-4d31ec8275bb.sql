
-- Helper: server-side premium check (SECURITY DEFINER, fixed search_path)
CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND COALESCE(subscription_plan, 'free') <> 'free'
  )
$$;

-- Apply premium enforcement to all premium tables.
-- Pattern: SELECT allowed for owner OR admin; writes require owner AND premium (or admin).

-- ============ receivables ============
DROP POLICY IF EXISTS "Users can insert own receivables" ON public.receivables;
DROP POLICY IF EXISTS "Users can update own receivables" ON public.receivables;
DROP POLICY IF EXISTS "Users can delete own receivables" ON public.receivables;
CREATE POLICY "Premium users can insert own receivables" ON public.receivables FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own receivables" ON public.receivables FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own receivables" ON public.receivables FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ payables ============
DROP POLICY IF EXISTS "Users can insert own payables" ON public.payables;
DROP POLICY IF EXISTS "Users can update own payables" ON public.payables;
DROP POLICY IF EXISTS "Users can delete own payables" ON public.payables;
CREATE POLICY "Premium users can insert own payables" ON public.payables FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own payables" ON public.payables FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own payables" ON public.payables FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ loans ============
DROP POLICY IF EXISTS "Users can insert own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can update own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can delete own loans" ON public.loans;
CREATE POLICY "Premium users can insert own loans" ON public.loans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own loans" ON public.loans FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own loans" ON public.loans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ assets ============
DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;
CREATE POLICY "Premium users can insert own assets" ON public.assets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own assets" ON public.assets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ investments ============
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete own investments" ON public.investments;
CREATE POLICY "Premium users can insert own investments" ON public.investments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own investments" ON public.investments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ partnerships ============
DROP POLICY IF EXISTS "Users can insert own partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Users can update own partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Users can delete own partnerships" ON public.partnerships;
CREATE POLICY "Premium users can insert own partnerships" ON public.partnerships FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own partnerships" ON public.partnerships FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partnerships" ON public.partnerships FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ partnership_entries ============
DROP POLICY IF EXISTS "Users can insert own partnership_entries" ON public.partnership_entries;
DROP POLICY IF EXISTS "Users can update own partnership_entries" ON public.partnership_entries;
DROP POLICY IF EXISTS "Users can delete own partnership_entries" ON public.partnership_entries;
CREATE POLICY "Premium users can insert own partnership_entries" ON public.partnership_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own partnership_entries" ON public.partnership_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partnership_entries" ON public.partnership_entries FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ savings_plans ============
DROP POLICY IF EXISTS "Users can insert own savings_plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can update own savings_plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can delete own savings_plans" ON public.savings_plans;
CREATE POLICY "Premium users can insert own savings_plans" ON public.savings_plans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own savings_plans" ON public.savings_plans FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_plans" ON public.savings_plans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ savings_installments ============
DROP POLICY IF EXISTS "Users can insert own savings_installments" ON public.savings_installments;
DROP POLICY IF EXISTS "Users can update own savings_installments" ON public.savings_installments;
DROP POLICY IF EXISTS "Users can delete own savings_installments" ON public.savings_installments;
CREATE POLICY "Premium users can insert own savings_installments" ON public.savings_installments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Premium users can update own savings_installments" ON public.savings_installments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (public.is_premium(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_installments" ON public.savings_installments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ Tighten user_roles to prevent admin self-grant escalation ============
-- Replace blanket "Only admins can manage roles" with restricted policies:
-- - Admins can view and DELETE roles (to demote), but cannot INSERT/UPDATE roles via API.
-- - New role grants must happen via service_role (server-side migration / edge function).
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
-- No INSERT/UPDATE policies for authenticated => only service_role can grant/modify roles.
