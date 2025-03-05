import path from 'path';
import convertToListings from './convertToListings';

const INPUT_FILE = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', 'nifty-thrifty-0-1-years.ts');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src', 'data', 'listings', 'nifty-thrifty-0-1-years.ts');

async function convertNiftyThrifty01Years() {
  console.log('Converting nifty-thrifty-0-1-years WhatsApp messages to listings...');
  console.log(`Input file: ${INPUT_FILE}`);
  console.log(`Output file: ${OUTPUT_FILE}`);
  
  try {
    // Make sure the output directory exists
    const fs = await import('fs');
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await convertToListings(INPUT_FILE, OUTPUT_FILE);
    console.log('Conversion complete!');
    console.log('Next steps:');
    console.log('1. Review the generated listings');
    console.log('2. Import the listings into your application');
  } catch (error) {
    console.error('Error converting listings:', error);
    process.exit(1);
  }
}

// Run the script
convertNiftyThrifty01Years(); 