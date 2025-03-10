import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FilterCriteria } from '@/utils/filterUtils';

interface FilterSidebarProps {
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  priceRanges: { min: number; max: number; label: string }[];
  dateRanges: { value: string; label: string }[];
  selectedCategory?: string;
  selectedLocation?: string;
  selectedPriceRange?: { min: number; max: number };
  selectedDateRange?: string;
  onFilterChange?: (filterCriteria: FilterCriteria) => void;
  onClearFilter?: (filterType: keyof FilterCriteria) => void;
  isLoading?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  locations,
  priceRanges,
  dateRanges,
  selectedCategory,
  selectedLocation,
  selectedPriceRange,
  selectedDateRange,
  onFilterChange,
  onClearFilter,
  isLoading = false,
}) => {
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleCategoryChange = (category: string) => {
    if (onFilterChange) {
      // Client-side filtering
      onFilterChange({
        ...buildCurrentFilterCriteria(),
        category,
      });
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          category,
          page: 1, // Reset to first page when changing filters
        },
      });
    }
  };

  const handleLocationChange = (location: string) => {
    if (onFilterChange) {
      // Client-side filtering
      onFilterChange({
        ...buildCurrentFilterCriteria(),
        location: location || undefined,
      });
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          location: location || undefined,
          page: 1,
        },
      });
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    if (onFilterChange) {
      // Client-side filtering
      onFilterChange({
        ...buildCurrentFilterCriteria(),
        minPrice: min,
        maxPrice: max,
      });
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          minPrice: min,
          maxPrice: max,
          page: 1,
        },
      });
    }
  };

  const handleDateRangeChange = (dateRange: string) => {
    if (onFilterChange) {
      // Client-side filtering
      onFilterChange({
        ...buildCurrentFilterCriteria(),
        dateRange: parseInt(dateRange, 10),
      });
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          dateRange,
          page: 1,
        },
      });
    }
  };

  const clearFilters = () => {
    if (onFilterChange) {
      // Client-side filtering
      onFilterChange({});
    } else {
      // Server-side filtering (fallback)
      router.push({
        pathname: router.pathname,
      });
    }
  };

  // Helper to build current filter criteria
  const buildCurrentFilterCriteria = (): FilterCriteria => {
    const criteria: FilterCriteria = {};
    
    if (selectedCategory) {
      criteria.category = selectedCategory;
    }
    
    if (selectedLocation) {
      criteria.location = selectedLocation;
    }
    
    if (selectedPriceRange) {
      criteria.minPrice = selectedPriceRange.min;
      criteria.maxPrice = selectedPriceRange.max;
    }
    
    if (selectedDateRange) {
      criteria.dateRange = parseInt(selectedDateRange, 10);
    }
    
    return criteria;
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Categories</h3>
          {selectedCategory && onClearFilter && (
            <button 
              onClick={() => onClearFilter('category')}
              className="text-xs text-primary-600 hover:text-primary-800"
              aria-label="Clear category filter"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center">
              <input
                type="radio"
                id={`category-${category.name}`}
                name="category"
                className="mr-2"
                checked={selectedCategory === category.name}
                onChange={() => handleCategoryChange(category.name)}
                disabled={isLoading || category.count === 0}
              />
              <label 
                htmlFor={`category-${category.name}`} 
                className={`flex-1 cursor-pointer ${category.count === 0 ? 'text-secondary-400' : ''}`}
              >
                {category.name}
                <span className="ml-1 text-secondary-500 text-sm">({category.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Price Range</h3>
          {selectedPriceRange && onClearFilter && (
            <button 
              onClick={() => onClearFilter('minPrice')}
              className="text-xs text-primary-600 hover:text-primary-800"
              aria-label="Clear price filter"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.label} className="flex items-center">
              <input
                type="radio"
                id={`price-${range.min}-${range.max}`}
                name="price"
                className="mr-2"
                checked={
                  selectedPriceRange?.min === range.min &&
                  selectedPriceRange?.max === range.max
                }
                onChange={() => handlePriceRangeChange(range.min, range.max)}
                disabled={isLoading || range.label.includes('(0)')}
              />
              <label 
                htmlFor={`price-${range.min}-${range.max}`} 
                className={`cursor-pointer ${range.label.includes('(0)') ? 'text-secondary-400' : ''}`}
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Date Listed</h3>
          {selectedDateRange && onClearFilter && (
            <button 
              onClick={() => onClearFilter('dateRange')}
              className="text-xs text-primary-600 hover:text-primary-800"
              aria-label="Clear date filter"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {dateRanges.map((range) => (
            <div key={range.value} className="flex items-center">
              <input
                type="radio"
                id={`date-${range.value}`}
                name="date"
                className="mr-2"
                checked={selectedDateRange === range.value}
                onChange={() => handleDateRangeChange(range.value)}
                disabled={isLoading || range.label.includes('(0)')}
              />
              <label 
                htmlFor={`date-${range.value}`} 
                className={`cursor-pointer ${range.label.includes('(0)') ? 'text-secondary-400' : ''}`}
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Location</h3>
          {selectedLocation && onClearFilter && (
            <button 
              onClick={() => onClearFilter('location')}
              className="text-xs text-primary-600 hover:text-primary-800"
              aria-label="Clear location filter"
            >
              Clear
            </button>
          )}
        </div>
        <select
          className="w-full p-2 border border-secondary-200 rounded-md"
          value={selectedLocation || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option 
              key={location.name} 
              value={location.name}
              disabled={location.count === 0}
            >
              {location.name} ({location.count})
            </option>
          ))}
        </select>
      </div>

      {(selectedCategory || selectedLocation || selectedPriceRange || selectedDateRange) && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
          disabled={isLoading}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 pr-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          filterContent
        )}
      </div>

      {/* Mobile filter button and modal */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full mb-4 py-2 bg-primary-500 text-white rounded-md flex items-center justify-center"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {(selectedCategory || selectedLocation || selectedPriceRange || selectedDateRange) && (
            <span className="ml-2 bg-white text-primary-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {[
                selectedCategory ? 1 : 0,
                selectedLocation ? 1 : 0,
                selectedPriceRange ? 1 : 0,
                selectedDateRange ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-secondary-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-secondary-500 hover:text-secondary-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                filterContent
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 py-2 bg-primary-500 text-white rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterSidebar; 