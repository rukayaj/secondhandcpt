/**
 * Verify script to test downloading images from WAHA with the fixed URL format
 */
require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { downloadImageFromWaha } = require('./scripts/deployment/imageUtils');

// Create temp directory if it doesn't exist
const tmpDir = path.join(process.cwd(), 'tmp', 'verify-waha');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Generate a hash of an image buffer for verification
 * @param {Buffer} buffer - The image buffer to hash
 * @returns {string} - The hash string
 */
function generateImageHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Test downloading from different URL formats
 */
async function testDownload() {
  console.log('Starting download test...');
  
  // Test URLs - including the example URL from the user
  const testUrls = [
    // The specific URL format the user mentioned
    'http://localhost:3001/api/files/default/false_27787894429-1623257234@g.us_3A4D9F55669962C9EC0C_27839559423@c.us.jpeg',
    
    // Test with a different port to verify port correction works
    'http://localhost:3000/api/files/default/false_27787894429-1623257234@g.us_3A4D9F55669962C9EC0C_27839559423@c.us.jpeg',
    
    // Test the URL associated with the specific listing
    'http://localhost:3001/api/files/default/false_27787894429-1623257234@g.us_3A4D9F55669962C9EC0C_27839559423@c.us.jpeg',
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\nTest ${i+1}: Downloading from URL: ${url}`);
    
    const outputPath = path.join(tmpDir, `test-image-${i+1}.jpg`);
    
    // Test the download
    const result = await downloadImageFromWaha(url, outputPath);
    
    if (result) {
      console.log(`✅ Successfully downloaded image to: ${outputPath}`);
      
      // Verify file exists and has content
      if (fs.existsSync(outputPath)) {
        const fileSize = fs.statSync(outputPath).size;
        console.log(`   File size: ${fileSize} bytes`);
        
        if (fileSize > 0) {
          // Generate hash for verification
          const buffer = fs.readFileSync(outputPath);
          const hash = generateImageHash(buffer);
          console.log(`   Image hash: ${hash}`);
          successCount++;
        } else {
          console.error(`❌ Downloaded file is empty: ${outputPath}`);
        }
      } else {
        console.error(`❌ File not found after download: ${outputPath}`);
      }
    } else {
      console.error(`❌ Failed to download from URL: ${url}`);
    }
  }
  
  console.log(`\n===== Test Results =====`);
  console.log(`${successCount} of ${testUrls.length} downloads successful`);
}

// Run the test
testDownload()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test error:', err.message)); 