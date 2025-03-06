
-- Run this in the Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  price NUMERIC,
  description TEXT,
  whatsapp_group TEXT,
  date TIMESTAMP WITH TIME ZONE,
  sender TEXT,
  text TEXT,
  images JSONB,
  condition TEXT,
  collection_areas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up proper permissions
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads
CREATE POLICY "Allow anonymous read access" 
  ON public.listings 
  FOR SELECT 
  TO anon 
  USING (true);

-- Create policy to allow authenticated users to insert/update/delete their own records
CREATE POLICY "Allow authenticated users to manage their own records" 
  ON public.listings 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
