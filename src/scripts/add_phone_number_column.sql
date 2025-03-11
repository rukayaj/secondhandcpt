-- Add phone_number column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create an index on the phone_number column for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_phone_number ON public.listings (phone_number);

-- Comment explaining the purpose of this column
COMMENT ON COLUMN public.listings.phone_number IS 'Phone number extracted from the listing text for duplicate detection'; 