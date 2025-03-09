#!/usr/bin/env node

/**
 * Duplicate Finder Script
 * 
 * This script helps identify and remove duplicate listings:
 * 1. Finds potential duplicate listings based on various criteria
 * 2. Allows reviewing and removing duplicates
 * 3. Finds duplicate images
 * 
 * Usage:
 * node scripts/duplicate-finder.js [options]
 * 
 * Options:
 *   --help, -h          Show help
 *   --verbose, -v       Show detailed output
 *   --images            Find duplicate images instead of listings
 *   --remove            Remove identified duplicates (use with caution)
 *   --threshold=<n>     Similarity threshold (0-1, default: 0.7)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const crypto = require('crypto');
const { getAllListings, deleteListing } = require('../src/utils/dbUtils');
const { WHATSAPP_GROUPS } = require('../src/utils/imageHandler');

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--images', 'Find duplicate images instead of listings')
  .option('--remove', 'Remove identified duplicates (use with caution)')
  .option('--threshold <n>', 'Similarity threshold (0-1)', parseFloat, 0.7)
  .parse(process.argv);

const options = program.opts();

/**
 * Main function to run the duplicate finder
 */
async function findDuplicates() {
  try {
    if (options.images) {
      console.log('Finding duplicate images...');
      await findDuplicateImages();
    } else {
      console.log('Finding duplicate listings...');
      await findDuplicateListings();
    }
  } catch (error) {
    console.error('Error in duplicate finder:', error);
    process.exit(1);
  }
}

/**
 * Find duplicate listings based on various criteria
 */
async function findDuplicateListings() {
  // Get all listings from the database
  console.log('Fetching all listings from the database...');
  const listings = await getAllListings({ limit: 10000 });
  console.log(`Found ${listings.length} total listings`);
  
  // Find potential duplicates
  console.log('\nAnalyzing listings for duplicates...');
  const duplicates = [];
  
  for (let i = 0; i < listings.length; i++) {
    const listing1 = listings[i];
    
    for (let j = i + 1; j < listings.length; j++) {
      const listing2 = listings[j];
      
      // Skip if from different WhatsApp groups
      if (listing1.whatsappGroup !== listing2.whatsappGroup) {
        continue;
      }
      
      // Calculate similarity score
      const similarity = calculateSimilarity(listing1, listing2);
      
      // If similarity is above threshold, consider it a potential duplicate
      if (similarity >= options.threshold) {
        duplicates.push({
          listing1,
          listing2,
          similarity,
          reason: getSimilarityReason(listing1, listing2)
        });
      }
    }
    
    // Show progress every 100 listings
    if (options.verbose && i % 100 === 0) {
      console.log(`Processed ${i} of ${listings.length} listings...`);
    }
  }
  
  // Sort duplicates by similarity score (highest first)
  duplicates.sort((a, b) => b.similarity - a.similarity);
  
  // Output results
  console.log(`\nFound ${duplicates.length} potential duplicate pairs`);
  
  if (duplicates.length > 0) {
    // Save detailed results to a file
    const outputFile = path.join(process.cwd(), 'duplicate-listings.json');
    fs.writeFileSync(outputFile, JSON.stringify(duplicates, null, 2));
    console.log(`Detailed results saved to ${outputFile}`);
    
    // Display top duplicates
    console.log('\nTop potential duplicates:');
    const topDuplicates = duplicates.slice(0, 10);
    
    for (let i = 0; i < topDuplicates.length; i++) {
      const { listing1, listing2, similarity, reason } = topDuplicates[i];
      
      console.log(`\n${i + 1}. Similarity: ${similarity.toFixed(2)} - ${reason}`);
      console.log(`   A: ${listing1.date} - ${listing1.text.substring(0, 100)}...`);
      console.log(`   B: ${listing2.date} - ${listing2.text.substring(0, 100)}...`);
    }
    
    // Remove duplicates if requested
    if (options.remove) {
      console.log('\nRemoving duplicates...');
      await removeDuplicates(duplicates);
    } else {
      console.log('\nTo remove duplicates, run with the --remove option');
      console.log('Review the duplicate-listings.json file before removing');
    }
  }
}

/**
 * Find duplicate images across listings
 */
