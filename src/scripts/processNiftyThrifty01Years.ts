import path from 'path';
import processWhatsAppChat from './processWhatsAppChat';

const GROUP_NAME = 'nifty-thrifty-0-1-years';

/**
 * Process the WhatsApp chat export for the Nifty Thrifty 0-1 Years group
 */
async function processNiftyThrifty01Years() {
  try {
    // Define paths
    const inputFilePath = path.resolve(process.cwd(), 'whatsapp-exports', `${GROUP_NAME}.txt`);
    const outputFilePath = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.ts`);
    
    console.log(`Processing WhatsApp chat export for ${GROUP_NAME}...`);
    console.log(`Input file: ${inputFilePath}`);
    console.log(`Output file: ${outputFilePath}`);
    
    // Process the chat
    await processWhatsAppChat(inputFilePath, outputFilePath, GROUP_NAME, {
      minMessageLength: 20,
      excludeShortReplies: true,
      redactPhoneNumbers: true
    });
    
    console.log('Processing complete!');
    console.log('Next steps:');
    console.log('1. Review the generated file and manually edit as needed');
    console.log('2. Add price, category, condition, and location information');
    console.log('3. Import the listings in your application');
    
  } catch (error) {
    console.error('Error processing Nifty Thrifty 0-1 Years chat:', error);
    process.exit(1);
  }
}

// Run the script
processNiftyThrifty01Years(); 