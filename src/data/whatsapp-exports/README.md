# WhatsApp Group Chat Exports

This directory contains WhatsApp group chat exports and their processed listings for the Second Hand CPT application.

## Directory Structure

- `*.ts` - Sanitized WhatsApp chat exports (with phone numbers redacted)
- `*.listings.ts` - Processed listings extracted from the chat exports
- `*.original.ts` - Original WhatsApp chat exports (not committed to Git, contains phone numbers)

## Import Process

The import process consists of two main steps:

1. **Import and Sanitize**: The raw WhatsApp chat export is imported and sanitized to redact phone numbers.
2. **Process and Parse**: The sanitized chat is processed to extract listings with their details.

## Available Scripts

### Import a New WhatsApp Group

1. Export the WhatsApp group chat:
   - Open the WhatsApp group
   - Click on the group name
   - Scroll down and select "Export chat"
   - Choose "Without media"
   - Save the exported text file to the `whatsapp-exports` directory in the project root

2. Create an import script for the new group:
   ```typescript
   // src/scripts/import[GroupName].ts
   import importAndSanitizeWhatsAppChat from './importWhatsAppChat';
   import path from 'path';

   const GROUP_NAME = 'your-group-name';
   const inputFilePath = path.resolve(process.cwd(), 'whatsapp-exports', `${GROUP_NAME}.txt`);
   const outputFilePath = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.ts`);

   importAndSanitizeWhatsAppChat(inputFilePath, outputFilePath, GROUP_NAME)
     .then(() => console.log('Import completed successfully'))
     .catch(console.error);
   ```

3. Create a processing script for the new group:
   ```typescript
   // src/scripts/process[GroupName].ts
   import fs from 'fs';
   import path from 'path';
   import parseWhatsAppChat from '../utils/whatsAppParser';

   const GROUP_NAME = 'your-group-name';
   const SANITIZED_CHAT_PATH = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.ts`);
   const OUTPUT_LISTINGS_PATH = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', `${GROUP_NAME}.listings.ts`);

   // ... rest of the processing code
   ```

4. Run the scripts:
   ```bash
   npx ts-node src/scripts/import[GroupName].ts
   npx ts-node src/scripts/process[GroupName].ts
   ```

   Or create a combined script:
   ```typescript
   // src/scripts/importAndProcess[GroupName].ts
   import { execSync } from 'child_process';
   import path from 'path';

   // ... implementation
   ```

### Combine All Listings

To combine all listings from different sources (including WhatsApp groups):

```bash
npx ts-node src/scripts/combineAllListings.ts
```

This will:
1. Import the original listings
2. Import all WhatsApp group listings
3. Combine them into a single dataset
4. Deduplicate the combined listings
5. Save the result to `src/utils/combinedListings.ts`

## Privacy Considerations

- Original WhatsApp chat exports contain phone numbers and should not be committed to Git
- The `.gitignore` file is configured to exclude `*.original.ts` files and the `whatsapp-exports` directory in the project root
- Always verify that phone numbers are properly redacted before committing any files

## Customization

The WhatsApp parser can be customized in `src/utils/whatsAppParser.ts`:

- Adjust regular expressions for better message parsing
- Modify category detection logic
- Improve condition, size, and location extraction
- Add new metadata extraction functions

## Troubleshooting

- If the parser is not correctly identifying listings, check the message format in the WhatsApp export
- If categories or other metadata are not being detected, review and update the regular expressions in the parser
- For issues with phone number redaction, verify the regex pattern in the import script 