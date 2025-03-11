#!/usr/bin/env node

/**
 * Test New Structure
 * 
 * This script tests that the reorganized scripts and utility modules
 * are working correctly with their new paths.
 */

require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== Testing Reorganized Scripts Structure ===\n');

// Check that utility modules can be imported
console.log('1. Testing utility module imports...');

try {
  // Import utils
  const importUtils = require('./import/importUtils');
  const imageUtils = require('./image-handling/imageUtils');
  const classificationUtils = require('./categorization/classificationUtils');
  
  console.log('✅ All utility modules imported successfully');
  
  // Basic validation of utilities
  console.log('\n2. Testing utility functions...');
  console.log(`✅ importUtils has ${Object.keys(importUtils).length} exported functions`);
  console.log(`✅ imageUtils has ${Object.keys(imageUtils).length} exported functions`);
  console.log(`✅ classificationUtils has ${Object.keys(classificationUtils).length} exported functions`);
} catch (error) {
  console.error('❌ Error importing utility modules:', error.message);
  process.exit(1);
}

// Check that directories exist
console.log('\n3. Checking directory structure...');
const directories = [
  'import',
  'image-handling',
  'categorization',
  'maintenance',
  'database',
  'deployment',
  'docs'
];

let allDirectoriesExist = true;
for (const dir of directories) {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directory exists: ${dir}`);
  } else {
    console.log(`❌ Directory missing: ${dir}`);
    allDirectoriesExist = false;
  }
}

if (!allDirectoriesExist) {
  console.error('\nSome directories are missing!');
  process.exit(1);
}

// Test package.json scripts
console.log('\n4. Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const scriptPrefixes = ['import:', 'image:', 'category:', 'iso:', 'maintenance:', 'deploy:', 'db:'];

let allPrefixesFound = true;
for (const prefix of scriptPrefixes) {
  const hasPrefix = Object.keys(packageJson.scripts).some(script => script.startsWith(prefix));
  if (hasPrefix) {
    console.log(`✅ Script prefix exists: ${prefix}`);
  } else {
    console.log(`❌ Script prefix missing: ${prefix}`);
    allPrefixesFound = false;
  }
}

if (!allPrefixesFound) {
  console.error('\nSome script prefixes are missing in package.json!');
  process.exit(1);
}

// Print test summary
console.log('\n=== Test Summary ===');
console.log('✅ All utility modules can be imported');
console.log(`✅ All expected directories exist: ${allDirectoriesExist ? 'Yes' : 'No'}`);
console.log(`✅ All script prefixes exist in package.json: ${allPrefixesFound ? 'Yes' : 'No'}`);
console.log('\n✅ The new structure appears to be correctly set up!');
console.log('\nNext steps:');
console.log('1. Run some actual scripts to verify they work with the new structure');
console.log('2. Review remaining documentation and update as needed');
console.log('3. After verifying everything works, consider removing deprecated scripts'); 