/**
 * Consolidated database utility module
 * 
 * This module handles all database operations:
 * - Adding new listings to the database
 * - Updating existing listings
 * - Checking for duplicates
 * - Retrieving listings with various filters
 */

const { getAdminClient, TABLES } = require('./supabaseClient');
const { extractPhoneNumber } = require('./listingParser');

/**
 * Add a new listing to the database
 * 
 * @param {Object} listing - The listing object to add
 * @returns {Promise<Object>} - The added listing with its ID
 */
async function addListing(listing) {
  try {
    const supabase = getAdminClient();
    
    // Extract phone number from the listing text if needed
    const phoneNumber = extractPhoneNumber(listing.text);
    
    // Format date as ISO string for PostgreSQL compatibility
    const dateString = listing.date instanceof Date ? listing.date.toISOString() : listing.date;
    
    // Format the listing for the database
    const dbListing = {
      whatsapp_group: listing.whatsappGroup,
      date: dateString,
      sender: listing.sender,
      text: listing.text,
      images: listing.images || [],
      price: listing.price,
      condition: listing.condition,
      collection_areas: listing.collectionAreas || [],
      date_added: new Date().toISOString(),
      is_iso: listing.isISO || false,
      category: listing.category || 'Uncategorised'
    };
    
    // Only add phone_number if the column exists in the database schema
    // This can be determined by checking the actual database structure
    // For now, we'll comment this out to avoid errors
    // if (phoneNumber) {
    //   dbListing.phone_number = phoneNumber;
    // }
    
    // Add the listing to the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .insert(dbListing)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error adding listing: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in addListing:', error);
    throw error;
  }
}

/**
 * Add multiple listings to the database
 * 
 * @param {Array} listings - Array of listing objects to add
 * @returns {Promise<Object>} - Statistics about the operation
 */
async function addListings(listings) {
  try {
    const supabase = getAdminClient();
    const stats = {
      total: listings.length,
      added: 0,
      errors: 0
    };
    
    // Format the listings for the database
    const dbListings = listings.map(listing => ({
      whatsapp_group: listing.whatsappGroup,
      date: listing.date,
      sender: listing.sender,
      text: listing.text,
      images: listing.images || [],
      price: listing.price,
      condition: listing.condition,
      collection_areas: listing.collectionAreas || [],
      date_added: new Date().toISOString(),
      is_iso: listing.isISO || false,
      category: listing.category || 'Uncategorised'
    }));
    
    // Add the listings to the database in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < dbListings.length; i += BATCH_SIZE) {
      const batch = dbListings.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .insert(batch);
      
      if (error) {
        console.error(`Error adding batch ${i / BATCH_SIZE + 1}:`, error);
        stats.errors += batch.length;
      } else {
        stats.added += batch.length;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error in addListings:', error);
    throw error;
  }
}

/**
 * Update an existing listing in the database
 * 
 * @param {string} id - The ID of the listing to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - The updated listing
 */
async function updateListing(id, updates) {
  try {
    const supabase = getAdminClient();
    
    // Format the updates for the database
    const dbUpdates = {};
    
    if (updates.whatsappGroup) dbUpdates.whatsapp_group = updates.whatsappGroup;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.sender) dbUpdates.sender = updates.sender;
    if (updates.text) dbUpdates.text = updates.text;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.condition) dbUpdates.condition = updates.condition;
    if (updates.collectionAreas) dbUpdates.collection_areas = updates.collectionAreas;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.isISO !== undefined) dbUpdates.is_iso = updates.isISO;
    
    // Add last updated timestamp
    dbUpdates.last_updated = new Date().toISOString();
    
    // Update the listing in the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating listing: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateListing:', error);
    throw error;
  }
}

/**
 * Check if a listing already exists in the database
 * 
 * @param {Object} listing - The listing to check
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<boolean>} - Whether the listing exists
 */
async function listingExists(listing, verbose = false) {
  try {
    const supabase = getAdminClient();
    
    if (verbose) {
      console.log(`Checking if listing exists: ${listing.title || 'Untitled'}`);
      console.log(`- Group: ${listing.whatsappGroup}`);
      console.log(`- Date: ${listing.date}`);
      console.log(`- Sender: ${listing.sender}`);
    }
    
    // Format date as ISO string for PostgreSQL compatibility
    const dateString = listing.date instanceof Date ? listing.date.toISOString() : listing.date;
    
    // Check if a listing with the same date, sender, and whatsapp group exists
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, title, date, text')
      .eq('whatsapp_group', listing.whatsappGroup)
      .eq('date', dateString)
      .eq('sender', listing.sender)
      .limit(1);
    
    if (error) {
      throw new Error(`Error checking if listing exists: ${error.message}`);
    }
    
    const exists = data.length > 0;
    
    if (exists && verbose) {
      console.log('Found existing listing:');
      console.log(`- ID: ${data[0].id}`);
      console.log(`- Title: ${data[0].title}`);
      console.log(`- Date: ${new Date(data[0].date).toISOString()}`);
      
      // Calculate text similarity if both have text
      if (listing.text && data[0].text) {
        const similarity = calculateTextSimilarity(listing.text, data[0].text);
        console.log(`- Text similarity: ${Math.round(similarity * 100)}%`);
      }
    }
    
    return exists;
  } catch (error) {
    console.error('Error in listingExists:', error);
    throw error;
  }
}

