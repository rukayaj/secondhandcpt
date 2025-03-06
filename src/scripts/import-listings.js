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

// Path to the JSON data file
const dataFilePath = path.join(__dirname, '..', 'data', 'second-hand-listings-checked.json');

// Function to make a POST request to the Supabase REST API
function makeRequest(endpoint, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const apiUrl = new URL(`${supabaseUrl}/rest/v1/${endpoint}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
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

async function importListings() {
  try {
    console.log('Reading JSON data file...');
    const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    console.log(`Found ${jsonData.length} listings to import`);
    
    // First, try to insert a single test record
    console.log('Testing connection with a single record...');
    const testRecord = {
      title: 'Test Listing',
      price: 99.99,
      description: 'This is a test listing',
      whatsapp_group: 'Test Group',
      date: new Date().toISOString(),
      sender: 'System Test',
      text: 'Test message content',
      images: ['test-image.jpg'],
      condition: 'New',
      collection_areas: ['Test Area']
    };
    
    try {
      const testResult = await makeRequest('listings', testRecord);
      console.log('Test record inserted successfully:', testResult);
    } catch (testError) {
      console.error('Error inserting test record:', testError.message);
      console.log('Please make sure the listings table exists in your Supabase database.');
      console.log('You can create it by running the SQL in src/scripts/create_tables.sql in the Supabase SQL Editor.');
      process.exit(1);
    }
    
    // Process the data in batches to avoid request size limits
    const batchSize = 10; // Smaller batch size for REST API
    const totalBatches = Math.ceil(jsonData.length / batchSize);
    
    console.log(`Processing ${totalBatches} batches of ${batchSize} records each...`);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, jsonData.length);
      const batch = jsonData.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${totalBatches} (records ${start + 1}-${end})...`);
      
      // Transform the data to match the database schema
      const transformedBatch = batch.map(item => ({
        title: item.text.split('\n')[0].substring(0, 100), // Use first line as title, limit to 100 chars
        price: item.price || 0,
        description: item.text,
        whatsapp_group: item.whatsappGroup,
        date: new Date(item.date).toISOString(),
        sender: item.sender,
        text: item.text,
        images: item.images || [],
        condition: item.condition || null,
        collection_areas: item.collectionAreas || []
      }));
      
      try {
        // Insert the batch
        await makeRequest('listings', transformedBatch);
        console.log(`Batch ${i + 1} inserted successfully`);
      } catch (error) {
        console.error(`Error inserting batch ${i + 1}:`, error.message);
        process.exit(1);
      }
      
      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('All listings imported successfully!');
    
  } catch (error) {
    console.error('Error importing listings:', error);
    process.exit(1);
  }
}

importListings(); 