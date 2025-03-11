-- Add a function to check if a column exists in a table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

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

-- Test the function with a query
SELECT check_column_exists('listings', 'id') AS id_exists, 
       check_column_exists('listings', 'is_iso') AS is_iso_exists; 