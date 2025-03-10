-- Add category column migration

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'category'
  ) THEN
    ALTER TABLE listings ADD COLUMN category TEXT DEFAULT 'Other';
    CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);
    RAISE NOTICE 'Category column added to listings table';
  ELSE
    RAISE NOTICE 'Category column already exists in listings table';
  END IF;
END $$;

-- Create index on category for faster searches
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);

-- Verify category column exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'listings' AND column_name = 'category'
) as category_column_exists; 