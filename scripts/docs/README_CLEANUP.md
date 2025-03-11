# Scripts Cleanup and Consolidation Plan

This document outlines the plan for cleaning up and consolidating scripts in the codebase to make it easier to maintain and understand.

## Current Issues

The `scripts` directory currently contains:
- Multiple scripts that perform similar functions
- Outdated scripts that have been superseded by newer versions
- Redundant image handling code across multiple scripts
- Multiple ways to import WhatsApp data (Puppeteer-based, manual exports, WAHA API)
- Numerous README files with overlapping information

## Consolidation Plan

### 1. Organize Scripts by Function

Create logical subdirectories in the `scripts` directory:

```
scripts/
├── import/            # All data import scripts
├── image-handling/    # Image processing scripts
├── categorization/    # Category and ISO classification
├── maintenance/       # Cleanup, duplicate handling, etc.
├── database/          # SQL scripts and database utilities
├── deployment/        # Deployment scripts
└── docs/              # Documentation and READMEs
```

### 2. Consolidate Redundant Scripts

#### WhatsApp Import Scripts
- ✅ Keep `waha-import.js` as the primary import script
- ❌ Deprecate `whatsapp-import.js` and `import-whatsapp-listings.js`
- ❌ Deprecate `update-from-whatsapp.js`

#### Image Handling
- ✅ Keep `waha-image-handler.js` as the primary image processor
- ❌ Deprecate `copy-whatsapp-images.js`, `upload-whatsapp-images.js`, and `upload-whatsapp-group-images.js`

#### Listing Classification
- ✅ Keep `classify-iso-with-llm.js` and `categorize-with-llm.js`
- ❌ Deprecate older category scripts

#### Duplicate Handling
- ✅ Keep `duplicate-finder.js` as the main duplicate detection script
- ❌ Deprecate `findDuplicateListings.js` and `findDuplicateImages.js`

### 3. Create Utility Modules

Extract common functionality into shared utility modules:

- `importUtils.js` - Common functions for all import scripts
- `imageUtils.js` - Shared image processing functions
- `classificationUtils.js` - Shared classification functions
- `databaseUtils.js` - Database interaction functions (built on top of existing dbUtils)

### 4. Update Package.json

Update npm scripts to use the consolidated scripts with clear naming conventions:

- Use `import:` prefix for all import commands
- Use `image:` prefix for image processing commands
- Use `classify:` prefix for classification commands
- Use `db:` prefix for database operations

### 5. Document the New Structure

- Create a main `README.md` that provides an overview of all available scripts
- Include clear usage instructions and examples
- Document the relationships between scripts

## Implementation Approach

1. Create new directory structure
2. Move and rename existing scripts
3. Update import paths in all files
4. Create new utility modules
5. Update package.json commands
6. Test all functionality
7. Document the new structure
8. Create deprecation notices for old scripts

## Benefits

- Clearer organization makes it easier to find scripts
- Reduced code duplication
- Better separation of concerns
- Easier maintenance and updates
- Consistent naming conventions
- Better documentation

## Migration Period

During the transition period:
- Keep deprecated scripts with deprecation notices
- Maintain duplicate npm commands temporarily
- After validation, remove deprecated scripts 