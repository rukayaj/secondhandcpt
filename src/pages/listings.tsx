import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { 
  getListings
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
  initialFilterCriteria
}: ListingsPageProps) {
  const router = useRouter();
  const { category, location, minPrice, maxPrice, dateRange, page = '1' } = router.query;
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  
  // State for filtering and pagination
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(initialFilterCriteria);
  const [listings, setListings] = useState<ListingRecord[]>(initialListings);
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
    
    const newFilterCriteria: FilterCriteria = {
      page: currentPage,
      limit: ITEMS_PER_PAGE
    };
    
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
    
    // Fetch listings with the new filters and pagination
    fetchListings(newFilterCriteria);
  }, [category, location, minPrice, maxPrice, dateRange, currentPage]);

  // Fetch listings with filters and pagination
  const fetchListings = async (filters: FilterCriteria) => {
    try {
      setIsLoading(true);
      
      // Use the optimized filterListings function with pagination
      const result = await filterListings(filters);
      
      setListings(result.listings);
      setTotalListings(result.totalCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setIsLoading(false);
    }
  };

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
    router.push({
      pathname: router.pathname,
    });
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
            selectedPriceRange={selectedPriceRange}
            selectedDateRange={filterCriteria.dateRange?.toString()}
            onFilterChange={handleFilterChange}
            onClearFilter={handleClearFilter}
            onClearAll={clearFilters}
            className="w-full md:w-1/4 mr-0 md:mr-8 mb-6 md:mb-0"
          />
          
          {/* Listing Grid */}
          <div className="w-full md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <div className="text-center p-8 bg-secondary-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No listings found</h3>
                <p className="text-secondary-600 mb-4">
                  Try adjusting your filters or check back later for new listings.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
                >
                  Clear all filters
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
  // Parse query parameters
  const {
    category,
    location,
    minPrice,
    maxPrice,
    dateRange,
    page = '1'
  } = query;
  
  const currentPage = parseInt(page, 10);
  
  // Build filter criteria
  const filterCriteria: FilterCriteria = {
    page: currentPage,
    limit: ITEMS_PER_PAGE
  };
  
  if (category) {
    filterCriteria.category = category;
  }
  
  if (location) {
    filterCriteria.location = location;
  }
  
  if (minPrice && maxPrice) {
    filterCriteria.minPrice = parseInt(minPrice, 10);
    filterCriteria.maxPrice = parseInt(maxPrice, 10);
  }
  
  if (dateRange) {
    const days = parseInt(dateRange, 10);
    if (!isNaN(days)) {
      filterCriteria.dateRange = days;
    }
  }
  
  try {
    // Get listings with filters and pagination
    const result = await filterListings(filterCriteria);
    
    // Get filter options with counts
    const filterOptions = await getAllFilterOptions(filterCriteria);
    
    return {
      props: {
        listings: result.listings,
        categories: filterOptions.categories || [],
        locations: filterOptions.locations || [],
        priceRanges: filterOptions.priceRanges || [],
        dateRanges: filterOptions.dateRanges || [],
        totalListings: result.totalCount,
        initialFilterCriteria: filterCriteria
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return default values on error
    return {
      props: {
        listings: [],
        categories: [],
        locations: [],
        priceRanges: [],
        dateRanges: [],
        totalListings: 0,
        initialFilterCriteria: filterCriteria
      }
    };
  }
} 