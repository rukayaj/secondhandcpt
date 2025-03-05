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

async function updateListingsWithoutImages() {
  console.log('Updating listings without images...');
  
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
  const listings: Listing[] = eval(`(${listingsArrayString})`);
  
  // Find listings without images
  const listingsWithoutImages = listings.filter(listing => 
    !listing.images || listing.images.length === 0
  );
  
  console.log(`Found ${listingsWithoutImages.length} listings without images`);
  
  // Process each listing without images
  const updatedListings = listings.map(listing => {
    // Skip listings that already have images
    if (listing.images && listing.images.length > 0) {
      return listing;
    }
    
    // Check if the listing is already marked as ISO
    if (listing.isISO) {
      console.log(`Listing ${listing.id} is already marked as ISO`);
      return listing;
    }
    
    const text = listing.text.toLowerCase();
    
    // Check if the text contains ISO indicators
    const isoIndicators = ['iso', 'looking for', 'in search of', 'needed', 'need', 'searching for', 'wanted'];
    const isIsoPost = isoIndicators.some(indicator => text.includes(indicator.toLowerCase()));
    
    // Check if the text contains selling indicators
    const sellingIndicators = ['selling', 'for sale', 'r ', 'rand', 'price', 'collection'];
    const isSellingPost = sellingIndicators.some(indicator => text.includes(indicator.toLowerCase()));
    
    if (isIsoPost && !isSellingPost) {
      console.log(`Marking listing ${listing.id} as ISO`);
      return { ...listing, isISO: true };
    } else if (isSellingPost) {
      console.log(`Listing ${listing.id} appears to be a selling post without images`);
      // For selling posts without images, we'll keep them but add a note
      return listing;
    } else {
      console.log(`Listing ${listing.id} doesn't have clear indicators`);
      // For unclear posts, we'll examine them manually
      console.log(`Text: ${listing.text}`);
      return listing;
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
  updateListingsWithoutImages().catch(console.error);
}

export { updateListingsWithoutImages }; 