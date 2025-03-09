import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import Pagination from '../components/Pagination';
import { searchListings, type Listing } from '@/utils/parser';

interface SearchPageProps {
  listings: Listing[];
  totalListings: number;
  searchTerm: string;
}

const ITEMS_PER_PAGE = 16;

export default function SearchPage({ listings, totalListings, searchTerm }: SearchPageProps) {
  const router = useRouter();
  const { q, page = '1' } = router.query;
  
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);

  return (
    <Layout title={`Search Results for "${searchTerm}" - Nifty Thrifty`}>
      <div className="container">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <p className="text-secondary-600 mb-8">
          Showing results for "{searchTerm}"
        </p>

        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          <div className="bg-secondary-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-secondary-600 mb-4">
              We couldn't find any listings matching "{searchTerm}".
            </p>
            <p className="text-secondary-600 mb-4">
              Try using different keywords or browse all listings.
            </p>
            <button
              onClick={() => router.push('/listings')}
              className="btn btn-primary"
            >
              Browse All Listings
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }: { query: any }) {
  const { q, page = '1' } = query;
  const searchTerm = q ? (Array.isArray(q) ? q[0] : q) : '';
  const currentPage = parseInt(page, 10);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  
  // Search listings by search term using our improved implementation
  const filteredListings = searchListings(searchTerm);
  
  // Sort by date (newest first)
  filteredListings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get total count for pagination
  const totalListings = filteredListings.length;
  
  // Paginate results
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  return {
    props: {
      listings: paginatedListings,
      totalListings,
      searchTerm,
    },
  };
} 