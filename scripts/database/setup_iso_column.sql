-- Setup ISO column and helper functions
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- PART 1: Add is_iso column if it doesn't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_iso BOOLEAN DEFAULT FALSE;

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_listings_is_iso ON listings (is_iso);

-- PART 2: Create helper function to check column existence
-- This is useful for scripts that need to check if a column exists before using it

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION check_column_exists(p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = p_table_name
    AND column_name = p_column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Grant access to the function for the authenticated and anon roles
GRANT EXECUTE ON FUNCTION check_column_exists(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_column_exists(TEXT, TEXT) TO anon;

-- PART 3: Verification
-- Verify that both the column and function now exist

-- Check if the ISO column was added successfully
SELECT check_column_exists('listings', 'is_iso') AS is_iso_column_exists;

-- Get a sample of listings with both the category and is_iso columns
SELECT id, text, category, is_iso
FROM listings
LIMIT 5; 