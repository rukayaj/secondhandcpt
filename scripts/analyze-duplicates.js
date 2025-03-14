require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeListing(id) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return null;
  }
}

async function checkExistingListingsWithSameText(text, sender) {
  try {
    console.log(`\nChecking for listings with identical text from sender ${sender}:`);
    
    // This is the same query that should be used in listingExists
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, date, text, whatsapp_group')
      .eq('sender', sender)
      .eq('text', text);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} listings with identical text from the same sender:`);
      data.forEach(listing => {
        console.log(`- ID: ${listing.id}`);
        console.log(`  Title: ${listing.title}`);
        console.log(`  Group: ${listing.whatsapp_group}`);
        console.log(`  Date: ${listing.date}`);
      });
      return true;
    } else {
      console.log('No listings found with identical text from the same sender.');
      return false;
    }
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false;
  }
}

async function analyzeDuplicates() {
  // The two listing IDs to analyze
  const id1 = '3e328326-7939-49b4-96a1-5f36e8cc1f62';
  const id2 = 'f7602a7e-7200-41ce-b061-adf527908391';
  
  console.log(`Analyzing potential duplicate listings:\n- ${id1}\n- ${id2}`);
  
  const listing1 = await analyzeListing(id1);
  const listing2 = await analyzeListing(id2);
  
  if (!listing1 || !listing2) {
    console.error('Could not retrieve one or both listings');
    return;
  }
  
  console.log('\nListing 1:');
  console.log('  ID:', listing1.id);
  console.log('  Title:', listing1.title);
  console.log('  Group:', listing1.whatsapp_group);
  console.log('  Date:', new Date(listing1.date).toLocaleString());
  console.log('  Sender:', listing1.sender);
  console.log('  Date Added:', new Date(listing1.date_added).toLocaleString());
  
  console.log('\nListing 2:');
  console.log('  ID:', listing2.id);
  console.log('  Title:', listing2.title);
  console.log('  Group:', listing2.whatsapp_group);
  console.log('  Date:', new Date(listing2.date).toLocaleString());
  console.log('  Sender:', listing2.sender);
  console.log('  Date Added:', new Date(listing2.date_added).toLocaleString());
  
  // Compare key fields
  console.log('\nComparison:');
  console.log('  Same title:', listing1.title === listing2.title ? 'YES ✅' : 'NO ❌');
  console.log('  Same text:', listing1.text === listing2.text ? 'YES ✅' : 'NO ❌');
  console.log('  Same sender:', listing1.sender === listing2.sender ? 'YES ✅' : 'NO ❌');
  console.log('  Same group:', listing1.whatsapp_group === listing2.whatsapp_group ? 'YES ✅' : 'NO ❌');
  
  // See which listing was added first
  const dateAdded1 = new Date(listing1.date_added);
  const dateAdded2 = new Date(listing2.date_added);
  const timeDiff = Math.abs(dateAdded2 - dateAdded1) / 1000; // difference in seconds
  
  console.log(`\nTiming: Listing #${dateAdded1 < dateAdded2 ? '1' : '2'} was added first`);
  console.log(`Time difference: ${Math.floor(timeDiff / 60)} minutes ${Math.floor(timeDiff % 60)} seconds`);
  
  // Check if we can find other listings with the same text and sender
  await checkExistingListingsWithSameText(listing1.text, listing1.sender);
  
  console.log(`\nConclusion: These listings ${listing1.text === listing2.text && listing1.sender === listing2.sender ? 'SHOULD' : 'should NOT'} have been detected as duplicates.`);
  console.log('If they were not detected, this suggests an issue with the database query execution or timing during import.');
}

analyzeDuplicates()
  .then(() => console.log('\nAnalysis complete'))
  .catch(error => console.error('Analysis error:', error)); 