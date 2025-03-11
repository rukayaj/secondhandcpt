const fs = require('fs');
const path = require('path');

// Path to the duplicate images JSON file
const duplicatesPath = path.join(__dirname, 'duplicate-images.json');
// Path to the sanitized data file
const dataFilePath = path.join(__dirname, '../src/utils/sampleData.sanitized.ts');

// Read the duplicates file
const duplicates = JSON.parse(fs.readFileSync(duplicatesPath, 'utf8'));

console.log(`Found ${duplicates.length} sets of duplicate listings`);

// Read the data file
let dataFileContent = fs.readFileSync(dataFilePath, 'utf8');

// Extract the start and end of the listings array
const startMarker = 'export const sampleListings: Listing[] = [';
const endMarker = '];';
const startIndex = dataFileContent.indexOf(startMarker) + startMarker.length;
const endIndex = dataFileContent.lastIndexOf(endMarker);

// Extract the array content
const arrayContent = dataFileContent.substring(startIndex, endIndex);

// For each set of duplicates, keep only the first listing
const listingsToRemove = new Set();

duplicates.forEach(duplicate => {
  const { image, listingIds } = duplicate;
  
  // Keep the first listing, remove the rest
  const idsToRemove = listingIds.slice(1);
  idsToRemove.forEach(id => listingsToRemove.add(id));
  
  console.log(`For image ${image}, keeping listing ${listingIds[0]} and removing ${idsToRemove.join(', ')}`);
});

console.log(`\nTotal listings to remove: ${listingsToRemove.size}`);

// Create a backup of the original file
const backupPath = `${dataFilePath}.backup`;
fs.writeFileSync(backupPath, dataFileContent);
console.log(`Created backup at ${backupPath}`);

// Process the file to remove duplicate listings
let newArrayContent = arrayContent;
let removedCount = 0;

// Sort IDs in descending order to avoid position shifts when removing
const sortedIdsToRemove = Array.from(listingsToRemove).sort((a, b) => parseInt(b) - parseInt(a));

for (const id of sortedIdsToRemove) {
  // Find the listing with this ID
  const listingRegex = new RegExp(`(\\s*\\{[^{]*?"id":\\s*"${id}"[^}]*?\\}),?`, 'gs');
  const match = listingRegex.exec(newArrayContent);
  
  if (match) {
    // Remove the listing
    newArrayContent = newArrayContent.replace(match[0], '');
    removedCount++;
  }
}

// Create the new file content
const newFileContent = dataFileContent.substring(0, startIndex) + newArrayContent + dataFileContent.substring(endIndex);

// Write the new file
const outputPath = `${dataFilePath}.deduplicated`;
fs.writeFileSync(outputPath, newFileContent);

console.log(`\nRemoved ${removedCount} duplicate listings`);
console.log(`New file written to ${outputPath}`);
console.log('\nTo apply these changes:');
console.log(`1. Review the changes in ${outputPath}`);
console.log(`2. If satisfied, run: cp ${outputPath} ${dataFilePath}`);
console.log(`3. If not, the original file is backed up at ${backupPath}`); 