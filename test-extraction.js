const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Function to extract listings from WhatsApp chat content
function extractListings(content, whatsappGroup) {
  const results = [];
  const lines = content.split('\n');
  let currentListing = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match any line that starts with a date and time
    // Note: There's a special character (8239) between the time and am/pm
    const dateTimeMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) -/i);
    
    if (dateTimeMatch) {
      // Check if it's a message (has a colon after the sender)
      const messageMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) - (.+?): (.*)$/i);
      
      if (messageMatch) {
        // If we were building a previous listing, save it
        if (currentListing) {
          results.push(currentListing);
        }
        
        // Start a new listing
        const [_, date, time, ampm, sender, text] = messageMatch;
        
        // Skip system messages
        if (sender === "Messages and calls are end-to-end encrypted" || 
            line.includes("joined using this group's invite link") ||
            line.includes("was added") ||
            line.includes("created group") ||
            line.includes("You joined") ||
            sender.includes("You") ||
            line.includes("The message timer was updated")) {
          currentListing = null;
          continue;
        }
        
        currentListing = {
          whatsappGroup,
          date: `${date} ${time} ${ampm}`,
          sender,
          text,
          images: text.includes('(file attached)') ? [text.match(/([^\/\s]+\.jpg)/)?.[1]].filter(Boolean) : undefined,
          price: null
        };
        
        // Extract price if available
        const priceMatch = text.match(/R(\d+)/) || text.match(/@R(\d+)/);
        if (priceMatch) {
          currentListing.price = parseInt(priceMatch[1], 10);
        }
      } else {
        // This is a system message or other non-message line
        currentListing = null;
      }
    } else if (currentListing) {
      // This is a continuation of the previous message
      currentListing.text += '\n' + line;
      
      // Check for price in continuation lines if not already found
      if (currentListing.price === null) {
        const priceMatch = line.match(/R(\d+)/) || line.match(/@R(\d+)/);
        if (priceMatch) {
          currentListing.price = parseInt(priceMatch[1], 10);
        }
      }
      
      // Check for image in continuation lines if not already found
      if (!currentListing.images && line.includes('(file attached)')) {
        const imageMatch = line.match(/([^\/\s]+\.jpg)/);
        if (imageMatch) {
          currentListing.images = [imageMatch[1]];
        }
      }
    }
  }
  
  // Don't forget to add the last listing
  if (currentListing) {
    results.push(currentListing);
  }
  
  return results;
}

