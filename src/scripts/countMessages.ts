import fs from 'fs';

/**
 * Count the number of messages in a WhatsApp chat export
 * @param filePath Path to the WhatsApp chat export file
 */
async function countMessages(filePath: string): Promise<void> {
  try {
    // Read the chat content
    const chatContent = await fs.promises.readFile(filePath, 'utf-8');
    
    // Split the content by lines
    const lines = chatContent.split('\n');
    
    // Count the number of lines that match the date pattern
    let messageCount = 0;
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{1,2}/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (datePattern.test(line)) {
        messageCount++;
        
        // Print the first 5 matches for debugging
        if (messageCount <= 5) {
          console.log(`Match ${messageCount}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
        }
      }
    }
    
    console.log(`Total messages: ${messageCount}`);
    
    return;
  } catch (error) {
    console.error('Error counting messages:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node countMessages.ts <filePath>');
    process.exit(1);
  }
  
  const [filePath] = args;
  countMessages(filePath)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default countMessages; 