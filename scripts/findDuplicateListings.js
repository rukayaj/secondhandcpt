const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to the data file
const DATA_FILE_PATH = path.join(__dirname, '../src/utils/sampleData.sanitized.ts');

// Function to read the data file and extract listings
async function readListings() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    
    // Extract the array content between the markers
    const startMarker = 'export const sampleListings: Listing[] = [';
    const endMarker = '];';
    
    const startIndex = fileContent.indexOf(startMarker) + startMarker.length;
    const endIndex = fileContent.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not find the listings array in the file');
    }
    
    const arrayContent = fileContent.substring(startIndex, endIndex);
    
    // Parse the array content
    // We'll use a simple approach to convert the TypeScript array to valid JSON
    const jsonArrayString = '[' + 
      arrayContent
        .replace(/,(\s*})/g, '$1') // Remove trailing commas after objects
        .replace(/,(\s*\])/g, '$1') // Remove trailing commas after arrays
        .replace(/\/\/.*/g, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    + ']';
    
    try {
      return JSON.parse(jsonArrayString);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError.message);
      console.error('First 100 characters of processed string:', jsonArrayString.substring(0, 100));
      throw parseError;
    }
  } catch (error) {
    console.error('Error reading listings:', error.message);
    // Fallback to a simpler approach - create a temporary file with just the array
    const tempFilePath = path.join(__dirname, 'temp-listings.js');
    fs.writeFileSync(
      tempFilePath,
      `module.exports = ${fs.readFileSync(DATA_FILE_PATH, 'utf8')
        .replace('import { Listing } from \'./parser\';', '')
        .replace('export const sampleListings: Listing[] =', 'return')
      }`
    );
    
    try {
      const tempModule = require('./temp-listings.js');
      const listings = tempModule();
      fs.unlinkSync(tempFilePath); // Clean up
      return listings;
    } catch (tempError) {
      console.error('Error with fallback approach:', tempError.message);
      throw tempError;
    }
  }
}

// Function to find potential duplicates based on text similarity and other attributes
function findPotentialDuplicates(listings) {
  const potentialDuplicates = [];
  
  for (let i = 0; i < listings.length; i++) {
    for (let j = i + 1; j < listings.length; j++) {
      const listing1 = listings[i];
      const listing2 = listings[j];
      
      // Skip if they don't have the same category or similar price
      if (listing1.category !== listing2.category) continue;
      
      // If both have prices, check if they're similar
      if (listing1.price && listing2.price) {
        const priceDiff = Math.abs(listing1.price - listing2.price);
        const priceThreshold = Math.max(listing1.price, listing2.price) * 0.1; // 10% difference
        
        if (priceDiff > priceThreshold) continue;
      }
      
      // Check for image path similarity
      let hasCommonImage = false;
      if (listing1.images && listing2.images) {
        // Extract the image filenames without paths
        const images1 = listing1.images.map(img => path.basename(img));
        const images2 = listing2.images.map(img => path.basename(img));
        
        // Check if any image filenames match
        for (const img1 of images1) {
          if (images2.includes(img1)) {
            hasCommonImage = true;
            break;
          }
        }
      }
      
      // Check for text similarity
      const textSimilarity = calculateTextSimilarity(listing1.text, listing2.text);
      
      // If they have a common image or high text similarity, consider them potential duplicates
      if (hasCommonImage || textSimilarity > 0.7) {
        potentialDuplicates.push({
          listing1: {
            id: listing1.id,
            text: listing1.text,
            category: listing1.category,
            price: listing1.price,
            images: listing1.images
          },
          listing2: {
            id: listing2.id,
            text: listing2.text,
            category: listing2.category,
            price: listing2.price,
            images: listing2.images
          },
          similarity: textSimilarity,
          hasCommonImage
        });
      }
    }
  }
  
  // Sort by similarity (highest first)
  potentialDuplicates.sort((a, b) => {
    // Prioritize listings with common images
    if (a.hasCommonImage && !b.hasCommonImage) return -1;
    if (!a.hasCommonImage && b.hasCommonImage) return 1;
    
    // Then sort by text similarity
    return b.similarity - a.similarity;
  });
  
  return potentialDuplicates;
}

// Function to calculate text similarity using Jaccard similarity of words
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Normalize and tokenize the texts
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  
  // Calculate intersection
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  
  // Calculate union
  const union = new Set([...words1, ...words2]);
  
  // Calculate Jaccard similarity
  return intersection.size / union.size;
}

// Main function to find duplicate listings
async function findDuplicateListings() {
  console.log('Reading listings...');
  const listings = await readListings();
  console.log(`Found ${listings.length} listings`);
  
  // Find potential duplicates
  console.log('Finding potential duplicates...');
  const potentialDuplicates = findPotentialDuplicates(listings);
  
  // Output the results
  console.log(`Found ${potentialDuplicates.length} potential duplicate pairs`);
  
  if (potentialDuplicates.length > 0) {
    console.log('\nPotential duplicates:');
    potentialDuplicates.forEach((pair, index) => {
      console.log(`\nDuplicate pair #${index + 1} (similarity: ${pair.similarity.toFixed(2)}, common image: ${pair.hasCommonImage}):`);
      console.log(`Listing 1 (ID: ${pair.listing1.id}):`);
      console.log(`  Category: ${pair.listing1.category}`);
      console.log(`  Price: ${pair.listing1.price}`);
      console.log(`  Text: ${pair.listing1.text.substring(0, 100)}${pair.listing1.text.length > 100 ? '...' : ''}`);
      console.log(`  Images: ${pair.listing1.images.join(', ')}`);
      
      console.log(`Listing 2 (ID: ${pair.listing2.id}):`);
      console.log(`  Category: ${pair.listing2.category}`);
      console.log(`  Price: ${pair.listing2.price}`);
      console.log(`  Text: ${pair.listing2.text.substring(0, 100)}${pair.listing2.text.length > 100 ? '...' : ''}`);
      console.log(`  Images: ${pair.listing2.images.join(', ')}`);
    });
    
    // Write the results to a file
    const outputPath = path.join(__dirname, 'duplicate-listings.json');
    fs.writeFileSync(outputPath, JSON.stringify(potentialDuplicates, null, 2));
    console.log(`\nDetailed results written to ${outputPath}`);
  }
}

// Run the script
findDuplicateListings().catch(error => {
  console.error('Error:', error);
}); 