# WhatsApp Listing Import Scripts

This directory contains scripts for importing, processing, and managing listings from WhatsApp group exports.

## Overview

The scripts in this directory are designed to:

1. Extract listings from WhatsApp group chat exports
2. Process and categorize the listings
3. Add new listings to the database
4. Handle images (copying to public directory, uploading to Supabase)
5. Find and remove duplicate listings and images

## Periodic Import Workflow

This application is designed for periodic updates (approximately every 3 days) from WhatsApp groups. The workflow is streamlined to be as seamless as possible:

### 1. Export WhatsApp Chats

Export the chat history from both WhatsApp groups:
- "Nifty Thrifty 0-1 year"
- "Nifty Thrifty 1-3 years"

When exporting, choose "Without Media" as the script will handle images separately.

### 2. Prepare Files

1. Place the exported text files in:
   - `src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt`
   - `src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt`

2. Save any new images from the WhatsApp groups to:
   - `src/data/nifty-thrifty-0-1-years/` (for 0-1 year group)
   - `src/data/nifty-thrifty-1-3-years/` (for 1-3 years group)

   > **Tip**: You can save images directly from WhatsApp to these folders, or use a file manager to copy them over.

### 3. Run Import

Run the full import process with a single command:

```bash
npm run import-whatsapp-full
```

This command will:
- Extract all listings from the WhatsApp exports
- Only add listings that don't already exist in the database
- Copy images to the public directory for web display
- Upload images to Supabase Storage for persistent storage
- Check for any missing images

### 4. Check for Duplicates (Optional)

If you notice duplicate listings in the application, you can run:

```bash
npm run find-duplicates
npm run remove-duplicates
```

The first command identifies potential duplicates, and the second removes high-confidence duplicates (similarity score > 0.9).

## Main Scripts

### WhatsApp Import Script (`whatsapp-import.js`)

This is the main script for importing WhatsApp listings. It handles the entire process from extraction to database insertion and image handling.

**Usage:**
```bash
# Basic import
npm run import-whatsapp

# Verbose output
npm run import-whatsapp-verbose

# Full import with image upload and checking
npm run import-whatsapp-full

# Or directly with options
node scripts/whatsapp-import.js [options]
```

**Options:**
- `--verbose, -v`: Show detailed output
- `--upload-images`: Upload images to Supabase Storage
- `--check-images`: Check for missing images in Supabase Storage
- `--categorize-llm`: Use LLM to improve categorization of "Other" listings

### Duplicate Finder Script (`duplicate-finder.js`)

This script helps identify and remove duplicate listings and images.

**Usage:**
```bash
# Find duplicate listings
npm run find-duplicates

# Find duplicate images
npm run find-duplicate-images

# Remove high-confidence duplicates
npm run remove-duplicates

# Or directly with options
node scripts/duplicate-finder.js [options]
```

**Options:**
- `--verbose, -v`: Show detailed output
- `--images`: Find duplicate images instead of listings
- `--remove`: Remove identified duplicates (use with caution)
- `--threshold <n>`: Similarity threshold (0-1, default: 0.7)

## Troubleshooting

### Common Issues

1. **Missing Images**
   - Problem: Images mentioned in listings but not found
   - Solution: Ensure images are in the correct source directories and run the import again

2. **Duplicate Listings**
   - Problem: Same listing appears multiple times
   - Solution: Run the duplicate finder and remover scripts

3. **Import Errors**
   - Problem: Import process fails
   - Solution: Run with `--verbose` flag to see detailed error messages

4. **Database Connection Issues**
   - Problem: Cannot connect to Supabase
   - Solution: Check your `.env.local` file for correct credentials

## Utility Modules

The scripts use several utility modules in the `src/utils` directory:

- `supabaseClient.js`: Centralized Supabase client module
- `imageHandler.js`: Consolidated image handling module
- `listingParser.js`: Listing extraction and processing module
- `categoryUtils.js`: Listing categorization module
- `dbUtils.js`: Database operations module

## Legacy Scripts

The following scripts are from the previous implementation and are kept for reference:

- `categorize-with-llm.js`: Uses an LLM to improve categorization
- `check-supabase-images.js`: Checks for missing images in Supabase
- `copy-whatsapp-images.js`: Copies images from source to public directory
- `findDuplicateImages.js`: Finds duplicate images
- `findDuplicateListings.js`: Finds duplicate listings
- `import-whatsapp-listings.js`: Imports listings from WhatsApp exports
- `removeDuplicateListings.js`: Removes duplicate listings
- `sanitizeData.js`: Sanitizes data (e.g., phone numbers)
- `update-from-whatsapp.js`: Updates listings from WhatsApp exports
- `update-listings-with-image-mapping.js`: Updates listings with image mappings
- `upload-whatsapp-group-images.js`: Uploads WhatsApp group images to Supabase
- `upload-whatsapp-images.js`: Uploads WhatsApp images to Supabase

These legacy scripts are being phased out in favor of the consolidated scripts described above. 