/**
 * Calculate text similarity between two strings (simple implementation)
 * 
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  // Convert to lowercase and remove common punctuation
  const normalize = text => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  // Use Levenshtein distance for similarity
  const distance = levenshteinDistance(normalizedText1, normalizedText2);
  const maxLength = Math.max(normalizedText1.length, normalizedText2.length);
  
  // Return similarity score (1 - normalized distance)
  return maxLength > 0 ? 1 - (distance / maxLength) : 1;
}

/**
 * Calculate Levenshtein distance between two strings
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Get all listings from the database
 * 
 * @param {Object} options - Options for retrieving listings
 * @param {number} options.limit - Maximum number of listings to retrieve
 * @param {number} options.offset - Number of listings to skip
 * @param {string} options.orderBy - Field to order by
 * @param {boolean} options.ascending - Whether to order in ascending order
 * @returns {Promise<Array>} - Array of listings
 */
async function getAllListings(options = {}) {
  try {
    const supabase = getAdminClient();
    const {
      limit = 100,
      offset = 0,
      orderBy = 'date_added',
      ascending = false
    } = options;
    
    // Get listings from the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error getting listings: ${error.message}`);
    }
    
    // Convert database records to application format
    return data.map(record => ({
      id: record.id,
      whatsappGroup: record.whatsapp_group,
      date: record.date,
      sender: record.sender,
      text: record.text,
      images: record.images || [],
      price: record.price,
      condition: record.condition,
      collectionAreas: record.collection_areas || [],
      category: record.category || 'Uncategorised',
      dateAdded: record.date_added,
      isISO: record.is_iso || false,
      phoneNumber: record.phone_number
    }));
  } catch (error) {
    console.error('Error in getAllListings:', error);
    throw error;
  }
}

/**
 * Get listings by category
 * 
 * @param {string} category - The category to filter by
 * @param {Object} options - Options for retrieving listings
 * @returns {Promise<Array>} - Array of listings in the specified category
 */
async function getListingsByCategory(category, options = {}) {
  try {
    const supabase = getAdminClient();
    const {
      limit = 100,
      offset = 0,
      orderBy = 'date_added',
      ascending = false
    } = options;
    
    // Get listings from the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .eq('category', category)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error getting listings by category: ${error.message}`);
    }
    
    // Convert database records to application format
    return data.map(record => ({
      id: record.id,
      whatsappGroup: record.whatsapp_group,
      date: record.date,
      sender: record.sender,
      text: record.text,
      images: record.images || [],
      price: record.price,
      condition: record.condition,
      collectionAreas: record.collection_areas || [],
      category: record.category || 'Uncategorised',
      dateAdded: record.date_added,
      isISO: record.is_iso || false
    }));
  } catch (error) {
    console.error('Error in getListingsByCategory:', error);
    throw error;
  }
}

/**
 * Search listings by text
 * 
 * @param {string} searchTerm - The term to search for
 * @param {Object} options - Options for retrieving listings
 * @returns {Promise<Array>} - Array of matching listings
 */
async function searchListings(searchTerm, options = {}) {
  try {
    const supabase = getAdminClient();
    const {
      limit = 100,
      offset = 0,
      orderBy = 'date_added',
      ascending = false
    } = options;
    
    // Get listings from the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .or(`text.ilike.%${searchTerm}%,sender.ilike.%${searchTerm}%`)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error searching listings: ${error.message}`);
    }
    
    // Convert database records to application format
    return data.map(record => ({
      id: record.id,
      whatsappGroup: record.whatsapp_group,
      date: record.date,
      sender: record.sender,
      text: record.text,
      images: record.images || [],
      price: record.price,
      condition: record.condition,
      collectionAreas: record.collection_areas || [],
      category: record.category || 'Uncategorised',
      dateAdded: record.date_added,
      isISO: record.is_iso || false
    }));
  } catch (error) {
    console.error('Error in searchListings:', error);
    throw error;
  }
}

