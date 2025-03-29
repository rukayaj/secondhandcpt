import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/Layout';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabaseClient } from '@/utils/supabase-client';
import { ListingRecord } from '@/utils/supabase';
import ListingCard from '@/components/ListingCard';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';
import { WHATSAPP_GROUPS } from '@/utils/whatsappGroups';

const FavoritesPage: NextPage = () => {
  const { favorites } = useFavorites();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to add human-readable group names to listings
  const addGroupNames = (listings: ListingRecord[]): ListingRecord[] => {
    return listings.map(listing => {
      // Ensure collection_areas is always an array
      const cleanedListing = { ...listing };
      
      // If collection_areas is a string, try to parse it as JSON
      if (typeof cleanedListing.collection_areas === 'string') {
        try {
          const parsed = JSON.parse(cleanedListing.collection_areas as any);
          (cleanedListing as any).collection_areas = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          (cleanedListing as any).collection_areas = [cleanedListing.collection_areas];
        }
      }
      
      // If still not an array, initialize as empty array
      if (!Array.isArray(cleanedListing.collection_areas)) {
        (cleanedListing as any).collection_areas = [];
      }
      
      return {
        ...cleanedListing,
        group_name: WHATSAPP_GROUPS[cleanedListing.whatsapp_group] || 'Unknown Group'
      };
    });
  };

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!favorites.length) {
        setListings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all favorites from Supabase
        const { data, error } = await supabaseClient
          .from('listings')
          .select('*')
          .in('id', favorites);

        if (error) {
          console.error('Error fetching favorites:', error);
          setError('Failed to load your favorite listings. Please try again later.');
        } else {
          // Apply group names to the listings before setting them
          setListings(addGroupNames(data || []));
          setError(null);
        }
      } catch (e) {
        console.error('Exception when fetching favorites:', e);
        setError('Something went wrong while loading your favorites.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteListings();
  }, [favorites]);

  return (
    <Layout title="My Favorites">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <Alert type="error" message={error} />
        ) : !favorites.length ? (
          <div className="text-center py-12">
            <div className="text-7xl mb-4">
              <i className="fa-regular fa-heart text-gray-300"></i>
            </div>
            <p className="text-xl text-gray-500 mb-4">
              You haven't added any listings to your favorites yet.
            </p>
            <p className="text-gray-400">
              Click the heart icon on any listing to save it to your favorites.
            </p>
          </div>
        ) : listings.length === 0 ? (
          <Alert 
            type="warning" 
            message="Some of your favorited listings may have been removed or are no longer available." 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage; 