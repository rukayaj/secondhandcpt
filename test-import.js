/**
 * Test script to run the WAHA-Gemini import
 */

// Import the importWhatsAppListings function from the waha-gemini-import.js file
const path = require('path');
const fs = require('fs');

// Read the waha-gemini-import.js file
const importScriptPath = path.join(__dirname, 'scripts', 'import', 'waha-gemini-import.js');
const importScriptContent = fs.readFileSync(importScriptPath, 'utf8');

// Extract the importWhatsAppListings function
const importWhatsAppListingsMatch = importScriptContent.match(/async function importWhatsAppListings\(\) \{[\s\S]+?return addedListings;\s*\}/);

if (!importWhatsAppListingsMatch) {
  console.error('Could not find importWhatsAppListings function in the script');
  process.exit(1);
}

// Create a new module that exports the importWhatsAppListings function
const tempModulePath = path.join(__dirname, 'temp-import-module.js');
fs.writeFileSync(tempModulePath, `
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from both project root and local directory
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const axios = require('axios');
const { program } = require('commander');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import utility modules
const { listingExists, addListing, getLatestMessageTimestampsByGroup } = require('./src/utils/dbUtils');
const { extractPhoneNumber } = require('./src/utils/listingParser');

// Import our consolidated utility modules
const { 
  WHATSAPP_GROUPS,
  WAHA_BASE_URL,
  getAdminClient,
  checkWahaSessionStatus,
  startWahaSession,
  waitForWahaAuthentication
} = require('./scripts/import/importUtils');

const {
  uploadImageToSupabase,
  downloadImageFromWaha
} = require('./scripts/deployment/imageUtils');

// API Prefix for WAHA
const WAHA_API_PREFIX = '/default';

// Create necessary directories
const tmpDir = path.join(process.cwd(), 'tmp');
const wahaImagesDir = path.join(tmpDir, 'waha-images');

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(\`Created directory: \${tmpDir}\`);
}

// Ensure waha-images directory exists
if (!fs.existsSync(wahaImagesDir)) {
  fs.mkdirSync(wahaImagesDir, { recursive: true });
  console.log(\`Created directory: \${wahaImagesDir}\`);
}

// Create group directories
WHATSAPP_GROUPS.forEach(group => {
  const groupDir = path.join(process.cwd(), group.dataDir);
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
    console.log(\`Created directory: \${groupDir}\`);
  }
});

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--skip-images', 'Skip processing and uploading images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--days <n>', 'Number of days of history to fetch', parseInt, 30)
  .option('--limit <n>', 'Limit number of messages per group', parseInt, 5)
  .option('--ignore-last-date', 'Ignore the last import date and use days parameter')
  .option('--skip-sync', 'Skip synchronization of expired listings')
  .parse(process.argv);

const options = program.opts();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// WhatsApp group mapping (group name to WAHA chat ID)
// Get mapping from importUtils
const GROUP_MAPPING = WHATSAPP_GROUPS.reduce((map, group) => {
  if (group.chatId) {
    map[group.name] = group.chatId;
  }
  return map;
}, {});

// Configuration
const MIN_AGE_DAYS = 7; // Only expire listings older than 7 days
const VERIFICATION_ENABLED = true; // Verify listings still exist before expiring

${importWhatsAppListingsMatch[0]}

module.exports = { importWhatsAppListings };
`);

// Import the function from the temporary module
const { importWhatsAppListings } = require('./temp-import-module');

// Run the import function
async function runTestImport() {
  try {
    console.log('Starting test import...');
    await importWhatsAppListings();
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    // Clean up the temporary module
    fs.unlinkSync(tempModulePath);
  }
}

// Run the test import
runTestImport(); 