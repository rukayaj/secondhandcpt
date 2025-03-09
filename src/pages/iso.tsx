import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import Pagination from '@/components/Pagination';
import { getISOPosts, Listing } from '@/utils/listingUtils';
import { useRouter } from 'next/router';

interface ISOPageProps {
  isoPosts: Listing[];
  totalPosts: number;
}

const ITEMS_PER_PAGE = 16;

// Define date ranges
const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: '3days', label: 'Past 3 Days' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
];

export default function ISOPage({ isoPosts, totalPosts }: ISOPageProps) {
  const router = useRouter();
  const { page = '1', dateRange } = router.query;
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);

  const handleDateRangeChange = (value: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        dateRange: value,
        page: 1,
      },
    });
  };

  const clearDateFilter = () => {
    const { dateRange, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: restQuery,
    });
  };

  return (
    <Layout title="ISO Posts - Nifty Thrifty">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">ISO Posts</h1>
          <p className="text-secondary-600">
            Browse what people are looking for. These are "In Search Of" posts from the WhatsApp groups.
          </p>
        </div>

        {/* Date filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Filter by Date</h3>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                className={`px-3 py-1 rounded-full text-sm ${
                  dateRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
                onClick={() => handleDateRangeChange(range.value)}
              >
                {range.label}
              </button>
            ))}
            {dateRange && (
              <button
                className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
                onClick={clearDateFilter}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {isoPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isoPosts.map((post) => (
                <ListingCard key={post.id} listing={post} />
              ))}
            </div>
            
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          <div className="bg-secondary-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No ISO posts found</h2>
            <p className="text-secondary-600">
              {dateRange ? 'Try adjusting your date filter or check back later.' : 'Check back later for new ISO posts.'}
            </p>
            {dateRange && (
              <button
                onClick={clearDateFilter}
                className="mt-4 btn btn-primary"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }: { query: any }) {
  try {
    const { dateRange, page = '1' } = query;
    const currentPage = parseInt(page, 10);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    
    // Get all ISO posts
    const isoPosts = await getISOPosts();
    let allIsoPosts = [...isoPosts];
    
    // Filter by date range if specified
    if (dateRange) {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'day':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          // No date filter
          break;
      }
      
      allIsoPosts = allIsoPosts.filter(
        (post: Listing) => new Date(post.date) >= cutoffDate
      );
    }
    
    // Sort by date (newest first)
    allIsoPosts.sort((a: Listing, b: Listing) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get total count for pagination
    const totalPosts = allIsoPosts.length;
    
    // Paginate results
    const paginatedPosts = allIsoPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    return {
      props: {
        isoPosts: paginatedPosts,
        totalPosts,
      },
    };
  } catch (error) {
    console.error('Error fetching ISO posts:', error);
    return {
      props: {
        isoPosts: [],
        totalPosts: 0,
      },
    };
  }
} 