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
import LoadingSpinner from '@/components/LoadingSpinner';

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

  // Handle clearing all filters
  const clearFilters = () => {
    if (handleFilterChange) {
      // Client-side filtering
      handleFilterChange({});
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
      });
    }
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
          <div className="w-full md:w-3/4 md:pl-6">
            {/* Active filters */}
            {(filterCriteria.category || filterCriteria.location || (filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined) || filterCriteria.dateRange) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filterCriteria.category && (
                  <div className="px-3 py-1 bg-secondary-100 rounded-full flex items-center">
                    <span className="text-sm">Category: {filterCriteria.category}</span>
                    <button 
                      onClick={() => handleClearFilter('category')}
                      className="ml-2 text-secondary-500 hover:text-secondary-700"
                      disabled={isLoading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                {filterCriteria.location && (
                  <div className="px-3 py-1 bg-secondary-100 rounded-full flex items-center">
                    <span className="text-sm">Location: {filterCriteria.location}</span>
                    <button 
                      onClick={() => handleClearFilter('location')}
                      className="ml-2 text-secondary-500 hover:text-secondary-700"
                      disabled={isLoading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                {filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined && (
                  <div className="px-3 py-1 bg-secondary-100 rounded-full flex items-center">
                    <span className="text-sm">
                      Price: R{filterCriteria.minPrice} - {filterCriteria.maxPrice === 100000 ? "∞" : `R${filterCriteria.maxPrice}`}
                    </span>
                    <button 
                      onClick={() => handleClearFilter('minPrice')}
                      className="ml-2 text-secondary-500 hover:text-secondary-700"
                      disabled={isLoading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                {filterCriteria.dateRange && (
                  <div className="px-3 py-1 bg-secondary-100 rounded-full flex items-center">
                    <span className="text-sm">
                      Date: {dateRanges.find(d => d.days === filterCriteria.dateRange)?.range || `Last ${filterCriteria.dateRange} days`}
                    </span>
                    <button 
                      onClick={() => handleClearFilter('dateRange')}
                      className="ml-2 text-secondary-500 hover:text-secondary-700"
                      disabled={isLoading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-primary-600">Loading listings...</p>
                </div>
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/listings`}
                  query={{
                    ...router.query,
                    page: undefined // We will set the page in Pagination component
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 mb-4">
                  <i className="fas fa-search text-secondary-400 text-2xl"></i>
                </div>
                <h2 className="text-xl font-semibold mb-2">No listings found</h2>
                <p className="text-secondary-600 mb-6">
                  Try adjusting your filters or browse all categories.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear All Filters
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