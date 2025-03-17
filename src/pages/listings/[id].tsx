import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAllListings, getListingById, Listing } from '@/utils/listingUtils';
import { getFormattedImageUrl } from '@/utils/imageUtils';

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
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  
  // Use the database category value instead of determining from text
  const category = listing.category || 'Other';

  // Use the title field directly - no fallback to ensure titles are always required
  const displayTitle = listing.title;

  if (!listing) {
    return (
      <Layout title="Listing Not Found">
        <div className="container py-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p>The listing you're looking for doesn't exist or has been removed.</p>
            <Link href="/listings" className="mt-4 inline-block text-primary-600 hover:underline">
              Browse all listings
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formattedDate = listing.date; // TOOD make human readable
  
  const getImageSrc = (imagePath: string) => {
    if (imagePath) {
      return getFormattedImageUrl(imagePath);
    }
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
  };

  const handleAdditionalImageError = (index: number) => {
    setAdditionalImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Generate related item titles using the title field
  const getRelatedItemTitle = (item: Listing): string => {
    return item.title;
  };

  return (
    <Layout title={`${listing.title} - Nifty Thrifty`}>
      <div className="container py-8">
        <div className="mb-4">
          <Link href="/listings" className="text-primary-600 hover:underline flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to listings
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                {listing.images && listing.images.length > 0 && !mainImageError ? (
                  <div className="relative h-96 w-full">
                    <Image 
                      src={getImageSrc(listing.images[0])} 
                      alt={displayTitle}
                      fill
                      className="object-contain"
                      onError={() => setMainImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-96 bg-secondary-100 flex items-center justify-center">
                    <div className="text-center">
                      <i className={`${getCategoryIcon(category)} text-6xl mb-4`} style={{ color: getCategoryColor(category) }}></i>
                      <p className="text-secondary-400">No image available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {listing.images.slice(1).map((image, index) => (
                    !additionalImageErrors[index] && (
                      <div key={index} className="relative h-24 bg-white rounded-md overflow-hidden shadow-sm">
                        <Image 
                          src={getImageSrc(image)} 
                          alt={`${displayTitle} - image ${index + 2}`}
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
            
            {/* Listing Details */}
            <div>
              <h1 className="text-2xl font-bold mb-4">{displayTitle}</h1>
              
              {listing.price && (
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  R{listing.price}
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <i className={`${getCategoryIcon(category)} mr-2`} style={{ color: getCategoryColor(category) }}></i>
                  <span>{category}</span>
                </div>
                
                {listing.collectionAreas && listing.collectionAreas.length > 0 && (
                  <div className="flex items-center">
                    <i className="fa-solid fa-location-dot mr-2"></i>
                    <span>{listing.collectionAreas.join(', ')}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <i className="fa-solid fa-calendar mr-2"></i>
                  <span>{formattedDate}</span>
                </div>
                
                {listing.condition && (
                  <div className="flex items-center">
                    <i className="fa-solid fa-tag mr-2"></i>
                    <span>Condition: <span className="font-medium">{listing.condition}</span></span>
                  </div>
                )}

                {listing.whatsappGroup && (
                  <div className="flex items-center">
                    <i className="fab fa-whatsapp mr-2 text-green-600"></i>
                    <span>Group: <span className="font-medium">{listing.whatsappGroup}</span></span>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <div className="bg-secondary-50 p-4 rounded-md whitespace-pre-line">
                  {listing.text || `No description available for this ${listing.category || 'item'}.`}
                </div>
              </div>
              
              <div className="space-y-3">
                <a 
                  href={`https://wa.me/?text=I'm interested in your listing: ${displayTitle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full flex justify-center items-center"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  Contact Seller
                </a>
                
                <Link 
                  href={`/listings?category=${encodeURIComponent(category)}`}
                  className="btn btn-secondary w-full flex justify-center items-center"
                >
                  <i className="fa-solid fa-tag mr-2"></i>
                  More {category} Items
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedListings.map((item) => {
                const relatedItemTitle = getRelatedItemTitle(item);
                const relatedItemCategory = item.category || 'Other';
                
                return (
                  <Link 
                    key={item.id} 
                    href={`/listings/${item.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative pt-[75%]">
                      {item.images && item.images.length > 0 ? (
                        <Image 
                          src={getImageSrc(item.images[0])} 
                          alt={relatedItemTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
                          <i 
                            className={`${getCategoryIcon(relatedItemCategory)} text-4xl`} 
                            style={{ color: getCategoryColor(relatedItemCategory) }}
                          ></i>
                        </div>
                      )}
                      
                      {item.price && (
                        <div className="absolute bottom-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-bold">
                          R{item.price}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">{relatedItemTitle}</h3>
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
  try {
    const listings = await getAllListings();
    
    const paths = listings.map((listing) => ({
      params: { id: listing.id },
    }));
    
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const id = params?.id as string;
    const listing = await getListingById(id);
    
    if (!listing) {
      return {
        notFound: true,
      };
    }
    
    // Get related listings (same category or similar price)
    const allListings = await getAllListings();
    
    // Find related listings with the same category or similar price
    const relatedListings = allListings
      .filter(item => 
        item.id !== listing.id && 
        (
          (item.category && item.category.toLowerCase() === listing.category?.toLowerCase()) ||
          (listing.price && item.price && 
           item.price >= listing.price * 0.7 && 
           item.price <= listing.price * 1.3)
        )
      )
      .slice(0, 6);
    
    return {
      props: {
        listing,
        relatedListings,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching listing details:', error);
    return {
      notFound: true,
    };
  }
}; 