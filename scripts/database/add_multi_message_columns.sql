-- Add multi-message and sold status columns to listings table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Add columns if they don't exist
ALTER TABLE listings 
  ADD COLUMN IF NOT EXISTS is_multi_message BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_listings_is_multi_message ON listings (is_multi_message);
CREATE INDEX IF NOT EXISTS idx_listings_is_sold ON listings (is_sold);
CREATE INDEX IF NOT EXISTS idx_listings_title ON listings (title);

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings' 
AND column_name IN ('is_multi_message', 'message_count', 'is_sold', 'sold_date', 'title'); 