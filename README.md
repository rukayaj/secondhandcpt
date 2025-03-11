# Second-Hand Cape Town

A web application for browsing second-hand baby items in Cape Town, powered by Supabase.

## Overview

This application displays listings from WhatsApp groups for second-hand baby items in Cape Town. It uses Supabase for both the database and image storage, and Google's Gemini AI for processing WhatsApp messages.

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

## Import Workflow with WAHA-Gemini Integration

This application uses the WAHA API to connect directly to WhatsApp and the Gemini AI to process messages and extract structured listing data. This approach provides a more reliable and automated way to import listings.

### WAHA-Gemini Integration

The WAHA-Gemini integration provides the following benefits:
- Direct connection to WhatsApp without manual export steps
- AI-powered extraction of structured listing data
- Automatic image downloading and uploading
- More reliable and consistent results

For detailed setup and usage instructions, see [WAHA_GEMINI_SETUP.md](WAHA_GEMINI_SETUP.md).

### Quick Start

To get started with the WAHA-Gemini integration:

1. Install dependencies:
   ```bash
   npm install @google/generative-ai
   ```

2. Start the WAHA Docker container:
   ```bash
   docker run -d -p 3001:3000 devlikeapro/waha
   ```

3. Ensure you have a Gemini API key in your `.env.local` file:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. Run the import process:
   ```bash
   npm run import-waha-gemini-full
   ```

### Available Scripts

The following npm scripts are available for the WAHA-Gemini integration:

```bash
# Standard WAHA-Gemini update (verbose output, upload images, check for missing images)
npm run import-waha-gemini-full

# Restart WAHA container and run the full import
npm run update-waha-gemini

# Deploy to Vercel after updating
npm run update-waha-gemini-deploy
```

## Supabase Setup

This application runs exclusively off Supabase for both database and storage. No source data is included in the repository.

For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

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

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This application is designed to be deployed to Vercel:

```bash
npm run vercel-deploy
```

## License

This project is licensed under the MIT License.
