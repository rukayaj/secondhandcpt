# Second Hand CPT

A marketplace application for second-hand baby items in Cape Town.

## Project Structure

The project is organized as follows:

```
src/
├── components/        # React components
├── data/              # Data files and WhatsApp exports
│   └── whatsapp-exports/  # Exported WhatsApp group data
├── pages/             # Next.js pages
├── scripts/           # Utility scripts for data processing
├── styles/            # CSS and styling
└── utils/             # Utility functions
    ├── textParsingUtils.ts  # Shared text parsing utilities
    ├── parser.ts            # Main parser and data access functions
    ├── combineListings.ts   # Functions to combine listings from different sources
    └── filterUtils.ts       # Utilities for filtering listings
```

## Key Utilities

### Text Parsing Utilities

The `textParsingUtils.ts` file contains shared functions for extracting information from listing messages:

- `extractCondition`: Extracts condition information (New, Excellent, Good, etc.)
- `extractSize`: Extracts size information (0-3 months, 1-2 years, etc.)
- `extractLocation`: Extracts location information
- `extractPrice`: Extracts price information
- `isISOPost`: Determines if a post is an "In Search Of" (ISO) post
- `determineCategory`: Determines the category of a listing

### Parser

The `parser.ts` file provides the main interface for accessing listing data:

- `getAllListings`: Gets all listings
- `getListingById`: Gets a listing by ID
- `getListingsByCategory`: Gets listings by category
- `getListingsByLocation`: Gets listings by location
- `getListingsByPriceRange`: Gets listings by price range
- `getListingsByDateRange`: Gets listings by date range
- `getISOPosts`: Gets all ISO posts
- `searchListings`: Searches listings by keyword

## Scripts

The `scripts` directory contains utility scripts for processing data:

- `convertListingsToAppFormat.ts`: Converts raw WhatsApp listings to the app format
- `combineAllListings.ts`: Combines listings from different sources
- `updateListingsWithoutImages.ts`: Updates listings without images
- `manuallyReviewListingsWithoutImages.ts`: Applies manual review decisions

## Maintenance Guidelines

1. **Adding New Categories**: To add a new category, update the `categories` array in `textParsingUtils.ts`.

2. **Updating Text Parsing Logic**: All text parsing logic is centralized in `textParsingUtils.ts` for easier maintenance.

3. **Processing New WhatsApp Exports**:
   - Place the raw export in `src/data/whatsapp-exports/`
   - Run the conversion script: `npx ts-node src/scripts/convertListingsToAppFormat.ts <input-file> <output-file>`
   - Run the combine script: `npx ts-node src/scripts/combineAllListings.ts`

4. **ISO Post Detection**: ISO posts are detected based on:
   - Explicit keywords like "ISO", "in search of", "looking for"
   - Absence of images combined with phrases like "anyone selling", "anyone have"

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Features

- Browse listings by category, location, and price range
- View "In Search Of" (ISO) posts
- Filter listings by date posted
- Responsive design for mobile and desktop
- Search functionality

## Technology Stack

- Next.js
- TypeScript
- Tailwind CSS
- FontAwesome icons

## Data Privacy

This repository uses sanitized data with phone numbers redacted. The original data files are excluded from version control.

## License

MIT 