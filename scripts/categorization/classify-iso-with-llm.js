/**
 * Classify ISO Posts with LLM
 * 
 * This script identifies genuine "In Search Of" (ISO) posts versus regular group messages
 * using LLM-based classification.
 * 
 * Run this script to clean up false positive ISO posts.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const readline = require('readline');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Table name constant
const LISTINGS_TABLE = 'listings';

// Set up readline interface for CLI prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
          content: "You are an expert at classifying WhatsApp messages for a second-hand marketplace. Your job is to analyze messages and determine if they are: 1) 'ISO' posts where someone is looking for an item to buy, 2) 'Sale' posts where someone is selling an item, or 3) 'Conversation' messages that are just group chat and should be deleted from the database."
        },
        {
          role: "user",
          content: `Classify this WhatsApp message as 'ISO' (looking for an item), 'Sale' (selling an item), or 'Conversation' (just chat that should be deleted). The message is: "${text}"`
        }
      ],
      functions: [
        {
          name: "classify_message",
          description: "Classify a WhatsApp message as an ISO post, a Sale post, or a Conversation message",
          parameters: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                enum: ["ISO", "Sale", "Conversation"],
                description: "The classification of the message ('ISO' for looking for items, 'Sale' for selling items, 'Conversation' for chat messages that should be deleted)"
              },
              confidence: {
                type: "number",
                description: "Confidence score from 0 to 1.0"
              },
              reasoning: {
                type: "string", 
                description: "Brief explanation of the classification reasoning"
              }
            },
            required: ["classification", "confidence", "reasoning"]
          }
        }
      ],
      function_call: { name: "classify_message" }
    }),
    parseResponse: (response) => {
      try {
        const functionCall = response.data.choices[0].message.function_call;
        const result = JSON.parse(functionCall.arguments);
        return {
          classification: result.classification,
          isISO: result.classification === "ISO",
          isSale: result.classification === "Sale",
          shouldDelete: result.classification === "Conversation",
          confidence: result.confidence,
          reasoning: result.reasoning
        };
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        return { 
          classification: "Sale", 
          isISO: false, 
          isSale: true,
          shouldDelete: false,
          confidence: 0, 
          reasoning: "Error in classification" 
        };
      }
    }
  },
  'MOCK': {
    name: 'Mock LLM (for testing)',
    url: '',
    headers: {},
    formatRequest: () => ({}),
    parseResponse: (text) => {
      // Simple heuristic for mock classification
      const isISOPattern = /\b(iso|looking for|wanted|need|anyone ha(ve|s)|where can i)\b/i;
      const conversationPattern = /\b(thanks|thank you|please|sorry|ok|okay|got it|will do|noted|no problem)\b/i;
      const isISO = isISOPattern.test(text || "");
      const isConversation = conversationPattern.test(text || "") && text.length < 60;
      
      let classification;
      if (isConversation) classification = "Conversation";
      else if (isISO) classification = "ISO";
      else classification = "Sale";
      
      return {
        classification,
        isISO: classification === "ISO",
        isSale: classification === "Sale",
        shouldDelete: classification === "Conversation",
        confidence: classification === "Conversation" ? 0.9 : (isISO ? 0.85 : 0.75),
        reasoning: isConversation ? 
          "This appears to be a conversational message that should be deleted." :
          (isISO ? 
            "This appears to be someone looking for an item to purchase." : 
            "This appears to be someone selling an item.")
      };
    }
  }
};

// Default options
const DEFAULT_OPTIONS = {
  limit: 100,
  batchSize: 10,
  service: 'MOCK', // Change to 'OPENAI' when ready to use real service
  dryRun: true,
  onlyCurrentISO: false, // Changed to false by default to find all conversation messages
  deleteConversations: true // New option to control whether to delete conversation messages
};

/**
 * Process listings with LLM classification
 * @param {Object} options - Processing options
 */
