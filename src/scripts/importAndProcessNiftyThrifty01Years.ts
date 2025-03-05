import { execSync } from 'child_process';
import path from 'path';

/**
 * Run both the import and processing scripts for the nifty-thrifty-0-1-years WhatsApp group
 */
async function importAndProcess() {
  try {
    console.log('Step 1: Importing and sanitizing WhatsApp chat export...');
    
    // Run the import script
    const importScriptPath = path.resolve(__dirname, 'importNiftyThrifty01Years.ts');
    execSync(`npx ts-node ${importScriptPath}`, { stdio: 'inherit' });
    
    console.log('\nStep 2: Processing WhatsApp chat and generating listings...');
    
    // Run the processing script
    const processScriptPath = path.resolve(__dirname, 'processNiftyThrifty01Years.ts');
    execSync(`npx ts-node ${processScriptPath}`, { stdio: 'inherit' });
    
    console.log('\nAll steps completed successfully!');
    console.log('You can now use the generated listings in your application.');
    
  } catch (error) {
    console.error('Error during import and processing:', error);
    process.exit(1);
  }
}

// Run the script
importAndProcess().catch(console.error); 