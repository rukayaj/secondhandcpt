# Second-Hand Cape Town

A web application for browsing second-hand baby items in Cape Town, powered by Supabase.

## Overview

This application displays listings from WhatsApp groups for second-hand baby items in Cape Town. The WAHA API (must be running locally with docker run -d -p 3001:3000 devlikeapro/waha - NOTE we use port 3001) is used to connect directly to WhatsApp to access data from the groups. Google's Gemini AI is used for processing WhatsApp messages and turning them into structured listing data with e.g. categories which are stored using Supabase for both the database and image storage. The front end makes the listings searchable and filterable. 

IMPORTANT - The WhatsApp groups often contain duplicate listings across groups and within groups. The import process should discard duplicates as and when it finds them. 

Each WhatsApp group has messages expiring after a certain time, and additionally users sometimes delete messages once an item has been sold. If a message is no longer in the WhatsApp group it should be deleted. For the moment this should be based on when the last message visible in each group was sent - all messages for that group which are older than that timestamp should be deleted from the Supabase storage and the database.

There are a number of auth requirements that should be in the .env.local file.

The following npm scripts are available for the WAHA-Gemini integration:

```bash
# Standard WAHA-Gemini update (verbose output, upload images, check for missing images)
npm run import-waha-gemini-full

# Restart WAHA container and run the full import
npm run update-waha-gemini

# Deploy to Vercel after updating
npm run update-waha-gemini-deploy
```

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
