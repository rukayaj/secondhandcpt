import fs from 'fs';
import path from 'path';

// Interface for extracted listings
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
 * Extract listings from a WhatsApp chat export
 * @param inputFilePath Path to the WhatsApp chat export file
 * @param outputFilePath Path to save the extracted listings
 * @param groupName Name of the WhatsApp group (used for ID generation)
 */
async function extractWhatsAppListings(
  inputFilePath: string,
  outputFilePath: string,
  groupName: string
): Promise<void> {
  try {
    // Read the chat content
    const chatContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Regular expressions for extraction
    const messageStartRegex = /\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)\]?\s*-?\s*([+\d\s]+):\s*(.*)/i;
    const imageRegex = /IMG-\d{8}-WA\d{4}\.jpg/g;
    const mediaOmittedRegex = /<Media omitted>|Media omitted/i;
    const priceRegex = /R\s*(\d+)/i;
    
    // Split the content by new message indicators
    // This regex looks for date/time patterns followed by phone numbers
    const messageBlocks = chatContent.split(/\n(?=\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?\]?\s*-?\s*[+\d\s]+:)/);
    
    const listings: WhatsAppListing[] = [];
    
    // Process each message block
    messageBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length === 0) return;
      
      // Extract header information from the first line
      const headerMatch = lines[0].match(messageStartRegex);
      if (!headerMatch) return;
      
      const [_, dateStr, timeStr, phoneNumber, firstMessageLine] = headerMatch;
      
      // Combine all lines of the message
      const messageLines = [firstMessageLine, ...lines.slice(1)];
      const fullMessage = messageLines.join('\n').trim();
      
      // Extract images
      const images: string[] = [];
      const imageMatches = fullMessage.match(imageRegex);
      if (imageMatches) {
        images.push(...imageMatches);
      }
      
      // Check for media omitted
      const hasMedia = mediaOmittedRegex.test(fullMessage);
      
      // Extract price
      let price: number | null = null;
      const priceMatch = fullMessage.match(priceRegex);
      if (priceMatch && priceMatch[1]) {
        price = parseInt(priceMatch[1], 10);
      }
      
      // Create listing object
      const listing: WhatsAppListing = {
        id: `${groupName}-${index + 1}`,
        date: dateStr,
        time: timeStr,
        phoneNumber,
        message: fullMessage,
        images,
        price,
        hasMedia
      };
      
      listings.push(listing);
    });
    
    console.log(`Extracted ${listings.length} messages from the chat`);
    
    // Write the listings to the output file
    const outputContent = `// Generated from WhatsApp chat export: ${path.basename(inputFilePath)}
// Group: ${groupName}
// Generated on: ${new Date().toISOString()}
// Total messages extracted: ${listings.length}

export interface WhatsAppListing {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  price: number | null;
  hasMedia: boolean;
}

export const ${groupName.replace(/[^a-zA-Z0-9]/g, '_')}Listings: WhatsAppListing[] = ${JSON.stringify(listings, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error extracting WhatsApp listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: ts-node extractWhatsAppListings.ts <inputFilePath> <outputFilePath> <groupName>');
    process.exit(1);
  }
  
  const [inputFilePath, outputFilePath, groupName] = args;
  
  extractWhatsAppListings(inputFilePath, outputFilePath, groupName)
    .then(() => console.log('Extraction complete!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default extractWhatsAppListings; 