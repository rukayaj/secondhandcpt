import { Listing, getAllListings, getISOPosts } from './listingUtils';


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
  sizes?: string[]; // Change from size to sizes array
  includeISO?: boolean; // New flag to control inclusion of ISO posts
}

/**
 * Filter listings based on multiple criteria
 */
export async function filterListings(filters: FilterCriteria = {}): Promise<Listing[]> {
  // Always fetch fresh listings from the database
  const listings = await getAllListings();
  let filteredListings = [...listings];
  
  // Filter out ISO posts by default unless explicitly included
  if (filters.includeISO !== true) {
    filteredListings = filteredListings.filter(listing => !listing.isISO);
  }
  
  // Filter by category
  if (filters.category) {
    filteredListings = filteredListings.filter(listing => 
      listing.category === filters.category
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
        listing => listing.price !== null && listing.price <= 100
      );
    } else {
      filteredListings = filteredListings.filter(
        listing => listing.price !== null && 
                  listing.price >= filters.minPrice! && 
                  listing.price <= filters.maxPrice!
      );
    }
  }
  
  // Filter by condition
  if (filters.condition) {
    filteredListings = filteredListings.filter(
      listing => listing.condition === filters.condition
    );
  }
  
  // Filter by date range (in days)
  if (filters.dateRange) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (filters.dateRange * 24 * 60 * 60 * 1000));
    filteredListings = filteredListings.filter(listing => {
      const listingDate = new Date(listing.dateAdded);
      return listingDate >= cutoff;
    });
  }
  
  // Filter by sizes
  if (filters.sizes && filters.sizes.length > 0) {
    filteredListings = filteredListings.filter(listing => {
      // If the listing has sizes array, check if any of the sizes match the filter
      if (listing.sizes && listing.sizes.length > 0) {
        return filters.sizes!.some(size => 
          listing.sizes!.some(listingSize => 
            listingSize.toLowerCase().includes(size.toLowerCase())
          )
        );
      }
      // Otherwise, try to find size mentions in the text
      return filters.sizes!.some(size => 
        listing.text && listing.text.toLowerCase().includes(size.toLowerCase())
      );
    });
  }
  
  return filteredListings;
}

/**
 * Get ISO posts with filtering
 * This function works specifically with ISO posts and applies the same filtering options
 */
