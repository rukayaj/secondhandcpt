# Second-Hand Cape Town

A web application for browsing second-hand baby items in Cape Town, powered by Supabase.

## Overview

This application displays listings from WhatsApp groups for second-hand baby items in Cape Town. It uses Supabase for both the database and image storage.

## Periodic Import Workflow

This application is designed to be updated periodically (approximately every 3 days) with new listings from WhatsApp groups. The workflow is as follows:

### Step 1: Scroll Through WhatsApp Groups

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
npm run update-website
```

This script will:
1. Check that all required files are in place
2. Run the full import process
3. Check for duplicates
4. Ask if you want to remove high-confidence duplicates
5. Guide you through the entire process

If you also want to deploy the updates to Vercel:

```bash
npm run update-website-deploy
```

### Alternative: Manual Steps

If you prefer to run the steps individually:

```bash
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
- `npm run update-website-deploy`: Update and deploy to Vercel
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
   - If the scroll script fails to find a group, try running it again
   - If WhatsApp Web design changes, the selectors in the script may need updating
   - Ensure you scan the QR code promptly when the browser opens

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
