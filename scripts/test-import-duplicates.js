require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { listingExists, addListing } = require('../src/utils/dbUtils.js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to simulate the import process
async function simulateImport() {
  console.log('Simulating the import process with cross-group duplicates...');
  
  // Create two test listings that should be duplicates of each other
  const listing1 = {
    title: 'Test Duplicate Item',
    text: 'This is a test item with identical text across different groups.',
    sender: 'test-sender@c.us',
    whatsappGroup: 'Group 1',
    date: new Date().toISOString(),
    images: [],
    price: 100,
    condition: 'Used'
  };
  
  const listing2 = {
    title: 'Test Duplicate Item',
    text: 'This is a test item with identical text across different groups.',
    sender: 'test-sender@c.us',
    whatsappGroup: 'Group 2',
    date: new Date().toISOString(),
    images: [],
    price: 100,
    condition: 'Used'
  };
  
  // Check if listing1 already exists
  console.log('Checking if the first test listing exists...');
  let exists = await listingExists(listing1, true);
  
  if (exists) {
    console.log('First test listing already exists, skipping addition');
  } else {
    console.log('First test listing does not exist, adding to database...');
    const result = await addListing(listing1);
    console.log('First listing added with ID:', result.id);
  }
  
  // Now check if listing2 is detected as a duplicate
  console.log('\nChecking if the second test listing is detected as a duplicate...');
  exists = await listingExists(listing2, true);
  
  if (exists) {
    console.log('SUCCESS: Second listing was correctly detected as a duplicate! ✅');
  } else {
    console.log('FAILURE: Second listing was NOT detected as a duplicate! ❌');
    console.log('Something is wrong with the duplicate detection logic.');
  }
  
  // Delete the test listing(s) if needed
  console.log('\nCleaning up test data...');
  try {
    const { data, error } = await supabase
      .from('listings')
      .delete()
      .eq('sender', 'test-sender@c.us')
      .eq('text', listing1.text);
      
    if (error) throw error;
    console.log('Test data cleaned up successfully.');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

simulateImport()
  .then(() => console.log('Test complete!'))
  .catch(error => console.error('Test error:', error)); 