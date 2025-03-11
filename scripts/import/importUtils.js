/**
 * Import Utilities
 * 
 * This module provides common functions for importing WhatsApp messages
 * that can be shared across multiple import scripts.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// WhatsApp group data
const WHATSAPP_GROUPS = [
  {
    name: 'Nifty Thrifty Modern Cloth Nappies',
    dataDir: 'nifty-thrifty-modern-cloth-nappies',
    chatFile: '_chat.txt',
    chatId: '120363139582792913@g.us'
  },
  {
    name: 'Nifty Thrifty 0-1 year (2)',
    dataDir: 'nifty-thrifty-0-1-years',
    chatFile: '_chat.txt',
    chatId: '120363190438741302@g.us'
  },
  {
    name: 'Nifty Thrifty Bumps & Boobs',
    dataDir: 'nifty-thrifty-bumps-and-boobs',
    chatFile: '_chat.txt',
    chatId: '120363068687931519@g.us'
  },
  {
    name: 'Nifty Thrifty 0-1 year (1)',
    dataDir: 'nifty-thrifty-0-1-years',
    chatFile: '_chat2.txt',
    chatId: '27787894429-1623257234@g.us'
  },
  {
    name: 'Nifty Thrifty 1-3 years',
    dataDir: 'nifty-thrifty-1-3-years',
    chatFile: '_chat.txt',
    chatId: '120363172946506359@g.us'
  },
  {
    name: 'Nifty Thrifty Kids (3-8 years) 2',
    dataDir: 'nifty-thrifty-kids-3-8-years',
    chatFile: '_chat.txt',
    chatId: '120363315487735378@g.us'
  }
];

// WAHA API Configuration
const WAHA_BASE_URL = 'http://localhost:3001/api';
const WAHA_SESSION = 'default';

/**
 * Get a Supabase client with admin privileges
 * @returns {Object} Supabase client
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Get the group data for a specific WhatsApp group name
 * @param {string} groupName - Name of the WhatsApp group
 * @returns {Object|null} Group data object or null if not found
 */
function getGroupByName(groupName) {
  return WHATSAPP_GROUPS.find(group => group.name === groupName) || null;
}

/**
 * Check WAHA session status
 * @returns {Promise<Object>} Session status object
 */
async function checkWahaSessionStatus() {
  try {
    const response = await axios.get(`${WAHA_BASE_URL}/sessions/${WAHA_SESSION}`);
    // Check if session is working and connected
    if (response.data && response.data.status === 'WORKING' && 
        response.data.engine && response.data.engine.state === 'CONNECTED') {
      return { authenticated: true, exists: true };
    } else {
      return { 
        authenticated: false, 
        exists: true,
        message: 'Session exists but is not authenticated'
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Session doesn't exist
      return { authenticated: false, exists: false };
    } else if (error.response && error.response.status === 422) {
      // Session exists but might not be authenticated
      return { 
        authenticated: false, 
        exists: true,
        message: error.response.data.message || 'Session exists but status unknown'
      };
    }
    throw error;
  }
}

/**
 * Start a new WAHA session
 * @returns {Promise<string|null>} QR code as string or null if no QR needed
 */
async function startWahaSession() {
  try {
    // First check if session already exists
    const status = await checkWahaSessionStatus();
    if (status.exists) {
      console.log('Session already exists. Checking authentication status...');
      
      if (status.authenticated) {
        console.log('✅ Session is already authenticated.');
        return null; // No QR needed
      } else {
        throw new Error('Session exists but is not authenticated. You may need to restart WAHA.');
      }
    }
    
    // Start a new session
    const response = await axios.post(`${WAHA_BASE_URL}/sessions/start`, {
      name: WAHA_SESSION
    });
    if (response.data && response.data.qr) {
      return response.data.qr;
    } else {
      console.log('No QR code returned, but session may have started.');
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 422 && 
        error.response.data && error.response.data.message) {
      // Session already exists or other error
      console.log(`Server response: ${error.response.data.message}`);
      
      if (error.response.data.message.includes('already started')) {
        console.log('Session already exists. Checking authentication status...');
        
        // Check if the session is authenticated
        const sessionStatus = await checkWahaSessionStatus();
        if (sessionStatus.authenticated) {
          console.log('✅ Session is authenticated and ready to use.');
          return null; // Already authenticated, no QR needed
        } else {
          throw new Error('Session exists but is not authenticated. You may need to restart WAHA.');
        }
      } else {
        throw new Error(`WAHA error: ${error.response.data.message}`);
      }
    }
  }
}

/**
 * Wait for the WAHA session to be authenticated
 * @returns {Promise<boolean>} True if authenticated, throws error if timeout
 */
async function waitForWahaAuthentication() {
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkWahaSessionStatus();
    if (status.authenticated) {
      return true;
    }
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write('.');
  }
  throw new Error('Authentication timeout. Please try again.');
}

