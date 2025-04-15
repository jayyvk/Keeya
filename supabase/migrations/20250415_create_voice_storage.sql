
-- Create a storage bucket for voice memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice_memories', 'Voice Memories', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice_memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'voice_memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'voice_memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to select their own files
CREATE POLICY "Users can select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice_memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for voice memories"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voice_memories');
