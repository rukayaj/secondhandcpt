const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read the current package.json
let packageJson;
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// List of old scripts to remove
const scriptsToRemove = [
  'scroll-whatsapp',
  'update-website',
  'update-website-full',
  'update-website-deploy',
  'update-website-scroll-only',
  'import-whatsapp',
  'import-whatsapp-full',
  'import-waha',
  'import-waha-verbose',
  'waha-images-upload',
  'update-waha',
  'update-waha-restart',
  'update-waha-deploy',
  'update-waha-full'
];

// Remove old scripts
scriptsToRemove.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    delete packageJson.scripts[script];
    console.log(`Removed old script: ${script}`);
  }
});

// Add new scripts
packageJson.scripts = packageJson.scripts || {};

// Add the new script for waha-gemini integration
packageJson.scripts['import-waha-gemini'] = 'node scripts/import/waha-gemini-import.js';
packageJson.scripts['import-waha-gemini-verbose'] = 'node scripts/import/waha-gemini-import.js --verbose';
packageJson.scripts['import-waha-gemini-full'] = 'node scripts/import/waha-gemini-import.js --verbose --upload-images --check-images';
packageJson.scripts['update-waha-gemini'] = 'npm run restart-waha && npm run import-waha-gemini-full';
packageJson.scripts['update-waha-gemini-deploy'] = 'npm run update-waha-gemini && npm run vercel-deploy';

// Write the updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully updated package.json with new waha-gemini scripts and removed old scripts');
} catch (error) {
  console.error('Error writing package.json:', error);
  process.exit(1);
} 