// Function to extract listings from a file
function extractListingsFromFile(filePath, whatsappGroup) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return extractListings(content, whatsappGroup);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Test cases
function runTests() {
  console.log("Running tests...");
  
  // Test 1: Basic message extraction
  const test1 = `12/5/24, 1:24 pm - +27 63 359 3846: IMG-20241205-WA0003.jpg (file attached)
All 3. @R80 fluffy shoes size 2&3 sandal size 2
Collection: Cape Gate Brackenfell
DM me if interested.`;
  
  const result1 = extractListings(test1, "Test Group");
  assert.strictEqual(result1.length, 1, "Should extract one listing");
  assert.strictEqual(result1[0].sender, "+27 63 359 3846", "Should extract correct sender");
  assert.strictEqual(result1[0].price, 80, "Should extract correct price");
  assert.strictEqual(result1[0].images[0], "IMG-20241205-WA0003.jpg", "Should extract image filename");
  console.log("Test 1 passed: Basic message extraction");
  
  // Test 2: System message filtering
  const test2 = `12/5/24, 1:45 pm - +27 79 132 4699 joined using this group's invite link
12/5/24, 2:07 pm - ~ Aimee Albertyn was added
12/5/24, 2:16 pm - +27 82 460 9944: IMG-20241205-WA0005.jpg (file attached)
Baby Sense Book
Perfect condition 
R50 
Collection Constantia
Cross posted`;
  
  const result2 = extractListings(test2, "Test Group");
  assert.strictEqual(result2.length, 1, "Should filter out system messages");
  assert.strictEqual(result2[0].sender, "+27 82 460 9944", "Should extract correct sender");
  assert.strictEqual(result2[0].price, 50, "Should extract correct price");
  console.log("Test 2 passed: System message filtering");
  
  // Test 3: Multi-line messages
  const test3 = `2/25/25, 2:37 pm - +27 83 368 8367: IMG-20250225-WA0025.jpg (file attached)
Toddler teepee floor bed with railing. Mattress included. R2000. Can be disassembled for transportation. Collect Kirstenhof . Cross posted.
2/25/25, 2:55 pm - +27 83 777 9642: This message was deleted`;
  
  const result3 = extractListings(test3, "Test Group");
  assert.strictEqual(result3.length, 2, "Should extract both messages");
  assert.strictEqual(result3[0].price, 2000, "Should extract correct price from multi-line message");
  assert.ok(result3[0].text.includes("Toddler teepee floor bed"), "Should include full multi-line text");
  console.log("Test 3 passed: Multi-line messages");
  
  // Test 4: Deleted messages
  const test4 = `2/24/25, 4:28 pm - +27 65 205 0920: This message was deleted
2/24/25, 4:34 pm - +27 82 473 7690: This message was deleted`;
  
  const result4 = extractListings(test4, "Test Group");
  assert.strictEqual(result4.length, 2, "Should extract deleted messages");
  assert.strictEqual(result4[0].text, "This message was deleted", "Should preserve deleted message text");
  console.log("Test 4 passed: Deleted messages");
  
  // Test 5: Messages with no price
  const test5 = `2/25/25, 7:29 am - +27 73 017 9444: ISO of a campcot in reasonable condition 🙏🏼`;
  
  const result5 = extractListings(test5, "Test Group");
  assert.strictEqual(result5.length, 1, "Should extract message with no price");
  assert.strictEqual(result5[0].price, null, "Price should be null when not present");
  console.log("Test 5 passed: Messages with no price");
  
  // Test 6: Edge case - message with multiple prices
  const test6 = `2/25/25, 11:31 am - +27 84 488 8777: IMG-20250225-WA0023.jpg (file attached)
18-24m bundle R440 
Mix of Edgars, Ackermans and pnp clothing
Some items were R200 each`;
  
  const result6 = extractListings(test6, "Test Group");
  assert.strictEqual(result6.length, 1, "Should extract message with multiple prices");
  assert.strictEqual(result6[0].price, 440, "Should extract the first price mentioned");
  console.log("Test 6 passed: Message with multiple prices");
  
  // Test 7: Edge case - null message
  const test7 = `12/5/24, 10:06 pm - +27 82 546 0212: null`;
  
  const result7 = extractListings(test7, "Test Group");
  assert.strictEqual(result7.length, 1, "Should extract null message");
  assert.strictEqual(result7[0].text, "null", "Should preserve null text");
  console.log("Test 7 passed: Null message");
  
  // Test 8: Edge case - message with media omitted
  const test8 = `12/6/24, 7:45 am - +27 82 823 8933: <Media omitted>`;
  
  const result8 = extractListings(test8, "Test Group");
  assert.strictEqual(result8.length, 1, "Should extract media omitted message");
  assert.strictEqual(result8[0].text, "<Media omitted>", "Should preserve media omitted text");
  assert.strictEqual(result8[0].images, undefined, "Should not have images array for media omitted");
  console.log("Test 8 passed: Media omitted message");
  
  // Test 9: Edge case - messages with names instead of phone numbers
  const test9 = `2/26/25, 9:31 am - ~ Malika Agherdien added ~ Nuhaa
2/26/25, 2:44 pm - ~ Lea Noble added +27 84 888 9105`;
  
  const result9 = extractListings(test9, "Test Group");
  assert.strictEqual(result9.length, 0, "Should not extract system messages with names");
  console.log("Test 9 passed: System messages with names");
  
  console.log("All tests passed!");
}

// Run the tests
runTests();

