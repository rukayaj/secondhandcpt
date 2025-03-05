import fs from 'fs';
import path from 'path';

// Define the interface for a raw WhatsApp message
interface RawWhatsAppMessage {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  priceValue: number | null;
}

/**
 * Extract messages from a WhatsApp chat export
 * @param inputFilePath Path to the WhatsApp chat export file
 * @param outputFilePath Path to save the extracted messages
 * @param groupName Name of the WhatsApp group (used for ID generation)
 */
async function extractWhatsAppMessages(
  inputFilePath: string,
  outputFilePath: string,
  groupName: string
): Promise<void> {
  try {
    // Read the chat content
    const chatContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Check the first few lines to determine the format
    const firstLines = chatContent.split('\n').slice(0, 10).join('\n');
    const hasSquareBrackets = firstLines.includes('[');
    
    console.log(`File format has square brackets: ${hasSquareBrackets}`);
    
    // Regular expressions for extracting information
    const dateTimePattern = hasSquareBrackets
      ? /\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{1,2}:\d{1,2})\]/
      : /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{1,2}(?: [ap]m)?)/;
    
    const imageRegex = /IMG-\d{8}-WA\d{4}\.jpg/g;
    const mediaOmittedRegex = /<Media omitted>/i;
    const priceRegex = /R\s*(\d+)/i;
    const phoneNumberRegex = /\+\d{2}\s\d{2}\s\d{3}\s\d{4}/;
    
    // Split the content by lines
    const lines = chatContent.split('\n');
    const messages: RawWhatsAppMessage[] = [];
    
    let currentMessage: RawWhatsAppMessage | null = null;
    let messageLines: string[] = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const dateTimeMatch = line.match(dateTimePattern);
      
      if (dateTimeMatch) {
        // If we have a current message, save it before starting a new one
        if (currentMessage) {
          // Combine all message lines
          currentMessage.message = messageLines.join('\n').trim();
          
          // Extract images
          const imageMatches = currentMessage.message.match(imageRegex);
          if (imageMatches) {
            currentMessage.images = [...imageMatches];
          }
          
          // Check for media omitted
          if (mediaOmittedRegex.test(currentMessage.message)) {
            currentMessage.images = ['<Media omitted>'];
          }
          
          // Check for price
          const priceMatch = currentMessage.message.match(priceRegex);
          if (priceMatch && priceMatch[1]) {
            currentMessage.hasPrice = true;
            currentMessage.priceValue = parseInt(priceMatch[1], 10);
          }
          
          messages.push(currentMessage);
        }
        
        // Extract date and time
        const date = dateTimeMatch[1];
        const time = dateTimeMatch[2];
        
        // Extract sender and message
        let restOfLine = '';
        if (hasSquareBrackets) {
          restOfLine = line.substring(dateTimeMatch[0].length).trim();
          if (restOfLine.startsWith('] ')) {
            restOfLine = restOfLine.substring(2);
          }
        } else {
          restOfLine = line.substring(dateTimeMatch[0].length).trim();
          if (restOfLine.startsWith(' - ')) {
            restOfLine = restOfLine.substring(3);
          }
        }
        
        // Extract phone number and message
        let phoneNumber = '';
        let messageText = '';
        
        // Try to find a phone number
        const phoneNumberMatch = restOfLine.match(phoneNumberRegex);
        if (phoneNumberMatch) {
          phoneNumber = phoneNumberMatch[0];
          
          // Extract message text (after the colon if present)
          const colonIndex = restOfLine.indexOf(':');
          if (colonIndex > -1) {
            messageText = restOfLine.substring(colonIndex + 1).trim();
          } else {
            // If no colon, use everything after the phone number
            const phoneIndex = restOfLine.indexOf(phoneNumber);
            if (phoneIndex > -1) {
              messageText = restOfLine.substring(phoneIndex + phoneNumber.length).trim();
            }
          }
        } else {
          // No phone number found, split by colon
          const colonIndex = restOfLine.indexOf(':');
          if (colonIndex > -1) {
            phoneNumber = restOfLine.substring(0, colonIndex).trim();
            messageText = restOfLine.substring(colonIndex + 1).trim();
          } else {
            // No colon, use the whole line as the sender
            phoneNumber = restOfLine;
          }
        }
        
        // Create a new message object
        currentMessage = {
          id: `${groupName}-${messages.length + 1}`,
          date,
          time,
          phoneNumber,
          message: messageText,
          images: [],
          hasPrice: false,
          priceValue: null
        };
        
        messageLines = [messageText];
      } else if (currentMessage) {
        // This is a continuation of the current message
        messageLines.push(line);
      }
    }
    
    // Don't forget to process the last message
    if (currentMessage) {
      // Combine all message lines
      currentMessage.message = messageLines.join('\n').trim();
      
      // Extract images
      const imageMatches = currentMessage.message.match(imageRegex);
      if (imageMatches) {
        currentMessage.images = [...imageMatches];
      }
      
      // Check for media omitted
      if (mediaOmittedRegex.test(currentMessage.message)) {
        currentMessage.images = ['<Media omitted>'];
      }
      
      // Check for price
      const priceMatch = currentMessage.message.match(priceRegex);
      if (priceMatch && priceMatch[1]) {
        currentMessage.hasPrice = true;
        currentMessage.priceValue = parseInt(priceMatch[1], 10);
      }
      
      messages.push(currentMessage);
    }
    
    console.log(`Extracted ${messages.length} messages from WhatsApp chat`);
    
    // Write the messages to the output file
    const outputContent = `// Generated from WhatsApp chat export: ${path.basename(inputFilePath)}
// Group: ${groupName}
// Generated on: ${new Date().toISOString()}
// Total messages: ${messages.length}

export interface RawWhatsAppMessage {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  priceValue: number | null;
}

export const ${groupName.replace(/[^a-zA-Z0-9]/g, '_')}Messages: RawWhatsAppMessage[] = ${JSON.stringify(messages, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error extracting WhatsApp messages:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: ts-node extractWhatsAppMessages.ts <inputFilePath> <outputFilePath> <groupName>');
    process.exit(1);
  }
  
  const [inputFilePath, outputFilePath, groupName] = args;
  extractWhatsAppMessages(inputFilePath, outputFilePath, groupName)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default extractWhatsAppMessages; 