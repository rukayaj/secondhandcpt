import React from 'react';
import Link from 'next/link';
import { ListingRecord } from '@/utils/supabase';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { formatDate, getConditionColor } from '@/utils/utils';
import { getFormattedImageUrl } from '@/utils/imageUtils';

// Helper function to get the appropriate FontAwesome icon for each category
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Clothing': 'fa-solid fa-shirt',
    'Maternity Clothing': 'fa-solid fa-person-pregnant',
    'Toys': 'fa-solid fa-gamepad',
    'Furniture': 'fa-solid fa-couch',
    'Footwear': 'fa-solid fa-shoe-prints',
    'Gear': 'fa-solid fa-baby-carriage',
    'Feeding': 'fa-solid fa-spoon',
    'Bath': 'fa-solid fa-bath',
    'Safety': 'fa-solid fa-shield-alt',
    'Bedding': 'fa-solid fa-bed',
    'Diapering': 'fa-solid fa-toilet-paper',
    'Health': 'fa-solid fa-kit-medical',
    'Books': 'fa-solid fa-book',
    'Swimming': 'fa-solid fa-water-ladder',
    'Uncategorised': 'fa-solid fa-box-open'
  };
  
  return iconMap[categoryName] || 'fa-solid fa-box';
}

// Helper function to get a color for each category
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Clothing': '#4F46E5', // indigo
    'Maternity Clothing': '#D946EF', // fuchsia
    'Toys': '#F59E0B',     // amber
    'Furniture': '#10B981', // emerald
    'Footwear': '#EC4899',  // pink
    'Gear': '#6366F1',     // indigo
    'Feeding': '#EF4444',  // red
    'Bath': '#0EA5E9',     // sky blue
    'Safety': '#F97316',   // orange
    'Bedding': '#14B8A6',  // teal
    'Diapering': '#F97316', // orange
    'Health': '#10B981',   // emerald
    'Books': '#8B5CF6',    // purple
    'Swimming': '#0EA5E9', // sky blue
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

interface ListingCardProps {
  listing: ListingRecord;
  displayMode?: 'grid' | 'list';
  showDetails?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const formattedDate = formatDate(listing.posted_on);
  const [imageError, setImageError] = React.useState(false);

  // Use the title field directly - no fallback to ensure titles are always required
  const displayTitle = listing.title;

  // Use the group_name field directly and format it
  const groupName = formatGroupName(listing.group_name || 'Unknown Group');

  // Use the database category value instead of determining from text
  const category = listing.category || 'Uncategorised';

  // Use the image from the listing
  const getImageSrc = () => {
    if (listing.images && listing.images.length > 0 && !listing.is_iso && !imageError) {
      return getFormattedImageUrl(listing.images[0]);
    }
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
  };

  const imageSrc = getImageSrc();

  return (
    <Link href={`/listings/${listing.id}`} className="card h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative pt-[75%]">
        {listing.is_iso ? (
          // For ISO posts, display the category icon instead of an image
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <i 
              className={`${getCategoryIcon(category)} text-6xl`} 
              style={{ color: getCategoryColor(category) }}
            ></i>
          </div>
        ) : (
          // For regular listings, display the image
          <Image
            src={imageSrc}
            alt={displayTitle}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={imageSrc.startsWith('https://placehold.co')}
          />
        )}
        
        {listing.is_iso && (
          <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
            <i className="fa-solid fa-search"></i>
            <span>ISO</span>
          </div>
        )}
        
        {listing.condition && (
          <div 
            className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded shadow text-white"
            style={{ backgroundColor: getConditionColor(listing.condition) }}
          >
            {listing.condition}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">
            {displayTitle}
          </h3>
          {listing.price && (
            <span className="font-bold text-primary-600 whitespace-nowrap ml-2">
              R{listing.price}
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 text-sm text-secondary-500 flex flex-col gap-1">
          <div className="flex items-center">
            <i 
              className={`${getCategoryIcon(category)} mr-1`} 
              style={{ color: getCategoryColor(category) }}
            ></i>
            <span>{category}</span>
          </div>
          
          {/* Display the WhatsApp group name */}
          <div className="flex items-center">
            <i className="fa-brands fa-whatsapp mr-1 text-green-500"></i>
            <span>{groupName}</span>
          </div>
          
          {listing.collection_areas && listing.collection_areas.length > 0 && (
            <div className="flex items-center">
              <i className="fa-solid fa-location-dot mr-1"></i>
              <span>{listing.collection_areas[0]}</span>
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