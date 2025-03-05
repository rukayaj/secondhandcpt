import { sampleListings, Listing } from './sampleData.public';

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
export function filterListings(filters: FilterCriteria = {}): Listing[] {
  let filteredListings = [...sampleListings];
  
  // Filter by category
  if (filters.category) {
    filteredListings = filteredListings.filter(listing => listing.category === filters.category);
  }
  
  // Filter by location
  if (filters.location) {
    filteredListings = filteredListings.filter(
      listing => listing.location && listing.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  // Filter by price range
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    // Special case for "Under R100" where max is 99.99
    if (filters.minPrice === 0 && filters.maxPrice === 99.99) {
      filteredListings = filteredListings.filter(
        listing => listing.price !== null && 
                  listing.price !== undefined &&
                  listing.price >= filters.minPrice! && 
                  listing.price < 100
      );
    } else {
      filteredListings = filteredListings.filter(
        listing => listing.price !== null && 
                  listing.price !== undefined &&
                  listing.price >= filters.minPrice! && 
                  listing.price <= filters.maxPrice!
      );
    }
  }
  
  // Filter by date range
  if (filters.dateRange) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
    
    filteredListings = filteredListings.filter(
      listing => new Date(listing.date) >= cutoffDate
    );
  }
  
  // Filter by condition
  if (filters.condition) {
    filteredListings = filteredListings.filter(
      listing => listing.condition === filters.condition
    );
  }
  
  // Filter by size
  if (filters.size) {
    filteredListings = filteredListings.filter(
      listing => listing.size === filters.size
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
export function getCategoriesWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the category to avoid filtering by the same category
  const { category, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const categoryCounts = countBy(filteredListings, 'category', true);
  
  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(category => category.name !== 'null' && category.name !== 'undefined')
    .sort((a, b) => b.count - a.count);
}

/**
 * Get locations with their counts, optionally filtered by other criteria
 */
export function getLocationsWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the location to avoid filtering by the same location
  const { location, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const locationCounts = countBy(filteredListings, 'location', true);
  
  return Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(location => location.name !== 'null' && location.name !== 'undefined')
    .sort((a, b) => b.count - a.count);
}

/**
 * Get price ranges with their counts, optionally filtered by other criteria
 */
export function getPriceRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the price range to avoid filtering by the same price range
  const { minPrice, maxPrice, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const priceRanges = [
    { range: 'Under R100', min: 0, max: 99.99 },
    { range: 'R100 - R250', min: 100, max: 250 },
    { range: 'R250 - R500', min: 250, max: 500 },
    { range: 'R500 - R1000', min: 500, max: 1000 },
    { range: 'R1000 - R2000', min: 1000, max: 2000 },
    { range: 'R2000 - R5000', min: 2000, max: 5000 },
    { range: 'Over R5000', min: 5000, max: 1000000 },
  ];
  
  // Count listings in each price range
  return priceRanges.map(range => {
    let count;
    
    if (range.range === 'Under R100') {
      // For "Under R100", we want strictly less than 100
      count = filteredListings.filter(
        (listing: Listing) => 
          listing.price !== null && 
          listing.price !== undefined &&
          listing.price >= range.min && 
          listing.price < 100
      ).length;
    } else {
      count = filteredListings.filter(
        (listing: Listing) => 
          listing.price !== null && 
          listing.price !== undefined &&
          listing.price >= range.min && 
          listing.price <= range.max
      ).length;
    }
    
    return { ...range, count };
  });
}

/**
 * Get date ranges with their counts, optionally filtered by other criteria
 */
export function getDateRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the date range to avoid filtering by the same date range
  const { dateRange, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const now = new Date();
  const dateRanges = [
    { range: 'Today', days: 1 },
    { range: 'Past 3 Days', days: 3 },
    { range: 'Past Week', days: 7 },
    { range: 'Past Month', days: 30 },
    { range: 'Past 3 Months', days: 90 },
  ];
  
  // Count listings in each date range
  return dateRanges.map(range => {
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - range.days);
    
    const count = filteredListings.filter(
      (listing: Listing) => new Date(listing.date) >= cutoffDate
    ).length;
    
    return { ...range, count };
  });
}

/**
 * Get conditions with their counts, optionally filtered by other criteria
 */
export function getConditionsWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the condition to avoid filtering by the same condition
  const { condition, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const conditionCounts = countBy(filteredListings, 'condition', true);
  
  return Object.entries(conditionCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(condition => condition.name !== 'null' && condition.name !== 'undefined')
    .sort((a, b) => b.count - a.count);
}

/**
 * Get sizes with their counts, optionally filtered by other criteria
 */
export function getSizesWithCounts(filters: FilterCriteria = {}) {
  // Create a new filter object without the size to avoid filtering by the same size
  const { size, ...otherFilters } = filters;
  
  // Get filtered listings based on other criteria
  const filteredListings = filterListings(otherFilters);
  
  const sizeCounts = countBy(filteredListings, 'size', true);
  
  return Object.entries(sizeCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(size => size.name !== 'null' && size.name !== 'undefined')
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all filter options with their counts, optionally filtered by current criteria
 */
export function getAllFilterOptions(filters: FilterCriteria = {}) {
  return {
    categories: getCategoriesWithCounts(filters),
    locations: getLocationsWithCounts(filters),
    priceRanges: getPriceRangesWithCounts(filters),
    dateRanges: getDateRangesWithCounts(filters),
    conditions: getConditionsWithCounts(filters),
    sizes: getSizesWithCounts(filters),
  };
} 