
-- Receivable Books (person profiles)
CREATE TABLE public.receivable_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_name text NOT NULL,
  description text,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'active',
  opening_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.receivable_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own receivable_books" ON public.receivable_books FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own receivable_books" ON public.receivable_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own receivable_books" ON public.receivable_books FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own receivable_books" ON public.receivable_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Receivable Entries
CREATE TABLE public.receivable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  book_id uuid NOT NULL REFERENCES public.receivable_books(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  category text,
  linked_account_id uuid REFERENCES public.accounts(id),
  amount numeric NOT NULL DEFAULT 0,
  collected_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  note text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.receivable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own receivable_entries" ON public.receivable_entries FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own receivable_entries" ON public.receivable_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own receivable_entries" ON public.receivable_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own receivable_entries" ON public.receivable_entries FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Payable Books (person/vendor profiles)
CREATE TABLE public.payable_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  person_name text NOT NULL,
  description text,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'active',
  opening_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payable_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own payable_books" ON public.payable_books FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own payable_books" ON public.payable_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own payable_books" ON public.payable_books FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own payable_books" ON public.payable_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Payable Entries
CREATE TABLE public.payable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  book_id uuid NOT NULL REFERENCES public.payable_books(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  category text,
  linked_account_id uuid REFERENCES public.accounts(id),
  amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  note text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own payable_entries" ON public.payable_entries FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own payable_entries" ON public.payable_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own payable_entries" ON public.payable_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own payable_entries" ON public.payable_entries FOR DELETE TO authenticated USING (user_id = auth.uid());
