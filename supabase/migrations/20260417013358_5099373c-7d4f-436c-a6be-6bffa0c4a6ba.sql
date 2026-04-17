-- Savings plans table
CREATE TABLE public.savings_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  plan_name text NOT NULL,
  recipient_name text,
  plan_type text NOT NULL DEFAULT 'fixed',
  installment_amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'monthly',
  duration_months integer,
  target_amount numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  maturity_date date,
  total_saved numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  note text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own savings_plans" ON public.savings_plans
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own savings_plans" ON public.savings_plans
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own savings_plans" ON public.savings_plans
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_plans" ON public.savings_plans
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_savings_plans_updated_at
BEFORE UPDATE ON public.savings_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Savings installments table
CREATE TABLE public.savings_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  plan_id uuid NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_date date,
  paid_amount numeric NOT NULL DEFAULT 0,
  linked_account_id uuid,
  note text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_savings_installments_plan ON public.savings_installments(plan_id);
CREATE INDEX idx_savings_installments_user ON public.savings_installments(user_id);

ALTER TABLE public.savings_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own savings_installments" ON public.savings_installments
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own savings_installments" ON public.savings_installments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own savings_installments" ON public.savings_installments
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own savings_installments" ON public.savings_installments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_savings_installments_updated_at
BEFORE UPDATE ON public.savings_installments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();