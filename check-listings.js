require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkListings() {
  try {
    console.log('Fetching listings from database...');
    
    const { data, error } = await supabase
      .from('listings')
      .select('*');
    
    if (error) {
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }
    
    console.log(`Found ${data.length} listings:`);
    
    data.forEach(listing => {
      console.log('\n--------------------------------------------');
      console.log(`ID: ${listing.id}`);
      console.log(`Title: ${listing.title}`);
      console.log(`Group: ${listing.whatsappGroup}`);
      
      // Format date
      const date = listing.date ? new Date(listing.date).toISOString() : 'No date';
      console.log(`Date: ${date}`);
      
      // Show images
      const images = listing.images || [];
      console.log(`Images (${images.length}): ${JSON.stringify(images)}`);
      
      // Print image URLs
      if (images.length > 0) {
        console.log('Image paths:');
        images.forEach((img, idx) => {
          console.log(`  ${idx+1}. ${img}`);
        });
      }
      
      console.log(`Category: ${listing.category}`);
    });
    
    // Also check for image files in Supabase
    console.log('\n\nChecking images in Supabase storage...');
    const { data: fileList, error: listError } = await supabase
      .storage
      .from('listing-images')
      .list();
    
    if (listError) {
      console.error('Error listing files in storage:', listError.message);
    } else {
      console.log(`Found ${fileList.length} files in storage bucket:`);
      fileList.forEach((file, idx) => {
        // Handle missing metadata
        const size = file.metadata && file.metadata.size 
          ? file.metadata.size 
          : 'unknown size';
        
        console.log(`  ${idx+1}. ${file.name} (${size} bytes)`);
      });
    }
    
  } catch (error) {
    console.error('Error checking listings:', error.message);
  }
}

checkListings(); 