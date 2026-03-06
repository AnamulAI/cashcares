
-- Entry attachments table
CREATE TABLE public.entry_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  entry_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('payable', 'receivable')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entry_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own entry_attachments" ON public.entry_attachments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own entry_attachments" ON public.entry_attachments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own entry_attachments" ON public.entry_attachments FOR DELETE USING (user_id = auth.uid());

-- Storage bucket for ledger attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ledger-attachments', 'ledger-attachments', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Storage RLS policies
CREATE POLICY "Users can upload own ledger attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ledger-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view ledger attachments" ON storage.objects FOR SELECT USING (bucket_id = 'ledger-attachments');
CREATE POLICY "Users can delete own ledger attachments" ON storage.objects FOR DELETE USING (bucket_id = 'ledger-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
