/**
 * Script to apply manual changes to the extracted listings
 */

const fs = require('fs');
const path = require('path');

// Load the most recent cleaned listings
const extractedListingsPath = path.join(__dirname, 'src/data/final-cleaned-listings.json');
const listings = JSON.parse(fs.readFileSync(extractedListingsPath, 'utf8'));

console.log(`Loaded ${listings.length} listings from final-cleaned-listings.json`);

// Load manual review decisions
const manualReviewPath = path.join(__dirname, 'manual_review_decisions.json');
const manualReview = JSON.parse(fs.readFileSync(manualReviewPath, 'utf8'));

console.log(`Loaded ${manualReview.length} manual review decisions`);

// Apply manual changes to the listings
const updatedListings = listings.filter(listing => {
  // Check if this listing has a manual change
  const manualChange = manualReview.find(change => 
    change.whatsappGroup === listing.whatsappGroup &&
    change.date === listing.date &&
    change.sender === listing.sender &&
    change.text === listing.text
  );

  if (manualChange) {
    if (manualChange.action && manualChange.action.startsWith('delete')) {
      console.log(`Deleting listing: ${manualChange.text.substring(0, 50)}...`);
      return false; // Filter out this listing
    }
  }

  return true; // Keep this listing
});

// Update listings with manual changes
updatedListings.forEach(listing => {
  // Check if this listing has a manual change
  const manualChange = manualReview.find(change => 
    change.whatsappGroup === listing.whatsappGroup &&
    change.date === listing.date &&
    change.sender === listing.sender &&
    change.text === listing.text
  );

  if (manualChange) {
    if (manualChange.price !== null && manualChange.price !== undefined) {
      console.log(`Updating price for listing: ${manualChange.text.substring(0, 50)}...`);
      listing.price = manualChange.price;
    }
    
    if (manualChange.iso === true) {
      console.log(`Adding ISO flag for listing: ${manualChange.text.substring(0, 50)}...`);
      listing.iso = true;
    }

    // Update collection areas if specified in the manual change
    if (manualChange.action && manualChange.action.includes('add Fish Hoek')) {
      if (!listing.collectionAreas) {
        listing.collectionAreas = [];
      }
      listing.collectionAreas.push('Fish Hoek');
      console.log(`Adding Fish Hoek to collection areas for: ${manualChange.text.substring(0, 50)}...`);
    }

    // Update condition if specified in the manual change
    if (manualChange.condition && (!listing.condition || listing.condition === 'UNKNOWN')) {
      console.log(`Updating condition for listing: ${manualChange.text.substring(0, 50)}...`);
      listing.condition = manualChange.condition;
    }
  }
});

// Save the updated listings
const outputPath = path.join(__dirname, 'src/data/extracted-listings-updated.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedListings, null, 2), 'utf8');

console.log(`Updated ${updatedListings.length} listings (removed ${listings.length - updatedListings.length})`);

// Generate statistics
const withPrice = updatedListings.filter(listing => listing.price !== null).length;
const withIso = updatedListings.filter(listing => listing.iso === true).length;

console.log(`Listings with price: ${withPrice} (${(withPrice / updatedListings.length * 100).toFixed(0)}%)`);
console.log(`Listings with ISO flag: ${withIso}`);

// Save the final cleaned listings
const finalPath = path.join(__dirname, 'src/data/final-cleaned-listings.json');
fs.writeFileSync(finalPath, JSON.stringify(updatedListings, null, 2), 'utf8');

console.log(`Saved final cleaned listings to ${finalPath}`);

// Count listings by condition
const conditionCounts = {};
updatedListings.forEach(listing => {
  const condition = listing.condition || 'UNKNOWN';
  conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
});

console.log(`Listings with condition: ${updatedListings.length - (conditionCounts.UNKNOWN || 0)} (${Math.round((updatedListings.length - (conditionCounts.UNKNOWN || 0)) / updatedListings.length * 100)}%)`);

// Count listings with collection areas
const withCollectionAreas = updatedListings.filter(listing => listing.collectionAreas && listing.collectionAreas.length > 0);
console.log(`Listings with collection areas: ${withCollectionAreas.length} (${Math.round(withCollectionAreas.length / updatedListings.length * 100)}%)`);

// Count listings by group
const groupCounts = {};
updatedListings.forEach(listing => {
  const group = listing.whatsappGroup;
  groupCounts[group] = (groupCounts[group] || 0) + 1;
});

console.log('\nListings by group:');
Object.entries(groupCounts).forEach(([group, count]) => {
  console.log(`- ${group}: ${count} listings`);
}); 