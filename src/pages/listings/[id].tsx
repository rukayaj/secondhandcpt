import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getListings, getListingById } from '@/utils/listingService';
import { ListingRecord } from '@/utils/supabase';
import { getFormattedImageUrl } from '@/utils/imageUtils';
import { formatDate } from '@/utils/utils';

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

// Helper function to format group name
function formatGroupName(groupName: string): string {
  if (!groupName) return 'Unknown Group';
  
  // Replace only "Nifty Thrifty" with "NT", preserving the rest of the name
  return groupName.replace(/nifty\s*thrifty/i, "NT");
}

interface ListingDetailProps {
  listing: ListingRecord;
  relatedListings: ListingRecord[];
}

export default function ListingDetail({ listing, relatedListings }: ListingDetailProps) {
  const [mainImageError, setMainImageError] = React.useState(false);
  const [additionalImageErrors, setAdditionalImageErrors] = React.useState<Record<number, boolean>>({});
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  
  // Use the database category value instead of determining from text
  const category = listing.category || 'Uncategorised';

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

  const formattedDate = formatDate(listing.posted_on);
  
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
  const getRelatedItemTitle = (item: ListingRecord): string => {
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
                    {listing.is_sold && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white py-1 px-3 font-bold text-sm rounded-md shadow-md">
                        SOLD
                      </div>
                    )}
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
              <h1 className="text-2xl font-bold mb-4">
                {displayTitle}
                {listing.is_sold && (
                  <span className="ml-2 text-red-600 font-bold">(SOLD)</span>
                )}
              </h1>
              
              {listing.is_iso && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white bg-blue-500 text-sm font-semibold mb-4">
                  <i className="fa-solid fa-search"></i>
                  <span>In Search Of</span>
                </div>
              )}
              
              {listing.is_sold && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white bg-red-600 text-sm font-semibold mb-4">
                  <i className="fa-solid fa-ban"></i>
                  <span>SOLD</span>
                </div>
              )}
              
              {!listing.is_iso && listing.price && (
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  R{listing.price}
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <i className={`${getCategoryIcon(category)} mr-2`} style={{ color: getCategoryColor(category) }}></i>
                  <span>{category}</span>
                </div>
                
                {!listing.is_iso && listing.collection_areas && listing.collection_areas.length > 0 && (
                  <div className="flex items-center">
                    <i className="fa-solid fa-location-dot mr-2"></i>
                    <span>{listing.collection_areas.join(', ')}</span>
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

                {listing.whatsapp_group && (
                  <div className="flex items-center">
                    <i className="fab fa-whatsapp mr-2 text-green-600"></i>
                    <span>Group: <span className="font-medium">{formatGroupName(listing.group_name || listing.whatsapp_group)}</span></span>
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
                const relatedItemCategory = item.category || 'Uncategorised';
                
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
                      
                      {/* SOLD indicator for related items */}
                      {item.is_sold && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white py-1 px-3 font-bold text-sm rounded-md shadow-md">
                          SOLD
                        </div>
                      )}
                      
                      {item.price && (
                        <div className="absolute bottom-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-bold">
                          R{item.price}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">
                        {relatedItemTitle}
                        {item.is_sold && <span className="ml-2 text-red-600">(SOLD)</span>}
                      </h3>
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
    const listings = await getListings();
    
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
    const allListings = await getListings();
    
    // Find related listings with the same category or similar price
    const relatedListings = allListings
      .filter(item => {
        // Skip if same listing
        if (item.id === listing.id) return false;
        
        // Match by category
        const matchesCategory = item.category && 
                               listing.category && 
                               item.category.toLowerCase() === listing.category.toLowerCase();
        
        // Match by price (if available)
        let matchesPrice = false;
        
        if (listing.price && item.price) {
          // Convert prices to numbers for comparison
          const listingPrice = typeof listing.price === 'string' 
            ? parseFloat(listing.price) 
            : listing.price;
            
          const itemPrice = typeof item.price === 'string' 
            ? parseFloat(item.price) 
            : item.price;
          
          // Check if both are valid numbers
          if (!isNaN(listingPrice) && !isNaN(itemPrice)) {
            // Price within 30% range
            matchesPrice = itemPrice >= listingPrice * 0.7 && itemPrice <= listingPrice * 1.3;
          }
        }
        
        return matchesCategory || matchesPrice;
      })
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