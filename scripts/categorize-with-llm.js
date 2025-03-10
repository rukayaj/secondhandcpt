/**
 * Ad-hoc script for enhancing database records with LLM categorization
 * 
 * This script:
 * 1. Fetches listings from the database that need categorization
 * 2. Uses an LLM service to categorize them
 * 3. Updates the database with the enhanced categories
 * 
 * Run this script manually as needed, not on a schedule.
 * 
 * Usage:
 *   node scripts/categorize-with-llm.js [options]
 * 
 * Options:
 *   --service=<mock|openai>   Which LLM service to use (default: mock)
 *   --limit=<number>          Maximum number of listings to process (default: 50)
 *   --batch=<number>          Number of listings per batch (default: 10)
 *   --live                    Run in live mode (update database) instead of dry run
 *   --all                     Process all listings, not just "Other" category
 *   --non-interactive         Run without interactive prompts, using provided options
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const readline = require('readline');
const { categorizeListingByKeywords } = require('../src/utils/categoryUtils');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Set up readline interface for CLI prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Available categories
const CATEGORIES = [
  'Clothing', 
  'Toys', 
  'Furniture', 
  'Footwear', 
  'Gear', 
  'Feeding', 
  'Accessories', 
  'Swimming', 
  'Bedding', 
  'Diapers', 
  'Books',
  'Other'
];

// Available LLM services
const LLM_SERVICES = {
  'OPENAI': {
    name: 'OpenAI with Function Calling',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    formatRequest: (text) => ({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that categorizes second-hand baby item listings. Analyze the listing text and determine the most appropriate category."
        },
        { 
          role: "user", 
          content: `Categorize this second-hand baby item listing: "${text}"`
        }
      ],
      functions: [
        {
          name: "categorize_listing",
          description: "Categorize a second-hand baby item listing into the most appropriate category",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: CATEGORIES,
                description: "The category that best describes the listing"
              },
              confidence: {
                type: "number",
                description: "Confidence score between 0 and 1, where 1 is highest confidence"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of why this category was chosen"
              }
            },
            required: ["category", "confidence"]
          }
        }
      ],
      function_call: { name: "categorize_listing" },
      temperature: 0
    }),
    parseResponse: (response) => {
      try {
        const functionCall = response.data.choices[0].message.function_call;
        if (functionCall && functionCall.name === "categorize_listing") {
          const args = JSON.parse(functionCall.arguments);
          return {
            category: args.category,
            confidence: args.confidence,
            reasoning: args.reasoning || ""
          };
        }
        throw new Error("No valid function call in response");
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        return { 
          category: "Other", 
          confidence: 0,
          reasoning: "Error parsing response"
        };
      }
    }
  },
  // Add other LLM services here as needed
  'MOCK': {
    name: 'Mock LLM (for testing)',
    formatRequest: () => ({}),
    parseResponse: () => {
      const categories = CATEGORIES.filter(c => c !== 'Other');
      const category = categories[Math.floor(Math.random() * categories.length)];
      return {
        category,
        confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1
        reasoning: "This is a mock categorization for testing purposes."
      };
    }
  }
};

// Default options
const DEFAULT_OPTIONS = {
  limit: 50,
  batchSize: 10,
  service: 'MOCK', // Change to 'OPENAI' when ready to use real service
  dryRun: true,
  onlyOtherCategory: true // Default to only processing "Other" category listings
};

/**
 * Process listings with LLM categorization
 * @param {Object} options - Processing options
 */
