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
import { useAnalytics } from '@/utils/useAnalytics';
import { GetServerSidePropsContext } from 'next';

interface ListingsPageProps {
  listings: ListingRecord[];
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  priceRanges: { range: string; min: number; max: number; count: number }[];
  dateRanges: { range: string; days: number; count: number }[];
  whatsappGroups?: { id: string; name: string; count: number }[];
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
  const { category, location, minPrice, maxPrice, dateRange, whatsappGroup, page = '1' } = router.query;
  const { trackEvent } = useAnalytics();
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  
  // State for filtering and pagination
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(initialFilterCriteria);
  const [listings, setListings] = useState<ListingRecord[]>(initialListings);
  const [categories, setCategories] = useState(initialCategories);
  const [locations, setLocations] = useState(initialLocations);
  const [priceRanges, setPriceRanges] = useState(initialPriceRanges);
  const [dateRanges, setDateRanges] = useState(initialDateRanges);
  const [whatsappGroups, setWhatsappGroups] = useState<{ id: string; name: string; count: number }[]>([]);
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
        setIsLoading(true);
        
        // Get all filter options with counts based on current filter criteria
        const filterOptions = await getAllFilterOptions(filterCriteria);
        
        // Update all filter counts
        setCategories(filterOptions.categories || []);
        setLocations(filterOptions.locations || []);
        setPriceRanges(filterOptions.priceRanges || []);
        setDateRanges(filterOptions.dateRanges || []);
        setWhatsappGroups(filterOptions.whatsappGroups || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating filter counts:', error);
        setIsLoading(false);
      }
    };
    
    updateFilterCounts();
  }, [filterCriteria]);
  
  // Fetch listings when filter criteria change
  const fetchListings = async (filters: FilterCriteria) => {
    try {
      setIsLoading(true);
      
      // Use the optimized filterListings function with pagination
      const result = await filterListings(filters);
      
      setListings(result.listings);
      setTotalListings(result.totalCount);
      setIsLoading(false);
      
      // Track the number of results after fetching
      trackEvent('search_results', {
        resultsCount: result.totalCount,
        category: filters.category,
        location: filters.location,
        priceRange: filters.minPrice && filters.maxPrice 
          ? `${filters.minPrice}-${filters.maxPrice}` 
          : undefined,
        dateRange: filters.dateRange,
        page: filters.page
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      setIsLoading(false);
    }
  };

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
      // Make sure to decode the location from the URL
      const decodedLocation = decodeURIComponent(Array.isArray(location) ? location[0] : location);
      newFilterCriteria.location = decodedLocation;
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
    
    if (whatsappGroup) {
      newFilterCriteria.whatsappGroup = Array.isArray(whatsappGroup) ? whatsappGroup[0] : whatsappGroup;
    }
    
    setFilterCriteria(newFilterCriteria);
    
    // Track search event with applied filters
    trackEvent('listing_search', {
      category: newFilterCriteria.category,
      location: newFilterCriteria.location,
      priceRange: newFilterCriteria.minPrice && newFilterCriteria.maxPrice 
        ? `${newFilterCriteria.minPrice}-${newFilterCriteria.maxPrice}` 
        : undefined,
      dateRange: newFilterCriteria.dateRange,
      whatsappGroup: newFilterCriteria.whatsappGroup,
      page: currentPage,
      resultsCount: undefined // Will be updated after fetch
    });
    
    // Fetch listings with the new filters and pagination
    fetchListings(newFilterCriteria);
  }, [category, location, minPrice, maxPrice, dateRange, whatsappGroup, currentPage]);

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
    // Track filter usage
    trackEvent('filter_use', {
      filterType: getChangedFilter(filterCriteria, newFilterCriteria),
      newValue: getNewFilterValue(filterCriteria, newFilterCriteria)
    });
    
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
    
    // Update whatsapp group
    if (newFilterCriteria.whatsappGroup) {
      query.whatsappGroup = newFilterCriteria.whatsappGroup;
    } else {
      delete query.whatsappGroup;
    }
    
    // Reset to page 1 when filters change
    query.page = '1';
    
    // Update URL
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  // Handle clearing one filter
  const handleClearFilter = (filterType: keyof FilterCriteria) => {
    const newFilterCriteria = { ...filterCriteria };
    
    // Track filter clearing
    trackEvent('filter_use', {
      filterType,
      filterValue: getFilterValue(filterCriteria, filterType),
      action: 'clear'
    });
    
    // Remove the specified filter
    delete newFilterCriteria[filterType];
    
    // Update URL query params
    const query = { ...router.query };
    
    // Handle based on filter type
    if (filterType === 'category') {
      delete query.category;
    } else if (filterType === 'location') {
      delete query.location;
    } else if (filterType === 'minPrice' || filterType === 'maxPrice') {
      delete query.minPrice;
      delete query.maxPrice;
    } else if (filterType === 'dateRange') {
      delete query.dateRange;
    } else if (filterType === 'whatsappGroup') {
      delete query.whatsappGroup;
    }
    
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
    
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

  // Track listing card clicks
  const handleListingClick = (listingId: string, listingTitle: string) => {
    trackEvent('listing_view', {
      listingId,
      listingTitle
    });
  };

  return (
    <Layout title="Browse Listings | Nifty Thrifty" description="Browse second-hand baby items in Cape Town">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          {/* Filters */}
          <FilterSidebar
            categories={categories}
            locations={locations}
            priceRanges={formattedPriceRanges}
            dateRanges={formattedDateRanges}
            whatsappGroups={whatsappGroups}
            selectedCategory={filterCriteria.category}
            selectedLocation={filterCriteria.location}
            selectedPriceRange={selectedPriceRange}
            selectedDateRange={filterCriteria.dateRange?.toString()}
            selectedWhatsappGroup={filterCriteria.whatsappGroup}
            onFilterChange={handleFilterChange}
            onClearFilter={handleClearFilter}
            onClearAll={clearFilters}
            className="w-full md:w-1/4 mr-0 md:mr-8 mb-6 md:mb-0"
          />
          
          {/* Listing Grid */}
          <div className="w-full md:w-3/4 md:pl-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map(listing => (
                    <Link 
                      href={`/listings/${listing.id}`} 
                      key={listing.id}
                      onClick={() => handleListingClick(listing.id, listing.title)}
                    >
                      <ListingCard listing={listing} />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={Math.ceil(totalListings / ITEMS_PER_PAGE)}
                    onPageChange={(page) => {
                      // Track pagination usage
                      trackEvent('pagination_use', {
                        fromPage: currentPage,
                        toPage: page
                      });
                      
                      router.push({
                        pathname: router.pathname,
                        query: { ...router.query, page: page.toString() }
                      });
                    }}
                  />
                </div>
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

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  // Parse query parameters
  const {
    category,
    location,
    minPrice,
    maxPrice,
    dateRange,
    whatsappGroup,
    page = '1'
  } = query;

  // Build filter criteria object for server-side filtering
  const filterCriteria: FilterCriteria = {
    page: parseInt(Array.isArray(page) ? page[0] : page, 10),
    limit: ITEMS_PER_PAGE
  };

  // Add category filter if present
  if (category) {
    filterCriteria.category = Array.isArray(category) ? category[0] : category;
  }

  // Add location filter if present
  if (location) {
    // Make sure to decode the location from the URL
    const locationStr = Array.isArray(location) ? location[0] : location;
    filterCriteria.location = decodeURIComponent(locationStr);
  }

  // Add price range filters if present
  if (minPrice && maxPrice) {
    const minPriceStr = Array.isArray(minPrice) ? minPrice[0] : minPrice;
    const maxPriceStr = Array.isArray(maxPrice) ? maxPrice[0] : maxPrice;
    
    filterCriteria.minPrice = parseInt(minPriceStr, 10);
    filterCriteria.maxPrice = parseInt(maxPriceStr, 10);
  }

  // Add date range filter if present
  if (dateRange) {
    const dateRangeStr = Array.isArray(dateRange) ? dateRange[0] : dateRange;
    filterCriteria.dateRange = parseInt(dateRangeStr, 10);
  }
  
  // Add WhatsApp group filter if present
  if (whatsappGroup) {
    filterCriteria.whatsappGroup = Array.isArray(whatsappGroup) ? whatsappGroup[0] : whatsappGroup;
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
        whatsappGroups: filterOptions.whatsappGroups || [],
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
        whatsappGroups: [],
        totalListings: 0,
        initialFilterCriteria: filterCriteria
      }
    };
  }
}

