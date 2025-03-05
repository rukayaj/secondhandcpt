import fs from 'fs';
import path from 'path';
import { combineListings, deduplicateListings } from '../utils/combineListings';
import { Listing } from '../utils/sampleData.public';

// Import the original sample listings
import { sampleListings as originalListings } from '../utils/sampleData.deduplicated';

// Constants
const OUTPUT_PATH = path.resolve(__dirname, '..', 'utils', 'combinedListings.ts');
const WHATSAPP_EXPORTS_DIR = path.resolve(__dirname, '..', 'data', 'whatsapp-exports');

/**
 * Combine all available listings from different sources
 */
async function combineAllListings() {
  try {
    // Initialize sources object with original listings
    const sources: Record<string, Listing[]> = {
      'original': originalListings
    };
    
    // Check if WhatsApp exports directory exists
    if (fs.existsSync(WHATSAPP_EXPORTS_DIR)) {
      // Get all listing files in the WhatsApp exports directory
      const files = fs.readdirSync(WHATSAPP_EXPORTS_DIR);
      const listingFiles = files.filter(file => file.endsWith('.listings.ts'));
      
      console.log(`Found ${listingFiles.length} WhatsApp listing files`);
      
      // Import each listing file
      for (const file of listingFiles) {
        const groupName = file.replace('.listings.ts', '');
        try {
          // Dynamic import of the listings file
          const filePath = path.join(WHATSAPP_EXPORTS_DIR, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          
          // Extract the listings array from the file content
          const match = fileContent.match(/const listings: Listing\[\] = (\[[\s\S]*\]);/);
          if (match && match[1]) {
            const listingsJson = match[1];
            const listings = JSON.parse(listingsJson);
            
            // Add to sources
            sources[groupName] = listings;
            console.log(`Imported ${listings.length} listings from ${groupName}`);
          } else {
            console.warn(`Could not extract listings from ${file}`);
          }
        } catch (error) {
          console.error(`Error importing listings from ${file}:`, error);
        }
      }
    } else {
      console.warn(`WhatsApp exports directory not found at ${WHATSAPP_EXPORTS_DIR}`);
    }
    
    // Combine all listings
    console.log('\nCombining listings from all sources...');
    const combinedListings = combineListings(sources);
    
    // Deduplicate listings
    console.log('\nDeduplicating combined listings...');
    const deduplicatedListings = deduplicateListings(combinedListings, {
      textSimilarityThreshold: 0.8,
      timeDifferenceThreshold: 48 * 60 * 60 * 1000, // 48 hours
      ignoreCase: true
    });
    
    // Write the combined listings to a file
    const outputContent = `
import { Listing } from './sampleData.public';

/**
 * Combined listings from all sources
 * Total listings: ${deduplicatedListings.length}
 * Generated on: ${new Date().toISOString()}
 * 
 * Sources:
 * ${Object.entries(sources)
      .map(([name, listings]) => `* - ${name}: ${listings.length} listings`)
      .join('\n * ')}
 */
const combinedListings: Listing[] = ${JSON.stringify(deduplicatedListings, null, 2)};

export default combinedListings;
`;
    
    fs.writeFileSync(OUTPUT_PATH, outputContent);
    console.log(`\nSuccessfully wrote ${deduplicatedListings.length} combined listings to ${OUTPUT_PATH}`);
    
  } catch (error) {
    console.error('Error combining listings:', error);
    process.exit(1);
  }
}

// Run the script
combineAllListings().catch(console.error); 