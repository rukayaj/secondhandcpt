import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  query?: Record<string, any>;
  onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages,
  basePath,
  query = {},
  onPageChange
}) => {
  const router = useRouter();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Create URL for a specific page
  const getPageUrl = (page: number) => {
    // If basePath is provided, use it, otherwise use router.pathname
    const pathname = basePath || router.pathname;
    
    // If query is provided, use it with the page parameter, otherwise use router.query
    const queryParams = query 
      ? { ...query, page } 
      : { ...router.query, page };
    
    return {
      pathname,
      query: queryParams,
    };
  };

  // Handle page change
  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onPageChange) {
      // Use callback if provided
      onPageChange(page);
    } else {
      // Otherwise use router navigation
      router.push(getPageUrl(page));
    }
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-1">
        {/* Previous page button */}
        <a
          href="#"
          className={classNames(
            'px-3 py-2 rounded-md',
            currentPage === 1
              ? 'text-secondary-400 cursor-not-allowed'
              : 'text-secondary-700 hover:bg-secondary-100'
          )}
          aria-disabled={currentPage === 1}
          onClick={(e) => currentPage > 1 && handlePageChange(currentPage - 1, e)}
        >
          <span className="sr-only">Previous</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </a>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-secondary-500">...</span>
            ) : (
              <a
                href="#"
                className={classNames(
                  'px-3 py-2 rounded-md',
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-700 hover:bg-secondary-100'
                )}
                aria-current={currentPage === page ? 'page' : undefined}
                onClick={(e) => currentPage !== page && handlePageChange(page as number, e)}
              >
                {page}
              </a>
            )}
          </React.Fragment>
        ))}

        {/* Next page button */}
        <a
          href="#"
          className={classNames(
            'px-3 py-2 rounded-md',
            currentPage === totalPages
              ? 'text-secondary-400 cursor-not-allowed'
              : 'text-secondary-700 hover:bg-secondary-100'
          )}
          aria-disabled={currentPage === totalPages}
          onClick={(e) => currentPage < totalPages && handlePageChange(currentPage + 1, e)}
        >
          <span className="sr-only">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </nav>
    </div>
  );
};

export default Pagination; 