
-- Accounts table
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'cash',
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  color text NOT NULL DEFAULT '#6366f1',
  icon text DEFAULT 'Wallet',
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "group" text NOT NULL DEFAULT 'expense',
  icon text DEFAULT 'Folder',
  color text NOT NULL DEFAULT '#6366f1',
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_subcategory boolean NOT NULL DEFAULT false,
  description text,
  usage_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  usable_in_budgets boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'expense',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  tags text[],
  status text NOT NULL DEFAULT 'completed',
  transfer_fee numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Allow public access for now (no auth yet)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO public.categories (name, "group", icon, color, is_active, usable_in_budgets) VALUES
  ('Salary', 'income', 'Banknote', '#10b981', true, false),
  ('Freelance', 'income', 'Laptop', '#06b6d4', true, false),
  ('Business Revenue', 'income', 'TrendingUp', '#8b5cf6', true, false),
  ('Rental Income', 'income', 'Home', '#f59e0b', true, false),
  ('Gift Received', 'income', 'Gift', '#ec4899', true, false),
  ('Food & Dining', 'expense', 'UtensilsCrossed', '#f97316', true, true),
  ('Transport', 'expense', 'Car', '#6366f1', true, true),
  ('Bills & Utilities', 'expense', 'Zap', '#eab308', true, true),
  ('Shopping', 'expense', 'ShoppingBag', '#ec4899', true, true),
  ('Education', 'expense', 'GraduationCap', '#3b82f6', true, true),
  ('Health & Medical', 'expense', 'Heart', '#ef4444', true, true),
  ('Training', 'expense', 'BookOpen', '#14b8a6', true, true),
  ('Entertainment', 'expense', 'Gamepad2', '#a855f7', true, true),
  ('Household', 'expense', 'Home', '#78716c', true, true),
  ('Family', 'expense', 'Heart', '#e11d48', true, true),
  ('Emergency Fund', 'savings', 'Shield', '#10b981', true, false),
  ('Vacation Fund', 'savings', 'Plane', '#06b6d4', true, false);

-- Seed default accounts
INSERT INTO public.accounts (name, type, balance, currency, color, icon, is_primary) VALUES
  ('Cash in Hand', 'cash', 12500, 'BDT', '#10b981', 'Wallet', true),
  ('Dutch Bangla Bank', 'bank', 185000, 'BDT', '#6366f1', 'Building2', false),
  ('bKash Personal', 'mobile_wallet', 8200, 'BDT', '#e11d48', 'Smartphone', false),
  ('BRAC Bank Savings', 'savings', 320000, 'BDT', '#f59e0b', 'PiggyBank', false),
  ('Nagad', 'mobile_wallet', 3500, 'BDT', '#f97316', 'Smartphone', false),
  ('Business Account', 'business', 450000, 'BDT', '#8b5cf6', 'Briefcase', false);
