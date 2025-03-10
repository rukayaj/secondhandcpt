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

This application provides two methods for periodic updates (approximately every 3 days) from WhatsApp groups:

### Option 1: WAHA API Integration (Recommended)

The recommended approach uses the [WhatsApp API - WAHA](https://github.com/devlikeapro/waha) project for more reliable WhatsApp data access.

#### 1. Start WAHA API

First, ensure Docker is installed and start the WAHA container:

```bash
# Run WAHA in Docker on port 3001
docker run -d -p 3001:3000 devlikeapro/waha
```

You can view the WAHA dashboard at http://localhost:3001 to check if it's running.

#### 2. Configure WhatsApp Group IDs

The free version of WAHA doesn't support automatic discovery of chat IDs. You need to manually configure the chat IDs in the `scripts/waha-import.js` file:

```javascript
const GROUP_MAPPING = {
  'Nifty Thrifty Modern Cloth Nappies': '120363045386754642@g.us',  // Replace with actual chat ID
  'Nifty Thrifty 0-1 year (2)': '120363044516064722@g.us',          // Replace with actual chat ID
  // ... other groups
};
```

To find the chat IDs:
1. Open WhatsApp Web in your browser
2. Open the Developer Tools (F12 or right-click > Inspect)
3. Go to the Network tab
4. Filter for "messages" or "chats"
5. Look for requests that contain the chat ID in the URL or response

#### 3. Run the WAHA Update Script

You can run the complete process with a single command:

```bash
# Standard WAHA update
npm run update-waha

# Restart WAHA container and run update
npm run update-waha-restart

# Update and deploy
npm run update-waha-deploy

# Full process: restart WAHA, update, and deploy
npm run update-waha-full
```

The first time you run this, you'll need to scan a QR code to authenticate. After that, the session will persist as long as the WAHA container is running.

#### Manual WAHA Steps

If you prefer to run individual steps:

```bash
# Just restart the WAHA container
npm run restart-waha

# Import messages from WhatsApp groups
npm run import-waha-verbose

# Handle images
npm run waha-images-upload

# Check for duplicates
npm run find-duplicates

# Remove duplicates
npm run remove-duplicates
```

### Option 2: Original Puppeteer-based Import

The original approach using browser automation:

#### 1. Scroll WhatsApp Chats

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

**Mac Silicon (M1/M2/M3) Users:** If you're using a Mac with Apple Silicon, the script will detect this and display a performance note. For best performance, ensure you're using an arm64 version of Node.js (check with `node -p "process.arch"`).

#### 2. Export Chats

After the scrolling is complete:
1. In the same browser window, manually export each chat:
   - Click the three-dot menu (⋮) > More > Export chat > WITHOUT MEDIA
   - Save each export file to its corresponding directory in `src/data/`

2. Save any new images from WhatsApp to the correct directory.

#### 3. Run Import

You can either run the complete process in one step:

```bash
npm run update-website-full
```

Or just the import process (if you've already scrolled and exported):

```bash
npm run update-website
```

These commands will:
- Check for required files
- Extract all listings from the WhatsApp exports
- Add new listings to the database
- Copy images to the public directory
- Check for duplicates
- Guide you through the entire process

## Main Scripts

### WAHA Update Script (`waha-update.sh`)

An all-in-one script for updating the website using the WAHA API integration.

**Usage:**
```bash
# Standard update
npm run update-waha

# Restart WAHA container and update
npm run update-waha-restart

# Update and deploy to Vercel
npm run update-waha-deploy

# Full process: restart WAHA, update, and deploy
npm run update-waha-full
```

**Options:**
- `--deploy`: Deploy the updates to Vercel after importing
- `--days=N`: Number of days of history to fetch (default: 7)
- `--restart-waha`: Restart the WAHA container before running (requires Docker)

**What it does:**
- Checks if WAHA API is running (or restarts it if requested)
- Runs the WAHA import script to fetch messages
- Processes images from WAHA
- Checks for duplicates
- Asks if you want to remove high-confidence duplicates
- Optionally deploys to Vercel (with the --deploy flag)

### WAHA Import Script (`waha-import.js`)

This script connects to the WAHA API to fetch and process WhatsApp messages.

**Usage:**
```bash
# Basic import
npm run import-waha

# Verbose output
npm run import-waha-verbose

# Full import with image upload and checking
npm run import-waha-full

# Or directly with options
node scripts/waha-import.js [options]
```

**Options:**
- `--verbose, -v`: Show detailed output
- `--upload-images`: Upload images to Supabase Storage
- `--check-images`: Check for missing images in Supabase Storage
- `--days=<n>`: Number of days of history to fetch (default: 3)

**Free Version Limitations:**
- The free version of WAHA doesn't support automatic chat discovery
- You need to manually configure the chat IDs in the script
- Some API endpoints like `/api/chats` are only available in the Plus version

### WAHA Image Handler (`waha-image-handler.js`)

Handles downloading and processing images from WAHA.

**Usage:**
```bash
# Basic image processing
npm run waha-images

# With upload to Supabase
npm run waha-images-upload

# Or directly with options
node scripts/waha-image-handler.js [options]
```

**Options:**
- `--verbose, -v`: Show detailed output
- `--upload`: Upload images to Supabase Storage
- `--group <name>`: Process only a specific group

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

**Troubleshooting:**
- If you see `TypeError: page.waitForTimeout is not a function`, the script has been fixed to use a custom delay function that works with all versions of Puppeteer.
- If you're on Mac Silicon with an x64 Node.js, you might see a performance warning. The script will still work, but might be slower.

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
# Standard update (without scrolling)
npm run update-website

# Full update including scrolling
npm run update-website-full

# Only scroll (no import)
npm run update-website-scroll-only

# Update and deploy to Vercel
npm run update-website-deploy
```

**What it does:**
- Checks for required directories and files (creating them if needed)
- Runs the WhatsApp scrolling script (if using full or scroll-only mode)
- Runs the import script with all necessary options
- Checks for duplicates
- Asks if you want to remove high-confidence duplicates
- Optionally deploys to Vercel (with the --deploy flag)

## Troubleshooting

### WAHA API Issues

1. **Session Already Started Error**
   - Problem: Error message "Session 'default' is already started" but not authenticated
   - Solution: Restart the WAHA container with `npm run restart-waha` or `npm run update-waha-restart`

2. **WAHA API Not Responding**
   - Problem: Cannot connect to WAHA API at http://localhost:3001
   - Solution: Check if Docker is running and start the WAHA container with `docker run -d -p 3001:3000 devlikeapro/waha`

3. **Authentication Issues**
   - Problem: Session is not authenticating or QR code doesn't appear
   - Solution: Restart the WAHA container with `npm run restart-waha` and try again

4. **Media Downloads Failing**
   - Problem: Images not downloading from WAHA
   - Solution: Check if the WhatsApp session is authenticated and try again

5. **Free Version Limitations**
   - Problem: Some API endpoints like `/api/chats` return 404 errors
   - Solution: These endpoints are only available in the Plus version. Use the workarounds described in this README.

### Common Issues

1. **WhatsApp Scrolling Issues**
   - Problem: Script fails to find a group or selector errors
   - Solution: WhatsApp Web's design may have changed, or the group name might be different. Check the console output for errors and update the script as needed.

2. **Puppeteer Errors**
   - Problem: `TypeError: page.waitForTimeout is not a function`
   - Solution: The script has been updated to use a compatible method. Make sure you're using the latest code.

3. **Performance on Mac Silicon**
   - Problem: "Degraded performance warning" about running on arm64 from x64 Node
   - Solution: Install an arm64 version of Node.js for best performance, but the script will still work with x64.

4. **Missing Images**
   - Problem: Images mentioned in listings but not found
   - Solution: Ensure images are in the correct source directories and run the import again

5. **Duplicate Listings**
   - Problem: Same listing appears multiple times
   - Solution: Run the duplicate finder and remover scripts

6. **Import Errors**
   - Problem: Import process fails
   - Solution: Run with `--verbose` flag to see detailed error messages

7. **Database Connection Issues**
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