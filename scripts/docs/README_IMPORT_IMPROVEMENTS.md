# Import Process Improvements

This document outlines the improvements made to the WhatsApp import process to address two key issues:

1. **Deleting Conversation Messages**: The ability to identify and delete messages that are just conversations and not actual listings.
2. **Smart Import with Last Import Date**: Preventing re-import of messages that have already been deleted by using the last import date.

## 1. Deleting Conversation Messages

The LLM-based classification script (`classify-iso-with-llm.js`) has been enhanced to identify and delete messages that are just conversations and not actual listings or ISO posts.

### How It Works

- The LLM now classifies messages into three categories: "ISO", "Sale", or "Conversation"
- Messages classified as "Conversation" can be automatically deleted from the database
- The script provides reasoning and confidence scores for each classification

### Commands

- `npm run delete-conversations` - Run the classification with OpenAI and delete conversation messages
- `npm run delete-conversations-dry-run` - Test the classification without making changes
- `npm run cleanup-listings` - Process a limited batch (200) of listings to clean up conversations

## 2. Smart Import with Last Import Date

The import script (`waha-import.js`) now tracks the last successful import date and uses it to avoid re-importing messages that have already been processed and potentially deleted.

### How It Works

- A new metadata system stores the last import date in `src/data/metadata.json`
- When running the import script, it checks for the last import date and only fetches messages after that date
- This prevents re-importing messages that were previously deleted as conversations
- The script updates the last import date after each successful import

### New Commands

- `npm run import-waha-smart` - Import messages using the last import date (recommended)
- `npm run import-waha-force-days` - Override the last import date and use the days parameter instead

### Command Line Options

The `waha-import.js` script now supports these additional options:

- `--ignore-last-date` - Ignore the last import date and use the days parameter instead
- `--days <n>` - Number of days of history to fetch (default: 30, used if no last import date)

## Implementation Details

### New Files

- `src/utils/metadataUtils.js` - Utilities for managing metadata like the last import date
- `src/data/metadata.json` - JSON file storing the last import date and import statistics

### Modified Files

- `scripts/waha-import.js` - Updated to use the last import date for fetching messages
- `scripts/classify-iso-with-llm.js` - Enhanced to identify and delete conversation messages
- `package.json` - Added new commands for the improved functionality

## Benefits

1. **Cleaner Database**: Conversation messages that aren't actual listings can be automatically removed
2. **Efficient Imports**: Only new messages are imported, avoiding re-processing of old messages
3. **Prevents Re-import of Deleted Messages**: Messages that were deleted as conversations won't be re-imported
4. **Better User Experience**: The marketplace will contain fewer irrelevant messages

## Usage Recommendations

For regular updates:
1. Run `npm run import-waha-smart` to import new messages
2. Run `npm run cleanup-listings` to identify and delete conversation messages

For a full cleanup:
1. Run `npm run import-waha-force-days` to import messages from the last 7 days
2. Run `npm run delete-conversations` to process all listings and delete conversations 