# WhatsApp Import and Sync Process Improvements

This document outlines the improvements made to the WhatsApp import process to better handle multi-message listings, sold status tracking, and synchronization with WhatsApp's message expiration.

## Database Schema Updates

We've added several new columns to the `listings` table to support the enhanced functionality:

- `is_multi_message`: Boolean flag indicating if a listing spans multiple messages
- `message_count`: Number of messages that make up this listing
- `is_sold`: Boolean flag indicating if the item has been sold
- `sold_date`: Timestamp when the item was marked as sold
- `title`: Extracted title of the listing

To apply these changes, run:

```bash
npm run db:add-multi-message-columns
```

## Message Grouping Improvements

### Previous Approach
Previously, we grouped messages based on a short time window (10 minutes) and only considered messages from the same sender.

### New Approach
The new approach groups messages from the same sender over a much longer period (72 hours) and takes into account:

1. **Reply Context**: Messages that are replies to other messages are grouped together
2. **Sold Markers**: Messages containing "x" or "sold" text are identified as sold markers
3. **Multiple Listings**: A single user may post multiple listings over time, which are now properly separated

## Gemini Prompt Enhancements

The Gemini prompt has been enhanced to:

1. Process multiple messages from the same user as a group
2. Extract multiple listings from a group of messages when appropriate
3. Identify sold items and extract the sold date
4. Better handle message context and replies

## Sold Status Tracking

We now track when items are marked as sold:

1. **Detection**: Items marked as sold via "x" or "sold" messages are identified
2. **Database Updates**: The `is_sold` and `sold_date` fields are updated in the database
3. **API**: New functions like `markListingAsSold` and `findPotentiallySoldListings` help manage sold items

## Message Expiration Synchronization

WhatsApp groups have a message expiration feature that automatically removes old messages. To keep our database in sync with this behavior:

1. **Oldest Message Detection**: The import script now identifies the oldest message still available in each WhatsApp group
2. **Database Cleanup**: Listings older than the oldest available message are removed from the database
3. **Automatic Sync**: This synchronization happens automatically during the import process

This ensures that our database only contains listings whose source messages are still available in the WhatsApp groups, maintaining data consistency.

## Usage

The enhanced import and sync process can be run with:

```bash
npm run import-waha-gemini-verbose -- --days 1 --limit 2
```

Options:
- `--days`: Number of days to look back for messages
- `--limit`: Maximum number of messages to process per group
- `--skip-images`: Skip image processing (faster for testing)
- `--skip-sync`: Skip the synchronization of expired listings

## Benefits

These improvements provide several benefits:

1. **Better User Experience**: More accurate representation of listings that span multiple messages
2. **Reduced Duplicates**: Better grouping reduces duplicate listings
3. **Up-to-date Information**: Sold status tracking keeps the database current
4. **Data Consistency**: Synchronization with WhatsApp's message expiration maintains database integrity
5. **More Context**: Related messages are properly grouped, providing more context for each listing

## Future Improvements

Potential future improvements include:

1. **Enhanced Sold Detection**: Improve detection of sold items through more sophisticated pattern matching
2. **User Notification**: Notify users when their items are automatically marked as sold
3. **Historical Data Update**: Process historical data to apply these improvements to existing listings
4. **Differential Sync**: Optimize synchronization by only checking for changes since the last sync 