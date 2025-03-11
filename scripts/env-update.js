const fs = require('fs');
const path = require('path');

// Path to .env.local.example
const envExamplePath = path.join(__dirname, '..', '.env.local.example');

// Check if file exists
if (!fs.existsSync(envExamplePath)) {
  console.error('.env.local.example file not found!');
  process.exit(1);
}

// Read the current .env.local.example
let envContent = fs.readFileSync(envExamplePath, 'utf8');

// Add Gemini API key if not already present
if (!envContent.includes('GEMINI_API_KEY')) {
  envContent += '\n# Google Gemini API Key for AI processing\nGEMINI_API_KEY=your_gemini_api_key_here\n';
}

// Write the updated content
try {
  fs.writeFileSync(envExamplePath, envContent);
  console.log('Successfully updated .env.local.example with GEMINI_API_KEY');
} catch (error) {
  console.error('Error writing .env.local.example:', error);
  process.exit(1);
} 