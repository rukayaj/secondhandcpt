import path from 'path';
import extractWhatsAppListings from './extractWhatsAppListings';

const GROUP_NAME = 'nifty-thrifty-0-1-years';
const INPUT_FILE = path.resolve(process.cwd(), 'whatsapp-exports', `${GROUP_NAME}.txt`);
const OUTPUT_FILE = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.ts`);

async function extractNiftyThrifty01Years() {
  console.log(`Extracting listings from ${GROUP_NAME} WhatsApp chat...`);
  console.log(`Input file: ${INPUT_FILE}`);
  console.log(`Output file: ${OUTPUT_FILE}`);
  
  try {
    await extractWhatsAppListings(INPUT_FILE, OUTPUT_FILE, GROUP_NAME);
    console.log('Extraction complete!');
    console.log('Next steps:');
    console.log('1. Review the extracted listings');
    console.log('2. Filter out non-listing messages');
    console.log('3. Import the listings into your application');
  } catch (error) {
    console.error('Error extracting listings:', error);
    process.exit(1);
  }
}

// Run the script
extractNiftyThrifty01Years(); 