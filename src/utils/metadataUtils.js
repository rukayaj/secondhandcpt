/**
 * Metadata Utilities
 * 
 * This module provides functions for managing import metadata
 * like last import date, statistics, etc.
 * 
 * The metadata is stored in a JSON file in the project directory.
 */

const fs = require('fs');
const path = require('path');

const METADATA_FILE = path.join(process.cwd(), 'tmp/metadata.json');

/**
 * Get the metadata object from the metadata file
 * @returns {Object} The metadata object
 */
function getMetadata() {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // If the file exists, read and parse it
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    
    // Otherwise, return an empty object
    return {};
  } catch (error) {
    console.error('Error reading metadata file:', error);
    return {};
  }
}

/**
 * Write the metadata object to the metadata file
 * @param {Object} metadata - The metadata object to write
 */
function writeMetadata(metadata) {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the metadata to the file
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error writing metadata file:', error);
  }
}

/**
 * Get the last import date from metadata
 * @returns {string|null} ISO date string or null if not found
 */
function getLastImportDate() {
  const metadata = getMetadata();
  return metadata.lastImportDate || null;
}

/**
 * Update the last import date in metadata
 * @param {Date} date - The date to set as last import date
 * @param {Object} stats - Optional statistics about the import
 */
function updateLastImportDate(date, stats = {}) {
  const metadata = getMetadata();
  metadata.lastImportDate = date.toISOString();
  metadata.lastImportStats = stats;
  writeMetadata(metadata);
}

module.exports = {
  getMetadata,
  writeMetadata,
  getLastImportDate,
  updateLastImportDate
}; 