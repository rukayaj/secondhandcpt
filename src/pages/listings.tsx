import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { 
  getListings, 
  getListingsByCategory, 
  getListingsByLocation, 
  getListingsByPriceRange
} from '@/utils/listingService';
import { ListingRecord } from '@/utils/supabase';
import {
  getPriceRangesWithCounts,
  getLocationsWithCounts,
  getCategoriesWithCounts,
  getDateRangesWithCounts,
  filterListings,
  FilterCriteria,
  getAllFilterOptions
} from '@/utils/filterUtils';

interface ListingsPageProps {
  listings: ListingRecord[];
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  priceRanges: { range: string; min: number; max: number; count: number }[];
  dateRanges: { range: string; days: number; count: number }[];
  totalListings: number;
  allListings: ListingRecord[]; // All listings for client-side filtering
  initialFilterCriteria: FilterCriteria; // Initial filter criteria
}

const ITEMS_PER_PAGE = 16;

export default function ListingsPage({ 
  listings: initialListings, 
  categories: initialCategories, 
  locations: initialLocations, 
  priceRanges: initialPriceRanges,
  dateRanges: initialDateRanges,
  totalListings: initialTotalListings,
  allListings,
  initialFilterCriteria
}: ListingsPageProps) {
  const router = useRouter();
  const { category, location, minPrice, maxPrice, dateRange, page = '1' } = router.query;
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  
  // State for client-side filtering
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(initialFilterCriteria);
  const [filteredListings, setFilteredListings] = useState<ListingRecord[]>(initialListings);
  const [categories, setCategories] = useState(initialCategories);
  const [locations, setLocations] = useState(initialLocations);
  const [priceRanges, setPriceRanges] = useState(initialPriceRanges);
  const [dateRanges, setDateRanges] = useState(initialDateRanges);
  const [totalListings, setTotalListings] = useState(initialTotalListings);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get selected price range
  const selectedPriceRange = minPrice && maxPrice 
    ? { min: parseInt(minPrice as string, 10), max: parseInt(maxPrice as string, 10) }
    : undefined;

  // Update filter counts when filter criteria change
  useEffect(() => {
    const updateFilterCounts = async () => {
      try {
        const categories = await getCategoriesWithCounts(filterCriteria);
        const locations = await getLocationsWithCounts(filterCriteria);
        const priceRanges = await getPriceRangesWithCounts(filterCriteria);
        const dateRanges = await getDateRangesWithCounts(filterCriteria);
        
        setCategories(categories);
        setLocations(locations);
        setPriceRanges(priceRanges);
        setDateRanges(dateRanges);
      } catch (error) {
        console.error('Error updating filter counts:', error);
      }
    };
    
    updateFilterCounts();
  }, [filterCriteria]);
  
  // Update filter criteria when URL query params change
  useEffect(() => {
    setIsLoading(true);
    
    const newFilterCriteria: FilterCriteria = {};
    
    if (category) {
      newFilterCriteria.category = Array.isArray(category) ? category[0] : category;
    }
    
    if (location) {
      newFilterCriteria.location = Array.isArray(location) ? location[0] : location;
    }
    
    if (minPrice && maxPrice) {
      newFilterCriteria.minPrice = parseInt(Array.isArray(minPrice) ? minPrice[0] : minPrice, 10);
      newFilterCriteria.maxPrice = parseInt(Array.isArray(maxPrice) ? maxPrice[0] : maxPrice, 10);
    }
    
    if (dateRange) {
      const days = parseInt(Array.isArray(dateRange) ? dateRange[0] : dateRange, 10);
      if (!isNaN(days)) {
        newFilterCriteria.dateRange = days;
      }
    }
    
    setFilterCriteria(newFilterCriteria);
    setIsLoading(false);
  }, [category, location, minPrice, maxPrice, dateRange]);

  // Filter listings client-side when filter criteria or page changes
  useEffect(() => {
    // Skip on initial render as we already have server-side data
    if (isLoading) return;
    
    const filterListingsClientSide = async () => {
      try {
        // Filter listings client-side
        const filtered = await filterListings(filterCriteria);
        const nonISOFiltered = filtered.filter((listing: ListingRecord) => !listing.is_iso);
        
        // Sort by date (newest first)
        nonISOFiltered.sort((a: ListingRecord, b: ListingRecord) => 
          new Date(b.posted_on).getTime() - new Date(a.posted_on).getTime()
        );
        
        // Update state with filtered listings and counts
        setFilteredListings(nonISOFiltered.slice(
          (currentPage - 1) * ITEMS_PER_PAGE, 
          currentPage * ITEMS_PER_PAGE
        ));
        setTotalListings(nonISOFiltered.length);
      } catch (error) {
        console.error('Error filtering listings client-side:', error);
      }
    };
    
    filterListingsClientSide();
  }, [filterCriteria, currentPage, isLoading]);

  // Convert price ranges to the format expected by FilterSidebar
  const formattedPriceRanges = priceRanges.map(range => ({
    min: range.min,
    max: range.max,
    label: `${range.range} (${range.count})`
  }));

  // Convert date ranges to the format expected by FilterSidebar
  const formattedDateRanges = dateRanges.map(range => ({
    value: range.days.toString(),
    label: `${range.range} (${range.count})`
  }));

  // Handle filter changes
  const handleFilterChange = (newFilterCriteria: FilterCriteria) => {
    // Update URL with new filter criteria
    const query: any = { ...router.query };
    
    // Update category
    if (newFilterCriteria.category) {
      query.category = newFilterCriteria.category;
    } else {
      delete query.category;
    }
    
    // Update location
    if (newFilterCriteria.location) {
      query.location = newFilterCriteria.location;
    } else {
      delete query.location;
    }
    
    // Update price range
    if (newFilterCriteria.minPrice !== undefined && newFilterCriteria.maxPrice !== undefined) {
      query.minPrice = newFilterCriteria.minPrice.toString();
      query.maxPrice = newFilterCriteria.maxPrice.toString();
    } else {
      delete query.minPrice;
      delete query.maxPrice;
    }
    
    // Update date range
    if (newFilterCriteria.dateRange) {
      query.dateRange = newFilterCriteria.dateRange.toString();
    } else {
      delete query.dateRange;
    }
    
    // Reset to page 1 when filters change
    query.page = '1';
    
    // Update URL
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  // Handle clearing a specific filter
  const handleClearFilter = (filterType: keyof FilterCriteria) => {
    const newFilterCriteria = { ...filterCriteria };
    
    if (filterType === 'minPrice' || filterType === 'maxPrice') {
      // Clear both min and max price together
      delete newFilterCriteria.minPrice;
      delete newFilterCriteria.maxPrice;
    } else {
      delete newFilterCriteria[filterType];
    }
    
    handleFilterChange(newFilterCriteria);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);

  return (
    <Layout title="All Listings - Nifty Thrifty">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Listings</h1>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters */}
          <FilterSidebar
            categories={categories}
            locations={locations}
            priceRanges={formattedPriceRanges}
            dateRanges={formattedDateRanges}
            selectedCategory={filterCriteria.category}
            selectedLocation={filterCriteria.location}
            selectedPriceRange={
              filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined
                ? { min: filterCriteria.minPrice, max: filterCriteria.maxPrice }
                : undefined
            }
            selectedDateRange={filterCriteria.dateRange?.toString()}
            onFilterChange={handleFilterChange}
            onClearFilter={handleClearFilter}
            isLoading={isLoading}
          />
          
          {/* Listings */}
          <div className="flex-1">
            {/* Active filters display */}
            {Object.keys(filterCriteria).length > 0 && (
              <div className="mb-6 bg-secondary-50 p-4 rounded-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-secondary-700 font-medium">Active filters:</span>
                  
                  {filterCriteria.category && (
                    <span className="inline-flex items-center bg-white border border-secondary-200 rounded-full px-3 py-1 text-sm">
                      Category: {filterCriteria.category}
                      <button 
                        onClick={() => handleClearFilter('category')}
                        className="ml-2 text-secondary-500 hover:text-secondary-700"
                        aria-label="Remove category filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filterCriteria.location && (
                    <span className="inline-flex items-center bg-white border border-secondary-200 rounded-full px-3 py-1 text-sm">
                      Location: {filterCriteria.location}
                      <button 
                        onClick={() => handleClearFilter('location')}
                        className="ml-2 text-secondary-500 hover:text-secondary-700"
                        aria-label="Remove location filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined && (
                    <span className="inline-flex items-center bg-white border border-secondary-200 rounded-full px-3 py-1 text-sm">
                      Price: R{filterCriteria.minPrice} - R{filterCriteria.maxPrice}
                      <button 
                        onClick={() => handleClearFilter('minPrice')}
                        className="ml-2 text-secondary-500 hover:text-secondary-700"
                        aria-label="Remove price filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filterCriteria.dateRange && (
                    <span className="inline-flex items-center bg-white border border-secondary-200 rounded-full px-3 py-1 text-sm">
                      Date: Past {filterCriteria.dateRange} days
                      <button 
                        onClick={() => handleClearFilter('dateRange')}
                        className="ml-2 text-secondary-500 hover:text-secondary-700"
                        aria-label="Remove date filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleFilterChange({})}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredListings.map((listing) => (
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
                  onClick={() => handleFilterChange({})}
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
  
  // Build filter criteria from query parameters
  const filterCriteria: FilterCriteria = {};
  
  if (category) {
    filterCriteria.category = category as string;
  }
  
  if (location) {
    filterCriteria.location = location as string;
  }
  
  if (minPrice && maxPrice) {
    filterCriteria.minPrice = parseInt(minPrice as string, 10);
    filterCriteria.maxPrice = parseInt(maxPrice as string, 10);
  }
  
  if (dateRange) {
    const days = parseInt(dateRange as string, 10);
    if (!isNaN(days)) {
      filterCriteria.dateRange = days;
    }
  }
  
  try {
    // Get filtered listings
    const filteredListings = await filterListings(filterCriteria);
    const nonISOListings = filteredListings.filter((listing: ListingRecord) => !listing.is_iso);
    
    // Sort by date (newest first)
    nonISOListings.sort((a: ListingRecord, b: ListingRecord) => new Date(b.posted_on).getTime() - new Date(a.posted_on).getTime());
    
    // Get total count for pagination
    const totalListings = nonISOListings.length;
    
    // Paginate results
    const paginatedListings = nonISOListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    // Get filter options with counts
    const filterOptions = await getAllFilterOptions(filterCriteria);
    
    // Get all listings for client-side filtering
    const allListings = await getListings();
    const allNonISOListings = allListings.filter((listing: ListingRecord) => !listing.is_iso);
    
    return {
      props: {
        listings: paginatedListings,
        categories: filterOptions.categories,
        locations: filterOptions.locations,
        priceRanges: filterOptions.priceRanges,
        dateRanges: filterOptions.dateRanges,
        totalListings,
        allListings: allNonISOListings,
        initialFilterCriteria: filterCriteria,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        listings: [],
        categories: [],
        locations: [],
        priceRanges: [],
        dateRanges: [],
        totalListings: 0,
        allListings: [],
        initialFilterCriteria: filterCriteria,
      },
    };
  }
} 