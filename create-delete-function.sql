-- Function to delete all listings
CREATE OR REPLACE FUNCTION delete_all_listings()
RETURNS void AS $$
BEGIN
  DELETE FROM listings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 