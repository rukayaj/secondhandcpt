import fs from 'fs';
import path from 'path';
import { ListingCandidate } from '../data/whatsapp-exports/nifty-thrifty-0-1-years-listings';

// Define the application's Listing interface
export interface Listing {
  id: string;
  date: string;
  sender: string;
  text: string;
  title?: string;
  images?: string[];
  price?: number | null;
  condition?: string | null;
  size?: string | null;
  location?: string | null;
  category?: string | null;
  isISO?: boolean;
}

/**
 * Extract location from a message
 * @param message The message text to extract location from
 * @returns The extracted location or null if not found
 */
function extractLocation(message: string): string | null {
  // Common location patterns
  const locationPatterns = [
    /\b(?:located|location|pickup|collect|available)(?:\s+in)?\s+([A-Za-z\s]+(?:Point|Town|Park|Heights|Village|Estate|Bay|View|Gardens|Hills|Valley|Beach|CBD|City|Centre|Center))\b/i,
    /\bin\s+([A-Za-z\s]+(?:Point|Town|Park|Heights|Village|Estate|Bay|View|Gardens|Hills|Valley|Beach|CBD|City|Centre|Center))\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract condition from a message
 * @param message The message text to extract condition from
 * @returns The extracted condition or null if not found
 */
function extractCondition(message: string): string | null {
  // Common condition patterns
  const conditionPatterns = [
    /\b(brand new|new with tags|nwt|excellent condition|good condition|fair condition|used condition|like new|gently used|barely used|well used|worn)\b/i,
  ];

  for (const pattern of conditionPatterns) {
    const match = message.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Extract size from a message
 * @param message The message text to extract size from
 * @returns The extracted size or null if not found
 */
function extractSize(message: string): string | null {
  // Common size patterns for baby items
  const sizePatterns = [
    /\b(newborn|preemie|premature|0-3\s*months?|3-6\s*months?|6-9\s*months?|9-12\s*months?|12-18\s*months?|18-24\s*months?|0-1\s*years?|1-2\s*years?|2-3\s*years?|3-4\s*years?|4-5\s*years?|5-6\s*years?|6-7\s*years?|7-8\s*years?|8-9\s*years?|9-10\s*years?|10-11\s*years?|11-12\s*years?|12-13\s*years?|13-14\s*years?|size\s+\d+|small|medium|large|xl|xxl)\b/i,
  ];

  for (const pattern of sizePatterns) {
    const match = message.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Extract category from a message
 * @param message The message text to extract category from
 * @returns The extracted category or null if not found
 */
function extractCategory(message: string): string | null {
  const messageLower = message.toLowerCase();
  
  // Define category keywords
  const categoryKeywords: Record<string, string[]> = {
    'Clothing': ['clothes', 'clothing', 'outfit', 'dress', 'pants', 'shirt', 'onesie', 'bodysuit', 'romper', 'sleepsuit', 'pajamas', 'pyjamas'],
    'Toys': ['toy', 'toys', 'play', 'game', 'puzzle', 'teddy', 'doll', 'stuffed', 'plush'],
    'Furniture': ['furniture', 'cot', 'crib', 'bed', 'chair', 'table', 'dresser', 'wardrobe', 'storage'],
    'Strollers': ['stroller', 'pram', 'buggy', 'pushchair', 'travel system'],
    'Car Seats': ['car seat', 'carseat', 'isofix', 'booster'],
    'Feeding': ['bottle', 'feeding', 'highchair', 'high chair', 'bib', 'formula', 'breast pump', 'sterilizer'],
    'Bathing': ['bath', 'tub', 'towel', 'wash'],
    'Carriers': ['carrier', 'sling', 'wrap', 'backpack'],
    'Monitors': ['monitor', 'camera', 'listening device'],
    'Diapering': ['diaper', 'nappy', 'changing table', 'changing pad'],
    'Books': ['book', 'reading', 'story'],
    'Safety': ['safety', 'gate', 'guard', 'lock', 'corner', 'plug'],
    'Health': ['health', 'thermometer', 'medicine', 'first aid'],
    'Bedding': ['bedding', 'blanket', 'sheet', 'pillow', 'sleeping bag', 'swaddle'],
    'Maternity': ['maternity', 'pregnancy', 'nursing', 'breastfeeding']
  };

  // Check for category keywords in the message
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword)) {
        return category;
      }
    }
  }

  return null;
}

/**
 * Generate a title from the message
 * @param message The message text to generate a title from
 * @returns A generated title
 */
function generateTitle(message: string, category: string | null): string {
  // First, clean the message by removing image references
  const cleanedMessage = message
    .split('\n')
    .filter(line => !line.includes('(file attached)') && !line.startsWith('IMG-'))
    .join(' ')
    .trim();
  
  if (!cleanedMessage) {
    // If there's no text left after cleaning, use the category
    return category ? `${category} Item` : 'Item for Sale';
  }
  
  // Try to extract the first sentence or phrase that mentions the item
  const firstSentenceMatch = cleanedMessage.match(/^.*?(selling|sale|sell|available|for sale)\s+(?:a|an)?\s*([^\.!?,]+)/i);
  
  if (firstSentenceMatch && firstSentenceMatch[2]) {
    return firstSentenceMatch[2].trim();
  }
  
  // If no clear item description, use the first 50 characters of the cleaned message
  const shortDescription = cleanedMessage.split(/[.!?]/)[0].trim();
  if (shortDescription.length > 10) {
    return shortDescription.substring(0, Math.min(50, shortDescription.length)) + (shortDescription.length > 50 ? '...' : '');
  }
  
  // Fallback to category if available
  if (category) {
    return `${category} Item`;
  }
  
  return 'Item for Sale';
}

/**
 * Convert a WhatsApp listing to the application's Listing format
 * @param listing The WhatsApp listing to convert
 * @returns The converted Listing
 */
function convertToAppListing(listing: ListingCandidate): Listing {
  // Extract date from DD/MM/YY format
  const [day, month, year] = listing.date.split('/').map(Number);
  const dateObj = new Date(2000 + year, month - 1, day, 
    parseInt(listing.time.split(':')[0]), 
    parseInt(listing.time.split(':')[1]), 
    parseInt(listing.time.split(':')[2] || '0')
  );
  
  // Extract metadata from the message
  const location = extractLocation(listing.message);
  const condition = extractCondition(listing.message);
  const size = extractSize(listing.message);
  const category = extractCategory(listing.message);
  
  // Generate a title
  const title = generateTitle(listing.message, category);
  
  // Convert image paths if needed
  const images = listing.images.map(img => `/images/listings/${img}`);
  
  return {
    id: listing.id,
    date: dateObj.toISOString(),
    sender: listing.phoneNumber,
    text: listing.message,
    title,
    images: images.length > 0 ? images : undefined,
    price: listing.priceValue,
    condition,
    size,
    location,
    category,
    isISO: listing.isISO
  };
}

/**
 * Convert WhatsApp listings to the application's Listing format
 * @param inputFilePath Path to the filtered WhatsApp listings file
 * @param outputFilePath Path to save the converted listings
 */
async function convertListings(
  inputFilePath: string,
  outputFilePath: string
): Promise<void> {
  try {
    // Read the file content
    const fileContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Extract the array from the file content
    const arrayMatch = fileContent.match(/export const potentialListings: ListingCandidate\[\] = (\[[\s\S]*?\]);/);
    if (!arrayMatch || !arrayMatch[1]) {
      throw new Error('Could not extract listings array from the file');
    }
    
    // Parse the array
    const whatsAppListings: ListingCandidate[] = JSON.parse(arrayMatch[1]);
    
    if (!whatsAppListings || !whatsAppListings.length) {
      throw new Error('No listings found in the input file');
    }
    
    console.log(`Found ${whatsAppListings.length} WhatsApp listings`);
    
    // Convert the listings
    const appListings: Listing[] = whatsAppListings.map(convertToAppListing);
    
    console.log(`Converted ${appListings.length} listings to app format`);
    
    // Write the converted listings to the output file
    const outputContent = `// Generated from WhatsApp listings: ${path.basename(inputFilePath)}
// Generated on: ${new Date().toISOString()}
// Total listings: ${appListings.length}

import { Listing } from '../../utils/sampleData.public';

export const niftyThrifty01YearsListings: Listing[] = ${JSON.stringify(appListings, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error converting listings:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node convertListingsToAppFormat.ts <inputFilePath> <outputFilePath>');
    process.exit(1);
  }
  
  const [inputFilePath, outputFilePath] = args;
  convertListings(inputFilePath, outputFilePath)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default convertListings; 