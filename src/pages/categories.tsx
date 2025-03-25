import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { getCategoriesWithCounts } from '@/utils/filterUtils';

interface CategoryPageProps {
  categories: {
    name: string;
    count: number;
  }[];
}

export default function CategoriesPage({ categories }: CategoryPageProps) {
  return (
    <Layout title="Categories - Nifty Thrifty">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Categories</h1>
          <p className="text-secondary-600">
            Browse items by category to find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/listings?category=${encodeURIComponent(category.name)}&page=1`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 w-full bg-secondary-100 flex items-center justify-center">
                <i className={`${getCategoryIcon(category.name)} text-6xl`} style={{ color: getCategoryColor(category.name) }}></i>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-1">{category.name}</h2>
                <p className="text-secondary-600">
                  {category.count} {category.count === 1 ? 'item' : 'items'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

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

export async function getStaticProps() {
  try {
    const categories = await getCategoriesWithCounts();
    
    // Sort categories by count (most items first)
    categories.sort((a, b) => b.count - a.count);
    
    return {
      props: {
        categories,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      props: {
        categories: [],
      },
      revalidate: 3600,
    };
  }
} 