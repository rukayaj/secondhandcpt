import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAllListings, getListingById, Listing } from '@/utils/parser';
import { formatDate, getConditionColor } from '@/utils/helpers';

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

interface ListingDetailProps {
  listing: Listing;
  relatedListings: Listing[];
}

export default function ListingDetail({ listing, relatedListings }: ListingDetailProps) {
  const [mainImageError, setMainImageError] = React.useState(false);
  const [additionalImageErrors, setAdditionalImageErrors] = React.useState<Record<number, boolean>>({});

  if (!listing) {
    return (
      <Layout title="Listing Not Found - Nifty Thrifty">
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Listing Not Found</h1>
          <p className="mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Link href="/listings" className="btn-primary">
            Browse All Listings
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = formatDate(listing.date);
  
  // Generate a clean title from the text if one isn't provided or if it's an image filename
  const displayTitle = (listing.title && !listing.title.startsWith('IMG-')) 
    ? listing.title 
    : ((listing.text.split('\n')
        .filter(line => !line.includes('(file attached)') && !line.startsWith('IMG-'))
        .join(' ')
        .substring(0, 60)) + (listing.text.length > 60 ? '...' : '')) 
    || ((listing.category || '') + (listing.size ? ` (${listing.size})` : '')) 
    || 'Listing';

  const handleAdditionalImageError = (index: number) => {
    setAdditionalImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  return (
    <Layout 
      title={`${displayTitle} - Nifty Thrifty`}
      description={`${displayTitle} - ${listing.price ? `R${listing.price}` : 'Price not specified'} - ${listing.location || 'Location not specified'}`}
    >
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/listings" className="text-primary-600 hover:text-primary-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {listing.images && listing.images.length > 0 && !mainImageError ? (
                <div className="relative h-96 w-full">
                  <Image 
                    src={listing.images[0]} 
                    alt={listing.title || 'Listing image'}
                    fill
                    className="object-contain"
                    onError={() => setMainImageError(true)}
                  />
                </div>
              ) : (
                <div className="h-96 bg-secondary-100 flex items-center justify-center">
                  <div className="text-center">
                    <i className={`${getCategoryIcon(listing.category || 'Other')} text-6xl mb-4`} style={{ color: getCategoryColor(listing.category || 'Other') }}></i>
                    <p className="text-secondary-400">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional images */}
            {listing.images && listing.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {listing.images.slice(1).map((image, index) => (
                  !additionalImageErrors[index] && (
                    <div key={index} className="relative h-24 bg-white rounded-md overflow-hidden shadow-sm">
                      <Image 
                        src={image} 
                        alt={`${listing.title} - image ${index + 2}`}
                        fill
                        className="object-cover"
                        onError={() => handleAdditionalImageError(index)}
                      />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-2">{displayTitle}</h1>
              <p className="text-3xl font-bold text-primary-600 mb-4">
                {listing.price && `R${listing.price}`}
              </p>
              
              <div className="mb-6">
                {listing.isISO && (
                  <span className="inline-block text-xs font-semibold mr-2 px-2.5 py-0.5 rounded shadow" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                    ISO
                  </span>
                )}
                {listing.condition && (
                  <span 
                    className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded shadow"
                    style={getConditionColor(listing.condition)}
                  >
                    {listing.condition}
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {listing.category && (
                  <div className="flex">
                    <span className="text-secondary-500 w-24">Category:</span>
                    <span className="font-medium">{listing.category}</span>
                  </div>
                )}
                
                {listing.size && (
                  <div className="flex">
                    <span className="text-secondary-500 w-24">Size:</span>
                    <span className="font-medium">{listing.size}</span>
                  </div>
                )}
                
                {listing.location && (
                  <div className="flex">
                    <span className="text-secondary-500 w-24">Location:</span>
                    <span className="font-medium">{listing.location}</span>
                  </div>
                )}
                
                <div className="flex">
                  <span className="text-secondary-500 w-24">Posted:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
              </div>

              <div className="border-t border-secondary-200 pt-4 mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-secondary-700 whitespace-pre-line">{listing.text}</p>
              </div>

              <div className="space-y-3">
                <a 
                  href={`https://wa.me/?text=I'm interested in your listing: ${listing.title}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex justify-center items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  Contact Seller
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((item) => {
                // Generate a clean title for related items
                const relatedItemTitle = (item.title && !item.title.startsWith('IMG-'))
                  ? item.title
                  : item.text.split('\n')
                      .filter(line => !line.includes('(file attached)') && !line.startsWith('IMG-'))
                      .join(' ')
                      .substring(0, 60) + (item.text.length > 60 ? '...' : '')
                  || (item.category || '') + (item.size ? ` (${item.size})` : '')
                  || 'Listing';
                
                return (
                  <Link 
                    key={item.id} 
                    href={`/listings/${item.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 w-full bg-secondary-100">
                      {item.images && item.images.length > 0 ? (
                        <Image 
                          src={item.images[0]} 
                          alt={relatedItemTitle}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Replace with placeholder when image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(item.category || 'No Image')}`;
                            target.style.objectFit = 'contain';
                            // Mark as unoptimized to avoid Next.js image optimization
                            target.setAttribute('data-unoptimized', 'true');
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-secondary-400">No image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {relatedItemTitle}
                      </h3>
                      <p className="text-primary-600 font-bold">{item.price ? `R${item.price}` : ''}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const listings = getAllListings();
  
  const paths = listings.map((listing) => ({
    params: { id: listing.id.toString() },
  }));
  
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;
  const listing = getListingById(id);
  
  // If listing not found, return 404
  if (!listing) {
    return {
      notFound: true
    };
  }
  
  // Get related listings (same category, excluding current)
  const relatedListings: Listing[] = listing.category 
    ? getAllListings()
        .filter(item => item.id !== listing.id && item.category === listing.category)
        .slice(0, 4)
    : [];
  
  return {
    props: {
      listing,
      relatedListings
    },
    revalidate: 3600 // Revalidate every hour
  };
}; 