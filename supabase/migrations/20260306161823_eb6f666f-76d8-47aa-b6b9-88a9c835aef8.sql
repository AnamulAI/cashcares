
-- Receivables table
CREATE TABLE public.receivables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_name text NOT NULL,
  reason text,
  total_amount numeric NOT NULL DEFAULT 0,
  received_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to receivables" ON public.receivables FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER receivables_updated_at BEFORE UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Payables table
CREATE TABLE public.payables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_name text NOT NULL,
  reason text,
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to payables" ON public.payables FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER payables_updated_at BEFORE UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Loans table
CREATE TABLE public.loans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_name text NOT NULL,
  loan_type text NOT NULL DEFAULT 'borrowed',
  principal_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  installment_amount numeric,
  interest_rate numeric,
  linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Assets table
CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'other',
  purchase_value numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  acquisition_date date,
  linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Investments table
CREATE TABLE public.investments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_name text NOT NULL,
  investment_type text NOT NULL DEFAULT 'other',
  invested_amount numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  start_date date,
  linked_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
