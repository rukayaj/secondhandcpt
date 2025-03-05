import { sampleListings } from '../utils/sampleData';
import * as fs from 'fs';
import * as path from 'path';

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
  console.log(`Text: ${listing.text}`);
});

// Keep only the first listing (assuming it's the original)
const originalTeepee = teepeeBeds[0];
const duplicateIds = teepeeBeds.slice(1).map(listing => listing.id);

console.log(`\nKeeping original listing (ID: ${originalTeepee.id})`);
console.log(`Removing duplicate listings (IDs: ${duplicateIds.join(', ')})`);

// Create a new array without the duplicates
const deduplicatedListings = sampleListings.filter(listing => 
  !duplicateIds.includes(listing.id)
);

console.log(`\nRemoved ${sampleListings.length - deduplicatedListings.length} duplicate listings`);
console.log(`Original count: ${sampleListings.length}, New count: ${deduplicatedListings.length}`);

// Create the new sample data file content
const fileContent = `import { Listing } from './parser';

// Deduplicated listings
export const sampleListings: Listing[] = ${JSON.stringify(deduplicatedListings, null, 2)};

// Helper function to count occurrences by a property
const countBy = <T>(array: T[], key: keyof T): Record<string, number> => {
  return array.reduce((result: Record<string, number>, obj: T) => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      const valueStr = String(value);
      result[valueStr] = (result[valueStr] || 0) + 1;
    }
    return result;
  }, {});
};

// Generate categories with counts
export const sampleCategories = Object.entries(
  countBy(sampleListings, 'category')
).map(([name, count]) => ({ name, count }))
  .filter(cat => cat.name !== 'null')
  .sort((a, b) => b.count - a.count);

// Generate unique locations
export const sampleLocations = Array.from(new Set(
  sampleListings
    .map(listing => listing.location)
    .filter(location => location !== null && location !== undefined)
))
  .sort();
`;

// Write to a new file
const outputPath = path.join(__dirname, '../utils/sampleData.deduplicated.ts');
fs.writeFileSync(outputPath, fileContent);
console.log(`\nWrote deduplicated listings to ${outputPath}`);
console.log('You can manually replace the original sampleData.ts with this file if you are satisfied with the results.'); 