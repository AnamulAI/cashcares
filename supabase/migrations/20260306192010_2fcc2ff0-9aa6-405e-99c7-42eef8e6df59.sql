
-- ============================================================
-- Add user_id to all data tables, backfill, tighten RLS
-- ============================================================

-- 1. Add user_id columns (nullable first for backfill)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payables ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.partnership_entries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill existing rows with admin user
UPDATE public.accounts SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.categories SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.transactions SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.budgets SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.assets SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.investments SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.loans SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.payables SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.receivables SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.reminders SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.partnerships SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;
UPDATE public.partnership_entries SET user_id = 'a3b5c18b-2c4c-407e-8e7d-2724a230b3eb' WHERE user_id IS NULL;

-- 3. Set NOT NULL and default
ALTER TABLE public.accounts ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.categories ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.budgets ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.assets ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.investments ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.loans ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.payables ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.receivables ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.reminders ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.partnerships ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.partnership_entries ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 4. Drop old open policies
DROP POLICY IF EXISTS "Allow all access to accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow all access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all access to budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow all access to assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all access to investments" ON public.investments;
DROP POLICY IF EXISTS "Allow all access to loans" ON public.loans;
DROP POLICY IF EXISTS "Allow all access to payables" ON public.payables;
DROP POLICY IF EXISTS "Allow all access to receivables" ON public.receivables;
DROP POLICY IF EXISTS "Allow all access to reminders" ON public.reminders;
DROP POLICY IF EXISTS "Allow all access to partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Allow all access to partnership_entries" ON public.partnership_entries;

-- 5. Create per-user RLS policies + admin read access

-- ACCOUNTS
CREATE POLICY "Users can select own accounts" ON public.accounts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CATEGORIES
CREATE POLICY "Users can select own categories" ON public.categories FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE TO authenticated USING (user_id = auth.uid());

-- TRANSACTIONS
CREATE POLICY "Users can select own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- BUDGETS
CREATE POLICY "Users can select own budgets" ON public.budgets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ASSETS
CREATE POLICY "Users can select own assets" ON public.assets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE TO authenticated USING (user_id = auth.uid());

-- INVESTMENTS
CREATE POLICY "Users can select own investments" ON public.investments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- LOANS
CREATE POLICY "Users can select own loans" ON public.loans FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own loans" ON public.loans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own loans" ON public.loans FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own loans" ON public.loans FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PAYABLES
CREATE POLICY "Users can select own payables" ON public.payables FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own payables" ON public.payables FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own payables" ON public.payables FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own payables" ON public.payables FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RECEIVABLES
CREATE POLICY "Users can select own receivables" ON public.receivables FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own receivables" ON public.receivables FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own receivables" ON public.receivables FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own receivables" ON public.receivables FOR DELETE TO authenticated USING (user_id = auth.uid());

-- REMINDERS
CREATE POLICY "Users can select own reminders" ON public.reminders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PARTNERSHIPS
CREATE POLICY "Users can select own partnerships" ON public.partnerships FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own partnerships" ON public.partnerships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own partnerships" ON public.partnerships FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partnerships" ON public.partnerships FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PARTNERSHIP_ENTRIES
CREATE POLICY "Users can select own partnership_entries" ON public.partnership_entries FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own partnership_entries" ON public.partnership_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own partnership_entries" ON public.partnership_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partnership_entries" ON public.partnership_entries FOR DELETE TO authenticated USING (user_id = auth.uid());
