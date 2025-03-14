# Nifty thrifty

A new web application for browsing, searching and filtering second-hand baby items from WhatsApp in Cape Town, powered by Supabase. Still under development.

This application has been written and is managed by AI (including Claude and ChatGPT), with the occasional bit of help from human developers. Keep in mind that you, the AI, will be building and populating this website, and as it is still under development you can wipe the database and start afresh as much as you wish - don't bother migrating old data, just work on getting the import process right.

The WAHA API (must be running locally with docker run -d -p 3001:3000 devlikeapro/waha - IMPORTANT NOTE: we use port 3001 for this API) is used to connect directly to WhatsApp to access data from the groups. 

Google's Gemini AI is used for processing WhatsApp messages and turning them into structured listing data (with e.g. categories, phone numbers, group names, etc, see the prompt for the full structure) which are stored using Supabase for both the database and image storage. 

IMPORTANT - The WhatsApp groups often contain duplicate listings across groups and within groups. The import process should discard duplicates as and when it finds them. This has proven tricky, it's not reliable to do it based on text content so it's probably best to use image hashes to compare and find duplicates. Use your judgement here. We have also had a few problems with importing images correctly and generating hashes, so pay close attention to this. 

Each WhatsApp group has messages expiring after a certain time, and additionally users sometimes delete messages once an item has been sold. If a message is no longer in the WhatsApp group it should be deleted. For the moment this should be based on when the last message visible in each group was sent - all messages for that group which are older than that timestamp should be deleted from the Supabase storage and the database. For the moment, to keep things simple we won't worry about manually deleted messages by users. The import process (can also be thought of as a syncing process) should handle the deletion of expired messages + the import of new messages. 

There are a number of auth requirements that should be in the .env.local file. 

Note that making database structural changes is not possible from the app - if you need to do that generate some SQL for the human developers to run in the Supabase SQL console. Do not bother saving a file - just write out the SQL.

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
