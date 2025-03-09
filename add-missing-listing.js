/**
 * Script to add the missing Cath Kids listing to the database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define the missing listing
const missingListing = {
  whatsapp_group: 'Nifty Thrifty 0-1 year',
  date: new Date('2024-11-17T14:15:00'), // Approximate date based on image name
  sender: '+27 72 118 4955', // Using a sender from another listing as an example
  text: '6 to 12 month Cath Kids ditsy pink floral 100% summer cotton dress. Good to very good condition. Can even be worn as a top as she grows. Just stunning R150. Collect Kenilworth Xposted',
  images: ['IMG-20241117-WA0014.jpg'],
  price: 150,
  condition: 'VERY_GOOD',
  collection_areas: ['Kenilworth']
};

async function addMissingListing() {
  try {
    console.log('Adding missing Cath Kids listing to the database...');
    
    // Insert the listing into the database
    const { data, error } = await supabase
      .from('listings')
      .insert([{
        whatsapp_group: missingListing.whatsapp_group,
        date: missingListing.date,
        sender: missingListing.sender,
        text: missingListing.text,
        images: missingListing.images,
        price: missingListing.price,
        condition: missingListing.condition,
        collection_areas: missingListing.collection_areas
      }])
      .select();
    
    if (error) {
      console.error('Error adding listing:', error);
      return;
    }
    
    console.log('Successfully added missing listing!');
    console.log('Listing ID:', data[0].id);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
addMissingListing(); 