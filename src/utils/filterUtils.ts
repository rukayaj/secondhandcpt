import { Listing, getAllListings } from './listingUtils';

/**
 * Filter interface to represent all possible filter criteria
 */
export interface FilterCriteria {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: number; // in days
  condition?: string;
  size?: string;
}

/**
 * Filter listings based on multiple criteria
 */
export async function filterListings(filters: FilterCriteria = {}): Promise<Listing[]> {
  // Always fetch fresh listings from the database
  const listings = await getAllListings();
  let filteredListings = [...listings];
  
  // Filter by category
  if (filters.category) {
    filteredListings = filteredListings.filter(listing => 
      listing.text.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }
  
  // Filter by location
  if (filters.location) {
    filteredListings = filteredListings.filter(
      listing => listing.collectionAreas.some(area => 
        area.toLowerCase().includes(filters.location!.toLowerCase())
      )
    );
  }
  
  // Filter by price range
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    // Special case for "Under R100" where max is 99.99
    if (filters.minPrice === 0 && filters.maxPrice === 99.99) {
      filteredListings = filteredListings.filter(
        listing => listing.price !== null && 
                  listing.price >= filters.minPrice! && 
                  listing.price < 100
      );
    } else {
      filteredListings = filteredListings.filter(
        listing => listing.price !== null && 
                  listing.price >= filters.minPrice! && 
                  listing.price <= filters.maxPrice!
      );
    }
  }
  
  // Filter by date range (in days)
  if (filters.dateRange) {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - filters.dateRange);
    
    filteredListings = filteredListings.filter(listing => {
      const listingDate = new Date(listing.date);
      return listingDate >= cutoffDate;
    });
  }
  
  // Filter by condition
  if (filters.condition) {
    filteredListings = filteredListings.filter(
      listing => listing.condition && listing.condition.toLowerCase() === filters.condition!.toLowerCase()
    );
  }
  
  return filteredListings;
}

/**
 * Helper function to count occurrences by a specified property
 */
export function countBy<T>(
  array: T[],
  property: keyof T,
  filterNulls = true
): { [key: string]: number } {
  return array.reduce((acc, item) => {
    const value = item[property];
    if (filterNulls && (value === null || value === undefined)) {
      return acc;
    }
    
    const key = String(value);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
}

/**
 * Get categories with their counts, optionally filtered by other criteria
 */
export async function getCategoriesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the category
  const { category, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define common categories to look for in the text
  const categories = [
    'Clothing', 'Toys', 'Books', 'Furniture', 'Strollers',
    'Car Seats', 'Cribs', 'High Chairs', 'Bottles', 'Diapers', 'Shoes'
  ];
  
  return categories.map(cat => {
    const count = filteredListings.filter(listing => 
      listing.text.toLowerCase().includes(cat.toLowerCase())
    ).length;
    
    return { name: cat, count };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Get locations with their counts, optionally filtered by other criteria
 */
export async function getLocationsWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the location
  const { location, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Get all unique locations
  const allLocations = new Set<string>();
  filteredListings.forEach(listing => {
    listing.collectionAreas.forEach(area => allLocations.add(area));
  });
  
  return Array.from(allLocations).map(loc => {
    const count = filteredListings.filter(listing => 
      listing.collectionAreas.includes(loc)
    ).length;
    
    return { name: loc, count };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Get price ranges with their counts, optionally filtered by other criteria
 */
export async function getPriceRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the price range
  const { minPrice, maxPrice, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define price ranges
  const ranges = [
    { range: 'Under R100', min: 0, max: 99.99 },
    { range: 'R100 - R200', min: 100, max: 200 },
    { range: 'R200 - R500', min: 200, max: 500 },
    { range: 'R500 - R1000', min: 500, max: 1000 },
    { range: 'R1000 - R2000', min: 1000, max: 2000 },
    { range: 'Over R2000', min: 2000, max: 100000 }
  ];
  
  return ranges.map(range => {
    const count = filteredListings.filter(listing => 
      listing.price !== null && 
      listing.price >= range.min && 
      listing.price <= range.max
    ).length;
    
    return { ...range, count };
  });
}

/**
 * Get date ranges with their counts, optionally filtered by other criteria
 */
export async function getDateRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the date range
  const { dateRange, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define date ranges
  const ranges = [
    { range: 'Last 24 hours', days: 1 },
    { range: 'Last 3 days', days: 3 },
    { range: 'Last week', days: 7 },
    { range: 'Last month', days: 30 },
    { range: 'Last 3 months', days: 90 },
    { range: 'All time', days: 3650 }
  ];
  
  const now = new Date();
  
  return ranges.map(range => {
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - range.days);
    
    const count = filteredListings.filter(listing => {
      const listingDate = new Date(listing.date);
      return listingDate >= cutoffDate;
    }).length;
    
    return { ...range, count };
  });
}

/**
 * Get conditions with their counts, optionally filtered by other criteria
 */
export async function getConditionsWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the condition
  const { condition, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define common conditions
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  return conditions.map(cond => {
    const count = filteredListings.filter(listing => 
      listing.condition === cond
    ).length;
    
    return { name: cond, count };
  }).filter(item => item.count > 0);
}

/**
 * Get sizes with counts based on other filters
 */
export async function getSizesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the size
  const { size, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define common sizes
  const sizes = ['Small', 'Medium', 'Large', 'XL', 'XXL'];
  
  return sizes.map(s => {
    // Since we don't have a size field in our Supabase data,
    // we'll look for size mentions in the text
    const count = filteredListings.filter(listing => 
      listing.text.toLowerCase().includes(s.toLowerCase())
    ).length;
    
    return { name: s, count };
  }).filter(item => item.count > 0);
}

/**
 * Get all filter options with counts
 */
export async function getAllFilterOptions(filters: FilterCriteria = {}) {
  return {
    categories: await getCategoriesWithCounts(filters),
    locations: await getLocationsWithCounts(filters),
    priceRanges: await getPriceRangesWithCounts(filters),
    dateRanges: await getDateRangesWithCounts(filters),
    conditions: await getConditionsWithCounts(filters),
    sizes: await getSizesWithCounts(filters)
  };
} 