/**
 * Get listings with missing images
 * 
 * @returns {Promise<Array>} - Array of listings with missing images
 */
async function getListingsWithMissingImages() {
  try {
    const supabase = getAdminClient();
    
    // Get listings from the database
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error getting listings with images: ${error.message}`);
    }
    
    // Convert database records to application format
    return data.map(record => ({
      id: record.id,
      whatsappGroup: record.whatsapp_group,
      date: record.date,
      sender: record.sender,
      text: record.text,
      images: record.images || [],
      price: record.price,
      condition: record.condition,
      collectionAreas: record.collection_areas || [],
      category: record.category || 'Uncategorised',
      dateAdded: record.date_added,
      isISO: record.is_iso || false
    }));
  } catch (error) {
    console.error('Error in getListingsWithMissingImages:', error);
    throw error;
  }
}

/**
 * Delete a listing from the database
 * 
 * @param {string} id - The ID of the listing to delete
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
async function deleteListing(id) {
  try {
    const supabase = getAdminClient();
    
    // Delete the listing from the database
    const { error } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting listing: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteListing:', error);
    throw error;
  }
}

/**
 * Find duplicate listings using database queries
 * 
 * @param {Object} options - Options for finding duplicates
 * @param {number} options.threshold - Similarity threshold (0-1)
 * @param {boolean} options.crossGroup - Whether to search across all WhatsApp groups
 * @returns {Promise<Array>} - Array of duplicate pairs
 */
async function findDuplicateListings(options = {}) {
  try {
    const supabase = getAdminClient();
    const duplicates = [];
    
    // Find duplicates by phone number (if available)
    if (options.usePhoneNumbers) {
      console.log('Finding duplicates by phone number...');
      
      const { data: phoneNumberDuplicates, error: phoneError } = await supabase
        .from(TABLES.LISTINGS)
        .select('*')
        .not('phone_number', 'is', null)
        .order('phone_number');
      
      if (phoneError) {
        throw new Error(`Error finding duplicates by phone number: ${phoneError.message}`);
      }
      
      // Group by phone number
      const phoneGroups = {};
      for (const listing of phoneNumberDuplicates) {
        if (!listing.phone_number) continue;
        
        if (!phoneGroups[listing.phone_number]) {
          phoneGroups[listing.phone_number] = [];
        }
        phoneGroups[listing.phone_number].push(listing);
      }
      
      // Find groups with more than one listing
      for (const phoneNumber in phoneGroups) {
        const group = phoneGroups[phoneNumber];
        if (group.length > 1) {
          // Create duplicate pairs
          for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
              // Skip if from different WhatsApp groups and crossGroup is false
              if (!options.crossGroup && group[i].whatsapp_group !== group[j].whatsapp_group) {
                continue;
              }
              
              // Convert to application format
              const listing1 = {
                id: group[i].id,
                whatsappGroup: group[i].whatsapp_group,
                date: group[i].date,
                sender: group[i].sender,
                text: group[i].text,
                images: group[i].images || [],
                price: group[i].price,
                condition: group[i].condition,
                collectionAreas: group[i].collection_areas || [],
                category: group[i].category || 'Uncategorised',
                dateAdded: group[i].date_added,
                isISO: group[i].is_iso || false,
                phoneNumber: group[i].phone_number
              };
              
              const listing2 = {
                id: group[j].id,
                whatsappGroup: group[j].whatsapp_group,
                date: group[j].date,
                sender: group[j].sender,
                text: group[j].text,
                images: group[j].images || [],
                price: group[j].price,
                condition: group[j].condition,
                collectionAreas: group[j].collection_areas || [],
                category: group[j].category || 'Uncategorised',
                dateAdded: group[j].date_added,
                isISO: group[j].is_iso || false,
                phoneNumber: group[j].phone_number
              };
              
              duplicates.push({
                listing1,
                listing2,
                similarity: 1.0, // Phone number match is a strong indicator
                reason: `Same phone number: ${phoneNumber}`
              });
            }
          }
        }
      }
      
      console.log(`Found ${duplicates.length} duplicate pairs by phone number`);
    }
    
    // Find duplicates by text similarity (using the existing approach)
    // This would be a fallback for listings without phone numbers
    
    return duplicates;
  } catch (error) {
    console.error('Error in findDuplicateListings:', error);
    throw error;
  }
}

module.exports = {
  addListing,
  addListings,
  updateListing,
  listingExists,
  getAllListings,
  getListingsByCategory,
  searchListings,
  getListingsWithMissingImages,
  deleteListing,
  findDuplicateListings
}; 