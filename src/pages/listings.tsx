import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { 
  getAllListings, 
  getListingsByCategory, 
  getListingsByLocation, 
  getListingsByPriceRange,
  getCategoriesWithCounts,
  getAllLocations,
  Listing 
} from '@/utils/parser';

interface ListingsPageProps {
  listings: Listing[];
  categories: { name: string; count: number }[];
  locations: string[];
  totalListings: number;
}

// Define price ranges
const priceRanges = [
  { min: 0, max: 100, label: 'Under R100' },
  { min: 100, max: 250, label: 'R100 - R250' },
  { min: 250, max: 500, label: 'R250 - R500' },
  { min: 500, max: 1000, label: 'R500 - R1000' },
  { min: 1000, max: 2000, label: 'R1000 - R2000' },
  { min: 2000, max: 5000, label: 'R2000 - R5000' },
  { min: 5000, max: 1000000, label: 'Over R5000' },
];

// Define date ranges
const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: '3days', label: 'Past 3 Days' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
];

const ITEMS_PER_PAGE = 16;

export default function ListingsPage({ listings, categories, locations, totalListings }: ListingsPageProps) {
  const router = useRouter();
  const { category, location, minPrice, maxPrice, dateRange, page = '1' } = router.query;
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);
  
  // Get selected price range
  const selectedPriceRange = minPrice && maxPrice 
    ? { min: parseInt(minPrice as string, 10), max: parseInt(maxPrice as string, 10) }
    : undefined;

  return (
    <Layout title="All Listings - SecondHandCPT">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">All Listings</h1>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters */}
          <FilterSidebar
            categories={categories}
            locations={locations}
            priceRanges={priceRanges}
            dateRanges={dateRanges}
            selectedCategory={category as string}
            selectedLocation={location as string}
            selectedPriceRange={selectedPriceRange}
            selectedDateRange={dateRange as string}
          />
          
          {/* Listings */}
          <div className="flex-1">
            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </>
            ) : (
              <div className="bg-secondary-50 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">No listings found</h2>
                <p className="text-secondary-600 mb-4">
                  Try adjusting your filters or check back later for new listings.
                </p>
                <button
                  onClick={() => router.push('/listings')}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }: { query: any }) {
  const { category, location, minPrice, maxPrice, dateRange, page = '1' } = query;
  const currentPage = parseInt(page, 10);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  
  // Get all listings
  let filteredListings = getAllListings().filter(listing => !listing.isISO);
  
  // Apply category filter
  if (category) {
    filteredListings = filteredListings.filter(listing => listing.category === category);
  }
  
  // Apply location filter
  if (location) {
    filteredListings = filteredListings.filter(
      listing => listing.location && listing.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  // Apply price range filter
  if (minPrice && maxPrice) {
    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);
    filteredListings = filteredListings.filter(
      listing => listing.price !== null && listing.price >= min && listing.price <= max
    );
  }
  
  // Apply date range filter
  if (dateRange) {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateRange) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0); // Start of today
        break;
      case '3days':
        cutoffDate.setDate(now.getDate() - 3);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        // No date filter
        break;
    }
    
    filteredListings = filteredListings.filter(
      listing => new Date(listing.date) >= cutoffDate
    );
  }
  
  // Sort by date (newest first)
  filteredListings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get total count for pagination
  const totalListings = filteredListings.length;
  
  // Paginate results
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Get categories with counts
  const categories = getCategoriesWithCounts();
  
  // Get all locations
  const locations = getAllLocations();
  
  return {
    props: {
      listings: paginatedListings,
      categories,
      locations,
      totalListings,
    },
  };
} 