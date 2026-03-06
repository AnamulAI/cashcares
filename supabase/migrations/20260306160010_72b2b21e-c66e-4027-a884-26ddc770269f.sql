
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  allocated_amount numeric NOT NULL DEFAULT 0,
  alert_threshold integer NOT NULL DEFAULT 80,
  period_type text NOT NULL DEFAULT 'monthly',
  start_date date NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
