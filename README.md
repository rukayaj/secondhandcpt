# Second-Hand Cape Town

A web application for browsing second-hand baby items in Cape Town, powered by Supabase.

## Overview

This application displays listings from WhatsApp groups for second-hand baby items in Cape Town. It uses Supabase for both the database and image storage.

## Features

### Categories
The application automatically categorizes listings into the following categories:
- Clothing
- Toys
- Furniture
- Footwear
- Gear
- Feeding
- Accessories
- Swimming
- Bedding
- Diapering
- Books
- Health
- Bath
- Other

Categories are determined using natural language processing of the listing text, looking for category-specific keywords and patterns.

### Search and Filtering
The website provides powerful search and filtering capabilities:
- **Search by keyword**: Find listings containing specific terms
- **Filter by category**: Browse listings in specific categories
- **Filter by location**: Find items available in specific areas of Cape Town
- **Filter by price range**: Set minimum and maximum price filters
- **Filter by date range**: Filter listings by how recently they were posted
- **Filter by condition**: Filter by item condition (New, Like New, Excellent, etc.)

These filtering options can be combined to narrow down results and find exactly what you're looking for.

## Periodic Import Workflow

This application is designed to be updated periodically (approximately every 3 days) with new listings from WhatsApp groups. There are two methods for importing listings:

1. **WAHA API Integration (Recommended)**: A Docker-based WhatsApp API that provides a more reliable way to fetch messages
2. **Puppeteer-based Import**: The original method that uses browser automation to fetch messages

### Method 1: WAHA WhatsApp API Integration (Recommended)