// Helper function to determine which filter changed
const getChangedFilter = (oldFilters: FilterCriteria, newFilters: FilterCriteria): string => {
  if (oldFilters.category !== newFilters.category) return 'category';
  if (oldFilters.location !== newFilters.location) return 'location';
  if (oldFilters.minPrice !== newFilters.minPrice || oldFilters.maxPrice !== newFilters.maxPrice) return 'price';
  if (oldFilters.dateRange !== newFilters.dateRange) return 'date';
  if (oldFilters.whatsappGroup !== newFilters.whatsappGroup) return 'whatsappGroup';
  return 'unknown';
};

// Helper function to get the new filter value
const getNewFilterValue = (oldFilters: FilterCriteria, newFilters: FilterCriteria): string => {
  if (oldFilters.category !== newFilters.category) return newFilters.category || '';
  if (oldFilters.location !== newFilters.location) return newFilters.location || '';
  if (oldFilters.minPrice !== newFilters.minPrice || oldFilters.maxPrice !== newFilters.maxPrice) {
    return newFilters.minPrice && newFilters.maxPrice 
      ? `${newFilters.minPrice}-${newFilters.maxPrice}` 
      : '';
  }
  if (oldFilters.dateRange !== newFilters.dateRange) return newFilters.dateRange?.toString() || '';
  if (oldFilters.whatsappGroup !== newFilters.whatsappGroup) return newFilters.whatsappGroup || '';
  return '';
};

// Helper function to get the filter value
const getFilterValue = (filters: FilterCriteria, filterType: keyof FilterCriteria): string => {
  if (filterType === 'category') return filters.category || '';
  if (filterType === 'location') return filters.location || '';
  if (filterType === 'minPrice' || filterType === 'maxPrice') {
    return filters.minPrice && filters.maxPrice 
      ? `${filters.minPrice}-${filters.maxPrice}` 
      : '';
  }
  if (filterType === 'dateRange') return filters.dateRange?.toString() || '';
  if (filterType === 'whatsappGroup') return filters.whatsappGroup || '';
  return '';
}; 