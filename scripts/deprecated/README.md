# Deprecated Scripts

This directory contains scripts that have been deprecated and are no longer actively used in the project. They are kept for reference purposes only.

## List of Deprecated Files

### waha-import.js
- **Original location**: scripts/import/waha-import.js
- **Reason for deprecation**: Replaced by the more robust `waha-gemini-import.js` which uses Google's Gemini AI to extract more accurate listing information from WhatsApp messages.
- **Date deprecated**: March 12, 2025

### wahaImageUtils.js
- **Original location**: scripts/image-handling/wahaImageUtils.js
- **Reason for deprecation**: Functionality has been consolidated into `imageUtils.js`. The `downloadImageFromWaha` function in `imageUtils.js` now handles port corrections for localhost URLs.
- **Date deprecated**: March 12, 2025

### copy-whatsapp-images.js
- **Original location**: scripts/image-handling/copy-whatsapp-images.js
- **Reason for deprecation**: Functionality has been superseded by `waha-image-handler.js` which handles both downloading and uploading images in a more integrated way.
- **Date deprecated**: Before March 12, 2025 (was already marked as deprecated in the file)

### upload-whatsapp-images.js
- **Original location**: scripts/image-handling/upload-whatsapp-images.js
- **Reason for deprecation**: Functionality has been superseded by `waha-image-handler.js` and the integrated image handling in `waha-gemini-import.js`.
- **Date deprecated**: Before March 12, 2025 (was already marked as deprecated in the file)

## When to Remove

These files can be safely removed when:
1. The project has been running stably with the replacement solutions for at least 3 months
2. No code in the active codebase references these files
3. All team members agree they are no longer needed for reference

## How to Handle Deprecated Code

When depreciating code:
1. Move the file to this directory
2. Update this README with details about the file
3. Update any documentation that referenced the deprecated file
4. Ensure any dependent code is updated to use the replacement solution 