/**
 * Check if a listing already exists in the database
 * @param {Object} listing - Listing to check
 * @returns {Promise<boolean>} True if listing exists, false otherwise
 */
async function checkListingExists(listing) {
  try {
    const supabase = getAdminClient();
    
    // Check if a listing with the same date, sender, and group exists
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .eq('whatsapp_group', listing.whatsappGroup)
      .eq('date', listing.date)
      .eq('sender', listing.sender)
      .limit(1);
    
    if (error) {
      throw new Error(`Error checking if listing exists: ${error.message}`);
    }
    
    return data.length > 0;
  } catch (error) {
    console.error('Error checking if listing exists:', error);
    throw error;
  }
}

/**
 * Extract date and time from a WhatsApp message line
 * @param {string} line - WhatsApp message line
 * @returns {Object|null} Object with date or null if invalid
 */
function extractDateFromLine(line) {
  // Matches [DD/MM/YY, HH:MM:SS] or [DD/MM/YYYY, HH:MM:SS] format
  const dateRegex = /\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}), (\d{1,2}):(\d{1,2}):(\d{1,2})\]/;
  const match = line.match(dateRegex);
  
  if (!match) {
    return null;
  }
  
  const [_, day, month, year, hours, minutes, seconds] = match;
  
  // Convert 2-digit year to 4-digit year
  let fullYear = parseInt(year);
  if (fullYear < 100) {
    fullYear += 2000;
  }
  
  // Create date object (months are 0-indexed in JavaScript)
  const date = new Date(
    fullYear, 
    parseInt(month) - 1, 
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  );
  
  return {
    date,
    isoString: date.toISOString(),
    timestamp: date.getTime(),
    match: match[0]
  };
}

/**
 * Extract sender name from a WhatsApp message line
 * @param {string} line - WhatsApp message line
 * @param {string} dateMatch - Date match string to remove
 * @returns {string|null} Sender name or null if invalid
 */
function extractSenderFromLine(line, dateMatch) {
  if (!dateMatch) {
    return null;
  }
  
  // Remove the date part and trim
  let withoutDate = line.replace(dateMatch, '').trim();
  
  // Check for the colon that separates sender from message
  const colonIndex = withoutDate.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }
  
  // Get sender name
  return withoutDate.substring(0, colonIndex).trim();
}

/**
 * Extract message text from a WhatsApp message line
 * @param {string} line - WhatsApp message line
 * @param {string} dateMatch - Date match string to remove
 * @param {string} sender - Sender name to remove
 * @returns {string|null} Message text or null if invalid
 */
function extractMessageFromLine(line, dateMatch, sender) {
  if (!dateMatch || !sender) {
    return null;
  }
  
  // Remove the date part and sender, then trim
  return line.replace(dateMatch, '')
    .replace(`${sender}:`, '')
    .trim();
}

/**
 * Create necessary data directories if they don't exist
 */
function createDirectories() {
  const directories = WHATSAPP_GROUPS.map(group => 
    path.join('src/data', group.dataDir)
  );
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// Export all utility functions
module.exports = {
  WHATSAPP_GROUPS,
  WAHA_BASE_URL,
  WAHA_SESSION,
  getAdminClient,
  getGroupByName,
  checkWahaSessionStatus,
  startWahaSession,
  waitForWahaAuthentication,
  checkListingExists,
  extractDateFromLine,
  extractSenderFromLine,
  extractMessageFromLine,
  createDirectories
}; 