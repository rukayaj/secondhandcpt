import fs from 'fs';
import path from 'path';
import { niftyThrifty01YearsListings } from '../data/whatsapp-exports/nifty-thrifty-0-1-years-app';
import { Listing, sampleListings } from '../utils/sampleData.public';

/**
 * Integrate the nifty-thrifty listings into the application
 * This script will:
 * 1. Create a new file with combined listings
 * 2. Ensure there are no duplicate IDs
 * 3. Sort listings by date (newest first)
 */
async function integrateListings(): Promise<void> {
  try {
    // Ensure the listings have unique IDs
    const existingIds = new Set(sampleListings.map(listing => listing.id));
    
    // Modify the nifty-thrifty listings to ensure unique IDs
    const uniqueNiftyThriftyListings = niftyThrifty01YearsListings.map(listing => {
      // If the ID already exists in the sample listings, prefix it with 'nt-'
      if (existingIds.has(listing.id)) {
        return {
          ...listing,
          id: `nt-${listing.id}`
        };
      }
      return listing;
    });
    
    console.log(`Processed ${uniqueNiftyThriftyListings.length} nifty-thrifty listings`);
    
    // Combine the listings
    const combinedListings = [...sampleListings, ...uniqueNiftyThriftyListings];
    
    // Sort by date (newest first)
    combinedListings.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Combined ${combinedListings.length} listings (${sampleListings.length} sample + ${uniqueNiftyThriftyListings.length} nifty-thrifty)`);
    
    // Create a new file with the combined listings
    const outputPath = path.resolve(process.cwd(), 'src', 'utils', 'combinedListings.ts');
    
    const outputContent = `// Generated on: ${new Date().toISOString()}
// Combined listings from sampleListings and niftyThrifty01YearsListings
// Total listings: ${combinedListings.length}

import { Listing } from './sampleData.public';

export const combinedListings: Listing[] = ${JSON.stringify(combinedListings, null, 2)};
`;
    
    await fs.promises.writeFile(outputPath, outputContent);
    console.log(`Output saved to: ${outputPath}`);
    
    // Create a backup of the original sampleData.public.ts file
    const sampleDataPath = path.resolve(process.cwd(), 'src', 'utils', 'sampleData.public.ts');
    const backupPath = path.resolve(process.cwd(), 'src', 'utils', 'sampleData.public.backup.ts');
    
    await fs.promises.copyFile(sampleDataPath, backupPath);
    console.log(`Backup of original sampleData.public.ts saved to: ${backupPath}`);
    
    // Read the original sampleData.public.ts file
    const sampleDataContent = await fs.promises.readFile(sampleDataPath, 'utf-8');
    
    // Replace the sampleListings array with the combined listings
    const updatedSampleDataContent = sampleDataContent.replace(
      /export const sampleListings: Listing\[\] = \[[\s\S]*?\];/,
      `export const sampleListings: Listing[] = ${JSON.stringify(combinedListings, null, 2)};`
    );
    
    // Write the updated content back to the file
    await fs.promises.writeFile(sampleDataPath, updatedSampleDataContent);
    console.log(`Updated sampleData.public.ts with combined listings`);
    
    return;
  } catch (error) {
    console.error('Error integrating listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  integrateListings()
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default integrateListings; 