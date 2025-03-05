import fs from 'fs';
import path from 'path';
import parseWhatsAppChat from '../utils/whatsAppParser';

// Constants
const GROUP_NAME = 'nifty-thrifty-0-1-years';
const SANITIZED_CHAT_PATH = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.ts`);
const OUTPUT_LISTINGS_PATH = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.listings.ts`);

/**
 * Process the WhatsApp chat export and generate a listings file
 */
async function processWhatsAppChat() {
  try {
    // Check if the sanitized chat file exists
    if (!fs.existsSync(SANITIZED_CHAT_PATH)) {
      console.error(`Error: Sanitized chat file not found at ${SANITIZED_CHAT_PATH}`);
      console.log('Please run the importNiftyThrifty01Years.ts script first to generate the sanitized chat file.');
      process.exit(1);
    }

    // Read the sanitized chat content
    const chatContent = fs.readFileSync(SANITIZED_CHAT_PATH, 'utf-8');
    
    // Extract the actual chat content from the TypeScript file
    // The file should export a string like: export default `...chat content...`;
    const chatMatch = chatContent.match(/export default `([\s\S]*)`/);
    if (!chatMatch || !chatMatch[1]) {
      console.error('Error: Could not extract chat content from the sanitized file.');
      process.exit(1);
    }
    
    const extractedChatContent = chatMatch[1];
    
    // Parse the chat content into listings
    console.log(`Parsing WhatsApp chat for group: ${GROUP_NAME}`);
    const listings = parseWhatsAppChat(extractedChatContent, GROUP_NAME);
    
    console.log(`Successfully parsed ${listings.length} listings from the chat.`);
    
    // Generate statistics
    const categoryCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const conditionCounts: Record<string, number> = {};
    const sizeCounts: Record<string, number> = {};
    const priceRanges: Record<string, number> = {
      'Under R100': 0,
      'R100 - R250': 0,
      'R250 - R500': 0,
      'R500 - R1000': 0,
      'R1000+': 0,
      'No Price': 0
    };
    
    listings.forEach(listing => {
      // Count categories
      if (listing.category) {
        categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
      } else {
        categoryCounts['Uncategorized'] = (categoryCounts['Uncategorized'] || 0) + 1;
      }
      
      // Count locations
      if (listing.location) {
        locationCounts[listing.location] = (locationCounts[listing.location] || 0) + 1;
      } else {
        locationCounts['Unknown'] = (locationCounts['Unknown'] || 0) + 1;
      }
      
      // Count conditions
      if (listing.condition) {
        conditionCounts[listing.condition] = (conditionCounts[listing.condition] || 0) + 1;
      } else {
        conditionCounts['Unknown'] = (conditionCounts['Unknown'] || 0) + 1;
      }
      
      // Count sizes
      if (listing.size) {
        sizeCounts[listing.size] = (sizeCounts[listing.size] || 0) + 1;
      } else {
        sizeCounts['Unknown'] = (sizeCounts['Unknown'] || 0) + 1;
      }
      
      // Count price ranges
      if (listing.price === null || listing.price === undefined) {
        priceRanges['No Price']++;
      } else if (listing.price < 100) {
        priceRanges['Under R100']++;
      } else if (listing.price < 250) {
        priceRanges['R100 - R250']++;
      } else if (listing.price < 500) {
        priceRanges['R250 - R500']++;
      } else if (listing.price < 1000) {
        priceRanges['R500 - R1000']++;
      } else {
        priceRanges['R1000+']++;
      }
    });
    
    // Log statistics
    console.log('\n--- Statistics ---');
    console.log('Categories:');
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    console.log('\nLocations:');
    Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([location, count]) => {
        console.log(`  ${location}: ${count}`);
      });
    
    console.log('\nConditions:');
    Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([condition, count]) => {
        console.log(`  ${condition}: ${count}`);
      });
    
    console.log('\nPrice Ranges:');
    Object.entries(priceRanges)
      .forEach(([range, count]) => {
        console.log(`  ${range}: ${count}`);
      });
    
    // Write the listings to a file
    const outputContent = `
import { Listing } from '../../utils/sampleData.public';

/**
 * Listings parsed from the ${GROUP_NAME} WhatsApp group
 * Total listings: ${listings.length}
 * Generated on: ${new Date().toISOString()}
 */
const listings: Listing[] = ${JSON.stringify(listings, null, 2)};

export default listings;
`;
    
    fs.writeFileSync(OUTPUT_LISTINGS_PATH, outputContent);
    console.log(`\nSuccessfully wrote ${listings.length} listings to ${OUTPUT_LISTINGS_PATH}`);
    
  } catch (error) {
    console.error('Error processing WhatsApp chat:', error);
    process.exit(1);
  }
}

// Run the script
processWhatsAppChat().catch(console.error); 