/**
 * WhatsApp Group Chat Scroller
 * 
 * This script uses Puppeteer to automatically scroll through WhatsApp Web group chats
 * to ensure all messages are loaded before export.
 * 
 * Usage:
 * 1. Run: npm run scroll-whatsapp
 * 2. Scan the QR code when prompted
 * 3. The script will automatically scroll through each group
 * 4. After completion, manually export the chats
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SCROLL_COUNT = 200; // Adjust based on how far back you need to go
const SCROLL_DELAY = 500; // Delay between scrolls in ms
const NOTIFICATION_DELAY = 3000; // Delay for notification permissions dialog

async function scrollWhatsAppGroups() {
  console.log('Starting WhatsApp scroller...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Use non-headless mode so you can see what's happening
    defaultViewport: null, // Use default viewport of browser
    args: ['--start-maximized'] // Start with maximized window
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to WhatsApp Web
    console.log('Navigating to WhatsApp Web...');
    await page.goto('https://web.whatsapp.com/');
    
    // Handle notification permission dialog
    page.on('dialog', async dialog => {
      console.log(`Dialog appeared: ${dialog.message()}`);
      await dialog.dismiss();
    });
    
    // Wait for notification permission if it appears
    await page.waitForTimeout(NOTIFICATION_DELAY);
    
    console.log('\n📱 Please scan the QR code to log in...');
    console.log('Waiting for WhatsApp to load your chats (this may take a minute)...\n');
    
    // Wait for the chats to appear
    await page.waitForSelector('div[aria-label="Chat list"]', { timeout: 120000 });
    console.log('✅ Logged in successfully!\n');
    
    // Get chat list
    await page.waitForTimeout(2000); // Wait for chats to fully load
    
    // List of groups to scroll (from the screenshot)
    const groups = [
      'Nifty Thrifty Modern Cloth Nappies',
      'Nifty Thrifty 0-1 year (2)',
      'Nifty Thrifty Bumps & Boobs',
      'Nifty Thrifty 0-1 year (1)',
      'Nifty Thrifty 1-3 years',
      'Nifty Thrifty Kids (3-8 years) 2'
    ];
    
    for (const group of groups) {
      try {
        console.log(`📂 Processing: ${group}`);
        
        // Search for the group
        console.log(`   Searching for group chat...`);
        
        // Click the search icon
        await page.waitForSelector('button[aria-label="Search or start new chat"]');
        await page.click('button[aria-label="Search or start new chat"]');
        
        // Type the group name in the search box
        await page.waitForSelector('div[contenteditable="true"][data-tab="3"]');
        await page.type('div[contenteditable="true"][data-tab="3"]', group);
        
        // Wait for search results
        await page.waitForTimeout(2000);
        
        // Click on the group chat from search results
        const chatElements = await page.$$('span[title]');
        let groupFound = false;
        
        for (const element of chatElements) {
          const titleHandle = await element.getProperty('title');
          const title = await titleHandle.jsonValue();
          
          if (title === group) {
            console.log(`   Found group: ${group}`);
            await element.click();
            groupFound = true;
            break;
          }
        }
        
        if (!groupFound) {
          console.log(`   ⚠️ Couldn't find group: ${group}. Skipping...`);
          // Clear the search
          await page.click('button[aria-label="Back"]');
          await page.waitForTimeout(1000);
          continue;
        }
        
        // Wait for the chat to load
        await page.waitForTimeout(2000);
        
        // Scroll to load message history
        console.log(`   Starting to scroll (${SCROLL_COUNT} scrolls)...`);
        
        // Get the message container
        const messageContainer = await page.$('div[role="region"][tabindex="-1"]');
        if (!messageContainer) {
          console.log(`   ⚠️ Couldn't find message container for ${group}. Skipping...`);
          continue;
        }
        
        // Perform scrolling
        for (let i = 0; i < SCROLL_COUNT; i++) {
          await page.evaluate(() => {
            const container = document.querySelector('div[role="region"][tabindex="-1"]');
            if (container) {
              container.scrollTop = 0; // Scroll to top to load older messages
            }
          });
          
          // Progress indicator
          if (i % 20 === 0 || i === SCROLL_COUNT - 1) {
            console.log(`   📜 Scroll progress: ${Math.round((i + 1) / SCROLL_COUNT * 100)}%`);
          }
          
          await page.waitForTimeout(SCROLL_DELAY);
        }
        
        console.log(`   ✅ Finished scrolling through ${group}\n`);
        
      } catch (error) {
        console.error(`   ❌ Error processing ${group}:`, error.message);
      }
    }
    
    console.log('\n✅ All groups processed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Manually export each chat:');
    console.log('   - Open each group');
    console.log('   - Click ⋮ (three dots) > More > Export chat > WITHOUT MEDIA');
    console.log('2. Save each export to the appropriate directory:');
    console.log('   - src/data/nifty-thrifty-0-1-years/');
    console.log('   - src/data/nifty-thrifty-1-3-years/');
    console.log('   - etc.');
    console.log('3. Run: npm run update-website\n');
    
    console.log('Press Ctrl+C to close this script when you\'re done with the exports.');
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
  }
  
  // Keep the browser open for manual export
  // The user will need to close it manually or with Ctrl+C
}

// Create necessary data directories if they don't exist
function createDirectories() {
  const directories = [
    'src/data',
    'src/data/nifty-thrifty-0-1-years',
    'src/data/nifty-thrifty-1-3-years',
    'src/data/nifty-thrifty-modern-cloth-nappies',
    'src/data/nifty-thrifty-bumps-and-boobs',
    'src/data/nifty-thrifty-kids-3-8-years'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// Run the script
createDirectories();
scrollWhatsAppGroups().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 