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

### 1. Scroll WhatsApp Chats

First, use the automated scrolling script to load message history:

```bash
npm run scroll-whatsapp
```

This will:
- Launch WhatsApp Web in a browser window
- Prompt you to scan a QR code to log in
- Automatically scroll through all 6 WhatsApp groups
- Keep the browser open so you can export each chat

> **Important**: WhatsApp only exports messages that have been loaded on your device. This scrolling step ensures you get all recent messages before exporting.

### 2. Export Chats

After the scrolling is complete:
1. In the same browser window, manually export each chat:
   - Click the three-dot menu (⋮) > More > Export chat > WITHOUT MEDIA
   - Save each export file to its corresponding directory in `src/data/`

2. Save any new images from WhatsApp to the correct directory.

### 3. Run Import

Run the full import process with a single command:

```bash
npm run update-website
```

This command will:
- Check for required files
- Extract all listings from the WhatsApp exports
- Add new listings to the database
- Copy images to the public directory
- Check for duplicates
- Guide you through the entire process

## Main Scripts

### WhatsApp Scroll Script (`whatsapp-scroll.js`)

This script automates scrolling through WhatsApp Web to load message history before export.

**Usage:**
```bash
npm run scroll-whatsapp
```

**What it does:**
- Launches a browser with WhatsApp Web
- Searches for and opens each WhatsApp group
- Scrolls up to load message history
- Keeps the browser open for you to export chats

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

### Update Website Script (`update-website.sh`)

An all-in-one script that runs the complete update process.

**Usage:**
```bash
npm run update-website
# Or with deployment
npm run update-website-deploy
```

**What it does:**
- Checks for required directories and files
- Runs the import script with all necessary options
- Checks for duplicates
- Asks if you want to remove high-confidence duplicates
- Optionally deploys to Vercel (with the --deploy flag)

## Troubleshooting

### Common Issues

1. **WhatsApp Scrolling Issues**
   - Problem: Script fails to find a group or selector errors
   - Solution: WhatsApp Web's design may have changed, or the group name might be different. Check the console output for errors and update the script as needed.

2. **Missing Images**
   - Problem: Images mentioned in listings but not found
   - Solution: Ensure images are in the correct source directories and run the import again

3. **Duplicate Listings**
   - Problem: Same listing appears multiple times
   - Solution: Run the duplicate finder and remover scripts

4. **Import Errors**
   - Problem: Import process fails
   - Solution: Run with `--verbose` flag to see detailed error messages

5. **Database Connection Issues**
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