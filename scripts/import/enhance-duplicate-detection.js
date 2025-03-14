/**
 * Script to test and enhance duplicate detection functionality
 * 
 * This script tests various methods of duplicate detection:
 * 1. Exact text matching
 * 2. Title matching
 * 3. Image hash matching
 * 4. Sender + partial text matching
 */
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

/**
 * Test function for enhanced duplicate detection
 * @param {string} id1 - ID of the first listing
 * @param {string} id2 - ID of the second listing
 */
async function testDuplicateDetection(id1, id2) {
  try {
    console.log('Loading listings for duplicate detection test...');
    
    // Get the first listing
    const { data: listing1, error: error1 } = await supabase
      .from('listings')
      .select('id, title, text, sender, whatsapp_group, images, image_hashes')
      .eq('id', id1)
      .single();
      
    if (error1) {
      console.error(`Error fetching first listing: ${error1.message}`);
      return;
    }
    
    // Get the second listing
    const { data: listing2, error: error2 } = await supabase
      .from('listings')
      .select('id, title, text, sender, whatsapp_group, images, image_hashes')
      .eq('id', id2)
      .single();
      
    if (error2) {
      console.error(`Error fetching second listing: ${error2.message}`);
      return;
    }
    
    // Show listing details
    console.log('\nListing 1:');
    console.log('ID:', listing1.id);
    console.log('Title:', listing1.title);
    console.log('Sender:', listing1.sender);
    console.log('WhatsApp Group:', listing1.whatsapp_group);
    console.log('Text:', listing1.text);
    console.log('Images:', JSON.stringify(listing1.images));
    console.log('Image Hashes:', JSON.stringify(listing1.image_hashes));
    
    console.log('\nListing 2:');
    console.log('ID:', listing2.id);
    console.log('Title:', listing2.title);
    console.log('Sender:', listing2.sender);
    console.log('WhatsApp Group:', listing2.whatsapp_group);
    console.log('Text:', listing2.text);
    console.log('Images:', JSON.stringify(listing2.images));
    console.log('Image Hashes:', JSON.stringify(listing2.image_hashes));
    
    // Test methods
    console.log('\nRunning duplicate detection tests:');
    
    // 1. Exact text matching
    const exactTextMatch = listing1.text === listing2.text;
    console.log('1. Exact text match:', exactTextMatch ? 'YES ✅' : 'NO ❌');
    
    // 2. Title matching
    const titleMatch = listing1.title === listing2.title;
    console.log('2. Title match:', titleMatch ? 'YES ✅' : 'NO ❌');
    
    // 3. Image hash matching
    let imageHashMatch = false;
    if (listing1.image_hashes && listing1.image_hashes.length > 0 &&
        listing2.image_hashes && listing2.image_hashes.length > 0) {
      const matchingHashes = listing1.image_hashes.filter(hash => 
        listing2.image_hashes.includes(hash)
      );
      imageHashMatch = matchingHashes.length > 0;
      if (imageHashMatch) {
        console.log('   Matching hashes:', matchingHashes);
      }
    }
    console.log('3. Image hash match:', imageHashMatch ? 'YES ✅' : 'NO ❌');
    
    // 4. Sender + partial text matching
    const senderMatch = listing1.sender === listing2.sender;
    let partialTextMatch = false;
    
    if (senderMatch && listing1.text && listing2.text) {
      // Clean texts for comparison (remove spaces, lowercase)
      const cleanText1 = listing1.text.toLowerCase().replace(/\s+/g, '');
      const cleanText2 = listing2.text.toLowerCase().replace(/\s+/g, '');
      
      // Check if one text contains a significant portion of the other
      const shorterText = cleanText1.length <= cleanText2.length ? cleanText1 : cleanText2;
      const longerText = cleanText1.length > cleanText2.length ? cleanText1 : cleanText2;
      
      // Consider it a match if the shorter text is at least 80% contained in the longer text
      const minMatchLength = Math.floor(shorterText.length * 0.8);
      let matchCount = 0;
      
      // Count how many characters from shorter text are in longer text
      for (let i = 0; i < shorterText.length; i++) {
        if (longerText.includes(shorterText[i])) {
          matchCount++;
        }
      }
      
      partialTextMatch = matchCount >= minMatchLength;
      console.log(`   Character match: ${matchCount}/${shorterText.length} (${Math.round(matchCount / shorterText.length * 100)}%)`);
    }
    
    console.log('4. Sender + partial text match:', (senderMatch && partialTextMatch) ? 'YES ✅' : 'NO ❌');
    
    // 5. Combined result
    const isDuplicate = exactTextMatch || (titleMatch && senderMatch) || imageHashMatch || (senderMatch && partialTextMatch);
    console.log('\nFINAL RESULT: Would be detected as duplicate?', isDuplicate ? 'YES ✅' : 'NO ❌');
    
    // Suggestions for improving listingExists function
    console.log('\nSuggestions for improving duplicate detection:');
    if (!imageHashMatch && (exactTextMatch || (titleMatch && senderMatch) || (senderMatch && partialTextMatch))) {
      console.log('- Image hash matching needs to be fixed (hashes not stored or not matching)');
    }
    
    if (!exactTextMatch && (titleMatch && senderMatch)) {
      console.log('- Add title+sender matching as a fallback when texts don\'t match exactly');
    }
    
    if (!exactTextMatch && (senderMatch && partialTextMatch)) {
      console.log('- Add partial text matching for same sender as a fallback');
    }
    
  } catch (error) {
    console.error('Error testing duplicate detection:', error);
  }
}

// Test with the two known duplicate listings
let listingId1 = 'f5bfad65-10e4-43a7-8795-dc7f411f1c87';
let listingId2 = '17bd6c46-8744-4279-9aec-322431a29404';

// Allow passing IDs via command line args
if (process.argv.length >= 4) {
  listingId1 = process.argv[2];
  listingId2 = process.argv[3];
}

console.log(`Testing duplicate detection between listings:\n- ${listingId1}\n- ${listingId2}`);

testDuplicateDetection(listingId1, listingId2)
  .then(() => console.log('\nTest completed'))
  .catch(error => console.error('Test error:', error)); 