async function classifyListingsWithLLM(options) {
  const { limit, batchSize, service, dryRun, onlyCurrentISO, deleteConversations } = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  console.log(`\nStarting LLM classification with the following options:`);
  console.log(`- Service: ${LLM_SERVICES[service].name}`);
  console.log(`- Limit: ${limit} listings`);
  console.log(`- Batch size: ${batchSize}`);
  console.log(`- Mode: ${dryRun ? 'Dry run (no database changes)' : 'Live run (will update database)'}`);
  console.log(`- Filter: ${onlyCurrentISO ? 'Only current ISO-flagged listings' : 'All listings'}`);
  console.log(`- Delete Conversations: ${deleteConversations ? 'Yes' : 'No'}`);
  
  // Fetch listings to process
  console.log(`\nFetching listings...`);
  
  let query = supabase
    .from(LISTINGS_TABLE)
    .select('id, text, is_iso');
  
  // Only get current ISO posts if option is selected
  if (onlyCurrentISO) {
    query = query.eq('is_iso', true);
  }
  
  // Limit results and get listings
  const { data: listings, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }
  
  console.log(`Found ${listings.length} listings to classify`);
  
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
    changed: 0,
    unchanged: 0,
    errors: 0,
    toISO: 0,
    toSale: 0,
    deleted: 0,
    avgConfidence: 0,
    totalConfidence: 0
  };
  
  // Process batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} listings)...`);
    
    const updates = [];
    const deletions = [];
    
    // Process each listing in the batch
    for (const listing of batch) {
      try {
        console.log(`\nProcessing listing ${listing.id}:`);
        console.log(`"${listing.text.substring(0, 100)}${listing.text.length > 100 ? '...' : ''}"`);
        
        stats.processed++;
        
        // Get current ISO status
        const currentIsISO = listing.is_iso;
        console.log(`  → Current ISO status: ${currentIsISO ? 'YES' : 'NO'}`);
        
        // Get LLM classification
        let result;
        
        if (service === 'MOCK') {
          // Mock service doesn't require API calls
          result = selectedService.parseResponse(listing.text);
        } else {
          // Real API service
          const requestData = selectedService.formatRequest(listing.text);
          
          try {
            console.log(`  → Calling LLM API...`);
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
              console.error(`  → Response: ${JSON.stringify(apiError.response.data).substring(0, 200)}`);
            }
            throw apiError; // Re-throw to be caught by the outer try/catch
          }
        }
        
        const { classification, isISO: shouldBeISO, shouldDelete, confidence, reasoning } = result;
        
        // Update confidence stats
        stats.totalConfidence += confidence;
        
        // Handle conversation messages that should be deleted
        if (shouldDelete && deleteConversations) {
          console.log(`  → Classification: ${classification} (confidence: ${confidence.toFixed(2)})`);
          console.log(`  → Should be deleted as a conversation message`);
          if (reasoning) console.log(`  → Reasoning: ${reasoning}`);
          
          stats.deleted++;
          
          // Add to deletions if not a dry run
          if (!dryRun) {
            deletions.push(listing.id);
          }
          
          continue; // Skip to next listing
        }
        
        // Check if classification changes current status
        if (shouldBeISO === currentIsISO) {
          console.log(`  → Classification unchanged: ${classification} (confidence: ${confidence.toFixed(2)})`);
          if (reasoning) console.log(`  → Reasoning: ${reasoning}`);
          stats.unchanged++;
        } else {
          console.log(`  → New classification: ${classification} (was: ${currentIsISO ? 'ISO' : 'Sale'})`);
          console.log(`  → Confidence: ${confidence.toFixed(2)}`);
          if (reasoning) console.log(`  → Reasoning: ${reasoning}`);
          
          // Track changes for statistics
          if (shouldBeISO) {
            stats.toISO++;
          } else {
            stats.toSale++;
          }
          
          stats.changed++;
          
          // Add to updates if not a dry run
          if (!dryRun) {
            updates.push({
              id: listing.id,
              is_iso: shouldBeISO
            });
          }
        }
      } catch (error) {
        console.error(`Error processing listing ${listing.id}:`, error.message);
        stats.errors++;
      }
    }
    
    // Update database if not a dry run and there are updates
    if (!dryRun && updates.length > 0) {
      console.log(`\nUpdating ${updates.length} listings in the database...`);
      
      const { error: updateError } = await supabase
        .from(LISTINGS_TABLE)
        .upsert(updates);
      
      if (updateError) {
        console.error('Error updating listings:', updateError);
        stats.errors += updates.length;
      } else {
        console.log('Database updated successfully');
      }
    }
    
    // Delete conversation messages if not a dry run and there are deletions
    if (!dryRun && deletions.length > 0) {
      console.log(`\nDeleting ${deletions.length} conversation messages from the database...`);
      
      const { error: deleteError } = await supabase
        .from(LISTINGS_TABLE)
        .delete()
        .in('id', deletions);
      
      if (deleteError) {
        console.error('Error deleting conversation messages:', deleteError);
        stats.errors += deletions.length;
      } else {
        console.log('Conversation messages deleted successfully');
      }
    }
  }
  
  // Calculate average confidence
  if (stats.processed > 0) {
    stats.avgConfidence = stats.totalConfidence / stats.processed;
  }
  
  // Print statistics
  console.log('\n===== Classification Statistics =====');
  console.log(`Total processed: ${stats.processed}`);
  console.log(`Changed: ${stats.changed} (${Math.round(stats.changed / stats.processed * 100)}%)`);
  console.log(`  - Sale → ISO: ${stats.toISO}`);
  console.log(`  - ISO → Sale: ${stats.toSale}`);
  console.log(`Deleted: ${stats.deleted} (${Math.round(stats.deleted / stats.processed * 100)}%)`);
  console.log(`Unchanged: ${stats.unchanged} (${Math.round(stats.unchanged / stats.processed * 100)}%)`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Average confidence: ${stats.avgConfidence.toFixed(2)}`);
  
  console.log('\nISO classification complete!');
}

/**
 * Prompt the user for options
 */
function promptForOptions() {
  console.log('\n===== ISO Classification Tool =====');
  console.log('This tool uses LLM to classify listings and optionally delete conversation messages');
  
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
          
          rl.question('\nProcess:\n1. Only current ISO posts\n2. All listings (recommended for finding conversations)\nChoice: ', (isoChoice) => {
            const onlyCurrentISO = isoChoice === '1';
            
            rl.question('\nDelete conversation messages:\n1. Yes (delete chat messages)\n2. No (keep all messages)\nChoice: ', (deleteChoice) => {
              const deleteConversations = deleteChoice !== '2';
              
              // Final confirmation
              console.log('\n===== Confirmation =====');
              console.log(`Service: ${LLM_SERVICES[service].name}`);
              console.log(`Limit: ${limit} listings`);
              console.log(`Batch size: ${batchSize}`);
              console.log(`Mode: ${dryRun ? 'Dry run (no database changes)' : 'Live run (will update database)'}`);
              console.log(`Process: ${onlyCurrentISO ? 'Only current ISO posts' : 'All listings'}`);
              console.log(`Delete conversations: ${deleteConversations ? 'Yes' : 'No'}`);
              
              rl.question('\nProceed? (y/n): ', async (confirm) => {
                if (confirm.toLowerCase() === 'y') {
                  await classifyListingsWithLLM({
                    service,
                    limit,
                    batchSize,
                    dryRun,
                    onlyCurrentISO,
                    deleteConversations
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
  });
}

/**
 * Main function
 */
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
    
    // Parse ISO filter option
    options.onlyCurrentISO = args.includes('--only-iso');
    
    // Parse delete conversations option
    options.deleteConversations = !args.includes('--no-delete');
    
    // Run with non-interactive options
    console.log('Running in non-interactive mode with options:');
    console.log(`- Service: ${options.service}`);
    console.log(`- Limit: ${options.limit}`);
    console.log(`- Batch size: ${options.batchSize}`);
    console.log(`- Mode: ${options.dryRun ? 'Dry run' : 'Live run'}`);
    console.log(`- Process: ${options.onlyCurrentISO ? 'Only current ISO posts' : 'All listings'}`);
    console.log(`- Delete conversations: ${options.deleteConversations ? 'Yes' : 'No'}`);
    
    await classifyListingsWithLLM(options);
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