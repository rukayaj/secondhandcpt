import fs from 'fs/promises';
import path from 'path';

interface Listing {
  id: string;
  date: string;
  sender: string;
  text: string;
  title?: string;
  images?: string[];
  price: number | null;
  condition: string | null;
  size: string | null;
  location: string | null;
  category: string | null;
  isISO: boolean;
}

async function manuallyReviewListingsWithoutImages() {
  console.log('Manually reviewing listings without images...');
  
  // Read the combined listings file
  const combinedListingsPath = path.join(process.cwd(), 'src/utils/combinedListings.ts');
  const fileContent = await fs.readFile(combinedListingsPath, 'utf-8');
  
  // Extract the listings array using regex
  const listingsMatch = fileContent.match(/export const combinedListings: Listing\[] = (\[[\s\S]*?\]);/);
  
  if (!listingsMatch || !listingsMatch[1]) {
    console.error('Could not find listings array in the file');
    return;
  }
  
  // Parse the listings array
  const listingsArrayString = listingsMatch[1];
  // Use JSON.parse instead of eval for safety
  const listingsJson = listingsArrayString.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
  let listings: Listing[];
  try {
    listings = JSON.parse(listingsJson);
  } catch (error) {
    console.error('Error parsing listings:', error);
    // Fallback to eval if JSON.parse fails
    listings = eval(`(${listingsArrayString})`);
  }
  
  // Find listings without images
  const listingsWithoutImages = listings.filter(listing => 
    !listing.images || listing.images.length === 0
  );
  
  console.log(`Found ${listingsWithoutImages.length} listings without images`);
  
  // Based on our manual review, we know which listings need to be updated
  const updatedListings = listings.map(listing => {
    // Skip listings that already have images
    if (listing.images && listing.images.length > 0) {
      return listing;
    }
    
    // Check if the listing is already marked as ISO
    if (listing.isISO) {
      return listing;
    }
    
    // Specific listings we identified that should be marked as ISO or kept
    if (listing.id === '267') {
      // This is a selling post for baby clothes bundle
      console.log(`Keeping listing ${listing.id} as a selling post`);
      return listing;
    } else if (listing.id === '266') {
      // This is a selling post for a wood rolling single floor bed
      console.log(`Keeping listing ${listing.id} as a selling post`);
      return listing;
    } else {
      // For any other listings without images that aren't already ISO, mark them as ISO
      console.log(`Marking listing ${listing.id} as ISO`);
      return { ...listing, isISO: true };
    }
  });
  
  // Count how many listings were updated
  const updatedCount = updatedListings.filter((listing, index) => 
    listing.isISO !== listings[index].isISO
  ).length;
  
  console.log(`Updated ${updatedCount} listings`);
  
  // Write the updated listings back to the file
  const updatedFileContent = fileContent.replace(
    /export const combinedListings: Listing\[] = \[[\s\S]*?\];/,
    `export const combinedListings: Listing[] = ${JSON.stringify(updatedListings, null, 2)};`
  );
  
  await fs.writeFile(combinedListingsPath, updatedFileContent, 'utf-8');
  console.log('Updated listings file saved');
}

// Check if this script is being run directly
if (require.main === module) {
  manuallyReviewListingsWithoutImages().catch(console.error);
}

export { manuallyReviewListingsWithoutImages }; 