async function categorizeListingsWithLLM(options) {
  const { limit, batchSize, service, dryRun, onlyOtherCategory } = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  console.log(`\nStarting LLM categorization with the following options:`);
  console.log(`- Service: ${LLM_SERVICES[service].name}`);
  console.log(`- Limit: ${limit} listings`);
  console.log(`- Batch size: ${batchSize}`);
  console.log(`- Mode: ${dryRun ? 'Dry run (no database changes)' : 'Live run (will update database)'}`);
  console.log(`- Filter: ${onlyOtherCategory ? 'Only "Other" category listings' : 'All listings'}`);
  
  // Fetch listings that need categorization
  console.log(`\nFetching listings...`);
  
  // Start the query
  let query = supabase.from('listings').select('id, text, category');
  
  // Filter by category if needed
  if (onlyOtherCategory) {
    // Filter for NULL category or "Other" category
    query = query.or('category.is.null,category.eq.Other');
    console.log('Filtering for listings with NULL or "Other" category only');
  }
  
  // Limit the number of results
  const { data: listings, error } = await query.limit(limit);
  
  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }
  
  console.log(`Found ${listings.length} listings to categorize`);
  
  if (listings.length === 0) {
    console.log('No listings to process. Exiting...');
    return;
  }
  
  const selectedService = LLM_SERVICES[service];
  if (!selectedService) {
    console.error(`LLM service "${service}" not found`);
    return;
  }
  
  // Create batches of listings
  const batches = [];
  for (let i = 0; i < listings.length; i += batchSize) {
    batches.push(listings.slice(i, i + batchSize));
  }
  
  console.log(`\nProcessing ${batches.length} batches of up to ${batchSize} listings each...`);
  
  // Statistics
  const stats = {
    processed: 0,
    categorized: 0,
    unchanged: 0,
    errors: 0,
    categories: {},
    avgConfidence: 0,
    totalConfidence: 0
  };
  
  // Process batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} listings)...`);
    
    const updates = [];
    
    // Process each listing in the batch
    for (const listing of batch) {
      try {
        console.log(`\nProcessing listing ${listing.id}:`);
        console.log(`"${listing.text.substring(0, 100)}${listing.text.length > 100 ? '...' : ''}"`);
        
        stats.processed++;
        
        // Get current category from the category field or use "Other" as default
        const currentCategory = listing.category || 'Other';
        console.log(`  → Current category: ${currentCategory}`);
        
        // Get LLM categorization
        let result;
        
        if (service === 'MOCK') {
          // Mock service doesn't require API calls
          result = selectedService.parseResponse();
        } else {
          // Real API service
          const requestData = selectedService.formatRequest(listing.text);
          
          // Log request details for debugging
          console.log(`  → API Request to: ${selectedService.url}`);
          console.log(`  → Auth header length: ${selectedService.headers['Authorization'].length}`);
          console.log(`  → Auth header prefix: ${selectedService.headers['Authorization'].substring(0, 15)}...`);
          
          try {
            const response = await axios.post(
              selectedService.url,
              requestData,
              { headers: selectedService.headers }
            );
            result = selectedService.parseResponse(response);
          } catch (apiError) {
            console.error(`  → API Error: ${apiError.message}`);
            if (apiError.response) {
              console.error(`  → Status: ${apiError.response.status}`);
              console.error(`  → Status Text: ${apiError.response.statusText}`);
              console.error(`  → Response Data:`, apiError.response.data);
            }
            throw apiError; // Re-throw to be caught by the outer try/catch
          }
        }
        
        const { category: newCategory, confidence, reasoning } = result;
        
        // Update confidence stats
        stats.totalConfidence += confidence;
        
        // Check if category changed
        if (newCategory === currentCategory) {
          console.log(`  → Category unchanged: ${newCategory} (confidence: ${confidence.toFixed(2)})`);
          if (reasoning) console.log(`  → Reasoning: ${reasoning}`);
          stats.unchanged++;
        } else {
          console.log(`  → New category: ${newCategory} (was: ${currentCategory || 'undefined'})`);
          console.log(`  → Confidence: ${confidence.toFixed(2)}`);
          if (reasoning) console.log(`  → Reasoning: ${reasoning}`);
          
          // Update category stats
          stats.categories[newCategory] = (stats.categories[newCategory] || 0) + 1;
          stats.categorized++;
          
          // Add to updates if not a dry run
          if (!dryRun) {
            updates.push({
              id: listing.id,
              category: newCategory // Update the category field (not title)
            });
          }
        }
      } catch (error) {
        console.error(`Error processing listing ${listing.id}:`, error.message);
        stats.errors++;
      }
      
      // Add a small delay between requests to avoid rate limits
      if (service !== 'MOCK') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Update database if not a dry run and there are updates
    if (!dryRun && updates.length > 0) {
      console.log(`\nUpdating ${updates.length} listings in the database...`);
      
      const { error: updateError } = await supabase
        .from('listings')
        .upsert(updates);
      
      if (updateError) {
        console.error('Error updating listings:', updateError);
      } else {
        console.log('Database updated successfully');
      }
    }
  }
  
  // Calculate average confidence
  if (stats.processed > 0) {
    stats.avgConfidence = stats.totalConfidence / stats.processed;
  }
  
  // Print statistics
  console.log('\n===== Categorization Statistics =====');
  console.log(`Total processed: ${stats.processed}`);
  console.log(`Categorized differently: ${stats.categorized}`);
  console.log(`Unchanged: ${stats.unchanged}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Average confidence: ${stats.avgConfidence.toFixed(2)}`);
  
  if (stats.categorized > 0) {
    console.log('\nCategory distribution:');
    Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`- ${category}: ${count} listings (${Math.round(count / stats.categorized * 100)}%)`);
      });
  }
  
  console.log('\nLLM categorization complete!');
}

