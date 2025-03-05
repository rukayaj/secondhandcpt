# WhatsApp Group Chat Import Process

This document outlines the process for importing WhatsApp group chat exports into the application.

## Overview

The import process consists of several steps:

1. **Extract raw messages** from the WhatsApp chat export file
2. **Filter potential listings** from the raw messages
3. **Convert filtered listings** to the application's format
4. **Integrate the listings** into the application

## Prerequisites

- WhatsApp chat export file (`.txt`) placed in the `whatsapp-exports` directory at the project root
- Node.js and npm installed

## Supported WhatsApp Export Formats

The import process supports two different WhatsApp export formats:

1. **Square Bracket Format**: `[DD/MM/YY, HH:MM:SS] +XX XX XXX XXXX: Message`
2. **Dash Format**: `MM/DD/YY, HH:MM am/pm - Sender: Message`

The script automatically detects the format of the export file and processes it accordingly.

## All-in-One Import Process

For convenience, an all-in-one script is provided that automates the entire import process:

```bash
npm run import-whatsapp-group -- [GROUP_NAME] [INPUT_FILE_PATH]
```

Example:
```bash
npm run import-whatsapp-group -- nifty-thrifty-0-1-years whatsapp-exports/nifty-thrifty-0-1-years.txt
```

This script will:
1. Extract raw messages from the WhatsApp chat export
2. Filter potential listings
3. Convert listings to the application format
4. Integrate the listings into the application

## Step-by-Step Process

If you prefer to run each step individually, you can use the following commands:

### 1. Extract Raw Messages

```bash
npm run extract-whatsapp -- whatsapp-exports/[GROUP_NAME].txt src/data/whatsapp-exports/[GROUP_NAME]-raw.ts [GROUP_NAME]
```

Example:
```bash
npm run extract-whatsapp -- whatsapp-exports/nifty-thrifty-0-1-years.txt src/data/whatsapp-exports/nifty-thrifty-0-1-years-raw.ts nifty-thrifty-0-1-years
```

This step extracts all messages from the WhatsApp chat export file and saves them in a structured format.

### 2. Filter Potential Listings

```bash
npm run filter-listings -- src/data/whatsapp-exports/[GROUP_NAME]-raw.ts src/data/whatsapp-exports/[GROUP_NAME]-listings.ts
```

Example:
```bash
npm run filter-listings -- src/data/whatsapp-exports/nifty-thrifty-0-1-years-raw.ts src/data/whatsapp-exports/nifty-thrifty-0-1-years-listings.ts
```

This step filters the raw messages to identify potential listings based on patterns such as:
- Messages containing selling-related terms
- Messages with prices
- ISO (In Search Of) posts
- Excluding short replies and questions

### 3. Convert Filtered Listings

```bash
npm run convert-listings -- src/data/whatsapp-exports/[GROUP_NAME]-listings.ts src/data/whatsapp-exports/[GROUP_NAME]-app.ts
```

Example:
```bash
npm run convert-listings -- src/data/whatsapp-exports/nifty-thrifty-0-1-years-listings.ts src/data/whatsapp-exports/nifty-thrifty-0-1-years-app.ts
```

This step converts the filtered listings to the application's format, including:
- Extracting metadata (location, condition, size, category)
- Generating titles
- Formatting dates
- Converting image paths

### 4. Integrate Listings

Before running this step, make sure to update the import statement in `src/scripts/integrateNiftyThriftyListings.ts` to point to the correct app file:

```typescript
import { niftyThrifty01YearsListings } from '../data/whatsapp-exports/[GROUP_NAME]-app';
```

Then run:

```bash
npm run integrate-listings
```

This step integrates the converted listings into the application by:
- Ensuring unique IDs
- Combining with existing listings
- Sorting by date (newest first)
- Creating a backup of the original data
- Updating the application's data file

## Data Privacy

To protect user privacy:
- Original WhatsApp chat export files should be added to `.gitignore`
- Files with the `.original.ts` extension are automatically added to `.gitignore`
- Phone numbers are redacted in the public-facing application

## Handling Images

When importing WhatsApp chat exports, the system extracts references to images in the format `IMG-YYYYMMDD-WAXXXX.jpg`. These references are stored in the listings data, but the actual image files need to be manually copied to the correct location.

### Image Location

The application expects images to be located in the following directory:

```
public/images/listings/
```

### Adding Images

To add images from WhatsApp exports:

1. Export the images from WhatsApp to your device
2. Rename the images to match the format referenced in the listings (if needed)
3. Copy the images to the `public/images/listings/` directory

For more detailed information about handling images, see [README-IMAGES.md](README-IMAGES.md).

## Customization

### Filtering Logic

The filtering logic can be customized in `src/scripts/filterListings.ts` by modifying the regular expressions:
- `sellingRegex`: Patterns for identifying selling-related terms
- `isoRegex`: Patterns for identifying ISO posts
- `shortReplyRegex`: Patterns for identifying short replies to exclude
- `questionRegex`: Patterns for identifying questions to exclude

### Metadata Extraction

The metadata extraction logic can be customized in `src/scripts/convertListingsToAppFormat.ts` by modifying the functions:
- `extractLocation`: Patterns for extracting location information
- `extractCondition`: Patterns for extracting condition information
- `extractSize`: Patterns for extracting size information
- `extractCategory`: Keywords for categorizing listings
- `generateTitle`: Logic for generating titles from messages

## Troubleshooting

### Missing Images

If images are referenced in the listings but not available in the application:
1. Create an `images/listings` directory in the `public` folder
2. Copy the images from the WhatsApp export to this directory
3. Ensure the image filenames match those referenced in the listings

### Incorrect Metadata

If metadata (location, condition, size, category) is not being extracted correctly:
1. Review the extraction patterns in `src/scripts/convertListingsToAppFormat.ts`
2. Add or modify patterns to better match the text in your WhatsApp messages
3. Re-run the conversion and integration steps

### Duplicate Listings

If duplicate listings appear in the application:
1. Check for duplicate IDs in the combined listings
2. Ensure the integration script is correctly handling ID conflicts
3. Consider adding additional deduplication logic based on message content or date 