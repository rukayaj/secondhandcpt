import fs from 'fs';
import path from 'path';
import { Listing } from '../utils/sampleData.public';

/**
 * Import listings from various sources into the main application
 * This script combines listings from different sources into a single file
 * that can be used by the application
 */
async function importListingsToApp(): Promise<void> {
  try {
    console.log('Importing listings to application...');
    
    // Define paths
    const outputPath = path.resolve(process.cwd(), 'src', 'utils', 'combinedListings.ts');
    const niftyThriftyPath = path.resolve(process.cwd(), 'src', 'data', 'listings', 'nifty-thrifty-0-1-years.ts');
    
    // Import the nifty-thrifty listings
    console.log(`Importing listings from: ${niftyThriftyPath}`);
    
    // Read the file content
    const fileContent = await fs.promises.readFile(niftyThriftyPath, 'utf-8');
    
    // Extract the listings array using regex
    const listingsMatch = fileContent.match(/export const \w+Listings: Listing\[\] = (\[[\s\S]*\]);/);
    if (!listingsMatch || !listingsMatch[1]) {
      throw new Error('Could not extract listings from the file');
    }
    
    // Parse the listings
    const niftyThriftyListings: Listing[] = JSON.parse(listingsMatch[1]);
    
    console.log(`Found ${niftyThriftyListings.length} listings from nifty-thrifty-0-1-years`);
    
    // Combine all listings
    const allListings = [...niftyThriftyListings];
    
    console.log(`Total combined listings: ${allListings.length}`);
    
    // Write the combined listings to the output file
    const outputContent = `// Generated combined listings file
// Generated on: ${new Date().toISOString()}
// Total listings: ${allListings.length}

import { Listing } from './sampleData.public';

export const combinedListings: Listing[] = ${JSON.stringify(allListings, null, 2)};
`;
    
    await fs.promises.writeFile(outputPath, outputContent);
    console.log(`Output saved to: ${outputPath}`);
    
    console.log('Import complete!');
    console.log('Next steps:');
    console.log('1. Review the combined listings');
    console.log('2. Update your application to use the combined listings');
    
    return;
  } catch (error) {
    console.error('Error importing listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  importListingsToApp()
    .then(() => console.log('Import complete!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default importListingsToApp; 