export async function filterISOPosts(filters: FilterCriteria = {}): Promise<Listing[]> {
  // Get ISO posts (which uses the database is_iso field)
  const isoPosts = await getISOPosts();
  let filteredPosts = [...isoPosts];
  
  // Apply the same filters but skip the ISO check since we know these are all ISO
  
  // Filter by category
  if (filters.category) {
    filteredPosts = filteredPosts.filter(post => 
      post.category === filters.category
    );
  }
  
  // Filter by location
  if (filters.location) {
    filteredPosts = filteredPosts.filter(
      post => post.collectionAreas.some(area => 
        area.toLowerCase().includes(filters.location!.toLowerCase())
      )
    );
  }
  
  // Filter by date range (in days)
  if (filters.dateRange) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
    
    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.date);
      return postDate >= cutoffDate;
    });
  }
  
  return filteredPosts;
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
  try {
    // Get all defined categories from categoryUtils for consistent ordering
    const definedCategories = getAllCategories();
    const categoryNames = Object.keys(definedCategories);
    
    // Create a copy of filters without the category
    const { category, ...otherFilters } = filters;
    
    // Ensure includeISO is set to false by default to exclude ISO posts from counts
    // This makes the counts match what's displayed on the listings page
    const filtersWithoutISO = {
      ...otherFilters,
      includeISO: filters.includeISO === true
    };
    
    // If we have other filters, we need to filter listings first
    if (Object.keys(otherFilters).length > 0) {
      // Use the filters that exclude ISO posts
      const filteredListings = await filterListings(filtersWithoutISO);
      
      // Count occurrences of each category
      const categoryCounts: Record<string, number> = {};
      
      // Initialize with zero counts for all defined categories
      for (const cat of categoryNames) {
        categoryCounts[cat] = 0;
      }
      
      // Count category occurrences in the filtered listings
      for (const listing of filteredListings) {
        const cat = listing.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
      
      // Convert to required format with proper ordering
      return categoryNames
        .map(name => ({ name, count: categoryCounts[name] || 0 }))
        .filter(item => item.name !== 'Other' || item.count > 0) // Only include Other if it has counts
        .sort((a, b) => {
          // Sort by predefined order, with Other at the end
          if (a.name === 'Other') return 1;
          if (b.name === 'Other') return -1;
          return b.count - a.count; // Then by count
        });
    } else {
      // No other filters, we can use the database function directly
      // Import the supabase client directly to avoid circular dependencies
      const { supabase } = await import('./supabase');
      
      try {
        // Try to use the RPC function first, but modify query to exclude ISO posts
        // NOTE: If your RPC function doesn't have a parameter for excluding ISO posts,
        // you'll need to use the fallback method below
        const { data, error } = await supabase.rpc('get_category_counts');
        
        if (!error && data) {
          // We need to filter the results manually to exclude ISO posts
          // Get all non-ISO listings to calculate correct counts
          const { data: nonIsoListings, error: listingsError } = await supabase
            .from('listings')
            .select('category')
            .eq('is_iso', false);
            
          if (listingsError) {
            console.error('Error fetching non-ISO listings:', listingsError);
            // Continue with potentially incorrect counts from RPC
          } else {
            // Count occurrences of each category in non-ISO listings
            const manualCategoryCounts: Record<string, number> = {};
            for (const listing of nonIsoListings) {
              const cat = listing.category || 'Other';
              manualCategoryCounts[cat] = (manualCategoryCounts[cat] || 0) + 1;
            }
            
            // Process the results to match our defined categories
            return categoryNames
              .map(name => ({ name, count: manualCategoryCounts[name] || 0 }))
              .filter(item => item.name !== 'Other' || (manualCategoryCounts[item.name] && manualCategoryCounts[item.name] > 0))
              .sort((a, b) => {
                // Sort by predefined order, with Other at the end
                if (a.name === 'Other') return 1;
                if (b.name === 'Other') return -1;
                return b.count - a.count; // Then by count
              });
          }
          
          // Process the results to match our defined categories (if we didn't do the manual count above)
          const dbCategories = data.reduce((acc: Record<string, number>, { name, count }: { name: string; count: number }) => {
            acc[name] = count;
            return acc;
          }, {} as Record<string, number>);
          
          // Build the result with our defined categories
          return categoryNames
            .map(name => ({ name, count: dbCategories[name] || 0 }))
            .filter(item => item.name !== 'Other' || (dbCategories[item.name] && dbCategories[item.name] > 0))
            .sort((a, b) => {
              // Sort by predefined order, with Other at the end
              if (a.name === 'Other') return 1;
              if (b.name === 'Other') return -1;
              return b.count - a.count; // Then by count
            });
        }
        
        // If RPC fails (function doesn't exist), fallback to manual count
        console.log('Could not use get_category_counts function, falling back to query...');
      } catch (err) {
        console.warn('Error using get_category_counts function:', err);
      }
      
      // Fallback: Query the database and count categories manually, excluding ISO posts
      const { data: result, error } = await supabase
        .from('listings')
        .select('category')
        .eq('is_iso', false); // Only include non-ISO posts
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      
      // Count occurrences of each category
      const categoryCounts: Record<string, number> = {};
      
      // Initialize with zero counts for all defined categories
      for (const cat of categoryNames) {
        categoryCounts[cat] = 0;
      }
      
      // Count non-ISO listings by category
      for (const listing of result) {
        const category = listing.category || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
      
      // Convert to required format and sort
      return categoryNames
        .map(name => ({ name, count: categoryCounts[name] || 0 }))
        .filter(item => item.count > 0 || (item.name !== 'Other'))
        .sort((a, b) => {
          // Sort by predefined order, with Other at the end
          if (a.name === 'Other') return 1;
          if (b.name === 'Other') return -1;
          return b.count - a.count; // Then by count
        });
    }
  } catch (error) {
    console.error('Error in getCategoriesWithCounts:', error);
    return [];
  }
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
  // Create a copy of filters without the sizes
  const { sizes, ...otherFilters } = filters;
  const filteredListings = await filterListings(otherFilters);
  
  // Define common sizes to look for
  const commonSizes = [
    // Clothing sizes
    'Newborn', '0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m',
    '2-3y', '3-4y', '4-5y', '5-6y',
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    // Numeric sizes (could be clothing or shoe sizes)
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    // EU shoe sizes
    '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'
  ];
  
  const sizeObjects = commonSizes.map(sizeName => {
    // Count listings with this size in the sizes array or in the text
    const count = filteredListings.filter(listing => {
      // Check in the sizes array first
      if (listing.sizes && listing.sizes.length > 0) {
        return listing.sizes.some(s => 
          s.toLowerCase().includes(sizeName.toLowerCase()) ||
          sizeName.toLowerCase().includes(s.toLowerCase())
        );
      }
      // Fallback to text search
      return listing.text && listing.text.toLowerCase().includes(sizeName.toLowerCase());
    }).length;
    
    return { name: sizeName, count };
  });
  
  // Only return sizes that have at least one listing
  return sizeObjects.filter(item => item.count > 0);
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