-- Switch to Uncategorised Category System
-- This script changes the default category system to use 'Uncategorised' as the initial state
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Step 1: Update all existing 'Other' category listings to 'Uncategorised'
UPDATE listings 
SET category = 'Uncategorised' 
WHERE category = 'Other' OR category IS NULL;

-- Step 2: Update any rows where category is empty string to 'Uncategorised'
UPDATE listings 
SET category = 'Uncategorised' 
WHERE category = '';

-- Step 3: Verify the changes
SELECT 
  category, 
  COUNT(*) as count
FROM 
  listings 
GROUP BY 
  category 
ORDER BY 
  count DESC;

-- For informational purposes, check how many rows were updated
SELECT 
  'Rows changed to Uncategorised:' as info,
  COUNT(*) as count
FROM 
  listings 
WHERE 
  category = 'Uncategorised'; 