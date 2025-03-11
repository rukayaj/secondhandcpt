-- Add is_iso column to listings table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Add is_iso column if it doesn't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_iso BOOLEAN DEFAULT FALSE;

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_listings_is_iso ON listings (is_iso);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings' AND column_name = 'is_iso'; 