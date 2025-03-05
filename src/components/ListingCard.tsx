import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/utils/parser';
import { formatDate, getConditionColor } from '@/utils/helpers';
import { getValidImagePath } from '@/utils/imageUtils';
import SafeImage from './SafeImage';

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

  // Generate a clean title from the text if one isn't provided or if it's an image filename
  const displayTitle = (listing.title && !listing.title.startsWith('IMG-')) 
    ? listing.title 
    : ((listing.text.split('\n')
        .filter(line => !line.includes('(file attached)') && !line.startsWith('IMG-'))
        .join(' ')
        .substring(0, 60)) + (listing.text.length > 60 ? '...' : '')) 
    || ((listing.category || '') + (listing.size ? ` (${listing.size})` : '')) 
    || 'Listing';

  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="relative h-48 w-full bg-secondary-100">
          {listing.images && listing.images.length > 0 ? (
            <SafeImage
              src={listing.images[0]}
              alt={displayTitle}
              fill
              className="object-cover"
              category={listing.category}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <i className={`${getCategoryIcon(listing.category || 'Other')} text-4xl mb-2`} style={{ color: getCategoryColor(listing.category || 'Other') }}></i>
                <p className="text-secondary-400 text-sm">No image</p>
              </div>
            </div>
          )}
          
          {/* Category badge */}
          {listing.category && (
            <div className="absolute top-2 left-2">
              <span 
                className="inline-block text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: getCategoryColor(listing.category), color: 'white' }}
              >
                {listing.category}
              </span>
            </div>
          )}
          
          {/* ISO badge */}
          {listing.isISO && (
            <div className="absolute top-2 right-2">
              <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-500 text-white shadow-sm">
                ISO
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary-600 transition-colors">
            {displayTitle}
          </h3>
          
          <div className="flex justify-between items-center">
            <p className="text-primary-600 font-bold">{listing.price ? `R${listing.price}` : ''}</p>
            
            {listing.condition && (
              <span 
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded"
                style={getConditionColor(listing.condition)}
              >
                {listing.condition}
              </span>
            )}
          </div>
          
          {listing.location && (
            <p className="text-secondary-500 text-sm mt-2 truncate">
              <i className="fas fa-map-marker-alt mr-1"></i> {listing.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard; 