
ALTER TABLE public.partnerships
  ADD COLUMN IF NOT EXISTS partner_1_role text NOT NULL DEFAULT 'capital_partner',
  ADD COLUMN IF NOT EXISTS partner_2_role text NOT NULL DEFAULT 'capital_partner',
  ADD COLUMN IF NOT EXISTS partner_1_contribution_nature text NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS partner_2_contribution_nature text NOT NULL DEFAULT 'cash';

ALTER TABLE public.partnership_entries
  ADD COLUMN IF NOT EXISTS estimated_value numeric DEFAULT NULL;
