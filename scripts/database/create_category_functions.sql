-- Function to get category counts
CREATE OR REPLACE FUNCTION get_category_counts()
RETURNS TABLE (name text, count bigint) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(category, 'Other') as name,
    COUNT(*) as count
  FROM 
    listings
  GROUP BY 
    COALESCE(category, 'Other')
  ORDER BY 
    count DESC;
$$;

-- Grant access to the function for the authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_category_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_counts() TO anon;

-- You can run this to test the function:
-- SELECT * FROM get_category_counts(); 