async function findDuplicateImages() {
  // Get all listings with images
  console.log('Fetching listings with images...');
  const listings = await getAllListings({ limit: 10000 });
  const listingsWithImages = listings.filter(listing => listing.images && listing.images.length > 0);
  console.log(`Found ${listingsWithImages.length} listings with images`);
  
  // Create a map of image hashes
  console.log('\nCalculating image hashes...');
  const imageHashes = {};
  const duplicateImages = [];
  
  for (const group of WHATSAPP_GROUPS) {
    const imagesDir = path.join(process.cwd(), 'public/images', group.publicDir);
    
    // Skip if directory doesn't exist
    if (!fs.existsSync(imagesDir)) {
      console.warn(`Image directory not found: ${imagesDir}`);
      continue;
    }
    
    // Process each listing with images
    for (const listing of listingsWithImages) {
      if (listing.whatsappGroup !== group.name) continue;
      
      for (const imageName of listing.images) {
        const imagePath = path.join(imagesDir, imageName);
        
        // Skip if image doesn't exist
        if (!fs.existsSync(imagePath)) {
          if (options.verbose) {
            console.warn(`Image not found: ${imagePath}`);
          }
          continue;
        }
        
        try {
          // Calculate hash of the image
          const imageData = fs.readFileSync(imagePath);
          const hash = crypto.createHash('md5').update(imageData).digest('hex');
          
          // Check if this hash already exists
          if (imageHashes[hash]) {
            duplicateImages.push({
              hash,
              original: {
                listing: imageHashes[hash].listing,
                imageName: imageHashes[hash].imageName,
                imagePath: imageHashes[hash].imagePath
              },
              duplicate: {
                listing,
                imageName,
                imagePath
              }
            });
            
            if (options.verbose) {
              console.log(`Found duplicate: ${imageName} (${hash})`);
            }
          } else {
            // Store the hash
            imageHashes[hash] = {
              listing,
              imageName,
              imagePath
            };
          }
        } catch (error) {
          console.error(`Error processing image ${imagePath}:`, error.message);
        }
      }
    }
  }
  
  // Output results
  console.log(`\nFound ${duplicateImages.length} duplicate images`);
  
  if (duplicateImages.length > 0) {
    // Save detailed results to a file
    const outputFile = path.join(process.cwd(), 'duplicate-images.json');
    fs.writeFileSync(outputFile, JSON.stringify(duplicateImages, null, 2));
    console.log(`Detailed results saved to ${outputFile}`);
    
    // Display some examples
    console.log('\nExample duplicate images:');
    const examples = duplicateImages.slice(0, 5);
    
    for (let i = 0; i < examples.length; i++) {
      const { hash, original, duplicate } = examples[i];
      
      console.log(`\n${i + 1}. Hash: ${hash}`);
      console.log(`   Original: ${original.imageName} in listing ${original.listing.id}`);
      console.log(`   Duplicate: ${duplicate.imageName} in listing ${duplicate.listing.id}`);
    }
  }
}

/**
 * Remove duplicate listings
 * 
 * @param {Array} duplicates - Array of duplicate pairs
 */
async function removeDuplicates(duplicates) {
  // Only remove listings that are very likely duplicates
  const highConfidenceDuplicates = duplicates.filter(d => d.similarity > 0.9);
  console.log(`Found ${highConfidenceDuplicates.length} high-confidence duplicates to remove`);
  
  if (highConfidenceDuplicates.length === 0) {
    console.log('No high-confidence duplicates found');
    return;
  }
  
  // Keep track of listings that have been removed
  const removedIds = new Set();
  
  for (const { listing1, listing2 } of highConfidenceDuplicates) {
    // Skip if either listing has already been removed
    if (removedIds.has(listing1.id) || removedIds.has(listing2.id)) {
      continue;
    }
    
    // Decide which listing to keep (prefer the one with more information)
    const [keep, remove] = decideDuplicateToRemove(listing1, listing2);
    
    try {
      // Remove the duplicate
      await deleteListing(remove.id);
      removedIds.add(remove.id);
      
      console.log(`Removed duplicate: ${remove.id} (kept ${keep.id})`);
    } catch (error) {
      console.error(`Error removing duplicate ${remove.id}:`, error.message);
    }
  }
  
  console.log(`\nRemoved ${removedIds.size} duplicate listings`);
}

