# Nifty Thrifty Utility Scripts

This directory contains utility scripts for the Nifty Thrifty application.

## Finding Duplicate Listings

The `findDuplicateListings.js` script identifies potential duplicate listings based on:

1. Exact matching image filenames
2. Text similarity
3. Same category and similar price

### How it works

1. The script reads all listings from the sanitized data file
2. It compares listings pairwise, looking for:
   - Listings in the same category
   - Listings with similar prices (within 10%)
   - Listings that share the same image filename
   - Listings with similar text content (using Jaccard similarity)
3. It outputs a list of potential duplicate listings with similarity scores

### Running the script

```bash
node findDuplicateListings.js
```

The script will output potential duplicates to the console and also save detailed results to `duplicate-listings.json`.

### Understanding the results

The script prioritizes:
1. Listings that share the exact same image filename (most reliable indicator)
2. Listings with high text similarity (above 0.7 on a scale of 0-1)

Each potential duplicate pair includes:
- Text similarity score (higher is more similar)
- Whether they share a common image
- Details of both listings for comparison

### Removing duplicates

After identifying duplicates, you can manually edit the `sampleData.sanitized.ts` file to remove the unwanted duplicates.

## Other Scripts

- `sanitizeData.js`: Script to sanitize phone numbers in the data file 