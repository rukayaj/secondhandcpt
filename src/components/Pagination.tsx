import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
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
    return {
      pathname: router.pathname,
      query: { ...router.query, page },
    };
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-1">
        {/* Previous page button */}
        <Link
          href={getPageUrl(Math.max(1, currentPage - 1))}
          className={classNames(
            'px-3 py-2 rounded-md',
            currentPage === 1
              ? 'text-secondary-400 cursor-not-allowed'
              : 'text-secondary-700 hover:bg-secondary-100'
          )}
          aria-disabled={currentPage === 1}
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
        </Link>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-secondary-500">...</span>
            ) : (
              <Link
                href={getPageUrl(page as number)}
                className={classNames(
                  'px-3 py-2 rounded-md',
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-700 hover:bg-secondary-100'
                )}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Link>
            )}
          </React.Fragment>
        ))}

        {/* Next page button */}
        <Link
          href={getPageUrl(Math.min(totalPages, currentPage + 1))}
          className={classNames(
            'px-3 py-2 rounded-md',
            currentPage === totalPages
              ? 'text-secondary-400 cursor-not-allowed'
              : 'text-secondary-700 hover:bg-secondary-100'
          )}
          aria-disabled={currentPage === totalPages}
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
        </Link>
      </nav>
    </div>
  );
};

export default Pagination; 