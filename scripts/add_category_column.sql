-- Add category column to listings table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Add category column if it doesn't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings' AND column_name = 'category'; 