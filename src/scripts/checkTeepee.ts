import { sampleListings } from '../utils/sampleData';

// Find all listings containing "Toddler teepee floor bed"
const teepeeBeds = sampleListings.filter(listing => 
  listing.text.includes('Toddler teepee floor bed')
);

console.log(`Found ${teepeeBeds.length} listings for "Toddler teepee floor bed":`);

// Display each listing
teepeeBeds.forEach((listing, index) => {
  console.log(`\nListing ${index + 1}:`);
  console.log(`ID: ${listing.id}`);
  console.log(`Date: ${listing.date}`);
  console.log(`Sender: ${listing.sender}`);
  console.log(`Text: ${listing.text}`);
  console.log(`Price: ${listing.price}`);
  console.log(`Location: ${listing.location}`);
  console.log(`Category: ${listing.category}`);
  console.log(`Condition: ${listing.condition}`);
  console.log(`Images: ${listing.images.join(', ')}`);
});

// Check if they are from the same sender
const uniqueSenders = new Set(teepeeBeds.map(listing => listing.sender));
console.log(`\nNumber of unique senders: ${uniqueSenders.size}`);

// Check if they have the same image
const uniqueImages = new Set(teepeeBeds.flatMap(listing => listing.images));
console.log(`Number of unique images: ${uniqueImages.size}`);

// Conclusion
if (teepeeBeds.length > 1 && uniqueSenders.size === 1 && uniqueImages.size === 1) {
  console.log('\nCONCLUSION: These are duplicate listings from the same sender with the same image.');
} else {
  console.log('\nCONCLUSION: These listings may not be duplicates.');
} 