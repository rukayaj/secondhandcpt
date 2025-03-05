import { sampleListings } from '../utils/sampleData';
import { findDuplicates } from '../utils/parser';
import * as fs from 'fs';
import * as path from 'path';

// Find duplicates
const { duplicates, uniqueListings } = findDuplicates(sampleListings);

console.log(`Found ${duplicates.length} sets of duplicates in ${sampleListings.length} total listings`);
console.log(`After removing duplicates: ${uniqueListings.length} unique listings\n`);

// Log some information about the duplicates
duplicates.forEach(({ original, duplicates }) => {
  console.log(`Original (ID: ${original.id}):`);
  console.log(`Text: ${original.text.substring(0, 50)}${original.text.length > 50 ? '...' : ''}`);
  console.log(`Duplicates: ${duplicates.length} (IDs: ${duplicates.map(d => d.id).join(', ')})`);
  console.log('---');
});

// Create the new sample data file content
const fileContent = `import { Listing } from './parser';

// Deduplicated listings
export const sampleListings: Listing[] = ${JSON.stringify(uniqueListings, null, 2)};

// Generate categories with counts
export const sampleCategories = Object.entries(
  countBy(sampleListings, 'category')
).map(([name, count]) => ({ name, count }))
  .filter(cat => cat.name !== 'null')
  .sort((a, b) => b.count - a.count);

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

// Generate unique locations
export const sampleLocations = Array.from(new Set(
  sampleListings
    .map(listing => listing.location)
    .filter(location => location !== null && location !== undefined)
))
  .sort();
`;

// Ask for confirmation before writing
console.log(`\nReady to write ${uniqueListings.length} deduplicated listings to a new file.`);
console.log('This will create a new file called sampleData.deduplicated.ts');
console.log('You can then manually replace the original sampleData.ts with this file if you are satisfied with the results.');

// Write to a new file
const outputPath = path.join(__dirname, '../utils/sampleData.deduplicated.ts');
fs.writeFileSync(outputPath, fileContent);
console.log(`\nWrote deduplicated listings to ${outputPath}`); 