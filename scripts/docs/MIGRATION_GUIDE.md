# Migration Guide: Scripts Consolidation

This document provides guidance for developers on how to use the new script organization and structure.

## Overview of Changes

The scripts directory has been reorganized into a more logical structure:

```
scripts/
├── import/            # Data import scripts
├── image-handling/    # Image processing scripts
├── categorization/    # Category and ISO classification
├── maintenance/       # Cleanup, duplicate handling, etc.
├── database/          # SQL scripts and database utilities
├── deployment/        # Deployment scripts
└── docs/              # Documentation and READMEs
```

Utility modules have been created to reduce code duplication:

- `scripts/import/importUtils.js`
- `scripts/image-handling/imageUtils.js`
- `scripts/categorization/classificationUtils.js`

## How to Run Scripts

All scripts can now be run using npm commands with consistent prefixes:

- `npm run import:*` for import scripts
- `npm run image:*` for image handling
- `npm run category:*` for category management
- `npm run iso:*` for ISO classification
- `npm run maintenance:*` for duplicate handling and maintenance
- `npm run deploy:*` for deployment scripts
- `npm run db:*` for database operations

For example:
```bash
# Import WhatsApp messages
npm run import:waha-smart

# Process images
npm run image:upload

# Categorize listings
npm run category:uncategorised-with-llm

# Find and remove duplicates
npm run maintenance:find-duplicates
npm run maintenance:remove-duplicates
```

## Using the Utility Modules

### Import Utilities

```javascript
const { 
  WHATSAPP_GROUPS,
  WAHA_BASE_URL,
  WAHA_SESSION,
  getAdminClient,
  checkWahaSessionStatus,
  startWahaSession,
  waitForWahaAuthentication,
  createDirectories
} = require('../import/importUtils');
```

### Image Utilities

```javascript
const {
  getAdminClient,
  WHATSAPP_GROUPS,
  getGroupByName,
  ensureDirectoriesExist,
  downloadImage,
  uploadImageToSupabase,
  checkMissingSupabaseImages
} = require('../image-handling/imageUtils');
```

### Classification Utilities

```javascript
const {
  getAdminClient,
  isISOPostByPattern,
  detectCategoryByKeywords,
  getUncategorizedListings,
  updateListingCategories,
  getISOListings,
  updateListingISOFlags,
  deleteListingsByIds
} = require('../categorization/classificationUtils');
```

## Updating Old Scripts

If you need to update an old script to use the new structure:

1. Move the script to the appropriate directory
2. Update imports to use utility modules
3. Remove duplicate functionality
4. Update any paths that reference the old structure

For example, if you have a script that imports from WhatsApp:

```javascript
// Old way
const { listingExists, addListing } = require('../src/utils/dbUtils');
const { WHATSAPP_GROUPS } = require('../src/utils/imageHandler');

// New way
const { listingExists, addListing } = require('../../src/utils/dbUtils');
const { WHATSAPP_GROUPS } = require('./importUtils');
```

## Legacy Support

For backward compatibility, legacy commands are still available:

```bash
# Old command
npm run import-waha-smart

# New command (preferred)
npm run import:waha-smart
```

These legacy commands will be removed in a future update, so please start using the new commands.

## Testing the New Structure

You can test that the new structure is correctly set up by running:

```bash
npm run test:structure
```

This will verify that:

1. Utility modules can be imported
2. All expected directories exist
3. Script prefixes exist in package.json

## Recommended Workflow

For the current recommended workflow:

1. **Import Messages**:
   ```bash
   npm run import:waha-smart
   ```

2. **Process Images**:
   ```bash
   npm run image:upload
   ```

3. **Cleanup Conversation Messages**:
   ```bash
   npm run iso:cleanup-listings
   ```

4. **Categorize Uncategorized Listings**:
   ```bash
   npm run category:uncategorised-with-llm
   ```

5. **Find and Remove Duplicates**:
   ```bash
   npm run maintenance:find-duplicates
   npm run maintenance:remove-duplicates
   ```

## Questions or Issues

If you encounter any issues with the new structure, please:

1. Run the test script to verify the structure is correct
2. Check the log files for any errors
3. Update your local version to the latest commit
4. Contact the development team if issues persist 