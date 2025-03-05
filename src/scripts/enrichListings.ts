import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Listing } from '../utils/sampleData.public';

/**
 * Interactive script to help enrich listings with missing information
 * This is meant to be used after processing a WhatsApp chat export
 * to add price, category, condition, and location information
 */
async function enrichListings() {
  // Get the file path from command line arguments
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path to the listings file.');
    console.error('Usage: npm run enrich-listings -- src/data/whatsapp-exports/nifty-thrifty-0-1-years.ts');
    process.exit(1);
  }

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the listings array
    const match = fileContent.match(/export const \w+Listings: Listing\[\] = (\[[\s\S]*\]);/);
    if (!match || !match[1]) {
      console.error('Error: Could not extract listings from the file.');
      process.exit(1);
    }

    // Parse the listings
    let listings: Listing[] = JSON.parse(match[1]);
    console.log(`Found ${listings.length} listings in the file.`);

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Categories for selection
    const categories = [
      'Clothing', 'Toys', 'Furniture', 'Footwear', 'Gear', 
      'Feeding', 'Accessories', 'Swimming', 'Bedding', 'Diapers'
    ];

    // Conditions for selection
    const conditions = [
      'New', 'Like New', 'Good', 'Fair', 'Poor'
    ];

    // Process each listing
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      
      console.log('\n==================================================');
      console.log(`Listing ${i + 1} of ${listings.length}`);
      console.log('==================================================');
      console.log(`Text: ${listing.text}`);
      console.log(`Images: ${listing.images?.join(', ') || 'None'}`);
      console.log(`ISO: ${listing.isISO ? 'Yes' : 'No'}`);
      console.log('--------------------------------------------------');
      
      // Price
      if (listing.price === null) {
        const priceStr = await askQuestion(rl, 'Price (number only, no R, or leave empty): ');
        if (priceStr.trim()) {
          const price = parseInt(priceStr.trim(), 10);
          if (!isNaN(price)) {
            listing.price = price;
          }
        }
      } else {
        console.log(`Current price: R${listing.price}`);
        const changePrice = await askQuestion(rl, 'Change price? (y/n): ');
        if (changePrice.toLowerCase() === 'y') {
          const priceStr = await askQuestion(rl, 'New price (number only, no R): ');
          if (priceStr.trim()) {
            const price = parseInt(priceStr.trim(), 10);
            if (!isNaN(price)) {
              listing.price = price;
            }
          }
        }
      }
      
      // Category
      if (!listing.category) {
        console.log('Categories:');
        categories.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat}`);
        });
        const catIndexStr = await askQuestion(rl, 'Select category (number, or leave empty): ');
        if (catIndexStr.trim()) {
          const catIndex = parseInt(catIndexStr.trim(), 10) - 1;
          if (catIndex >= 0 && catIndex < categories.length) {
            listing.category = categories[catIndex];
          }
        }
      } else {
        console.log(`Current category: ${listing.category}`);
        const changeCategory = await askQuestion(rl, 'Change category? (y/n): ');
        if (changeCategory.toLowerCase() === 'y') {
          console.log('Categories:');
          categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat}`);
          });
          const catIndexStr = await askQuestion(rl, 'Select category (number): ');
          if (catIndexStr.trim()) {
            const catIndex = parseInt(catIndexStr.trim(), 10) - 1;
            if (catIndex >= 0 && catIndex < categories.length) {
              listing.category = categories[catIndex];
            }
          }
        }
      }
      
      // Condition
      if (!listing.condition) {
        console.log('Conditions:');
        conditions.forEach((cond, index) => {
          console.log(`${index + 1}. ${cond}`);
        });
        const condIndexStr = await askQuestion(rl, 'Select condition (number, or leave empty): ');
        if (condIndexStr.trim()) {
          const condIndex = parseInt(condIndexStr.trim(), 10) - 1;
          if (condIndex >= 0 && condIndex < conditions.length) {
            listing.condition = conditions[condIndex];
          }
        }
      } else {
        console.log(`Current condition: ${listing.condition}`);
        const changeCondition = await askQuestion(rl, 'Change condition? (y/n): ');
        if (changeCondition.toLowerCase() === 'y') {
          console.log('Conditions:');
          conditions.forEach((cond, index) => {
            console.log(`${index + 1}. ${cond}`);
          });
          const condIndexStr = await askQuestion(rl, 'Select condition (number): ');
          if (condIndexStr.trim()) {
            const condIndex = parseInt(condIndexStr.trim(), 10) - 1;
            if (condIndex >= 0 && condIndex < conditions.length) {
              listing.condition = conditions[condIndex];
            }
          }
        }
      }
      
      // Location
      if (!listing.location) {
        const location = await askQuestion(rl, 'Location (or leave empty): ');
        if (location.trim()) {
          listing.location = location.trim();
        }
      } else {
        console.log(`Current location: ${listing.location}`);
        const changeLocation = await askQuestion(rl, 'Change location? (y/n): ');
        if (changeLocation.toLowerCase() === 'y') {
          const location = await askQuestion(rl, 'New location: ');
          if (location.trim()) {
            listing.location = location.trim();
          }
        }
      }
      
      // Size
      if (!listing.size) {
        const size = await askQuestion(rl, 'Size (or leave empty): ');
        if (size.trim()) {
          listing.size = size.trim();
        }
      } else {
        console.log(`Current size: ${listing.size}`);
        const changeSize = await askQuestion(rl, 'Change size? (y/n): ');
        if (changeSize.toLowerCase() === 'y') {
          const size = await askQuestion(rl, 'New size: ');
          if (size.trim()) {
            listing.size = size.trim();
          }
        }
      }
      
      // Skip to next?
      const skipToNext = await askQuestion(rl, 'Continue to next listing? (y/n): ');
      if (skipToNext.toLowerCase() !== 'y') {
        console.log('Saving progress and exiting...');
        break;
      }
    }
    
    // Close readline interface
    rl.close();
    
    // Extract the variable name from the file
    const varNameMatch = fileContent.match(/export const (\w+)Listings: Listing\[\]/);
    if (!varNameMatch || !varNameMatch[1]) {
      console.error('Error: Could not extract variable name from the file.');
      process.exit(1);
    }
    const varName = varNameMatch[1];
    
    // Write the updated listings back to the file
    const updatedContent = fileContent.replace(
      /export const \w+Listings: Listing\[\] = \[[\s\S]*\];/,
      `export const ${varName}Listings: Listing[] = ${JSON.stringify(listings, null, 2)};`
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`\nSuccessfully updated listings in ${filePath}`);
    
  } catch (error) {
    console.error('Error enriching listings:', error);
    process.exit(1);
  }
}

// Helper function to ask a question and get a response
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the script
enrichListings().catch(console.error); 