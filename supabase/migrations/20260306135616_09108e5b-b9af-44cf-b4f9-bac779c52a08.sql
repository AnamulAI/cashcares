
-- Function to atomically increment an account balance
CREATE OR REPLACE FUNCTION public.increment_balance(account_uuid uuid, amount_val numeric)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.accounts SET balance = balance + amount_val WHERE id = account_uuid;
$$;

-- Function to increment category usage count
CREATE OR REPLACE FUNCTION public.increment_usage(cat_uuid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.categories SET usage_count = usage_count + 1 WHERE id = cat_uuid;
$$;