/**
 * Calculate similarity between two listings
 * 
 * @param {Object} listing1 - First listing
 * @param {Object} listing2 - Second listing
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(listing1, listing2) {
  let score = 0;
  
  // Check for shared images
  if (listing1.images.length > 0 && listing2.images.length > 0) {
    const sharedImages = listing1.images.filter(img => listing2.images.includes(img));
    if (sharedImages.length > 0) {
      score += 0.5; // Strong indicator of duplicate
    }
  }
  
  // Check for similar text (Jaccard similarity)
  const words1 = new Set(listing1.text.toLowerCase().split(/\s+/));
  const words2 = new Set(listing2.text.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  const textSimilarity = intersection.size / union.size;
  score += textSimilarity * 0.3;
  
  // Check for same price
  if (listing1.price && listing2.price && Math.abs(listing1.price - listing2.price) < 1) {
    score += 0.1;
  }
  
  // Check for same condition
  if (listing1.condition && listing2.condition && listing1.condition === listing2.condition) {
    score += 0.05;
  }
  
  // Check for same collection areas
  if (listing1.collectionAreas.length > 0 && listing2.collectionAreas.length > 0) {
    const sharedAreas = listing1.collectionAreas.filter(area => 
      listing2.collectionAreas.includes(area)
    );
    
    if (sharedAreas.length > 0) {
      score += 0.05;
    }
  }
  
  return Math.min(score, 1); // Cap at 1
}

/**
 * Get the reason for similarity between two listings
 * 
 * @param {Object} listing1 - First listing
 * @param {Object} listing2 - Second listing
 * @returns {string} - Reason for similarity
 */
function getSimilarityReason(listing1, listing2) {
  const reasons = [];
  
  // Check for shared images
  if (listing1.images.length > 0 && listing2.images.length > 0) {
    const sharedImages = listing1.images.filter(img => listing2.images.includes(img));
    if (sharedImages.length > 0) {
      reasons.push(`Shared images: ${sharedImages.length}`);
    }
  }
  
  // Check for similar text
  const words1 = new Set(listing1.text.toLowerCase().split(/\s+/));
  const words2 = new Set(listing2.text.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const textSimilarity = intersection.size / Math.min(words1.size, words2.size);
  
  if (textSimilarity > 0.5) {
    reasons.push(`Similar text: ${(textSimilarity * 100).toFixed(0)}%`);
  }
  
  // Check for same price
  if (listing1.price && listing2.price) {
    const priceDiff = Math.abs(listing1.price - listing2.price);
    if (priceDiff < 1) {
      reasons.push('Same price');
    } else if (priceDiff < listing1.price * 0.1) {
      reasons.push('Similar price');
    }
  }
  
  // Check for same condition
  if (listing1.condition && listing2.condition && listing1.condition === listing2.condition) {
    reasons.push('Same condition');
  }
  
  return reasons.join(', ') || 'Unknown';
}

/**
 * Decide which duplicate listing to remove
 * 
 * @param {Object} listing1 - First listing
 * @param {Object} listing2 - Second listing
 * @returns {Array} - [keep, remove] pair
 */
function decideDuplicateToRemove(listing1, listing2) {
  // Calculate information score for each listing
  const score1 = calculateInformationScore(listing1);
  const score2 = calculateInformationScore(listing2);
  
  // Keep the listing with more information
  return score1 >= score2 ? [listing1, listing2] : [listing2, listing1];
}

/**
 * Calculate information score for a listing
 * 
 * @param {Object} listing - The listing to score
 * @returns {number} - Information score
 */
function calculateInformationScore(listing) {
  let score = 0;
  
  // More images is better
  score += listing.images.length * 2;
  
  // Having a price is good
  if (listing.price) score += 1;
  
  // Having a condition is good
  if (listing.condition) score += 1;
  
  // Having collection areas is good
  score += listing.collectionAreas.length;
  
  // Longer text might have more information
  score += Math.min(listing.text.length / 100, 3);
  
  return score;
}

// Run the duplicate finder
findDuplicates(); 