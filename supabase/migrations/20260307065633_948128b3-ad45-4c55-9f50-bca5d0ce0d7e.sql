
-- Create upgrade_requests table
CREATE TABLE public.upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  requested_plan text NOT NULL,
  current_plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'pending',
  note text,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
CREATE POLICY "Users can insert own upgrade_requests"
  ON public.upgrade_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own requests
CREATE POLICY "Users can select own upgrade_requests"
  ON public.upgrade_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update requests (approve/reject)
CREATE POLICY "Admins can update upgrade_requests"
  ON public.upgrade_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete requests
CREATE POLICY "Admins can delete upgrade_requests"
  ON public.upgrade_requests FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
