import fs from 'fs/promises';
import path from 'path';

interface RawListing {
  id: string;
  date: string;
  phone: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  price: number | null;
}

interface AppListing {
  id: string;
  date: string;
  sender: string;
  text: string;
  title: string | null;
  images: string[];
  price: number | null;
  condition: string | null;
  size: string | null;
  location: string | null;
  category: string | null;
  isISO: boolean;
}

// Helper functions to extract metadata from messages
function extractCondition(message: string): string | null {
  const conditionRegex = /\b(brand new|new with tags|nwt|excellent condition|good condition|fair condition|used condition|like new|gently used|barely used|well used|worn)\b/i;
  const match = message.match(conditionRegex);
  return match ? match[0] : null;
}

function extractSize(message: string): string | null {
  const sizeRegex = /\b(newborn|preemie|premature|0-3\s*months?|3-6\s*months?|6-9\s*months?|9-12\s*months?|12-18\s*months?|18-24\s*months?|0-1\s*years?|1-2\s*years?|2-3\s*years?|3-4\s*years?|4-5\s*years?|5-6\s*years?|6-7\s*years?|7-8\s*years?|8-9\s*years?|9-10\s*years?|10-11\s*years?|11-12\s*years?|12-13\s*years?|13-14\s*years?|size\s+\d+|small|medium|large|xl|xxl)\b/i;
  const match = message.match(sizeRegex);
  return match ? match[0] : null;
}

function extractLocation(message: string): string | null {
  const locationRegex = /\b(?:in|from|at|near|collection|collect from|pickup from|available in)\s+([A-Za-z\s]+(?:Point|Town|Park|Heights|Village|Estate|Bay|View|Gardens|Hills|Valley|Beach|CBD|City|Centre|Center))\b/i;
  const match = message.match(locationRegex);
  return match ? match[1] : null;
}

function determineCategory(message: string): string | null {
  const messageLower = message.toLowerCase();
  
  // Define category keywords
  const categoryMap: Record<string, string[]> = {
    'Clothing': ['clothes', 'clothing', 'outfit', 'dress', 'pants', 'shirt', 'onesie', 'bodysuit', 'romper', 'sleepsuit', 'pajamas', 'pyjamas'],
    'Toys': ['toy', 'toys', 'play', 'game', 'puzzle', 'teddy', 'doll', 'stuffed', 'plush', 'playmat'],
    'Furniture': ['furniture', 'cot', 'crib', 'bed', 'chair', 'table', 'dresser', 'wardrobe', 'storage'],
    'Footwear': ['shoes', 'boots', 'sandals', 'footwear', 'socks'],
    'Gear': ['stroller', 'pram', 'buggy', 'pushchair', 'car seat', 'carrier', 'sling', 'wrap', 'backpack'],
    'Feeding': ['bottle', 'feeding', 'highchair', 'high chair', 'bib', 'formula', 'breast pump', 'sterilizer', 'nursing'],
    'Accessories': ['hat', 'cap', 'beanie', 'mittens', 'gloves', 'scarf', 'sunglasses', 'bag', 'backpack'],
    'Swimming': ['swim', 'swimming', 'pool', 'beach', 'float', 'life jacket'],
    'Bedding': ['bedding', 'blanket', 'sheet', 'pillow', 'sleeping bag', 'swaddle', 'duvet', 'comforter'],
    'Diapers': ['diaper', 'nappy', 'changing table', 'changing pad'],
    'Books': ['book', 'reading', 'story'],
    'Other': []
  };
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
}

function isISOPost(message: string, hasImages: boolean = false): boolean {
  const messageLower = message.toLowerCase();
  
  // If there are explicit ISO indicators in the text, it's an ISO post
  if (messageLower.includes('iso') || 
      messageLower.includes('in search of') || 
      messageLower.includes('looking for')) {
    return true;
  }
  
  // If there are no images and the text suggests looking for something, it's likely an ISO post
  if (!hasImages && (
    messageLower.includes('anyone selling') ||
    messageLower.includes('anyone have') ||
    messageLower.includes('does anyone') ||
    messageLower.startsWith('looking for') ||
    messageLower.startsWith('wanted')
  )) {
    return true;
  }
  
  return false;
}

async function convertListingsToAppFormat(inputFilePath: string, outputFilePath: string) {
  try {
    // Read the input file
    const fileContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Extract the group name from the input file path
    const groupName = path.basename(inputFilePath).split('-listings')[0];
    
    // Parse the JSON content
    const match = fileContent.match(/export const potentialListings: ListingCandidate\[\] = (\[[\s\S]*\]);/);
    if (!match || !match[1]) {
      throw new Error('Could not extract listings from the file');
    }
    
    const rawListings = JSON.parse(match[1]);
    
    // Convert to app format
    const appListings: AppListing[] = rawListings.map((raw: any) => {
      // Extract images with correct paths
      const images = raw.images.map((img: string) => {
        // Extract just the filename
        const filename = img.split('/').pop() || img;
        // Return the path with the correct group folder
        return `/images/${groupName}/${filename}`;
      });
      
      // Check if the listing has images
      const hasImages = raw.images.length > 0;
      
      return {
        id: raw.id,
        date: new Date(`${raw.date} ${raw.time}`).toISOString(),
        sender: raw.phoneNumber,
        text: raw.message,
        title: images.length > 0 ? images[0].split('/').pop()?.replace('.jpg', '') || null : null,
        images,
        price: raw.priceValue,
        condition: extractCondition(raw.message),
        size: extractSize(raw.message),
        location: extractLocation(raw.message),
        category: determineCategory(raw.message),
        isISO: isISOPost(raw.message, hasImages)
      };
    });
    
    // Write to output file
    const outputContent = `export const appListings = ${JSON.stringify(appListings, null, 2)};`;
    await fs.writeFile(outputFilePath, outputContent);
    
    console.log(`Converted ${appListings.length} listings to app format`);
    console.log(`Output saved to ${outputFilePath}`);
    
  } catch (error) {
    console.error('Error converting listings to app format:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npm run convert-listings -- <input-file-path> <output-file-path>');
  process.exit(1);
}

const inputFilePath = args[0];
const outputFilePath = args[1];

convertListingsToAppFormat(inputFilePath, outputFilePath); 