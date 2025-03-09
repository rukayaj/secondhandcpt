/**
 * Update listings from WhatsApp export
 * 
 * This script:
 * 1. Extracts listings from WhatsApp text files for both groups
 * 2. Uses enhanced weighted categorization
 * 3. Adds new records to the database
 * 4. Copies images from source to public directory
 * 
 * Usage:
 * 1. Export WhatsApp chats and place them in src/data/nifty-thrifty-0-1-years and src/data/nifty-thrifty-1-3-years
 * 2. Run this script to process the exports and update the database
 */

require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const path = require('path');

// Helper function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n==== Running ${path.basename(scriptPath)} ====\n`);
    
    const child = exec(`node ${scriptPath}`, {
      cwd: path.dirname(scriptPath)
    });
    
    // Stream output to console
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
}

// Main function to run all scripts in sequence
async function updateFromWhatsApp() {
  try {
    console.log('Starting WhatsApp update process...');
    
    // Step 1: Import new listings
    console.log('\nStep 1: Importing new listings from WhatsApp exports...');
    await runScript(path.join(__dirname, 'import-whatsapp-listings.js'));
    
    // Step 2: Copy images
    console.log('\nStep 2: Copying images from source to public directory...');
    await runScript(path.join(__dirname, 'copy-whatsapp-images.js'));
    
    console.log('\n===== WhatsApp Update Process Complete =====');
    console.log('✅ New listings imported');
    console.log('✅ Images copied to public directory');
    
    console.log('\nOptional next steps:');
    console.log('1. Run "node scripts/categorize-with-llm.js" to improve categorization of "Other" listings');
    console.log('2. Run "node scripts/check-supabase-images.js" to verify all images are properly uploaded to Supabase');
    
  } catch (error) {
    console.error('Error in update process:', error);
    process.exit(1);
  }
}

// Run the update process
updateFromWhatsApp(); 