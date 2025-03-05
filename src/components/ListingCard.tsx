import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/utils/parser';
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

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const formattedDate = formatDate(listing.date);
  const [imageError, setImageError] = React.useState(false);

  // Use placeholder image if no images are available or if there was an error loading the image
  const imageSrc = (listing.images && listing.images.length > 0 && !listing.isISO && !imageError)
    ? listing.images[0]
    : `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(listing.category || 'No Image')}`;

  return (
    <Link href={`/listings/${listing.id}`} className="card h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative pt-[75%]">
        {listing.isISO ? (
          // For ISO posts, display the category icon instead of an image
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <i 
              className={`${getCategoryIcon(listing.category || 'Other')} text-6xl`} 
              style={{ color: getCategoryColor(listing.category || 'Other') }}
            ></i>
          </div>
        ) : (
          // For regular listings, display the image
          <Image
            src={imageSrc}
            alt={listing.text.split('\n')[0]}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={imageSrc.startsWith('https://placehold.co')}
          />
        )}
        
        {listing.isISO && (
          <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
            <i className="fa-solid fa-search"></i>
            <span>ISO</span>
          </div>
        )}
        
        {listing.condition && (
          <div 
            className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded shadow"
            style={getConditionColor(listing.condition)}
          >
            {listing.condition}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">
            {listing.text.split('\n')[0].substring(0, 60)}
            {listing.text.split('\n')[0].length > 60 ? '...' : ''}
          </h3>
          {listing.price && (
            <span className="font-bold text-primary-600 whitespace-nowrap ml-2">
              R{listing.price}
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 text-sm text-secondary-500 flex flex-col gap-1">
          {listing.category && (
            <div className="flex items-center">
              <i 
                className={`${getCategoryIcon(listing.category)} mr-1`} 
                style={{ color: getCategoryColor(listing.category) }}
              ></i>
              <span>{listing.category}</span>
            </div>
          )}
          
          {listing.size && (
            <div className="flex items-center">
              <i className="fa-solid fa-ruler mr-1"></i>
              <span>Size: {listing.size}</span>
            </div>
          )}
          
          {listing.location && (
            <div className="flex items-center">
              <i className="fa-solid fa-location-dot mr-1"></i>
              <span>{listing.location}</span>
            </div>
          )}
          
          <div className="flex items-center mt-1">
            <i className="fa-solid fa-calendar mr-1"></i>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard; 