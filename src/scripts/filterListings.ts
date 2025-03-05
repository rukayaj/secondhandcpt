import fs from 'fs';
import path from 'path';

// Define the interface for a raw WhatsApp message
interface RawWhatsAppMessage {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  priceValue: number | null;
}

interface ListingCandidate extends RawWhatsAppMessage {
  isListing: boolean;
  isISO: boolean;
}

/**
 * Filter raw WhatsApp messages to identify potential listings
 * @param inputFilePath Path to the raw WhatsApp messages file
 * @param outputFilePath Path to save the filtered listings
 */
async function filterListings(
  inputFilePath: string,
  outputFilePath: string
): Promise<void> {
  try {
    // Read the file content
    const fileContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Extract the array from the file content
    const arrayMatch = fileContent.match(/export const \w+Messages: RawWhatsAppMessage\[\] = (\[[\s\S]*\]);/);
    if (!arrayMatch || !arrayMatch[1]) {
      throw new Error('Could not extract messages array from the file');
    }
    
    // Parse the array
    const rawMessages: RawWhatsAppMessage[] = JSON.parse(arrayMatch[1]);
    
    if (!rawMessages || !rawMessages.length) {
      throw new Error('No messages found in the input file');
    }
    
    console.log(`Found ${rawMessages.length} raw messages`);
    
    // Regular expressions for identifying listings
    const sellingRegex = /\b(selling|sale|sell|available|for sale)\b/i;
    const isoRegex = /\b(iso|in search of|looking for)\b/i;
    const shortReplyRegex = /^(yes|no|ok|okay|thanks|thank you|great|cool|nice|sure|maybe|dm|pm|message|chat|call|text|interested|available|sold|pending|reserved|hi|hello|hey|thx|ty|👍|👋|🙏|😊)[\s\.,!]*$/i;
    const questionRegex = /^(is|are|does|do|can|could|would|will|has|have|had|was|were|should|may|might)[\s\w\.,!]*\?$/i;
    
    // Filter the messages to identify potential listings
    const listingCandidates: ListingCandidate[] = rawMessages.map(message => {
      const isISO = isoRegex.test(message.message);
      const isSelling = sellingRegex.test(message.message);
      const hasPrice = message.hasPrice;
      const isShortReply = shortReplyRegex.test(message.message);
      const isQuestion = questionRegex.test(message.message);
      
      // A message is a potential listing if:
      // 1. It's an ISO post, OR
      // 2. It mentions selling something, OR
      // 3. It has a price
      // AND it's not a short reply or a question
      const isListing = (isISO || isSelling || hasPrice) && !isShortReply && !isQuestion;
      
      return {
        ...message,
        isListing,
        isISO
      };
    });
    
    // Filter to only include potential listings
    const potentialListings = listingCandidates.filter(candidate => candidate.isListing);
    
    console.log(`Identified ${potentialListings.length} potential listings`);
    
    // Group by phone number to identify conversations
    const listingsByPhone: Record<string, ListingCandidate[]> = {};
    potentialListings.forEach(listing => {
      if (!listingsByPhone[listing.phoneNumber]) {
        listingsByPhone[listing.phoneNumber] = [];
      }
      listingsByPhone[listing.phoneNumber].push(listing);
    });
    
    console.log(`From ${Object.keys(listingsByPhone).length} unique phone numbers`);
    
    // Write the potential listings to the output file
    const outputContent = `// Generated from raw WhatsApp messages: ${path.basename(inputFilePath)}
// Generated on: ${new Date().toISOString()}
// Total potential listings: ${potentialListings.length}
// From ${Object.keys(listingsByPhone).length} unique phone numbers

export interface RawWhatsAppMessage {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  priceValue: number | null;
}

export interface ListingCandidate extends RawWhatsAppMessage {
  isListing: boolean;
  isISO: boolean;
}

export const potentialListings: ListingCandidate[] = ${JSON.stringify(potentialListings, null, 2)};

// Listings grouped by phone number
export const listingsByPhone: Record<string, ListingCandidate[]> = ${JSON.stringify(listingsByPhone, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error filtering listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node filterListings.ts <inputFilePath> <outputFilePath>');
    process.exit(1);
  }
  
  const [inputFilePath, outputFilePath] = args;
  filterListings(inputFilePath, outputFilePath)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default filterListings; 