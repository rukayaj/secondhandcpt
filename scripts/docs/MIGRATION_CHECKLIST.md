# Migration Checklist

This document tracks the progress of the script consolidation and what tasks remain to be completed.

## Completed Tasks

- [x] Created new logical directory structure
- [x] Moved scripts to appropriate directories
- [x] Created utility modules for shared functionality:
  - [x] `importUtils.js`
  - [x] `imageUtils.js`
  - [x] `classificationUtils.js`
- [x] Updated package.json with consistent script naming
- [x] Added legacy commands for backward compatibility
- [x] Added deprecation notices to deprecated scripts
- [x] Created comprehensive documentation
- [x] Created test script to verify structure
- [x] Updated imports in main scripts:
  - [x] Updated `waha-import.js` to use utility modules

## Testing Checklist

- [ ] Test import functionality:
  - [ ] Run `npm run import:waha-smart` to import messages
  - [ ] Verify new listings were added correctly
  
- [ ] Test image processing:
  - [ ] Run `npm run image:upload` to process images
  - [ ] Verify images are correctly uploaded to Supabase
  
- [ ] Test categorization:
  - [ ] Run `npm run category:uncategorised-with-llm` to categorize listings
  - [ ] Verify categories are applied correctly
  
- [ ] Test ISO classification:
  - [ ] Run `npm run iso:classify-with-llm` to classify ISO posts
  - [ ] Verify ISO flags are updated correctly
  
- [ ] Test duplicate handling:
  - [ ] Run `npm run maintenance:find-duplicates` to find duplicates
  - [ ] Run `npm run maintenance:remove-duplicates` to remove duplicates
  - [ ] Verify duplicates are correctly identified and removed

## Documentation Updates

- [x] Updated main README.md
- [x] Created README_CLEANUP.md with the consolidation plan
- [x] Created README_CONSOLIDATION_SUMMARY.md with changes made
- [x] Created MIGRATION_CHECKLIST.md to track progress
- [x] Created MIGRATION_GUIDE.md for developers
- [ ] Update any inline documentation in scripts to reference new paths

## Remaining Tasks

- [ ] Update imports in remaining scripts:
  - [x] `waha-import.js` - Done ✅
  - [ ] Other scripts as needed
- [ ] Test all scripts in production-like environment
- [x] Create a detailed migration guide for other developers
- [ ] Set a timeline for removing deprecated scripts
- [ ] Consider further consolidation opportunities:
  - [ ] Merge similar classification functionality
  - [ ] Create a more consistent API across utility modules

## Migration Timeline

1. **Phase 1: Setup and Organization** (Completed ✅)
   - Directory structure
   - Script organization
   - Utility modules
   - Documentation updates
   
2. **Phase 2: Testing and Validation** (Current)
   - Test all scripts
   - Fix any issues
   - Update documentation
   
3. **Phase 3: Final Migration** (Future)
   - Remove deprecated scripts
   - Clean up any remaining issues
   - Complete final documentation updates

## Timeline for Removing Deprecated Scripts

- **Month 1**: Keep all deprecated scripts for backward compatibility
- **Month 2**: Add warning logs to deprecated scripts encouraging use of new scripts
- **Month 3**: Remove deprecated scripts completely 