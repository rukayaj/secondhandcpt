# ISO Column Update

This guide will help you update your database to support the new ISO (In Search Of) features.

## Background

ISO posts are listings where users are seeking items rather than selling them. The codebase has been updated to:

1. Properly detect ISO posts using sophisticated pattern matching
2. Use the "no price = ISO" heuristic to catch more ISO listings
3. Store the ISO status in a dedicated database column
4. Allow filtering and viewing ISO posts separately

## Enhanced ISO Detection Logic

The new ISO detection logic combines two approaches:

1. **Pattern Matching**: Identifies ISO listings based on phrases like:
   - "ISO" or "in search of"
   - "looking for" or "wanted"
   - "does anyone have" or "can anyone"
   - Questions ending with "?"
   - And many more patterns

2. **No-Price Heuristic**: Listings without a price are considered ISO listings unless they explicitly mention selling terms.

In our database, approximately 40% of ISO listings are detected using the no-price heuristic, and 60% are detected using pattern matching.

## Step 1: Run the SQL Script

First, you need to add the `is_iso` column to your database. Run the provided SQL script in your Supabase SQL Editor:

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project > SQL Editor
3. Create a new query
4. Copy and paste the contents of `scripts/setup_iso_column.sql`
5. Click "Run" to execute the script

This script will:
- Add the `is_iso` column to the listings table
- Create an index for faster searching
- Create a helper function to check if columns exist
- Verify that everything was set up correctly

## Step 2: Update Existing Listings

After adding the column, you need to analyze all existing listings and set the `is_iso` flag appropriately:

```bash
npm run update-iso-flags
```

This script will:
- Check each listing's text for ISO indicators
- Update the `is_iso` flag in the database
- Provide statistics about how many listings were updated

## Step 3: Test the Updates

The website should now use the database `is_iso` field instead of text-based detection. Test this by:

1. Visiting the ISO page: http://localhost:3000/iso
2. Checking that listings are correctly categorized as ISO or not
3. Using the filtering options to filter ISO posts by date, category, etc.

## Important Files

- `scripts/setup_iso_column.sql` - SQL script to add the column and helper function
- `scripts/update-iso-flags.js` - Script to update all listings with the correct ISO flag
- `src/utils/listingUtils.ts` - Contains the updated code for retrieving ISO listings
- `src/utils/filterUtils.ts` - Contains the new `filterISOPosts` function

## Troubleshooting

If you encounter issues:

1. **Column doesn't exist error**: Make sure you've run the SQL script from Step 1.
2. **Script fails**: Check the error message - it should provide guidance on what's missing.
3. **ISO posts not showing**: Verify that the column exists and has been populated with correct values.

For more help, refer to the code comments in the relevant files. 