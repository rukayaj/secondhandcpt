# Fix WhatsApp Message Expiration Mechanism

## Problem

Users reported that listings were being deleted by the expiration mechanism even though they were still visible in the WhatsApp groups. This indicated a potential issue with how the system determines which listings should be expired.

## Solution

This PR implements an improved WhatsApp message expiration mechanism that addresses several issues with the current implementation:

1. **Fixed Query Parameters**: Removed the `fromMe: false` filter when querying for the oldest message, ensuring we get the true oldest message in the group.
2. **Added Minimum Age Requirement**: Listings must now be at least 7 days old before they can be considered for expiration.
3. **Added Verification Step**: Before deleting a listing, the system now checks if it still exists in the WhatsApp group.
4. **Improved Logging**: Added detailed logging to help diagnose any issues.

## Changes

- Added `scripts/import/test-oldest-message.js` - A test script to investigate issues with the expiration mechanism
- Added `scripts/import/improved-expiration.js` - The improved implementation of the expiration mechanism
- Added `scripts/import/run-improved-expiration.sh` - A shell script to run the improved expiration mechanism
- Added documentation in `docs/WHATSAPP_EXPIRATION_FIX.md`

## Testing

The changes have been tested by:

1. Running the test script to compare the current and improved methods of finding the oldest message
2. Verifying that listings that are still visible in WhatsApp are not deleted
3. Confirming that listings meet the minimum age requirement before being considered for expiration

## Deployment Notes

To deploy these changes:

1. Ensure the WhatsApp API server is running
2. Run the improved expiration mechanism:
   ```bash
   cd scripts/import
   ./run-improved-expiration.sh
   ```

## Screenshots

[Add screenshots of the test results or logs showing the improved behavior] 