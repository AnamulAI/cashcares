
-- mohorana_records
CREATE TABLE public.mohorana_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  spouse_name text NOT NULL,
  marriage_date date,
  currency text NOT NULL DEFAULT 'BDT',
  total_amount numeric NOT NULL DEFAULT 0,
  muajjal_amount numeric NOT NULL DEFAULT 0,
  muakhkhar_amount numeric NOT NULL DEFAULT 0,
  note text,
  attachment_path text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mohorana_records TO authenticated;
GRANT ALL ON public.mohorana_records TO service_role;

ALTER TABLE public.mohorana_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mohorana_records"
  ON public.mohorana_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mohorana_records"
  ON public.mohorana_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mohorana_records"
  ON public.mohorana_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own mohorana_records"
  ON public.mohorana_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_mohorana_records_updated_at
  BEFORE UPDATE ON public.mohorana_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- mohorana_payments
CREATE TABLE public.mohorana_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  record_id uuid NOT NULL REFERENCES public.mohorana_records(id) ON DELETE CASCADE,
  paid_on date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  account_id uuid,
  payment_type text NOT NULL DEFAULT 'general',
  note text,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mohorana_payments TO authenticated;
GRANT ALL ON public.mohorana_payments TO service_role;

ALTER TABLE public.mohorana_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mohorana_payments"
  ON public.mohorana_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mohorana_payments"
  ON public.mohorana_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mohorana_payments"
  ON public.mohorana_payments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own mohorana_payments"
  ON public.mohorana_payments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_mohorana_payments_updated_at
  BEFORE UPDATE ON public.mohorana_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_mohorana_payments_record_id ON public.mohorana_payments(record_id);
CREATE INDEX idx_mohorana_records_user_id ON public.mohorana_records(user_id);
CREATE INDEX idx_mohorana_payments_user_id ON public.mohorana_payments(user_id);
