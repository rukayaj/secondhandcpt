const fs = require('fs');
const path = require('path');

// Path to the original data file
const originalDataPath = path.join(__dirname, '../src/utils/sampleData.ts');
// Path to the sanitized output file
const sanitizedDataPath = path.join(__dirname, '../src/utils/sampleData.sanitized.ts');

// Read the original data file
let originalData = fs.readFileSync(originalDataPath, 'utf8');

// Extract the array of listings
const startMarker = 'export const sampleListings: Listing[] = [';
const endMarker = '];';

const startIndex = originalData.indexOf(startMarker);
const endIndex = originalData.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find the sampleListings array in the original file');
  process.exit(1);
}

// Extract the array content
const arrayContent = originalData.substring(startIndex, endIndex);

// Create a map to assign consistent IDs to phone numbers
const phoneMap = new Map();
let phoneCounter = 1;

// Function to sanitize phone numbers
function sanitizePhoneNumber(phoneNumber) {
  if (!phoneMap.has(phoneNumber)) {
    phoneMap.set(phoneNumber, `PHONE_REDACTED_${phoneCounter++}`);
  }
  return phoneMap.get(phoneNumber);
}

// Sanitize phone numbers in the array content
let sanitizedContent = arrayContent.replace(/"sender": "(\+\d+\s*\d+\s*\d+\s*\d+)"/g, (match, phoneNumber) => {
  return `"sender": "${sanitizePhoneNumber(phoneNumber)}"`;
});

// Get the rest of the file content (helper functions, etc.)
const restOfFile = originalData.substring(endIndex);

// Create the sanitized file content
const sanitizedFileContent = `import { Listing } from './parser';

// Deduplicated listings with sanitized phone numbers
${sanitizedContent}

${restOfFile}`;

// Write the sanitized file
fs.writeFileSync(sanitizedDataPath, sanitizedFileContent, 'utf8');

console.log(`Successfully created sanitized data file at ${sanitizedDataPath}`);
console.log(`Sanitized ${phoneCounter - 1} unique phone numbers`); 