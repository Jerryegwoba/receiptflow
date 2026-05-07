-- Create storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Storage policies: users can only access their own folder
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own receipts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RPC function to increment receipt count
CREATE OR REPLACE FUNCTION increment_receipt_count(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET receipt_count_this_month = receipt_count_this_month + 1,
      updated_at = now()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset receipt count monthly (optional: call this via pg_cron or app logic)
CREATE OR REPLACE FUNCTION reset_monthly_receipt_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET receipt_count_this_month = 0,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
