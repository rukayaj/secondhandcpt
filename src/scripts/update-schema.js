// Load environment variables
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  process.exit(1);
}

// Extract the project reference from the URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
console.log('Supabase Project Ref:', projectRef);

// Read SQL file
const sqlFilePath = path.join(__dirname, 'add_timestamps.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('SQL content loaded from file');

// Function to make a request to the Supabase REST API
function makeRequest(endpoint, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const apiUrl = new URL(`${supabaseUrl}/${endpoint}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };
    
    const req = https.request(apiUrl, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            resolve(responseData); // Return raw data if not JSON
          }
        } else {
          console.error(`HTTP Error: ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`HTTP Error: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function updateSchema() {
  try {
    console.log('Executing SQL to update schema...');
    
    // Execute SQL using the SQL API
    const result = await makeRequest('rest/v1/sql', { query: sqlContent });
    
    console.log('Schema updated successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error updating schema:', error.message);
    
    console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
    console.log('\n' + sqlContent);
    
    process.exit(1);
  }
}

updateSchema(); 