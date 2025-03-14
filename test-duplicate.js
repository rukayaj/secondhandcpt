/**
 * Unit test for duplicate detection
 * 
 * This test checks why duplicate listings aren't being detected across different WhatsApp groups.
 */

// Mock database for testing
const mockListings = [];
let mockImageHashes = false;

// Simple mock implementation of listingExists
async function mockListingExists(listing, verbose = false) {
  if (verbose) {
    console.log(`Checking if listing exists: ${listing.title || 'Untitled'}`);
    console.log(`- Group: ${listing.whatsappGroup}`);
    console.log(`- Date: ${listing.date}`);
    console.log(`- Sender: ${listing.sender}`);
  }
  
  // 1. Check for text match
  const textMatch = mockListings.find(l => 
    l.sender === listing.sender && 
    l.text === listing.text
  );
  
  if (textMatch) {
    if (verbose) {
      console.log('Found existing listing with identical text from same sender:');
      console.log(`- ID: ${textMatch.id}`);
      console.log(`- Title: ${textMatch.title}`);
    }
    return true;
  }
  
  // 2. Check for image hash match (if enabled)
  if (mockImageHashes && listing.image_hashes && listing.image_hashes.length > 0) {
    for (const existingListing of mockListings) {
      if (!existingListing.image_hashes || !Array.isArray(existingListing.image_hashes)) continue;
      
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
  
  // 3. Check for image path match
  if (listing.images && listing.images.length > 0) {
    for (const existingListing of mockListings) {
      if (!existingListing.images || existingListing.images.length === 0) continue;
      
      // Check if any image paths match
      const matchingImages = listing.images.filter(image => 
        existingListing.images.includes(image)
      );
      
      if (verbose && existingListing.images.length > 0) {
        console.log(`Comparing with listing ${existingListing.id} (${existingListing.title})`);
        console.log(`- Existing images: ${JSON.stringify(existingListing.images)}`);
        console.log(`- Current images: ${JSON.stringify(listing.images)}`);
        console.log(`- Matching images: ${matchingImages.length > 0 ? JSON.stringify(matchingImages) : 'None'}`);
      }
      
      if (matchingImages.length > 0) {
        return true;
      }
    }
  }
  
  return false;
}

async function testDuplicateDetection() {
  console.log("=== TESTING DUPLICATE DETECTION ACROSS DIFFERENT GROUPS ===\n");
  
  // Create two identical listings in different groups
  const listing1 = {
    id: "61a4cb56-cf49-410f-b9f3-f09ae67feb06",
    title: "Stars and moon multi coloured mini night light",
    text: "Brand new stars and moon multi coloured mini night light. \nAutomatically rotates.\nSelling for r100 \nCollection in Ottery or via Pudo\nX posted \n\nPLEASE PM FOR VIDEO",
    whatsappGroup: "Nifty Thrifty 0-1 year (1)",
    date: new Date("2025-03-13T16:05:32.000Z"),
    sender: "27652050920@c.us",
    price: 100,
    images: ["listings/Nifty_Thrifty_0-1_year_1_0_1741882106140_1704.jpg"],
    image_hashes: ["abcdef123456"]
  };

  const listing2 = {
    id: "91367ff3-df78-4867-9feb-846283f39492",
    title: "Stars and moon multi coloured mini night light",
    text: "Brand new stars and moon multi coloured mini night light. \nAutomatically rotates.\nSelling for r100 \nCollection in Ottery or via Pudo\nX posted \n\nPLEASE PM FOR VIDEO",
    whatsappGroup: "Nifty Thrifty 1-3 years",
    date: new Date("2025-03-13T16:05:48.000Z"),
    sender: "27652050920@c.us",
    price: 100,
    images: ["listings/Nifty_Thrifty_1-3_years_0_1741882108309_2582.jpg"],
    image_hashes: ["abcdef123456"] // Same hash
  };

  // SCENARIO 1: Text match is working
  console.log("SCENARIO 1: Testing with exact text match");
  mockListings.length = 0; // Clear mock listings
  mockListings.push(listing1);
  
  const isDuplicateText = await mockListingExists(listing2, true);
  console.log("\nDuplicate detection result with text match:", 
    isDuplicateText ? "DUPLICATE DETECTED ✅" : "DUPLICATE NOT DETECTED ❌");
  
  // SCENARIO 2: Different text, no image hashes
  console.log("\n-----------------------------------------");
  console.log("SCENARIO 2: Different text, no image hash comparison");
  mockListings.length = 0; // Clear mock listings
  listing1.text = "Brand new stars and moon mini night light. \nAutomatically rotates.\nSelling for r100 \nCollection in Ottery or via Pudo\nX posted"; // Slightly different text
  mockListings.push(listing1);
  
  const isDuplicateDiffText = await mockListingExists(listing2, true);
  console.log("\nDuplicate detection result with different text:", 
    isDuplicateDiffText ? "DUPLICATE DETECTED ✅" : "DUPLICATE NOT DETECTED ❌");
  
  // SCENARIO 3: Same image hash but different paths
  console.log("\n-----------------------------------------");
  console.log("SCENARIO 3: Same image hash, different image paths");
  mockListings.length = 0; // Clear mock listings
  mockImageHashes = true; // Enable image hash comparison
  listing1.text = listing2.text; // Reset text to be identical
  mockListings.push(listing1);
  
  const isDuplicateImageHash = await mockListingExists(listing2, true);
  console.log("\nDuplicate detection result with image hash:", 
    isDuplicateImageHash ? "DUPLICATE DETECTED ✅" : "DUPLICATE NOT DETECTED ❌");
  
  // SCENARIO 4: Same image path
  console.log("\n-----------------------------------------");
  console.log("SCENARIO 4: Same image path");
  mockListings.length = 0;
  mockImageHashes = false;
  listing1.images = ["listings/same_image_path.jpg"];
  listing2.images = ["listings/same_image_path.jpg"];
  mockListings.push(listing1);
  
  const isDuplicateImagePath = await mockListingExists(listing2, true);
  console.log("\nDuplicate detection result with same image path:", 
    isDuplicateImagePath ? "DUPLICATE DETECTED ✅" : "DUPLICATE NOT DETECTED ❌");
  
  // SCENARIO 5: Real world example - different image paths, same hash
  console.log("\n-----------------------------------------");
  console.log("SCENARIO 5: Real world example - Use actual values from production");
  mockListings.length = 0;
  mockImageHashes = true;
  
  // Reset to original values
  listing1.images = ["listings/Nifty_Thrifty_0-1_year_1_0_1741882106140_1704.jpg"];
  listing1.image_hashes = ["abcdef123456"];
  listing2.images = ["listings/Nifty_Thrifty_1-3_years_0_1741882108309_2582.jpg"];
  listing2.image_hashes = ["abcdef123456"];
  
  mockListings.push(listing1);
  
  const isDuplicateRealWorld = await mockListingExists(listing2, true);
  console.log("\nDuplicate detection result with real-world scenario:", 
    isDuplicateRealWorld ? "DUPLICATE DETECTED ✅" : "DUPLICATE NOT DETECTED ❌");
}

// Run the test
testDuplicateDetection()
  .then(() => console.log("\nTest completed"))
  .catch(err => console.error("Test error:", err)); 