// Main function to process the chat files
function processWhatsAppChats() {
  console.log("\nProcessing real data samples...");
  
  // Process the 0-1 year chat file
  try {
    const zeroToOneFilePath = './src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt';
    console.log(`Attempting to read file: ${zeroToOneFilePath}`);
    
    if (fs.existsSync(zeroToOneFilePath)) {
      const content = fs.readFileSync(zeroToOneFilePath, 'utf8');
      const listings = extractListings(content, "Nifty Thrifty 0-1 year");
      console.log(`Extracted ${listings.length} listings from 0-1 year chat file`);
      
      if (listings.length > 0) {
        console.log("Sample listings from 0-1 year chat:");
        console.log(JSON.stringify(listings.slice(0, 3), null, 2));
      }
    } else {
      console.log(`File not found: ${zeroToOneFilePath}`);
    }
  } catch (error) {
    console.error("Error processing 0-1 year chat file:", error);
  }
  
  // Process the 1-3 years chat file
  try {
    const oneToThreeFilePath = './src/data/nifty-thrifty-1-3-years/WhatsApp Chat with Nifty Thrifty 1-3 years.txt';
    console.log(`\nAttempting to read file: ${oneToThreeFilePath}`);
    
    if (fs.existsSync(oneToThreeFilePath)) {
      const content = fs.readFileSync(oneToThreeFilePath, 'utf8');
      const listings = extractListings(content, "Nifty Thrifty 1-3 years");
      console.log(`Extracted ${listings.length} listings from 1-3 years chat file`);
      
      if (listings.length > 0) {
        console.log("Sample listings from 1-3 years chat:");
        console.log(JSON.stringify(listings.slice(0, 3), null, 2));
      }
    } else {
      console.log(`File not found: ${oneToThreeFilePath}`);
    }
  } catch (error) {
    console.error("Error processing 1-3 years chat file:", error);
  }
}

// Process real samples
processWhatsAppChats();

// Debug function to directly process file content
function debugFileContent() {
  console.log("\nDebugging file content...");
  
  try {
    // Read the 0-1 year chat file
    const zeroToOneFilePath = './src/data/nifty-thrifty-0-1-years/WhatsApp Chat with Nifty Thrifty 0-1 year.txt';
    console.log(`Checking if file exists: ${zeroToOneFilePath}`);
    console.log(`File exists: ${fs.existsSync(zeroToOneFilePath)}`);
    
    if (fs.existsSync(zeroToOneFilePath)) {
      console.log("Reading file...");
      const content = fs.readFileSync(zeroToOneFilePath, 'utf8');
      console.log(`File read successfully. Content length: ${content.length} characters`);
      
      // Examine the first 20 lines with character codes
      const lines = content.split('\n').slice(0, 20); // Get first 20 lines
      
      console.log("\nFirst 20 lines of the file with character codes:");
      lines.forEach((line, index) => {
        console.log(`Line ${index + 1}: ${line}`);
        
        // Try to match date/time pattern with the updated regex
        const dateTimeMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) -/i);
        if (dateTimeMatch) {
          console.log(`  -> Matched date/time pattern: ${dateTimeMatch[0]}`);
          
          // Try to match message pattern with the updated regex
          const messageMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) - (.+?): (.*)$/i);
          if (messageMatch) {
            console.log(`  -> Matched message pattern`);
            console.log(`     Date: ${messageMatch[1]}`);
            console.log(`     Time: ${messageMatch[2]} ${messageMatch[3]}`);
            console.log(`     Sender: ${messageMatch[4]}`);
            console.log(`     Text: ${messageMatch[5]}`);
          } else {
            console.log(`  -> Did NOT match message pattern`);
          }
        }
      });
      
      // Process the entire file with our updated extraction logic
      console.log("\nProcessing entire file with updated extraction logic...");
      const extractedListings = extractListings(content, "Nifty Thrifty 0-1 year");
      console.log(`Extracted ${extractedListings.length} listings from file`);
      
      if (extractedListings.length > 0) {
        console.log("First 3 extracted listings:");
        console.log(JSON.stringify(extractedListings.slice(0, 3), null, 2));
      }
    } else {
      console.log(`File not found: ${zeroToOneFilePath}`);
    }
  } catch (error) {
    console.error("Error debugging file content:", error);
    console.error(error.stack);
  }
}

// Debug file content
debugFileContent(); 