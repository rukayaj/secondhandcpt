import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FilterCriteria } from '@/utils/filterUtils';
import LoadingSpinner from './LoadingSpinner';

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
  onClearAll?: () => void;
  isLoading?: boolean;
  className?: string;
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
  onClearAll,
  isLoading = false,
  className = '',
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
    if (onClearAll) {
      // Use provided clear all handler
      onClearAll();
    } else if (onFilterChange) {
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
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-primary-600">Updating filters...</span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Categories</h3>
          {selectedCategory && onClearFilter && (
            <button 
              onClick={() => onClearFilter('category')}
              className="text-xs text-primary-600 hover:text-primary-800"
              aria-label="Clear category filter"
              disabled={isLoading}
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
                className={`flex-1 cursor-pointer ${category.count === 0 ? 'text-secondary-400' : ''} ${isLoading ? 'opacity-70' : ''}`}
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

      <div className="mt-8">
        <button
          onClick={clearFilters}
          className="w-full py-2 px-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Clearing...' : 'Clear All Filters'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filters toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full px-4 py-2 bg-secondary-50 rounded-md border border-secondary-200"
        >
          <span className="font-medium">Filters</span>
          <span>
            <i className={`fas fa-${showMobileFilters ? 'chevron-up' : 'chevron-down'}`}></i>
          </span>
        </button>
      </div>

      {/* Filter sidebar */}
      <div 
        className={`${className} bg-white rounded-md p-4 border border-secondary-200 ${
          showMobileFilters ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>

        {filterContent}
      </div>
    </>
  );
};

export default FilterSidebar; 