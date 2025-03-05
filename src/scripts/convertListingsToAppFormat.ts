import fs from 'fs/promises';
import path from 'path';
import {
  extractCondition,
  extractSize,
  extractLocation,
  determineCategory,
  isISOPost
} from '../utils/textParsingUtils';

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