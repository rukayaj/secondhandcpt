import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getLocationsWithCounts } from '@/utils/filterUtils';

interface LocationsPageProps {
  locations: {
    name: string;
    count: number;
  }[];
}

export default function LocationsPage({ locations }: LocationsPageProps) {
  return (
    <Layout title="Locations - Nifty Thrifty">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Locations</h1>
          <p className="text-secondary-600">
            Browse items by location to find items near you in Cape Town.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-secondary-200">
            {locations.map((location, index) => (
              <Link
                key={location.name}
                href={`/listings?location=${encodeURIComponent(location.name)}&page=1`}
                className={`p-6 hover:bg-secondary-50 transition-colors ${
                  index % 3 === 0 ? 'md:border-t md:border-secondary-200' : ''
                }`}
              >
                <h2 className="font-semibold text-lg mb-1">{location.name}</h2>
                <p className="text-secondary-600">
                  {location.count} {location.count === 1 ? 'item' : 'items'}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">About Cape Town Areas</h2>
          <p className="text-secondary-700 mb-4">
            Cape Town is divided into several distinct areas, each with its own character and charm.
            From the bustling City Bowl to the scenic Southern Suburbs and the beautiful Atlantic Seaboard,
            finding items in your area makes pickup easier and more convenient.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">City Bowl & Atlantic Seaboard</h3>
              <p className="text-sm text-secondary-600">
                Includes CBD, Gardens, Sea Point, Green Point, Camps Bay, and surrounding areas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Southern Suburbs</h3>
              <p className="text-sm text-secondary-600">
                Includes Rondebosch, Claremont, Newlands, Kenilworth, and surrounding areas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Northern Suburbs</h3>
              <p className="text-sm text-secondary-600">
                Includes Bellville, Durbanville, Brackenfell, and surrounding areas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Southern Peninsula</h3>
              <p className="text-sm text-secondary-600">
                Includes Fish Hoek, Kommetjie, Simon's Town, and surrounding areas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">West Coast</h3>
              <p className="text-sm text-secondary-600">
                Includes Bloubergstrand, Table View, Milnerton, and surrounding areas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Cape Flats</h3>
              <p className="text-sm text-secondary-600">
                Includes Athlone, Mitchell's Plain, Grassy Park, and surrounding areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  // Get locations with counts directly from the utility function
  const locations = getLocationsWithCounts();
  
  // Sort by count (highest first), then alphabetically
  locations.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });
  
  return {
    props: {
      locations,
    },
    revalidate: 3600, // Revalidate every hour
  };
} 