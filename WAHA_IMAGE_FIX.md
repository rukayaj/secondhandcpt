# WAHA Image Handling Fix

## Issue Summary

We identified an issue with the import process where images from the WAHA API were not being properly downloaded, resulting in missing image hashes. This prevented the duplicate detection system from working correctly, as it relies on comparing image hashes to identify duplicate listings.

## Root Cause

1. **URL Format Mismatch**: The import script was not correctly handling the URL format used by the WAHA API for images. The correct format is:
   ```
   http://localhost:3001/api/files/default/false_27787894429-1623257234@g.us_3A4D9F55669962C9EC0C_27839559423@c.us.jpeg
   ```

2. **Port Correction**: The script was not properly handling the port correction when URLs contained `localhost:3000` instead of `localhost:3001`.

3. **Image Hash Generation**: Due to the download failures, image hashes were not being generated during the import process, resulting in empty `image_hashes` arrays in the database.

## Implemented Fixes

### 1. Fixed URL Handling in `downloadImageFromWaha`

Updated the `downloadImageFromWaha` function in `scripts/image-handling/imageUtils.js` to properly handle different URL formats:

```javascript
async function downloadImageFromWaha(imageUrl, outputPath) {
  try {
    // Check if the URL is valid
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('Invalid image URL provided:', imageUrl);
      return false;
    }

    // Use axios to download the image
    const axios = require('axios');
    const { writeFile } = require('fs/promises');
    
    // Fix for URL format - handle different types of URLs
    let finalUrl = imageUrl;
    
    // Handle non-HTTP "URLs" which are likely just message IDs
    if (!imageUrl.startsWith('http')) {
      // It's likely just a message ID, so construct the full URL
      const WAHA_BASE_URL = process.env.WAHA_BASE_URL || 'http://localhost:3001';
      const WAHA_SESSION = process.env.WAHA_SESSION || 'default';
      finalUrl = `${WAHA_BASE_URL}/api/messages/${WAHA_SESSION}/${imageUrl}/download`;
      console.log(`[DEBUG] Converted message ID to URL: ${finalUrl}`);
    } 
    // Handle port correction for localhost URLs
    else if (imageUrl.includes('localhost:3000')) {
      // Port correction for development environment
      finalUrl = imageUrl.replace('localhost:3000', 'localhost:3001');
      console.log(`[DEBUG] Corrected port in URL: ${finalUrl}`);
    }
    
    console.log(`[DEBUG] Downloading image from: ${finalUrl}`);
    const response = await axios.get(finalUrl, { responseType: 'arraybuffer' });
    
    if (response.status !== 200) {
      console.error(`Failed to download image, status: ${response.status}`);
      return false;
    }
    
    // Save the image to the specified path
    await writeFile(outputPath, Buffer.from(response.data));
    console.log(`[DEBUG] Image downloaded successfully to: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error downloading image from WAHA: ${error.message}`);
    return false;
  }
}
```

### 2. Updated `downloadAndUploadImage` in the Import Script

Modified the `downloadAndUploadImage` function in `scripts/import/waha-gemini-import.js` to use the fixed `downloadImageFromWaha` function for WAHA API URLs:

```javascript
async function downloadAndUploadImage(wahaClient, imageUrl, messageId, groupName, index, verbose = false) {
  // ...existing code...
  
  try {
    // Check if we have a real wahaClient or our mock client
    let imageBuffer;
    
    if (typeof wahaClient.downloadMediaMessage === 'function') {
      // Use the real WAHA client's downloadMediaMessage function if it exists
      imageBuffer = await wahaClient.downloadMediaMessage(imageUrl);
    } else if (imageUrl && typeof imageUrl === 'string') {
      // Handle the case when we just have a URL (for our mock client)
      try {
        // Special handling for WAHA API file URLs
        if (imageUrl.includes('/api/files/') || imageUrl.includes('/api/messages/')) {
          // Use the enhanced downloadImageFromWaha function for this type of URL
          const tmpPath = path.join(tmpDir, `waha_image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`);
          console.log(`Downloading WAHA image to temp path: ${tmpPath}`);
          
          const downloadSuccess = await downloadImageFromWaha(imageUrl, tmpPath);
          
          if (!downloadSuccess) {
            console.error(`Failed to download image from WAHA API: ${imageUrl}`);
            return null;
          }
          
          // Read the downloaded file into a buffer
          imageBuffer = fs.readFileSync(tmpPath);
          
          // Clean up the temp file
          try {
            fs.unlinkSync(tmpPath);
          } catch (unlinkError) {
            console.warn(`Warning: Could not delete temp file: ${unlinkError.message}`);
          }
        } else {
          // For other URLs, use axios directly
          const axios = require('axios');
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data, 'binary');
        }
      } catch (fetchError) {
        console.error(`Error fetching image from URL: ${fetchError.message}`);
        return null;
      }
    }
    
    // ...rest of the function...
  }
}
```

### 3. Created Verification Scripts

We created several scripts to verify the fixes:

1. `verify-waha-download.js`: Tests downloading images from the WAHA API with different URL formats.
2. `fix-image-hashes.js`: Finds listings with images but no image hashes and updates them.
3. `test-waha-import.js`: Tests the full import process with the fixed image handling.

## Testing Results

Our testing confirmed that:

1. The fixed `downloadImageFromWaha` function can successfully download images from the WAHA API.
2. The image hash generation works correctly when images are downloaded.
3. The duplicate detection system works correctly when image hashes are available.

## Recommendations

1. **Update the Main Import Script**: Apply the fixes to the main import script to ensure proper image handling in future imports.
2. **Run the Fix Script**: Run the `fix-image-hashes.js` script to update existing listings with missing image hashes.
3. **Add Logging**: Add additional logging to the import process to help diagnose any future issues.
4. **Consider Fallbacks**: Implement fallback mechanisms for duplicate detection when image hashes are not available.

## Conclusion

The issue with duplicate detection was caused by a failure to download images from the WAHA API, which prevented image hashes from being generated. By fixing the URL handling in the `downloadImageFromWaha` function and updating the import script to use this function, we've ensured that images can be properly downloaded, hashes can be generated, and duplicates can be detected. 