/**
 * Prompt the user for options
 */
function promptForOptions() {
  console.log('\n===== LLM Categorization Tool =====');
  console.log('This tool enhances database records with LLM categorization');
  
  rl.question(`\nSelect LLM service (default: ${DEFAULT_OPTIONS.service}):\n1. Mock LLM (for testing)\n2. OpenAI with Function Calling\nChoice: `, (serviceChoice) => {
    let service = DEFAULT_OPTIONS.service;
    
    if (serviceChoice === '1') service = 'MOCK';
    else if (serviceChoice === '2') service = 'OPENAI';
    
    rl.question(`\nLimit number of listings to process (default: ${DEFAULT_OPTIONS.limit}): `, (limitStr) => {
      const limit = parseInt(limitStr) || DEFAULT_OPTIONS.limit;
      
      rl.question(`\nBatch size (default: ${DEFAULT_OPTIONS.batchSize}): `, (batchSizeStr) => {
        const batchSize = parseInt(batchSizeStr) || DEFAULT_OPTIONS.batchSize;
        
        rl.question('\nMode:\n1. Dry run (no database changes)\n2. Live run (will update database)\nChoice: ', (modeChoice) => {
          const dryRun = modeChoice !== '2';
          
          rl.question('\nFilter listings by category:\n1. Only "Other" category listings (recommended)\n2. All listings\nChoice: ', (filterChoice) => {
            const onlyOtherCategory = filterChoice !== '2';
            
            // Final confirmation
            console.log('\n===== Confirmation =====');
            console.log(`Service: ${LLM_SERVICES[service].name}`);
            console.log(`Limit: ${limit} listings`);
            console.log(`Batch size: ${batchSize}`);
            console.log(`Mode: ${dryRun ? 'Dry run (no database changes)' : 'Live run (will update database)'}`);
            console.log(`Filter: ${onlyOtherCategory ? 'Only "Other" category listings' : 'All listings'}`);
            
            rl.question('\nProceed? (y/n): ', async (confirm) => {
              if (confirm.toLowerCase() === 'y') {
                await categorizeListingsWithLLM({
                  service,
                  limit,
                  batchSize,
                  dryRun,
                  onlyOtherCategory
                });
              } else {
                console.log('Operation cancelled');
              }
              
              rl.close();
            });
          });
        });
      });
    });
  });
}

// Main function
async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  
  // Check for non-interactive mode
  const nonInteractive = args.includes('--non-interactive');
  
  if (nonInteractive) {
    // Parse options from command-line arguments
    const options = {
      ...DEFAULT_OPTIONS
    };
    
    // Parse service
    const serviceArg = args.find(arg => arg.startsWith('--service='));
    if (serviceArg) {
      const service = serviceArg.split('=')[1].toUpperCase();
      if (service === 'OPENAI' || service === 'MOCK') {
        options.service = service;
      }
    }
    
    // Parse limit
    const limitArg = args.find(arg => arg.startsWith('--limit='));
    if (limitArg) {
      const limit = parseInt(limitArg.split('=')[1]);
      if (!isNaN(limit) && limit > 0) {
        options.limit = limit;
      }
    }
    
    // Parse batch size
    const batchArg = args.find(arg => arg.startsWith('--batch='));
    if (batchArg) {
      const batchSize = parseInt(batchArg.split('=')[1]);
      if (!isNaN(batchSize) && batchSize > 0) {
        options.batchSize = batchSize;
      }
    }
    
    // Parse live mode
    options.dryRun = !args.includes('--live');
    
    // Parse category filter
    options.onlyOtherCategory = !args.includes('--all');
    
    // Run with non-interactive options
    console.log('Running in non-interactive mode with options:');
    console.log(`- Service: ${options.service}`);
    console.log(`- Limit: ${options.limit}`);
    console.log(`- Batch size: ${options.batchSize}`);
    console.log(`- Mode: ${options.dryRun ? 'Dry run' : 'Live run'}`);
    console.log(`- Filter: ${options.onlyOtherCategory ? 'Only "Other" category' : 'All listings'}`);
    
    await categorizeListingsWithLLM(options);
    process.exit(0);
  } else {
    // Interactive mode
    promptForOptions();
  }
}

// Start the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 