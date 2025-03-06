-- Add timestamp columns to the listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS date_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to set the timestamps
UPDATE public.listings
SET date_added = created_at,
    date_checked = created_at
WHERE date_added IS NULL OR date_checked IS NULL;

-- Verify the changes
SELECT id, date_added, date_checked 
FROM public.listings 
LIMIT 5; 