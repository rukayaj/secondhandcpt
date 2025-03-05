import fs from 'fs';
import path from 'path';
import { newListings } from './newListings';

/**
 * This utility script merges the listings from newListings.ts into sampleData.ts
 * It reads the current sampleData.ts file, finds the closing bracket,
 * and inserts the new listings before it.
 */

// Read the current sampleData.ts file
const sampleDataPath = path.join(__dirname, 'sampleData.ts');
const sampleDataContent = fs.readFileSync(sampleDataPath, 'utf8');

// Find the position of the last closing bracket
const lastBracketIndex = sampleDataContent.lastIndexOf('];');

if (lastBracketIndex === -1) {
  console.error('Could not find the closing bracket in sampleData.ts');
  process.exit(1);
}

// Create the new listings string
const newListingsString = newListings
  .map(listing => {
    return `  {
    "id": "${listing.id}",
    "date": "${listing.date}",
    "sender": "${listing.sender}",
    "text": ${JSON.stringify(listing.text)},
    "images": ${JSON.stringify(listing.images)},
    "price": ${listing.price},
    "condition": "${listing.condition}",
    "size": ${listing.size ? `"${listing.size}"` : 'null'},
    "location": ${listing.location ? `"${listing.location}"` : 'null'},
    "category": "${listing.category}",
    "isISO": ${listing.isISO}
  }`;
  })
  .join(',\n');

// Insert the new listings before the closing bracket
const updatedContent = 
  sampleDataContent.slice(0, lastBracketIndex) + 
  (sampleDataContent[lastBracketIndex - 1] === '}' ? ',\n' : '') +
  newListingsString + 
  sampleDataContent.slice(lastBracketIndex);

// Write the updated content back to sampleData.ts
fs.writeFileSync(sampleDataPath, updatedContent, 'utf8');

console.log(`Successfully merged ${newListings.length} new listings into sampleData.ts`); 