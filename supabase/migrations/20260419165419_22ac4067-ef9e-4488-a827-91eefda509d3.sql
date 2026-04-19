ALTER TABLE public.entry_attachments DROP CONSTRAINT IF EXISTS entry_attachments_entry_type_check;

ALTER TABLE public.entry_attachments
ADD CONSTRAINT entry_attachments_entry_type_check
CHECK (entry_type IN ('payable', 'receivable', 'transaction', 'loan', 'investment', 'asset', 'savings_installment', 'partnership_entry'));