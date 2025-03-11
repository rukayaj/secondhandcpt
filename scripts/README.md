# Scripts Directory Organization

This directory contains scripts for managing the WhatsApp marketplace application. The scripts have been organized into logical directories based on their functionality.

## Directory Structure

- **`import/`** - Data import scripts
  - `waha-import.js` - Primary script for importing WhatsApp messages using WAHA API
  - `whatsapp-import.js` - Legacy script for importing from WhatsApp exports
  - `import-whatsapp-listings.js` - Legacy script for importing listings from exports
  - `update-from-whatsapp.js` - Legacy script for updating listings from WhatsApp

- **`image-handling/`** - Image processing scripts
  - `waha-image-handler.js` - Primary script for handling images from WAHA API
  - `copy-whatsapp-images.js` - Script for copying images from source to public dir
  - `upload-whatsapp-images.js` - Script for uploading images to Supabase
  - `check-supabase-images.js` - Script for checking missing images in Supabase
  - `update-listings-with-image-mapping.js` - Script for updating image references

- **`categorization/`** - Category and ISO classification scripts
  - `classify-iso-with-llm.js` - Script for classifying ISO posts using LLM
  - `categorize-with-llm.js` - Script for categorizing listings using LLM
  - `apply-categories.js` - Script for applying categories to listings
  - `update-iso-flags.js` - Script for updating ISO flags

- **`maintenance/`** - Cleanup and maintenance scripts
  - `duplicate-finder.js` - Primary script for finding duplicates
  - `findDuplicateListings.js` - Legacy script for finding duplicate listings
  - `findDuplicateImages.js` - Legacy script for finding duplicate images
  - `removeDuplicateListings.js` - Script for removing duplicate listings
  - `sanitizeData.js` - Script for sanitizing data
  - `mergeListings.js` - Script for merging listings

- **`database/`** - SQL scripts and database management
  - SQL scripts for schema updates and migrations
  - Database setup and migration scripts

- **`deployment/`** - Deployment scripts
  - `waha-update.sh` - Script for updating and deploying with WAHA
  - `update-website.sh` - Script for updating and deploying the website
  - `whatsapp-scroll.js` - Script for scrolling WhatsApp to load messages

- **`docs/`** - Documentation
  - Various README files with detailed information on specific features

## Recommended Workflow

For the current recommended workflow:

1. **Import Messages**:
   ```bash
   npm run import-waha-smart
   ```

2. **Process Images**:
   ```bash
   npm run waha-images-upload
   ```

3. **Cleanup Conversation Messages**:
   ```bash
   npm run cleanup-listings
   ```

4. **Categorize Uncategorized Listings**:
   ```bash
   npm run categorize-uncategorised-with-llm
   ```

5. **Find and Remove Duplicates**:
   ```bash
   npm run find-duplicates
   npm run remove-duplicates
   ```

## Notes on Deprecated Scripts

Some scripts have been deprecated in favor of newer, more efficient versions:

- For importing: Use `waha-import.js` instead of older WhatsApp export scripts
- For image handling: Use `waha-image-handler.js` as the primary image processor
- For duplicate handling: Use `duplicate-finder.js` instead of older duplicate scripts

See `docs/README_CLEANUP.md` for the full consolidation plan and details. 