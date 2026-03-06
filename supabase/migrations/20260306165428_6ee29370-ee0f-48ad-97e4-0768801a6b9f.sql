
-- Partnerships table
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_name TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  your_contribution NUMERIC NOT NULL DEFAULT 0,
  partner_contribution NUMERIC NOT NULL DEFAULT 0,
  shared_expense_total NUMERIC NOT NULL DEFAULT 0,
  settlement_amount NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partnership entries (ledger events)
CREATE TABLE public.partnership_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL DEFAULT 'contribution', -- contribution, shared_expense, settlement
  contributor TEXT, -- you, partner
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'custom',
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  related_entity_id TEXT,
  related_module TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to partnerships" ON public.partnerships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to partnership_entries" ON public.partnership_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_partnerships BEFORE UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_reminders BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
