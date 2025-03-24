import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import { getListings, getISOListings } from '@/utils/listingService';
import { ListingRecord } from '@/utils/supabase';
import { getCategoriesWithCounts } from '@/utils/filterUtils';
import { GetStaticProps } from 'next';

// Helper function to get the appropriate FontAwesome icon for each category
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Clothing': 'fa-solid fa-shirt',
    'Maternity Clothing': 'fa-solid fa-person-pregnant',
    'Footwear': 'fa-solid fa-shoe-prints',
    'Toys': 'fa-solid fa-gamepad',
    'Furniture': 'fa-solid fa-couch',
    'Books': 'fa-solid fa-book',
    'Feeding': 'fa-solid fa-spoon',
    'Bath': 'fa-solid fa-bath',
    'Safety': 'fa-solid fa-shield-alt',
    'Sleep': 'fa-solid fa-bed',
    'Diapering': 'fa-solid fa-toilet-paper',
    'Health': 'fa-solid fa-kit-medical',
    'Outdoor & Swimming': 'fa-solid fa-water-ladder',
    'Transport & Carriers': 'fa-solid fa-baby-carriage',
    'Uncategorised': 'fa-solid fa-box-open'
  };
  
  return iconMap[categoryName] || 'fa-solid fa-box';
}

// Helper function to get a color for each category
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Clothing': '#4F46E5', // indigo
    'Maternity Clothing': '#D946EF', // fuchsia
    'Footwear': '#EC4899',  // pink
    'Toys': '#F59E0B',     // amber
    'Furniture': '#10B981', // emerald
    'Books': '#8B5CF6',    // purple
    'Feeding': '#EF4444',  // red
    'Bath': '#0EA5E9',     // sky blue
    'Safety': '#F97316',   // orange
    'Sleep': '#14B8A6',  // teal
    'Diapering': '#F97316', // orange
    'Health': '#10B981',   // emerald
    'Outdoor & Swimming': '#0EA5E9', // sky blue
    'Transport & Carriers': '#6366F1',     // indigo
    'Uncategorised': '#6B7280' // gray
  };
  
  return colorMap[categoryName] || '#6B7280'; // gray as default
}

interface HomePageProps {
  featuredListings: ListingRecord[];
  recentISO: ListingRecord[];
  categories: { name: string; count: number }[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  // Fetch data from Supabase
  const allListings = await getListings();
  const isoListings = await getISOListings();
  const categoriesWithCounts = await getCategoriesWithCounts();
  
  // Get featured listings (most recent non-ISO listings)
  const featuredListings = allListings
    .filter(listing => !listing.is_iso)
    .sort((a, b) => new Date(b.posted_on).getTime() - new Date(a.posted_on).getTime())
    .slice(0, 12);
  
  // Get recent ISO posts
  const recentISO = isoListings
    .sort((a, b) => new Date(b.posted_on).getTime() - new Date(a.posted_on).getTime())
    .slice(0, 6);
  
  return {
    props: {
      featuredListings,
      recentISO,
      categories: categoriesWithCounts
    },
    // Revalidate every hour
    revalidate: 3600
  };
};

export default function HomePage({ featuredListings, recentISO, categories }: HomePageProps) {
  return (
    <Layout>
      <div className="container">
        {/* Hero section */}
        <section className="mb-12">
          <div className="bg-primary-50 rounded-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
              Find Second-Hand Baby Items in Cape Town
            </h1>
            <p className="text-lg md:text-xl text-primary-700 mb-6">
              A better way to browse WhatsApp groups for baby items. Find what you need or sell what you don't.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listings" className="btn btn-primary">
                Browse All Items
              </Link>
              <Link href="/iso" className="btn btn-secondary">
                View ISO Posts
              </Link>
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link href="/categories" className="text-primary-600 hover:text-primary-700">
              View All Categories
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.name}
                href={`/listings?category=${encodeURIComponent(category.name)}&page=1`}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <i 
                    className={`${getCategoryIcon(category.name)} text-lg`} 
                    style={{ color: getCategoryColor(category.name) }}
                  ></i>
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <p className="text-sm text-secondary-500 mt-1">{category.count} items</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured listings section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Items</h2>
            <Link href="/listings" className="text-primary-600 hover:text-primary-700">
              View All Items
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        {/* Recent ISO section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent ISO Posts</h2>
            <Link href="/iso" className="text-primary-600 hover:text-primary-700">
              View All ISO Posts
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentISO.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}