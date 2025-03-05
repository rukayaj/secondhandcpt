import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface FilterSidebarProps {
  categories: { name: string; count: number }[];
  locations: string[];
  priceRanges: { min: number; max: number; label: string }[];
  dateRanges: { value: string; label: string }[];
  selectedCategory?: string;
  selectedLocation?: string;
  selectedPriceRange?: { min: number; max: number };
  selectedDateRange?: string;
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
}) => {
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleCategoryChange = (category: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        category,
        page: 1, // Reset to first page when changing filters
      },
    });
  };

  const handleLocationChange = (location: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        location,
        page: 1,
      },
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        minPrice: min,
        maxPrice: max,
        page: 1,
      },
    });
  };

  const handleDateRangeChange = (dateRange: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        dateRange,
        page: 1,
      },
    });
  };

  const clearFilters = () => {
    router.push({
      pathname: router.pathname,
    });
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
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
              />
              <label htmlFor={`category-${category.name}`} className="flex-1 cursor-pointer">
                {category.name}
                <span className="ml-1 text-secondary-500 text-sm">({category.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.label} className="flex items-center">
              <input
                type="radio"
                id={`price-${range.label}`}
                name="price"
                className="mr-2"
                checked={
                  selectedPriceRange?.min === range.min &&
                  selectedPriceRange?.max === range.max
                }
                onChange={() => handlePriceRangeChange(range.min, range.max)}
              />
              <label htmlFor={`price-${range.label}`} className="cursor-pointer">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Date Listed</h3>
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
              />
              <label htmlFor={`date-${range.value}`} className="cursor-pointer">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Location</h3>
        <select
          className="w-full p-2 border border-secondary-200 rounded-md"
          value={selectedLocation || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {(selectedCategory || selectedLocation || selectedPriceRange || selectedDateRange) && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
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
        {filterContent}
      </div>

      {/* Mobile filter button and modal */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full mb-4 py-2 bg-primary-500 text-white rounded-md flex items-center justify-center"
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
              {filterContent}
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