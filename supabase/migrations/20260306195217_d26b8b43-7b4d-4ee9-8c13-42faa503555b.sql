-- Add subscription_plan and status to profiles for admin management
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Expand app_role enum to include manager and support
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';