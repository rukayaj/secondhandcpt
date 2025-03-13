# WhatsApp Message Expiration Mechanism

This document explains how the WhatsApp message expiration mechanism works in our system, the findings from our investigation, and recommendations for improvements.

## Current Implementation

The system uses the following approach to synchronize listings with WhatsApp messages:

1. During each import run, the system finds the **oldest message** still available in each WhatsApp group.
2. Any listings with dates **older than this oldest message** are considered "expired" and are removed from the database.
3. The logic is based on the principle that if a message is no longer available in WhatsApp, the corresponding listing should be removed from our database.

### Key Method: `findOldestMessageTimestamp`

This function queries the WhatsApp API to find the oldest message still available in a group. It sorts messages in ascending order (oldest first) and retrieves the first message.

```javascript
async function findOldestMessageTimestamp(chatId) {
  try {
    console.log(`Finding oldest message for chat ID: ${chatId}...`);
    
    // Get the oldest messages from the group (using sort=asc and limit=1)
    const response = await axios.get(`${WAHA_BASE_URL}/api/messages`, {
      params: {
        session: 'default',
        chatId: chatId,
        limit: 1,
        fromMe: false,
        sort: 'asc' // Sort ascending to get the oldest message first
      }
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const oldestMessage = response.data[0];
      console.log(`Oldest message found from ${new Date(oldestMessage.timestamp * 1000).toISOString()}`);
      return oldestMessage.timestamp;
    } else {
      console.warn(`No messages found for chat ID: ${chatId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error finding oldest message: ${error.message}`);
    return null;
  }
}
```

### Key Method: `deleteExpiredListings`

This function removes listings that are older than the oldest message still available in a WhatsApp group:

```javascript
async function deleteExpiredListings(groupName, timestampSeconds) {
  try {
    // Convert Unix timestamp (seconds) to ISO string for database comparison
    const oldestMessageDate = new Date(timestampSeconds * 1000).toISOString();
    
    console.log(`Deleting listings older than ${oldestMessageDate} for group "${groupName}"...`);
    
    // Find listings to delete (for logging purposes)
    const { data: expiredListings, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, title, date, images')
      .eq('whatsapp_group', groupName)
      .lt('date', oldestMessageDate);
    
    // Delete these listings and their associated images
    // ... (Implementation details)
  } catch (error) {
    console.error(`Error in deleteExpiredListings: ${error.message}`);
    return { deleted: 0, error };
  }
}
```

## Findings

### 1. Future Dates in Logs

The log output shows dates in 2025, which are in the future:

```
Finding oldest message for chat ID: 120363190438741302@g.us...
Oldest message found from 2025-03-12T19:18:15.000Z
```

This suggests one of the following:
- The test environment has its system clock set to a future date
- The WhatsApp API is returning future-dated timestamps
- There's a timezone or date handling issue

### 2. Small Time Differences

The listings being deleted are only a few minutes older than the "oldest message":

- "Baby Mack Fleece Onesie" (2025-03-12T19:09:19+00:00)
- "Adidas blue tracksuit" (2025-03-12T19:13:19+00:00)
- Oldest message: 2025-03-12T19:18:15.000Z

The difference is less than 10 minutes in many cases.

### 3. Technically Correct Behavior

Despite the unusual dates, the system is **working as designed**. The expiration logic correctly identifies messages that are older than the oldest message still available in the group.

## Recommendations

Based on our investigation, we recommend the following improvements:

### 1. Add Minimum Age Requirement

Modify the expiration logic to include a minimum age requirement. This would prevent nearly-new listings from being deleted due to small time differences:

```javascript
function shouldExpire(listingDate, oldestMessageDate, minAgeDays = 7) {
  const listing = new Date(listingDate);
  const oldestMessage = new Date(oldestMessageDate);
  const now = new Date();
  
  // Check if listing is older than the oldest message
  const isOlderThanOldestMessage = listing < oldestMessage;
  
  // Check if listing is older than minimum age
  const listingAgeMs = now.getTime() - listing.getTime();
  const minAgeMs = minAgeDays * 24 * 60 * 60 * 1000;
  const isOlderThanMinAge = listingAgeMs > minAgeMs;
  
  // Only expire if both conditions are met
  return isOlderThanOldestMessage && isOlderThanMinAge;
}
```

### 2. Add Grace Period for Deletion

Add a grace period (e.g., 24 hours) between identifying a listing as expired and actually deleting it. This would allow time for manual review or recovery if needed:

```javascript
// Step 1: Mark listings as "pending deletion"
async function markExpiredListings(groupName, timestampSeconds) {
  // Mark listings as pending deletion without actually deleting them
  // Set a pending_deletion_date field
}

// Step 2: In a separate process, actually delete listings after grace period
async function deletePendingListings() {
  const gracePeriodHours = 24;
  const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;
  
  // Delete listings where:
  // - pending_deletion_date is not null
  // - current time > pending_deletion_date + gracePeriodMs
}
```

### 3. Archive Instead of Delete

Instead of permanently deleting listings, consider archiving them. This would preserve the data while removing it from the active listings:

```javascript
async function archiveExpiredListings(groupName, timestampSeconds) {
  // Instead of deleting, update is_archived field to true
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .update({ is_archived: true, archived_date: new Date().toISOString() })
    .eq('whatsapp_group', groupName)
    .lt('date', oldestMessageDate);
}
```

### 4. Improve Logging and Monitoring

Add more detailed logging and monitoring to better understand the expiration process:

- Log the age of each expired listing (in days)
- Log the time difference between the listing date and the oldest message date
- Create alerts for unusual patterns (e.g., many listings deleted at once)

### 5. Add Configuration Options

Make the expiration behavior configurable:

```javascript
const EXPIRATION_CONFIG = {
  enabled: true,               // Enable/disable expiration entirely
  minAgeDays: 7,               // Minimum age before considering expiration
  useGracePeriod: true,        // Use grace period before deletion
  gracePeriodHours: 24,        // Grace period duration
  archiveInsteadOfDelete: true // Archive instead of delete
};
```

## Implementation Plan

1. **Immediate**: Add tests to validate current behavior and future improvements
2. **Short-term**: Implement minimum age requirement
3. **Medium-term**: Add grace period and archiving functionality
4. **Long-term**: Implement configuration options and improved monitoring

## Conclusion

The current expiration mechanism is working as designed but could benefit from these refinements to prevent premature deletion of listings and provide more flexibility in handling expired content.

These improvements would make the system more robust while still maintaining the core principle of keeping our database in sync with the available WhatsApp messages. 