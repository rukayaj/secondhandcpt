/**
 * Metadata Utilities
 * 
 * This module provides functions for managing application metadata,
 * such as the last import date for WhatsApp messages.
 */

const fs = require('fs');
const path = require('path');

// Path to the metadata file
const METADATA_FILE = path.join(process.cwd(), 'src/data/metadata.json');

/**
 * Initialize metadata file if it doesn't exist
 */
function initializeMetadata() {
  try {
    if (!fs.existsSync(METADATA_FILE)) {
      const defaultMetadata = {
        lastImportDate: null,
        importStats: {
          totalImported: 0,
          lastImportCount: 0,
          lastImportTime: null
        }
      };
      
      // Create directory if it doesn't exist
      const dir = path.dirname(METADATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write default metadata
      fs.writeFileSync(METADATA_FILE, JSON.stringify(defaultMetadata, null, 2));
      console.log(`Created metadata file at ${METADATA_FILE}`);
      return defaultMetadata;
    }
    
    // File exists, read and return it
    return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  } catch (error) {
    console.error(`Error initializing metadata: ${error.message}`);
    return {
      lastImportDate: null,
      importStats: {
        totalImported: 0,
        lastImportCount: 0,
        lastImportTime: null
      }
    };
  }
}

/**
 * Get the last import date
 * 
 * @returns {Date|null} The last import date or null if not set
 */
function getLastImportDate() {
  try {
    const metadata = initializeMetadata();
    return metadata.lastImportDate ? new Date(metadata.lastImportDate) : null;
  } catch (error) {
    console.error(`Error getting last import date: ${error.message}`);
    return null;
  }
}

/**
 * Update the last import date
 * 
 * @param {Date} date - The date to set as the last import date
 * @param {Object} stats - Optional stats about the import
 * @returns {boolean} True if successful, false otherwise
 */
function updateLastImportDate(date, stats = {}) {
  try {
    const metadata = initializeMetadata();
    
    // Update metadata
    metadata.lastImportDate = date.toISOString();
    metadata.importStats = {
      ...metadata.importStats,
      lastImportCount: stats.count || 0,
      lastImportTime: new Date().toISOString(),
      totalImported: (metadata.importStats.totalImported || 0) + (stats.count || 0)
    };
    
    // Write updated metadata
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Updated last import date to ${date.toISOString()}`);
    return true;
  } catch (error) {
    console.error(`Error updating last import date: ${error.message}`);
    return false;
  }
}

module.exports = {
  getLastImportDate,
  updateLastImportDate
}; 