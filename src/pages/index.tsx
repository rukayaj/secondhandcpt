import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ListingCard from '@/components/ListingCard';
import { getAllListings, getCategoriesWithCounts, getISOPosts, Listing } from '@/utils/parser';
import { GetStaticProps } from 'next';

// Helper function to get the appropriate FontAwesome icon for each category
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Clothing': 'fa-solid fa-shirt',
    'Toys': 'fa-solid fa-gamepad',
    'Furniture': 'fa-solid fa-couch',
    'Footwear': 'fa-solid fa-shoe-prints',
    'Gear': 'fa-solid fa-baby-carriage',
    'Feeding': 'fa-solid fa-spoon',
    'Accessories': 'fa-solid fa-hat-cowboy',
    'Swimming': 'fa-solid fa-water-ladder',
    'Bedding': 'fa-solid fa-bed',
    'Diapers': 'fa-solid fa-toilet-paper',
    'Books': 'fa-solid fa-book',
    'Other': 'fa-solid fa-box-open'
  };
  
  return iconMap[categoryName] || 'fa-solid fa-box';
}

// Helper function to get a color for each category
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Clothing': '#4F46E5', // indigo
    'Toys': '#F59E0B',     // amber
    'Furniture': '#10B981', // emerald
    'Footwear': '#EC4899',  // pink
    'Gear': '#6366F1',     // indigo
    'Feeding': '#EF4444',  // red
    'Accessories': '#8B5CF6', // purple
    'Swimming': '#0EA5E9', // sky blue
    'Bedding': '#14B8A6',  // teal
    'Diapers': '#F97316',  // orange
    'Books': '#8B5CF6',    // purple
    'Other': '#6B7280'     // gray
  };
  
  return colorMap[categoryName] || '#6B7280'; // gray as default
}

interface HomePageProps {
  featuredListings: Listing[];
  recentISO: Listing[];
  categories: { name: string; count: number }[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  // Fetch data from Supabase
  const allListings = await getAllListings();
  const isoListings = await getISOPosts();
  const categoriesWithCounts = await getCategoriesWithCounts();
  
  // Get featured listings (most recent non-ISO listings)
  const featuredListings = allListings
    .filter(listing => !listing.isISO)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);
  
  // Get recent ISO posts
  const recentISO = isoListings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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