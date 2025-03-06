# Second-Hand Cape Town Dataset

This dataset contains 601 listings from WhatsApp groups for second-hand baby items in Cape Town.

## Dataset Statistics

- Total listings: 601
- Listings with price: 550 (92%)
- Listings with condition: 400 (67%)
- Listings with collection areas: 479 (80%)
- Listings with ISO flag: 41 (7%)

### Listings by WhatsApp Group
- Nifty Thrifty 0-1 year: 424 (71%)
- Nifty Thrifty 1-3 years: 177 (29%)

### Listings by Condition
- UNKNOWN: 201 (33%)
- NEW: 77 (13%)
- VERY_GOOD: 67 (11%)
- GOOD: 140 (23%)
- EXCELLENT: 75 (12%)
- LIKE_NEW: 18 (3%)
- FAIR: 19 (3%)
- POOR: 4 (1%)

### Top 10 Collection Areas
- Claremont: 61 listings
- Kenilworth: 58 listings
- Rondebosch: 34 listings
- Constantia: 33 listings
- Gatesville: 31 listings
- Diep River: 28 listings
- Wynberg: 24 listings
- Plumstead: 22 listings
- Strandfontein: 22 listings
- Bergvliet: 21 listings

### Price Statistics
- Average price: R329
- Minimum price: R1
- Maximum price: R8000
- Free items: 2

## Data Cleaning Process

The dataset was cleaned through a multi-stage process:
1. Initial extraction from WhatsApp group exports
2. Automated parsing of listings to identify prices, conditions, and collection areas
3. Manual review of listings without prices to:
   - Add missing prices where available
   - Flag "In Search Of" (ISO) messages
   - Remove irrelevant messages (greetings, status updates, etc.)
4. Final cleanup and standardization

## Dataset Structure

Each listing contains the following fields:
- `whatsappGroup`: The WhatsApp group the listing was posted in
- `date`: The date and time the listing was posted
- `sender`: The phone number of the sender (anonymized)
- `text`: The text content of the listing
- `images`: Array of image filenames (if any)
- `price`: The price in ZAR (null if not specified)
- `condition`: The condition of the item (NEW, LIKE_NEW, VERY_GOOD, GOOD, FAIR, POOR, or null)
- `collectionAreas`: Array of collection areas mentioned
- `iso`: Boolean flag indicating if this is an "In Search Of" message

## License

This dataset is provided for research and educational purposes only.
