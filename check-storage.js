require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  try {
    console.log('Checking Supabase storage...');
    
    // List files in the 'listings' directory
    const { data: listingsFiles, error: listingsError } = await supabase
      .storage
      .from('listing-images')
      .list('listings');
    
    if (listingsError) {
      console.error('Error listing files in listings directory:', listingsError.message);
    } else if (listingsFiles && listingsFiles.length > 0) {
      console.log(`\nFound ${listingsFiles.length} files in 'listings' directory:`);
      listingsFiles.forEach((file, idx) => {
        console.log(`  ${idx+1}. ${file.name}`);
        
        // Get public URL for this file
        const { data: urlData } = supabase
          .storage
          .from('listing-images')
          .getPublicUrl(`listings/${file.name}`);
          
        if (urlData && urlData.publicUrl) {
          console.log(`     URL: ${urlData.publicUrl}`);
        }
      });
    } else {
      console.log('No files found in the listings directory');
    }
    
    // List files in the root directory
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('listing-images')
      .list();
    
    if (rootError) {
      console.error('Error listing files in root directory:', rootError.message);
    } else if (rootFiles && rootFiles.length > 0) {
      console.log(`\nFound ${rootFiles.length} files/folders in root directory:`);
      rootFiles.forEach((file, idx) => {
        console.log(`  ${idx+1}. ${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found in the root directory');
    }
    
    // Check for dead listings
    console.log('\nChecking for listings with invalid image paths...');
    const { data: listings, error: listingsQueryError } = await supabase
      .from('listings')
      .select('id, title, images');
    
    if (listingsQueryError) {
      console.error('Error querying listings:', listingsQueryError.message);
    } else {
      const invalidImageListings = listings.filter(listing => {
        if (!listing.images || listing.images.length === 0) {
          return false; // No images, so not invalid
        }
        
        // Check if all image paths start with 'listings/'
        return listing.images.some(imagePath => !imagePath.startsWith('listings/'));
      });
      
      if (invalidImageListings.length > 0) {
        console.log(`Found ${invalidImageListings.length} listings with potentially invalid image paths:`);
        invalidImageListings.forEach((listing) => {
          console.log(`  - ID: ${listing.id}`);
          console.log(`    Title: ${listing.title}`);
          console.log(`    Images: ${JSON.stringify(listing.images)}`);
        });
      } else {
        console.log('No listings with invalid image paths found');
      }
    }
    
  } catch (error) {
    console.error('Error checking storage:', error.message);
  }
}

checkStorage(); 