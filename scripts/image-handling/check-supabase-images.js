/**
 * Script to check if all images referenced in the database are properly uploaded to Supabase storage
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSupabaseImages() {
  try {
    console.log('Checking if all images referenced in the database are properly uploaded to Supabase storage...');
    
    // Get all listings from the database
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, images')
      .not('images', 'is', null);
    
    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return;
    }
    
    console.log(`Found ${listings.length} listings with images`);
    
    // Count total images
    let totalImages = 0;
    listings.forEach(listing => {
      if (listing.images && Array.isArray(listing.images)) {
        totalImages += listing.images.length;
      }
    });
    
    console.log(`Total images referenced: ${totalImages}`);
    
    // Check if all images exist in Supabase storage
    let missingImages = [];
    let processedImages = 0;
    
    for (const listing of listings) {
      if (listing.images && Array.isArray(listing.images)) {
        for (const imagePath of listing.images) {
          processedImages++;
          
          // Skip images that are already full URLs
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            continue;
          }
          
          // Construct the storage path
          const storagePath = `listings/${listing.id}-${imagePath.split('/').pop()}`;
          
          // Check if the image exists in Supabase storage
          const { data, error } = await supabase.storage
            .from('listing-images')
            .getPublicUrl(storagePath);
          
          if (error) {
            missingImages.push({ listingId: listing.id, imagePath });
          }
          
          // Log progress every 100 images
          if (processedImages % 100 === 0) {
            console.log(`Processed ${processedImages}/${totalImages} images`);
          }
        }
      }
    }
    
    console.log(`Processed ${processedImages}/${totalImages} images`);
    
    if (missingImages.length > 0) {
      console.log(`Found ${missingImages.length} missing images:`);
      missingImages.forEach(({ listingId, imagePath }) => {
        console.log(`- Listing ${listingId}: ${imagePath}`);
      });
    } else {
      console.log('All images are properly uploaded to Supabase storage!');
    }
  } catch (error) {
    console.error('Error checking Supabase images:', error);
  }
}

// Run the function
checkSupabaseImages(); 