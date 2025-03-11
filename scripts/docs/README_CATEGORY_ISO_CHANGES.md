# Category System and ISO Post Detection Updates

This guide explains two major improvements to the system:

1. **Improved ISO Post Detection with LLM**: Using a language model to distinguish genuine ISO (In Search Of) posts from regular group messages.

2. **Better Category System**: Changing from "Other" to "Uncategorised" as the default state for new listings.

## 1. LLM-based ISO Post Detection

### Problem: 
The previous ISO detection system had false positives - it was flagging regular messages like "Please post a pic" or "I'll get it tomorrow" as ISO posts because they contained phrases like "please" or "anyone".

### Solution:
We now use a language model to analyze the full context of messages and determine if they're genuine ISO posts or just regular group messages.

### How to Use:

1. **Run the ISO Classification Script**:
   ```bash
   npm run classify-iso-with-llm
   ```
   This will:
   - Show you current ISO posts that might be false positives
   - Use the LLM to analyze and re-classify them
   - Update their status in the database

2. **Automated Commands**:
   - `npm run classify-iso-live` - Run with OpenAI, automatically update database
   - `npm run classify-iso-dry-run` - Run with OpenAI but don't update database
   - `npm run classify-iso-mock` - Run with mock model for testing

## 2. Better Category System

### Problem:
The previous system used "Other" as both a legitimate category AND as the default for uncategorized listings, which was confusing.

### Solution:
We've introduced "Uncategorised" (note British spelling) as the initial state for all new listings. Now:

- New listings start as "Uncategorised"
- The categorization script looks specifically for "Uncategorised" listings to process
- "Other" is now a legitimate category for items that truly don't fit elsewhere

### Implementation Steps:

1. **Run the Database Migration**:
   ```bash
   npm run switch-to-uncategorised
   ```
   This will tell you to run the SQL script in Supabase SQL Editor:
   ```sql
   -- Copy the contents of scripts/switch-to-uncategorised.sql
   ```

2. **Updated Commands**:
   - `npm run categorize-uncategorised-with-llm` - Process uncategorised listings with LLM
   - `npm run categorize-uncategorised-dry-run` - Test without updating database
   - `npm run categorize-uncategorised-mock` - Test with mock data

## How the Updated System Works

1. **New Listings Flow**:
   - New listings come in with category = "Uncategorised"
   - The LLM categorization script finds these listings and categorizes them
   - The "Uncategorised" category should shrink over time as listings get processed

2. **ISO Post Detection Flow**:
   - Listings are analyzed for ISO patterns
   - The `is_iso` flag is set in the database
   - The ISO classifier can be run to fix any false positives

## Files Changed

- `scripts/classify-iso-with-llm.js` - New script for LLM-based ISO detection
- `scripts/switch-to-uncategorised.sql` - SQL migration script
- `scripts/categorize-with-llm.js` - Updated to target "Uncategorised" listings 
- `src/utils/categoryUtils.js` - Changed default category to "Uncategorised"
- `src/utils/dbUtils.js` - Changed default category in database operations

## Benefits

- More accurate ISO detection with fewer false positives
- Clearer distinction between genuinely uncategorized listings and "Other" category
- Better workflow for processing new listings 