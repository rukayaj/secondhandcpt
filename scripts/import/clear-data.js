require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log('Starting data cleanup...');
  
  try {
    // 1. Delete all listings from database
    console.log('Deleting all listings from database...');
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .gte('created_at', '2020-01-01');
    
    if (deleteError) {
      console.error('Error deleting listings:', deleteError.message);
    } else {
      console.log('Successfully deleted listings from database');
    }
    
    // 2. List files in storage bucket
    console.log('Listing files in the storage bucket...');
    const { data: fileList, error: listError } = await supabase
      .storage
      .from('listing-images')
      .list();
    
    if (listError) {
      console.error('Error listing files in storage:', listError.message);
    } else if (fileList && fileList.length > 0) {
      console.log(`Found ${fileList.length} files in storage bucket`);
      
      // Extract file paths
      const filePaths = fileList.map(file => file.name);
      
      // Delete files from storage bucket
      console.log('Deleting files from storage bucket...');
      const { data: deletedFiles, error: storageError } = await supabase
        .storage
        .from('listing-images')
        .remove(filePaths);
      
      if (storageError) {
        console.error('Error deleting files from storage:', storageError.message);
      } else {
        console.log(`Successfully deleted ${filePaths.length} files from storage bucket`);
      }
    } else {
      console.log('No files found in storage bucket');
    }
    
    console.log('Data cleanup completed!');
  } catch (error) {
    console.error('Error during data cleanup:', error.message);
    process.exit(1);
  }
}

clearData(); 