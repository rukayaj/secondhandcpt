const fs = require('fs');
const path = require('path');

// Get all image files in the listings directory
const imagesDir = path.join(__dirname, '../public/images/listings');
const imageFiles = fs.readdirSync(imagesDir);

console.log(`Found ${imageFiles.length} image files in the listings directory`);

// Create a map to track which images are used in which listings
const imageUsage = {};

// Read the sanitized data file as a string
const dataFilePath = path.join(__dirname, '../src/utils/sampleData.sanitized.ts');
const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');

// Extract listing IDs and their associated images using regex
const listingRegex = /"id":\s*"(\d+)"[^}]*?"images":\s*\[(.*?)\]/gs;
let match;
let listingCount = 0;

while ((match = listingRegex.exec(dataFileContent)) !== null) {
  listingCount++;
  const listingId = match[1];
  const imagesString = match[2];
  
  // Extract image paths from the images array
  const imagePathRegex = /"([^"]+)"/g;
  let imageMatch;
  
  while ((imageMatch = imagePathRegex.exec(imagesString)) !== null) {
    const imagePath = imageMatch[1];
    const imageFilename = path.basename(imagePath);
    
    if (!imageUsage[imageFilename]) {
      imageUsage[imageFilename] = [];
    }
    
    imageUsage[imageFilename].push(listingId);
  }
}

console.log(`Processed ${listingCount} listings`);

// Find images used in multiple listings
const duplicateImages = Object.entries(imageUsage)
  .filter(([_, listingIds]) => listingIds.length > 1)
  .sort((a, b) => b[1].length - a[1].length); // Sort by number of usages (descending)

console.log(`Found ${duplicateImages.length} images used in multiple listings`);

if (duplicateImages.length > 0) {
  console.log('\nImages used in multiple listings:');
  
  duplicateImages.forEach(([imageFilename, listingIds]) => {
    console.log(`\nImage: ${imageFilename}`);
    console.log(`Used in ${listingIds.length} listings: ${listingIds.join(', ')}`);
    
    // Extract and display snippets of the listings
    listingIds.forEach(id => {
      const listingRegex = new RegExp(`"id":\\s*"${id}"[^}]*?"text":\\s*"([^"]*)"`, 'g');
      const listingMatch = listingRegex.exec(dataFileContent);
      
      if (listingMatch) {
        const text = listingMatch[1].replace(/\\n/g, ' ').substring(0, 100);
        console.log(`  Listing ${id}: ${text}${text.length >= 100 ? '...' : ''}`);
      }
    });
  });
  
  // Write the results to a file
  const outputPath = path.join(__dirname, 'duplicate-images.json');
  fs.writeFileSync(
    outputPath, 
    JSON.stringify(
      duplicateImages.map(([imageFilename, listingIds]) => ({
        image: imageFilename,
        listingIds
      })),
      null, 
      2
    )
  );
  console.log(`\nDetailed results written to ${outputPath}`);
} 