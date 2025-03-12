// Script to update listings with "Unknown Item" titles
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key instead of anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to generate a title from text
function generateTitleFromText(text) {
  if (!text) return 'Item for sale';
  
  // Get the first line and clean it up
  let newTitle = text.split('\n')[0]
    .replace(/^(selling|iso|wtb|wts|wtt|sale)[\s:]+/i, '')
    .trim();
  
  // Truncate if too long
  if (newTitle.length > 60) {
    newTitle = newTitle.substring(0, 57) + '...';
  }
  
  return newTitle || 'Item for sale';
}

async function updateUnknownTitles() {
  try {
    console.log('Fetching listings with "Unknown Item" title...');
    
    // Query for listings with "Unknown Item" title
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, text')
      .eq('title', 'Unknown Item');
    
    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }
    
    console.log(`Found ${data.length} listings with 'Unknown Item' title`);
    
    // Update each listing
    for (const listing of data) {
      const newTitle = generateTitleFromText(listing.text);
      
      console.log(`Updating listing ${listing.id}, new title: '${newTitle}'`);
      
      const { error: updateError } = await supabase
        .from('listings')
        .update({ title: newTitle })
        .eq('id', listing.id);
      
      if (updateError) {
        console.error(`Error updating listing ${listing.id}:`, updateError);
      }
    }
    
    console.log('Update process completed');
  } catch (err) {
    console.error('Execution error:', err);
  }
}

// Run the update function
updateUnknownTitles(); 