/**
 * Apply Categories to Listings
 * 
 * This script categorizes all existing listings without a category.
 * It assumes the category column already exists in the database.
 * 
 * Run this script after adding the category column with the SQL script:
 * scripts/add_category_column.sql
 */

require('dotenv').config({ path: '.env.local' });
const { getAdminClient, TABLES } = require('../src/utils/supabaseClient');
const { categorizeByKeywords } = require('../src/utils/categoryUtils');

async function applyCategories() {
  try {
    console.log('🏷️  Applying categories to uncategorized listings...');
    
    // Get Supabase client
    const supabase = getAdminClient();
    
    // Get all listings that don't have a category set
    console.log('\nGetting uncategorized listings...');
    
    const { data: listings, error: fetchError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, text, category')
      .or('category.is.null,category.eq.Other,category.eq.')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      if (fetchError.message.includes('category')) {
        console.error('❌ Category column doesn\'t exist in the database. Please run the SQL script first:');
        console.log('Run this SQL in the Supabase SQL Editor:');
        console.log('  ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT \'Other\';');
        console.log('  CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);');
        return;
      } else {
        console.error('❌ Error fetching listings:', fetchError.message);
        return;
      }
    }
    
    console.log(`Found ${listings?.length || 0} listings to categorize`);
    
    // Skip if no listings need categorization
    if (!listings || listings.length === 0) {
      console.log('✅ All listings are already categorized');
      return reportCategoryStats(supabase);
    }
    
    // Categorize listings in batches
    console.log('\nCategorizing listings...');
    
    const categoryStats = {};
    const batchSize = 20; // Smaller batch size for fewer errors
    let updatedCount = 0;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const updates = [];
      
      for (const listing of batch) {
        // Skip listings with no text
        if (!listing.text) {
          console.log(`Skipping listing ${listing.id} with no text`);
          continue;
        }
        
        const result = categorizeByKeywords(listing.text);
        const category = result.category || 'Other';
        
        // Skip if the category is already set correctly
        if (listing.category === category) {
          continue;
        }
        
        updates.push({
          id: listing.id,
          category
        });
        
        // Count for stats
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
      
      // Skip empty batches
      if (updates.length === 0) {
        continue;
      }
      
      // Update in batch
      const { error: updateError } = await supabase
        .from(TABLES.LISTINGS)
        .upsert(updates);
      
      if (updateError) {
        console.error(`❌ Error updating batch ${i/batchSize + 1}:`, updateError.message);
      } else {
        updatedCount += updates.length;
        console.log(`Updated ${updatedCount} listings with categories (batch ${i/batchSize + 1}/${Math.ceil(listings.length/batchSize)})`);
      }
    }
    
    console.log('✅ Completed categorizing listings');
    
    // Report category stats
    if (Object.keys(categoryStats).length > 0) {
      console.log('\nCategory Distribution for Updated Listings:');
      const totalUpdated = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
      for (const [category, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
        console.log(`${category}: ${count} listings (${Math.round(count / totalUpdated * 100)}%)`);
      }
    }
    
    // Report final stats
    await reportCategoryStats(supabase);
    
  } catch (error) {
    console.error('❌ Error categorizing listings:', error.message);
  }
}

async function reportCategoryStats(supabase) {
  console.log('\nFinal Category Statistics:');
  
  try {
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('category');
    
    if (error) {
      console.error('❌ Error fetching category stats:', error.message);
      return;
    }
    
    const stats = {};
    for (const item of data) {
      const cat = item.category || 'Uncategorized';
      stats[cat] = (stats[cat] || 0) + 1;
    }
    
    const total = data.length;
    
    for (const [category, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
      console.log(`${category}: ${count} listings (${Math.round(count / total * 100)}%)`);
    }
  } catch (error) {
    console.error('❌ Error reporting category stats:', error.message);
  }
}

// Run the script
applyCategories().catch(console.error); 