This is the recommended approach that uses the [WhatsApp API - WAHA](https://github.com/devlikeapro/waha) project to provide a more reliable way to access WhatsApp data.

#### Step 1: Set Up WAHA API

First, make sure Docker is installed and running on your machine, then start the WAHA API container:

```bash
# Run WAHA in Docker on port 3001
docker run -d -p 3001:3000 devlikeapro/waha
```

After starting the container, visit http://localhost:3001 in your browser to check if WAHA is running.

#### Step 2: Configure WhatsApp Group IDs

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

#### Step 3: Run the WAHA Update Script

For the most seamless experience, run the all-in-one WAHA update script:

```bash
# Standard WAHA update 
npm run update-waha

# To restart WAHA container automatically before updating
npm run update-waha-restart

# To deploy to Vercel after updating
npm run update-waha-deploy

# To restart WAHA and deploy in one step
npm run update-waha-full
```

The script will:
1. Ensure WAHA API is running
2. Authenticate with WhatsApp (if needed)
3. Import messages from WhatsApp groups
4. Process and download images
5. Check for duplicates
6. Ask if you want to remove high-confidence duplicates
7. Optionally deploy to Vercel

> **Note:** The first time you run this, you'll need to scan a QR code to authenticate. After the first authentication, the session will persist as long as the WAHA container is running.

#### Alternative: Manual WAHA Steps

If you prefer to run the steps individually:

```bash
# Just restart the WAHA container
npm run restart-waha

# Import listings through WAHA
npm run import-waha-verbose

# Process images from WAHA
npm run waha-images-upload

# Check for duplicates
npm run find-duplicates

# Remove high-confidence duplicates
npm run remove-duplicates
```

#### Troubleshooting WAHA

If you encounter issues with WAHA:

1. **Session Already Started Error**: If you see an error about a session already being started but not authenticated:
   ```
   npm run update-waha-restart
   ```
   This will stop the existing WAHA container and start a fresh one.

2. **Authentication Issues**: If WAHA disconnects from WhatsApp, you may need to restart the container and scan the QR code again.

3. **Check WAHA UI**: You can visit http://localhost:3001 to see the WAHA dashboard and check session status.

4. **Free Version Limitations**: The free version of WAHA has limited API functionality. Some endpoints like `/api/chats` for automatic group discovery are only available in the Plus version.

### Method 2: Original Puppeteer-based Import

This is the original method that uses browser automation to fetch messages. It's less reliable but doesn't require Docker.

#### Step 1: Scroll Through WhatsApp Groups

First, use the automated scrolling script to ensure all messages are loaded in each WhatsApp group:

```bash
# Install Puppeteer if not already installed
npm install puppeteer

# Run the scrolling script
npm run scroll-whatsapp
```

This will:
1. Launch a browser window with WhatsApp Web
2. Prompt you to scan the QR code to log in
3. Automatically scroll through all six WhatsApp groups to load the message history
4. Keep the browser open so you can export the chats

> **Note:** WhatsApp Web only exports messages that have been loaded on your device. The scrolling script ensures all recent messages are loaded before exporting.

> **Mac Silicon (M1/M2/M3) Users:** For best performance, ensure you're using an arm64 version of Node.js. You can check with `node -p "process.arch"`. If it says "x64" instead of "arm64", you might experience slower performance.

### Step 2: Export WhatsApp Chat History

After the scrolling script completes:

1. In the same browser window that the script opened, manually export each chat:
   - Open each group
   - Click the three dots (⋮) in the top-right corner
   - Select More > Export chat
   - Choose "WITHOUT MEDIA" (the script will handle images separately)
   - Save the export files

2. Save the exported chat files to the appropriate directories:
   - `src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (1).txt`
   - `src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year (2).txt`
   - `src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt`
   - `src/data/nifty-thrifty-modern-cloth-nappies/WhatsApp Chat with Nifty Thrifty Modern Cloth Nappies.txt`
   - `src/data/nifty-thrifty-bumps-and-boobs/WhatsApp Chat with Nifty Thrifty Bumps & Boobs.txt`
   - `src/data/nifty-thrifty-kids-3-8-years/WhatsApp Chat with Nifty Thrifty Kids (3-8 years) 2.txt`

3. Save any new images from WhatsApp to the corresponding directories.

### Step 3: Run the Update Script

For the most seamless experience, run the all-in-one update script:

```bash
# Standard update 
npm run update-website

# Or, to do scrolling and updating in one step
npm run update-website-full
```

The full script will:
1. Scroll through WhatsApp groups to load messages 
2. Prompt you to export the chats
3. Check that all required files are in place
4. Run the full import process
5. Check for duplicates
6. Ask if you want to remove high-confidence duplicates

If you also want to deploy the updates to Vercel:

```bash
npm run update-website-deploy
```

### Alternative: Manual Steps

If you prefer to run the steps individually:

```bash
# Scroll through WhatsApp groups only (no import)
npm run update-website-scroll-only

# Import listings
npm run import-whatsapp-full

# Check for duplicates
npm run find-duplicates

# Remove high-confidence duplicates
npm run remove-duplicates
```

### Step 4: Deploy Updates (Optional)

If you're running the application on a hosting service like Vercel, you may need to deploy the updates:

```bash
# If using Vercel
vercel --prod
```

## Supabase Setup

This application runs exclusively off Supabase for both database and storage. No source data is included in the repository.

For detailed setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Dataset Statistics

- Total listings: 601
- Listings with price: 550 (92%)
- Listings with condition: 400 (67%)
- Listings with collection areas: 479 (80%)
- Listings with ISO flag: 41 (7%)

### Listings by WhatsApp Group
- Nifty Thrifty 0-1 year: 424 (71%)
- Nifty Thrifty 1-3 years: 177 (29%)

### Listings by Condition
- UNKNOWN: 201 (33%)
- NEW: 77 (13%)
- VERY_GOOD: 67 (11%)
- GOOD: 140 (23%)
- EXCELLENT: 75 (12%)
- LIKE_NEW: 18 (3%)
- FAIR: 19 (3%)
- POOR: 4 (1%)

### Top 10 Collection Areas
- Claremont: 61 listings
- Kenilworth: 58 listings
- Rondebosch: 34 listings
- Constantia: 33 listings
- Gatesville: 31 listings
- Diep River: 28 listings
- Wynberg: 24 listings
- Plumstead: 22 listings
- Strandfontein: 22 listings
- Bergvliet: 21 listings

### Price Statistics
- Average price: R329
- Minimum price: R1
- Maximum price: R8000
- Free items: 2

## Data Structure

Each listing contains the following fields:
- `whatsappGroup`: The WhatsApp group the listing was posted in
- `date`: The date and time the listing was posted
- `sender`: The phone number of the sender (anonymized)
- `text`: The text content of the listing
- `images`: Array of image filenames (if any)
- `price`: The price in ZAR (null if not specified)
- `condition`: The condition of the item (NEW, LIKE_NEW, VERY_GOOD, GOOD, FAIR, POOR, or null)
- `collectionAreas`: Array of collection areas mentioned
- `iso`: Boolean flag indicating if this is an "In Search Of" message

## Scripts and Utilities

The application includes several scripts to help with importing and managing listings:

### Main Scripts

- `npm run scroll-whatsapp`: Automatically scroll through WhatsApp Web to load message history
- `npm run update-website`: All-in-one script for the entire update process
- `npm run update-website-full`: Complete process including scrolling, importing, and duplicate checking
- `npm run update-website-deploy`: Update and deploy to Vercel
- `npm run update-website-scroll-only`: Only perform scrolling step
- `npm run import-whatsapp`: Basic import of new listings
- `npm run import-whatsapp-verbose`: Import with detailed logging
- `npm run import-whatsapp-full`: Complete import with image handling
- `npm run find-duplicates`: Find potential duplicate listings
- `npm run find-duplicate-images`: Find duplicate images
- `npm run remove-duplicates`: Remove high-confidence duplicates

For more details on the available scripts, see [scripts/README.md](scripts/README.md).

## Development

To run the application locally:

1. Clone the repository
2. Set up Supabase as described in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

### Common Issues

1. **WhatsApp Scrolling Issues**:
   - If you see `TypeError: page.waitForTimeout is not a function`, make sure you have the latest Puppeteer version (`npm install puppeteer@latest`)
   - If the scroll script fails to find a group, try running it again with a different WhatsApp layout
   - If WhatsApp Web design changes, the selectors in the script may need updating
   - Ensure you scan the QR code promptly when the browser opens
   - For Mac Silicon (M1/M2/M3) users, consider using an arm64 version of Node.js for best performance

2. **Missing Images**: If images are mentioned in listings but not found:
   - Check that the images were copied to the correct source directory
   - Run `npm run import-whatsapp-full` again to retry copying and uploading

3. **Duplicate Listings**: If you notice duplicate listings:
   - Run `npm run find-duplicates` to identify them
   - Run `npm run remove-duplicates` to remove high-confidence duplicates

4. **Import Errors**: If the import process fails:
   - Check the console output for specific errors
   - Ensure your WhatsApp export files are in the correct format and location
   - Verify that your Supabase credentials are correct in `.env.local`

## License

This application is provided for research and educational purposes only.
