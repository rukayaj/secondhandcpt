/**
 * Simple test for image hash comparison
 */

// Test data
const listing1 = {
  id: '61a4cb56-cf49-410f-b9f3-f09ae67feb06',
  title: 'Stars and moon multi coloured mini night light',
  sender: '27652050920@c.us',
  images: ['listings/Nifty_Thrifty_0-1_year_1_0_1741882106140_1704.jpg'],
  image_hashes: ['imagehash123'] // This is just a mock hash
};

const listing2 = {
  id: '91367ff3-df78-4867-9feb-846283f39492',
  title: 'Stars and moon multi coloured mini night light',
  sender: '27652050920@c.us',
  images: ['listings/Nifty_Thrifty_1-3_years_0_1741882108309_2582.jpg'],
  image_hashes: ['imagehash123'] // Same hash
};

// Test function
function checkImageHashMatch(existing, current) {
  if (!current.image_hashes || !Array.isArray(current.image_hashes) || current.image_hashes.length === 0) {
    console.log('Current listing has no image hashes');
    return false;
  }
  
  if (!existing.image_hashes || !Array.isArray(existing.image_hashes) || existing.image_hashes.length === 0) {
    console.log('Existing listing has no image hashes');
    return false;
  }
  
  console.log('Existing listing image hashes:', existing.image_hashes);
  console.log('Current listing image hashes:', current.image_hashes);
  
  // Look for any matching hash
  const matchingHashes = current.image_hashes.filter(hash => 
    existing.image_hashes.includes(hash)
  );
  
  console.log('Matching hashes:', matchingHashes.length > 0 ? matchingHashes : 'None');
  
  return matchingHashes.length > 0;
}

// Run the test
console.log('=== TESTING IMAGE HASH DETECTION ===\n');
console.log('Checking if listings have matching image hashes:');
const result = checkImageHashMatch(listing1, listing2);
console.log('\nResult:', result ? 'MATCH FOUND ✅' : 'NO MATCH FOUND ❌');

// Test with different hashes
console.log('\n=== TESTING WITH DIFFERENT HASHES ===\n');
listing2.image_hashes = ['differenthash456'];
console.log('Checking if listings have matching image hashes:');
const result2 = checkImageHashMatch(listing1, listing2);
console.log('\nResult:', result2 ? 'MATCH FOUND ✅' : 'NO MATCH FOUND ❌');

// Test with empty array
console.log('\n=== TESTING WITH EMPTY HASH ARRAY ===\n');
listing2.image_hashes = [];
console.log('Checking if listings have matching image hashes:');
const result3 = checkImageHashMatch(listing1, listing2);
console.log('\nResult:', result3 ? 'MATCH FOUND ✅' : 'NO MATCH FOUND ❌');

// Test with undefined hashes
console.log('\n=== TESTING WITH UNDEFINED HASHES ===\n');
delete listing2.image_hashes;
console.log('Checking if listings have matching image hashes:');
const result4 = checkImageHashMatch(listing1, listing2);
console.log('\nResult:', result4 ? 'MATCH FOUND ✅' : 'NO MATCH FOUND ❌'); 