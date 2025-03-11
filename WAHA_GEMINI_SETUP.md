# Waha-Gemini Integration

This document explains how to set up and use the Waha-Gemini integration for fetching WhatsApp messages and processing them with Google's Gemini AI.

## Overview

The Waha-Gemini integration replaces the previous method of manually exporting WhatsApp chat history. Instead, it:

1. Uses the WAHA (WhatsApp API) to directly fetch messages from WhatsApp groups
2. Processes these messages with Google's Gemini AI to extract structured listing data
3. Adds the listings to the Supabase database
4. Handles images automatically (download and upload to Supabase Storage)

This approach is more reliable, automated, and reduces manual steps.

## Prerequisites

- Docker (for running the WAHA container)
- Node.js
- Supabase project (already set up)
- Gemini API key (added to .env.local)

## Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai
```

### 2. Set up Environment Variables

Make sure your `.env.local` file contains the Gemini API key:

```
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Start the WAHA Docker Container

```bash
# Run WAHA in Docker on port 3001
docker run -d -p 3001:3000 devlikeapro/waha
```

After starting the container, visit http://localhost:3001 in your browser to check if WAHA is running.

### 4. Configure WhatsApp Group IDs

The WhatsApp group IDs need to be configured in the `scripts/import/importUtils.js` file. Each group should have a `chatId` specified.

```javascript
const WHATSAPP_GROUPS = [
  {
    name: 'Nifty Thrifty Modern Cloth Nappies',
    chatId: '120363045386754642@g.us',  // Replace with actual chat ID
    folderPath: 'tmp/waha-images/nifty-thrifty-modern-cloth-nappies'
  },
  // ... other groups
];
```

To find the chat IDs:
1. Open WhatsApp Web in your browser
2. Open the Developer Tools (F12 or right-click > Inspect)
3. Go to the Network tab
4. Filter for "messages" or "chats"
5. Look for requests that contain the chat ID in the URL or response

## Usage

### Running the Import Process

For the most seamless experience, run the all-in-one Waha-Gemini update script:

```bash
# Standard Waha-Gemini update (verbose output, upload images, check for missing images)
npm run import-waha-gemini-full

# To restart WAHA container automatically before updating
npm run update-waha-gemini

# To deploy to Vercel after updating
npm run update-waha-gemini-deploy
```

### Alternative: Manual Steps

If you prefer to run the steps individually:

```bash
# Just restart the WAHA container
npm run restart-waha

# Import listings through WAHA with Gemini processing
npm run import-waha-gemini

# More verbose output
npm run import-waha-gemini-verbose
```

## How It Works

1. **Authentication**: The script connects to WAHA and authenticates with WhatsApp. The first time you run it, you'll need to scan a QR code. After that, the session will persist.

2. **Fetching Messages**: It gets messages from all configured WhatsApp groups, starting from the last import date (or a specified number of days ago).

3. **Gemini Processing**: Each message is processed with Google's Gemini AI to extract:
   - Listing type (SALE or ISO)
   - Title
   - Price
   - Condition
   - Collection areas
   - Description
   - Phone number
   - Category

4. **Database Update**: Valid listings are added to the Supabase database.

5. **Image Processing**: If enabled, images are downloaded from WhatsApp and uploaded to Supabase Storage.

## Troubleshooting

### WAHA Session Issues

If you see an error about a session already being started but not authenticated:

```bash
npm run update-waha-gemini
```

This will stop the existing WAHA container and start a fresh one.

### Missing Images

If you notice missing images after import:

```bash
npm run import-waha-gemini -- --check-images
```

This will check for missing images in the Supabase Storage.

### Gemini API Issues

If there are errors with the Gemini API:

1. Check your API key in `.env.local`
2. Make sure you have billing set up for the Gemini API
3. Check the [Gemini API documentation](https://ai.google.dev/docs) for any updates or changes

## Batch Processing

For processing large numbers of messages, the script uses batching to avoid overwhelming the APIs. You can adjust the batch size in the script if needed. 