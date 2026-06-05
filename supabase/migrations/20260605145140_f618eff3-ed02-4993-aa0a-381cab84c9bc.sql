CREATE TABLE public.mohorana_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  record_id UUID NOT NULL REFERENCES public.mohorana_records(id) ON DELETE CASCADE,
  adjusted_on DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  note TEXT,
  attachment_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mohorana_adjustments TO authenticated;
GRANT ALL ON public.mohorana_adjustments TO service_role;

ALTER TABLE public.mohorana_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mohorana adjustments" ON public.mohorana_adjustments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mohorana adjustments" ON public.mohorana_adjustments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mohorana adjustments" ON public.mohorana_adjustments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mohorana adjustments" ON public.mohorana_adjustments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER mohorana_adjustments_set_updated BEFORE UPDATE ON public.mohorana_adjustments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.entry_attachments DROP CONSTRAINT entry_attachments_entry_type_check;
ALTER TABLE public.entry_attachments ADD CONSTRAINT entry_attachments_entry_type_check CHECK (entry_type = ANY (ARRAY['payable'::text, 'receivable'::text, 'transaction'::text, 'loan'::text, 'investment'::text, 'asset'::text, 'savings_installment'::text, 'partnership_entry'::text, 'mohorana_record'::text, 'mohorana_payment'::text, 'mohorana_adjustment'::text]));