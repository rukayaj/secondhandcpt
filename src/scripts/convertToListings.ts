import fs from 'fs';
import path from 'path';
import { Listing } from '../utils/sampleData.public';

// Define the WhatsAppListing interface here instead of importing it
interface WhatsAppListing {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  price: number | null;
  hasMedia: boolean;
}

/**
 * Convert WhatsApp messages to actual listings
 * @param inputFilePath Path to the extracted WhatsApp messages file
 * @param outputFilePath Path to save the converted listings
 */
async function convertToListings(
  inputFilePath: string,
  outputFilePath: string
): Promise<void> {
  try {
    // Read the file directly instead of importing it
    const fileContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Extract the listings array using regex
    const listingsMatch = fileContent.match(/export const \w+Listings: WhatsAppListing\[\] = (\[[\s\S]*\]);/);
    if (!listingsMatch || !listingsMatch[1]) {
      throw new Error('Could not extract listings from the file');
    }
    
    // Parse the listings
    const whatsAppListings: WhatsAppListing[] = JSON.parse(listingsMatch[1]);
    
    console.log(`Found ${whatsAppListings.length} WhatsApp messages`);
    
    // Filter out non-listing messages
    const listingMessages = whatsAppListings.filter((message: WhatsAppListing) => {
      // Skip short replies
      if (message.message.length < 20) return false;
      
      // Skip common non-listing messages
      const lowerMessage = message.message.toLowerCase();
      if (
        lowerMessage.startsWith('yes') ||
        lowerMessage.startsWith('no') ||
        lowerMessage.startsWith('ok') ||
        lowerMessage.startsWith('thanks') ||
        lowerMessage.startsWith('great') ||
        lowerMessage.startsWith('cool') ||
        lowerMessage.startsWith('nice') ||
        lowerMessage.startsWith('sure') ||
        lowerMessage.startsWith('dm') ||
        lowerMessage.startsWith('pm') ||
        lowerMessage.startsWith('interested')
      ) return false;
      
      // Include messages with prices or specific keywords
      return (
        message.price !== null ||
        lowerMessage.includes('selling') ||
        lowerMessage.includes('sale') ||
        lowerMessage.includes('iso') ||
        lowerMessage.includes('in search of') ||
        lowerMessage.includes('looking for')
      );
    });
    
    console.log(`Filtered to ${listingMessages.length} potential listings`);
    
    // Convert to Listing objects
    const listings: Listing[] = listingMessages.map((message: WhatsAppListing) => {
      // Extract location
      let location: string | null = null;
      const locationMatch = message.message.match(/(?:located|location|pickup|pick up|collect|available)(?:\s+in|\s+at|\s+from)?\s+([A-Za-z\s]+(?:Point|Town|Park|Heights|Village|Estate|Bay|View|Gardens|Hills|Valley))/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
      } else {
        // Try to find common Cape Town locations
        const commonLocations = [
          'Claremont', 'Sea Point', 'Green Point', 'Observatory', 'Woodstock', 
          'Rondebosch', 'Newlands', 'Constantia', 'Camps Bay', 'Hout Bay',
          'Muizenberg', 'Kalk Bay', 'Fish Hoek', 'Simon\'s Town', 'Noordhoek',
          'Table View', 'Blouberg', 'Milnerton', 'Century City', 'Durbanville',
          'Bellville', 'Parow', 'Goodwood', 'Pinelands', 'Mowbray',
          'Cape Town CBD', 'CBD', 'Gardens', 'Tamboerskloof', 'Bo-Kaap'
        ];
        
        // Check for each location in the message
        for (const loc of commonLocations) {
          if (message.message.includes(loc)) {
            location = loc;
            break;
          }
        }
      }
      
      // Determine if it's an ISO post
      const isISO = message.message.toLowerCase().includes('iso') || 
                    message.message.toLowerCase().includes('in search of') ||
                    message.message.toLowerCase().includes('looking for');
      
      // Extract condition
      let condition: string | null = null;
      if (message.message.toLowerCase().includes('new') || message.message.toLowerCase().includes('never used')) {
        condition = 'New';
      } else if (message.message.toLowerCase().includes('excellent condition') || message.message.toLowerCase().includes('like new')) {
        condition = 'Like New';
      } else if (message.message.toLowerCase().includes('good condition')) {
        condition = 'Good';
      } else if (message.message.toLowerCase().includes('fair condition') || message.message.toLowerCase().includes('used')) {
        condition = 'Fair';
      }
      
      // Extract size
      let size: string | null = null;
      const sizeMatch = message.message.match(/\b(\d+\s*-\s*\d+\s*months|\d+\s*months|\d+\s*years|\d+\s*y\/o|newborn|preemie|premature|tiny baby|first size)\b/i);
      if (sizeMatch && sizeMatch[1]) {
        size = sizeMatch[1].trim();
      }
      
      // Determine category
      let category: string | null = null;
      const lowerMessage = message.message.toLowerCase();
      
      if (lowerMessage.includes('clothes') || lowerMessage.includes('clothing') || lowerMessage.includes('outfit') || lowerMessage.includes('wear')) {
        category = 'Clothing';
      } else if (lowerMessage.includes('toy') || lowerMessage.includes('play')) {
        category = 'Toys';
      } else if (lowerMessage.includes('cot') || lowerMessage.includes('crib') || lowerMessage.includes('bed') || lowerMessage.includes('chair') || lowerMessage.includes('table')) {
        category = 'Furniture';
      } else if (lowerMessage.includes('shoe') || lowerMessage.includes('boot') || lowerMessage.includes('sandal')) {
        category = 'Footwear';
      } else if (lowerMessage.includes('stroller') || lowerMessage.includes('pram') || lowerMessage.includes('carrier') || lowerMessage.includes('car seat')) {
        category = 'Gear';
      } else if (lowerMessage.includes('bottle') || lowerMessage.includes('feeding') || lowerMessage.includes('food') || lowerMessage.includes('bib')) {
        category = 'Feeding';
      }
      
      // Create the listing object
      return {
        id: message.id,
        date: (() => {
          try {
            // Parse the date in DD/MM/YY format and convert to YYYY-MM-DD
            const dateParts = message.date.split('/');
            // Ensure we have a 4-digit year (assuming 20xx for 2-digit years)
            const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
            const formattedDate = `${year}-${dateParts[1]}-${dateParts[0]}`;
            
            // Create a date object and validate it
            const dateObj = new Date(`${formattedDate}T${message.time}`);
            
            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
              // If invalid, use current date as fallback
              return new Date().toISOString();
            }
            
            return dateObj.toISOString();
          } catch (error) {
            console.warn(`Invalid date format for message ${message.id}: ${message.date} ${message.time}`);
            // Return current date as fallback
            return new Date().toISOString();
          }
        })(),
        sender: message.phoneNumber,
        text: message.message,
        images: message.images,
        price: message.price,
        condition,
        size,
        location,
        category,
        isISO
      } as Listing;
    });
    
    console.log(`Converted ${listings.length} listings`);
    
    // Write the listings to the output file
    const outputContent = `// Generated from WhatsApp messages: ${path.basename(inputFilePath)}
// Generated on: ${new Date().toISOString()}
// Total listings: ${listings.length}

import { Listing } from '../../utils/sampleData.public';

export const niftyThrifty01YearsListings: Listing[] = ${JSON.stringify(listings, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error converting to listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node convertToListings.ts <inputFilePath> <outputFilePath>');
    process.exit(1);
  }
  
  const [inputFilePath, outputFilePath] = args;
  
  convertToListings(inputFilePath, outputFilePath)
    .then(() => console.log('Conversion complete!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default convertToListings; 