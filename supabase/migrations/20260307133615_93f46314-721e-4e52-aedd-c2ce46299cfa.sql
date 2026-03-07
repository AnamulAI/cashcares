
-- Add new columns for 2-partner structure with share ratios
ALTER TABLE public.partnerships 
  ADD COLUMN IF NOT EXISTS partner_1_name text,
  ADD COLUMN IF NOT EXISTS partner_2_name text,
  ADD COLUMN IF NOT EXISTS partner_1_share numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS partner_2_share numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS total_capital numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_withdrawn numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_profit_distributed numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reinvested numeric NOT NULL DEFAULT 0;

-- Migrate existing data: partner_name -> partner_2_name, keep partnership_name
UPDATE public.partnerships SET partner_1_name = 'You', partner_2_name = partner_name WHERE partner_1_name IS NULL;

-- Add linked_account_id to partnership_entries
ALTER TABLE public.partnership_entries
  ADD COLUMN IF NOT EXISTS linked_account_id uuid REFERENCES public.accounts(id);
