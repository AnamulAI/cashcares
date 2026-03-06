
-- Payment history for payable entries
CREATE TABLE public.payable_payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id uuid NOT NULL REFERENCES public.payable_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payable_payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own payable_payment_history" ON public.payable_payment_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payable_payment_history" ON public.payable_payment_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own payable_payment_history" ON public.payable_payment_history FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Collection history for receivable entries
CREATE TABLE public.receivable_collection_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id uuid NOT NULL REFERENCES public.receivable_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.receivable_collection_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own receivable_collection_history" ON public.receivable_collection_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own receivable_collection_history" ON public.receivable_collection_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own receivable_collection_history" ON public.receivable_collection_history FOR DELETE TO authenticated USING (user_id = auth.uid());
