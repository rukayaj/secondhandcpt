/**
 * Consolidated database utility module
 * 
 * This module handles all database operations:
 * - Adding new listings to the database
 * - Updating existing listings
 * - Checking for duplicates
 * - Retrieving listings with various filters
 */

// Use createClient directly since we can't import TypeScript from JS
const { createClient } = require('@supabase/supabase-js');
const { extractPhoneNumber } = require('./listingParser');

// Define table names
const TABLES = {
  LISTINGS: 'listings'
};

// Create a Supabase client with admin privileges
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

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
    let phoneNumber = extractPhoneNumber(listing.text);
    
    // If no phone number found in text, try to extract from sender
    if (!phoneNumber && listing.sender) {
      // Sender is often in format "XXXXXXXXXXXX@c.us"
      const senderMatch = listing.sender.match(/(\d+)@c\.us$/);
      if (senderMatch && senderMatch[1]) {
        // Normalize to ensure it starts with the proper format for South Africa
        // Convert WhatsApp format (27XXXXXXXXXX) to local format (0XXXXXXXXX)
        phoneNumber = senderMatch[1];
        if (phoneNumber.startsWith('27') && phoneNumber.length >= 11) {
          phoneNumber = '0' + phoneNumber.substring(2);
        }
      }
    }
    
    // Format date as ISO string for PostgreSQL compatibility
    const dateString = listing.date instanceof Date ? listing.date.toISOString() : listing.date;
    
    // Format sold date if available
    const soldDateString = listing.soldDate instanceof Date ? listing.soldDate.toISOString() : listing.soldDate;
    
    // Generate a meaningful title from the message text if title is missing or generic
    let title = listing.title;
    if (!title || title.trim() === '' || title === 'Unknown Item' || title === 'Untitled') {
      // Extract a descriptive title from the text content
      if (listing.text) {
        // Get the first line (or first 60 chars), cleaned of common prefixes
        title = listing.text
          .split('\n')[0]  // Get first line
          .replace(/^(selling|iso|wtb|wts|wtt):/i, '') // Remove common prefixes
          .trim();
          
        // If it's still too long, truncate it
        if (title.length > 60) {
          title = title.substring(0, 57) + '...';
        }
        
        // If it's too short, try to get more text
        if (title.length < 10 && listing.text.length > 10) {
          title = listing.text
            .replace(/\n/g, ' ')
            .trim()
            .substring(0, 60);
          
          if (title.length === 60) {
            title += '...';
          }
        }
      }
    }
    
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
      category: listing.category || 'Uncategorised',
      title: title || 'Item for sale', // Use our improved title with a final fallback
      // Add sold status fields
      is_sold: listing.isSold || false,
      sold_date: soldDateString || null,
      // Add multi-message fields
      is_multi_message: listing.isMultiUserMessage || false,
      message_count: listing.messageCount || 1,
    };
    
    // Only add image_hashes if they exist in the listing
    // This makes the code backward compatible with databases that don't have the column yet
    if (listing.image_hashes || listing.imageHashes) {
      dbListing.image_hashes = listing.image_hashes || listing.imageHashes || [];
    }
    
    // The phone_number column now exists in the database, so we can add it
    // Add phone_number if available
    if (phoneNumber) {
      dbListing.phone_number = phoneNumber;
    }
    
    // Add the listing to the database
    const result = await supabase
      .from(TABLES.LISTINGS)
      .insert(dbListing)
      .select()
      .single();
    
    const data = result.data;
    const error = result.error;
    
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
      category: listing.category || 'Uncategorised',
      sizes: listing.sizes || []
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
    if (updates.title) dbUpdates.title = updates.title;
    
    // Add support for sold status updates
    if (updates.isSold !== undefined) dbUpdates.is_sold = updates.isSold;
    if (updates.soldDate) {
      // Format sold date as ISO string
      dbUpdates.sold_date = updates.soldDate instanceof Date 
        ? updates.soldDate.toISOString() 
        : updates.soldDate;
    }
    
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
 * @param {Object} listing - The listing object to check
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
    
    // First check: exact match on sender and text content (regardless of group or date)
    // This is the most reliable way to detect duplicates, including cross-group duplicates
    if (listing.text && listing.sender) {
      try {
        const { data, error } = await supabase
          .from(TABLES.LISTINGS)
          .select('id, title, date, text, price, whatsapp_group')
          .eq('sender', listing.sender)
          .eq('text', listing.text);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Found matching text from same sender
          if (verbose) {
            console.log('Found existing listing with identical text from same sender:');
            console.log(`- ID: ${data[0].id}`);
            console.log(`- Title: ${data[0].title}`);
            console.log(`- Group: ${data[0].whatsapp_group} (This listing is in ${listing.whatsappGroup})`);
          }
          return true;
        }
      } catch (error) {
        console.error(`Error checking for text duplicate: ${error.message}`);
      }
    }
    
    // New check: search for similar text content from the same sender within the last 7 days
    if (listing.text && listing.sender) {
      try {
        // Calculate date threshold (7 days)
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - 7);
        const thresholdDateString = dateThreshold.toISOString();
        
        const { data: recentSenderListings, error: senderError } = await supabase
          .from(TABLES.LISTINGS)
          .select('id, title, date, text, price')
          .eq('sender', listing.sender)
          .gte('date', thresholdDateString)
          .order('date', { ascending: false })
          .limit(30); // Increased limit to catch more potential duplicates
        
        if (senderError) {
          console.error(`Error checking for recent sender listings: ${senderError.message}`);
        } else if (recentSenderListings && recentSenderListings.length > 0) {
          // Calculate start of substantive content (skip common intros like "I can't believe it's time for me to do this")
          const skipIntroPatterns = [
            /I can'?t believe it'?s time for me to do this/i,
            /sadly selling/i,
            /up for grabs/i,
            /selling (my|the following)/i,
            /for sale/i
          ];
          
          // Extract clean text for comparison
          let cleanListingText = listing.text;
          for (const pattern of skipIntroPatterns) {
            cleanListingText = cleanListingText.replace(pattern, '').trim();
          }
          
          // Check text similarity with recent listings from the same sender
          for (const existingListing of recentSenderListings) {
            if (!existingListing.text) continue;
            
            // Clean the existing listing text
            let cleanExistingText = existingListing.text;
            for (const pattern of skipIntroPatterns) {
              cleanExistingText = cleanExistingText.replace(pattern, '').trim();
            }
            
            const similarity = calculateTextSimilarity(cleanListingText, cleanExistingText);
            
            // If the similarity is very high, consider it a duplicate (80% or higher)
            if (similarity >= 0.8) {
              if (verbose) {
                console.log('Found duplicate by high text similarity from same sender:');
                console.log(`- ID: ${existingListing.id}`);
                console.log(`- Title: ${existingListing.title}`);
                console.log(`- Similarity: ${Math.round(similarity * 100)}%`);
              }
              return true;
            }
            
            // Check for key phrases match (30+ chars) between the texts
            if (cleanListingText.length > 30 && cleanExistingText.length > 30) {
              // Find matching phrases of at least 30 characters
              for (let i = 0; i <= cleanListingText.length - 30; i++) {
                const phrase = cleanListingText.substring(i, i + 30);
                if (cleanExistingText.includes(phrase)) {
                  if (verbose) {
                    console.log('Found duplicate by matching key phrase:');
                    console.log(`- ID: ${existingListing.id}`);
                    console.log(`- Title: ${existingListing.title}`);
                    console.log(`- Matching phrase: "${phrase}"`);
                  }
                  return true;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error in recent sender listings check: ${error.message}`);
      }
    }
    
    // New function to check for duplicate images by hash
    async function checkImageHashDuplicates() {
      try {
        if (!listing.images || listing.images.length === 0) {
          return false;
        }
        
        // If we have image hashes, look for duplicate hashes
        if (listing.image_hashes && listing.image_hashes.length > 0) {
          if (verbose) {
            console.log(`Checking for duplicate images by hash (${listing.image_hashes.length} hashes)`);
          }
          
          // Fetch recent listings with images from the same sender
          const { data: recentListings, error: recentError } = await supabase
            .from(TABLES.LISTINGS)
            .select('id, title, date, images, image_hashes')
            .eq('sender', listing.sender)
            .order('date', { ascending: false })
            .limit(50);
          
          if (recentError) {
            console.error(`Error querying for recent listings: ${recentError.message}`);
            return false;
          }
          
          // Check each listing for matching hashes
          for (const existingListing of recentListings) {
            if (!existingListing.image_hashes || !Array.isArray(existingListing.image_hashes) || existingListing.image_hashes.length === 0) {
              continue;
            }
            
            // Look for any matching hash
            const matchingHashes = listing.image_hashes.filter(hash => 
              existingListing.image_hashes.includes(hash)
            );
            
            if (matchingHashes.length > 0) {
              if (verbose) {
                console.log(`Found duplicate by matching image hash:`);
                console.log(`- ID: ${existingListing.id}`);
                console.log(`- Title: ${existingListing.title}`);
                console.log(`- Matching hash: ${matchingHashes[0]}`);
              }
              return true;
            }
          }
        }
        
        return false;
      } catch (error) {
        console.error(`Error in checkImageHashDuplicates: ${error.message}`);
        return false;
      }
    }
    
    // Check for duplicate by image hash
    const isImageHashDuplicate = await checkImageHashDuplicates();
    if (isImageHashDuplicate) {
      return true;
    }
    
    // Check for duplicate by image path (if images exist)
    if (listing.images && listing.images.length > 0 && listing.sender) {
      try {
        // Get recent listings with images from the same sender
        // Increasing limit from 20 to 100 to catch more potential duplicates
        const { data, error } = await supabase
          .from(TABLES.LISTINGS)
          .select('id, title, date, images, price')
          .eq('sender', listing.sender)
          .neq('images', '{}')
          .order('date', { ascending: false })
          .limit(100);  // Increased from 20 to 100
        
        if (error) {
          console.error(`Error querying for image duplicates: ${error.message}`);
          // Continue with other checks rather than throwing
        }
        else if (data && data.length > 0) {
          // Check for identical images
          if (verbose) {
            console.log(`Checking ${data.length} listings from same sender for matching images`);
            console.log(`Current listing images: ${JSON.stringify(listing.images)}`);
          }
          
          for (const existingListing of data) {
            if (existingListing.images && existingListing.images.length > 0) {
              // Check if any image paths match
              const matchingImages = listing.images.filter(image => 
                existingListing.images.includes(image)
              );
              
              if (verbose && existingListing.images.length > 0) {
                console.log(`Comparing with listing ${existingListing.id} (${existingListing.title})`);
                console.log(`- Existing images: ${JSON.stringify(existingListing.images)}`);
                console.log(`- Matching images: ${matchingImages.length > 0 ? JSON.stringify(matchingImages) : 'None'}`);
              }
              
              if (matchingImages.length > 0) {
                // If there's at least one matching image and prices are similar, consider it a duplicate
                const currentPrice = parseFloat(String(listing.price || '0').replace(/[^0-9.]/g, '')) || 0;
                const existingPrice = parseFloat(String(existingListing.price || '0').replace(/[^0-9.]/g, '')) || 0;
                const priceDifference = Math.abs(currentPrice - existingPrice);
                
                if (verbose) {
                  console.log(`Price comparison: Current ${currentPrice}, Existing ${existingPrice}, Difference ${priceDifference}`);
                }
                
                // Consider it a duplicate if:
                // 1. Prices are similar (within 10) OR
                // 2. At least half of the images match (strong evidence of duplicate)
                if (priceDifference < 10 || (matchingImages.length >= Math.max(1, Math.min(listing.images.length, existingListing.images.length) / 2))) {
                  if (verbose) {
                    console.log('Found existing listing with identical image(s) from same sender:');
                    console.log(`- ID: ${existingListing.id}`);
                    console.log(`- Title: ${existingListing.title}`);
                    console.log(`- Matching image: ${matchingImages[0]}`);
                    console.log(`- Price difference: ${priceDifference}`);
                  }
                  return true;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error checking for image duplicate: ${error.message}`);
        // Continue with other checks
      }
    }
    
    // Second check: exact match on date, sender, and WhatsApp group
    let exactMatches;
    try {
      // Try with phone_number field
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .select('id, title, date, text')
        .eq('whatsapp_group', listing.whatsappGroup)
        .eq('date', dateString)
        .eq('sender', listing.sender)
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      exactMatches = data;
    } catch (error) {
      console.error(`Error checking for exact listing match: ${error.message}`);
      return false;
    }
    
    if (exactMatches && exactMatches.length > 0) {
      // Additional check: Make sure the title matches or is similar
      // This prevents different listings from the same sender at the same time being treated as duplicates
      if (listing.title && exactMatches[0].title) {
        const titleSimilarity = calculateTextSimilarity(listing.title.toLowerCase(), exactMatches[0].title.toLowerCase());
        
        if (titleSimilarity < 0.7) {
          if (verbose) {
            console.log(`Found listing with same date/sender but different title (similarity: ${Math.round(titleSimilarity * 100)}%)`);
            console.log(`- This listing: "${listing.title}"`);
            console.log(`- Existing listing: "${exactMatches[0].title}"`);
            console.log('Not considering as duplicate due to different titles');
          }
          // Not a duplicate - different titles
          return false;
        }
      }
      
      if (verbose) {
        console.log('Found existing listing (exact match):');
        console.log(`- ID: ${exactMatches[0].id}`);
        console.log(`- Title: ${exactMatches[0].title}`);
      }
      return true;
    }
    
    // Second check: look for duplicates by phone number (if available)
    // Try to get phone number from listing or from sender
    let phoneNumber = listing.phoneNumber;
    
    // If no phone number provided, try to extract from sender
    if (!phoneNumber && listing.sender) {
      const senderMatch = listing.sender.match(/(\d+)@c\.us$/);
      if (senderMatch && senderMatch[1]) {
        phoneNumber = senderMatch[1];
        if (phoneNumber.startsWith('27') && phoneNumber.length >= 11) {
          phoneNumber = '0' + phoneNumber.substring(2);
        }
      }
    }
    
    if (phoneNumber) {
      try {
        const { data: phoneMatches, error: phoneError } = await supabase
          .from(TABLES.LISTINGS)
          .select('id, title, date, text, phone_number')
          .eq('phone_number', phoneNumber)
          .order('date', { ascending: false })
          .limit(5); // Check the most recent ones with this phone number
        
        if (phoneError) {
          // If there's an error related to phone_number, skip this check
          if (phoneError.message && phoneError.message.includes('phone_number')) {
            if (verbose) {
              console.log('Skipping phone number check - column not available');
            }
          } else {
            console.error(`Error checking for phone number match: ${phoneError.message}`);
          }
        } else if (phoneMatches && phoneMatches.length > 0) {
          // We found listings with the same phone number, check if they're similar
          for (const match of phoneMatches) {
            // Skip if it's too old (more than 30 days)
            const matchDate = new Date(match.date);
            const listingDate = new Date(dateString);
            const daysDifference = Math.abs((listingDate - matchDate) / (1000 * 60 * 60 * 24));
            
            if (daysDifference > 30) continue;
            
            // Calculate text similarity if both have text
            if (listing.text && match.text) {
              const similarity = calculateTextSimilarity(listing.text, match.text);
              
              if (verbose) {
                console.log(`Checking similar listing with same phone number:`);
                console.log(`- ID: ${match.id}`);
                console.log(`- Title: ${match.title}`);
                console.log(`- Text similarity: ${Math.round(similarity * 100)}%`);
              }
              
              // If the similarity is high, consider it a duplicate (70% or higher)
              if (similarity >= 0.7) {
                if (verbose) {
                  console.log(`Found duplicate listing by phone number with high text similarity: ${match.id}`);
                }
                return true;
              }
            }
          }
        }
      } catch (error) {
        // If the error is related to phone_number, skip this check
        if (error.message && error.message.includes('phone_number')) {
          if (verbose) {
            console.log('Skipping phone number check - column not available');
          }
        } else {
          console.error(`Error in phone number check: ${error.message}`);
        }
      }
    }
    
    // Third check: look for similar listings by text content
    try {
      // Get recent listings from the same group
      const { data: recentListings, error: recentError } = await supabase
        .from(TABLES.LISTINGS)
        .select('id, title, date, text')
        .eq('whatsapp_group', listing.whatsappGroup)
        .order('date', { ascending: false })
        .limit(20); // Check the most recent ones in this group
      
      if (recentError) {
        console.error(`Error checking for similar listings: ${recentError.message}`);
      } else if (recentListings.length > 0 && listing.text) {
        // Check for text similarity
        for (const match of recentListings) {
          // Skip if it's too old (more than 30 days)
          const matchDate = new Date(match.date);
          const listingDate = new Date(dateString);
          const daysDifference = Math.abs((listingDate - matchDate) / (1000 * 60 * 60 * 24));
          
          if (daysDifference > 30) continue;
          
          // Calculate text similarity if both have text
          if (match.text) {
            const similarity = calculateTextSimilarity(listing.text, match.text);
            
            if (verbose && similarity > 0.5) {
              console.log(`Checking similar listing by text:`);
              console.log(`- ID: ${match.id}`);
              console.log(`- Title: ${match.title}`);
              console.log(`- Text similarity: ${Math.round(similarity * 100)}%`);
            }
            
            // If the similarity is very high, consider it a duplicate (85% or higher)
            if (similarity >= 0.85) {
              if (verbose) {
                console.log(`Found duplicate listing by high text similarity: ${match.id}`);
              }
              return true;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error in text similarity check: ${error.message}`);
    }
    
    return false;
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

/**
 * Get the latest message timestamp for each WhatsApp group in the database
 * @returns {Promise<Object>} - Object with group names as keys and timestamps as values
 */
async function getLatestMessageTimestampsByGroup() {
  try {
    const supabase = getAdminClient();
    
    // Query to get the latest message timestamp for each WhatsApp group
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('whatsapp_group, date')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching latest timestamps:', error);
      return {};
    }
    
    // Create a map of group name to latest timestamp
    const latestTimestamps = {};
    data.forEach(listing => {
      // Only store the timestamp if it's newer than what we already have
      if (!latestTimestamps[listing.whatsapp_group] || 
          new Date(listing.date) > new Date(latestTimestamps[listing.whatsapp_group])) {
        latestTimestamps[listing.whatsapp_group] = listing.date;
      }
    });
    
    return latestTimestamps;
  } catch (error) {
    console.error('Error in getLatestMessageTimestampsByGroup:', error);
    return {};
  }
}

/**
 * Mark a listing as sold
 * 
 * @param {string} id - The ID of the listing to mark as sold
 * @param {Date|string} soldDate - The date when the item was sold (optional, defaults to current date)
 * @returns {Promise<Object>} - The updated listing
 */
async function markListingAsSold(id, soldDate = new Date()) {
  try {
    // Format the sold date for database
    const formattedSoldDate = soldDate instanceof Date 
      ? soldDate.toISOString() 
      : soldDate;
    
    // Update the listing
    return updateListing(id, {
      isSold: true,
      soldDate: formattedSoldDate
    });
  } catch (error) {
    console.error('Error in markListingAsSold:', error);
    throw error;
  }
}

/**
 * Find listings that may be sold based on recent WhatsApp messages
 * @param {string} groupName - The WhatsApp group name to search in
 * @param {string} sender - The sender's ID to search for
 * @param {Array} keywords - Keywords that indicate an item is sold (e.g., 'sold', 'x')
 * @param {number} days - Number of days back to search for listings
 * @returns {Promise<Array>} - Array of listings that might be sold
 */
async function findPotentiallySoldListings(groupName, sender, keywords = ['sold', 'x'], days = 30) {
  try {
    const supabase = getAdminClient();
    
    // Calculate the date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    // Find all active listings from this sender in this group
    const { data: listings, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .eq('whatsapp_group', groupName)
      .eq('sender', sender)
      .eq('is_sold', false)
      .gte('date', dateThreshold.toISOString());
    
    if (error) {
      throw new Error(`Error finding listings: ${error.message}`);
    }
    
    if (!listings || listings.length === 0) {
      return [];
    }
    
    // Return the listings for further processing
    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      date: listing.date,
      text: listing.text,
      price: listing.price,
      whatsappGroup: listing.whatsapp_group,
      sender: listing.sender
    }));
  } catch (error) {
    console.error('Error in findPotentiallySoldListings:', error);
    return [];
  }
}

/**
 * Delete listings that are older than a specified timestamp for a given WhatsApp group
 * This is used to clean up listings whose messages have expired from WhatsApp
 * 
 * @param {string} groupName - The name of the WhatsApp group
 * @param {number} timestampSeconds - Unix timestamp in seconds of the oldest message still in the group
 * @returns {Promise<{deleted: number, error: any}>} - Number of deleted listings and any error
 */
async function deleteExpiredListings(groupName, timestampSeconds) {
  try {
    // Convert Unix timestamp (seconds) to ISO string for database comparison
    const oldestMessageDate = new Date(timestampSeconds * 1000).toISOString();
    
    console.log(`Deleting listings older than ${oldestMessageDate} for group "${groupName}"...`);
    
    const supabase = getAdminClient();
    
    // Find listings to delete (for logging purposes)
    const { data: expiredListings, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, title, date, images')
      .eq('whatsapp_group', groupName)
      .lt('date', oldestMessageDate);
    
    if (countError) {
      console.error(`Error finding expired listings: ${countError.message}`);
      return { deleted: 0, error: countError };
    }
    
    // If no expired listings found, return early
    if (!expiredListings || expiredListings.length === 0) {
      console.log(`No expired listings found for group "${groupName}"`);
      return { deleted: 0, error: null };
    }
    
    console.log(`Found ${expiredListings.length} expired listings to delete for group "${groupName}"`);
    
    // Delete all associated images from S3 bucket first
    let removedImageCount = 0;
    for (const listing of expiredListings) {
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        for (const imagePath of listing.images) {
          // Delete the image from storage
          const { error: storageError } = await supabase
            .storage
            .from('listing-images')
            .remove([imagePath]);
          
          if (storageError) {
            console.warn(`Warning: Failed to delete image ${imagePath}: ${storageError.message}`);
          } else {
            removedImageCount++;
          }
        }
      }
    }
    
    // Delete the expired listings
    const { error: deleteError } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .eq('whatsapp_group', groupName)
      .lt('date', oldestMessageDate);
    
    if (deleteError) {
      console.error(`Error deleting expired listings: ${deleteError.message}`);
      return { deleted: 0, error: deleteError };
    }
    
    console.log(`Deleted ${expiredListings.length} expired listings and ${removedImageCount} associated images for group "${groupName}"`);
    
    return { 
      deleted: expiredListings.length, 
      imagesRemoved: removedImageCount,
      error: null,
      expiredListings // Return the list of deleted listings for reference
    };
  } catch (error) {
    console.error(`Error in deleteExpiredListings: ${error.message}`);
    return { deleted: 0, error };
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
  findDuplicateListings,
  getLatestMessageTimestampsByGroup,
  markListingAsSold,
  findPotentiallySoldListings,
  deleteExpiredListings,
}; 