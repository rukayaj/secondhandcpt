import fs from 'fs';
import path from 'path';
import { Listing } from '../utils/sampleData.public';

/**
 * Process a WhatsApp chat export and write potential listings to a file
 * This approach focuses on capturing all messages that might be listings
 * rather than trying to parse them perfectly with regex
 * 
 * @param inputFilePath Path to the WhatsApp chat export file
 * @param outputFilePath Path to save the processed listings
 * @param groupName Name of the WhatsApp group
 * @param options Optional configuration
 */
export async function processWhatsAppChat(
  inputFilePath: string,
  outputFilePath: string,
  groupName: string,
  options: {
    minMessageLength?: number;
    excludeShortReplies?: boolean;
    redactPhoneNumbers?: boolean;
  } = {}
): Promise<void> {
  const {
    minMessageLength = 20,
    excludeShortReplies = true,
    redactPhoneNumbers = true
  } = options;

  try {
    // Read the chat content
    const chatContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    
    // Save the original content with phone numbers redacted
    if (redactPhoneNumbers) {
      const redactedContent = redactPhoneNumbers ? 
        chatContent.replace(/\+\d{2}\s\d{2,3}\s\d{3}\s\d{4}/g, '[PHONE_REDACTED]') : 
        chatContent;
      
      const originalOutputPath = inputFilePath.replace('.txt', '.redacted.txt');
      await fs.promises.writeFile(originalOutputPath, redactedContent);
      console.log(`Original chat content (redacted) saved to: ${originalOutputPath}`);
    }
    
    // Process the chat content
    const lines = chatContent.split('\n');
    const listings: Partial<Listing>[] = [];
    
    // Regular expressions for basic parsing
    const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\] ([^:]+): (.*)$/;
    const imageRegex = /IMG-\d{8}-WA\d{4}\.jpg/g;
    const shortReplyRegex = /^(yes|no|ok|okay|thanks|thank you|great|cool|nice|sure|maybe|dm|pm|message|chat|call|text|interested|available|sold|pending|reserved|hi|hello|hey|thx|ty|👍|👋|🙏|😊)[\s\.,!]*$/i;
    
    let currentMessage: {
      date: Date;
      sender: string;
      text: string[];
      images: string[];
    } | null = null;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const match = line.match(messageRegex);
      
      if (match) {
        // If we have a current message, save it before starting a new one
        if (currentMessage) {
          const fullText = currentMessage.text.join('\n').trim();
          
          // Skip short replies if configured to do so
          if (excludeShortReplies && 
              (shortReplyRegex.test(fullText) || fullText.length < minMessageLength)) {
            // Skip this message
          } else {
            // Create a listing object
            const listing: Partial<Listing> = {
              id: `${groupName}-${listings.length + 1}`,
              date: currentMessage.date.toISOString(),
              sender: redactPhoneNumbers ? 
                currentMessage.sender.replace(/\+\d{2}\s\d{2,3}\s\d{3}\s\d{4}/g, '[PHONE_REDACTED]') : 
                currentMessage.sender,
              text: fullText,
              images: currentMessage.images.length > 0 ? [...currentMessage.images] : [],
              // We're not trying to parse these fields automatically anymore
              price: null,
              condition: null,
              size: null,
              location: null,
              category: null,
              isISO: fullText.toLowerCase().includes('iso') || 
                     fullText.toLowerCase().includes('in search of') || 
                     fullText.toLowerCase().includes('looking for')
            };
            
            listings.push(listing);
          }
        }
        
        // Extract date, time, sender, and message
        const [_, dateStr, timeStr, sender, message] = match;
        
        // Parse date
        const dateParts = dateStr.split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JS Date
        const year = parseInt(dateParts[2], 10) < 100 
          ? 2000 + parseInt(dateParts[2], 10) 
          : parseInt(dateParts[2], 10);
        
        // Parse time
        const timeParts = timeStr.split(':');
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        const second = parseInt(timeParts[2], 10);
        
        const date = new Date(year, month, day, hour, minute, second);
        
        // Start a new message
        currentMessage = {
          date,
          sender: sender.trim(),
          text: [message.trim()],
          images: []
        };
        
        // Extract images from the message
        const imageMatches = message.match(imageRegex);
        if (imageMatches) {
          currentMessage.images.push(...imageMatches);
        }
      } else if (currentMessage) {
        // This is a continuation of the current message
        currentMessage.text.push(line);
        
        // Extract images from the line
        const imageMatches = line.match(imageRegex);
        if (imageMatches) {
          currentMessage.images.push(...imageMatches);
        }
      }
    }
    
    // Don't forget to process the last message
    if (currentMessage) {
      const fullText = currentMessage.text.join('\n').trim();
      
      if (!(excludeShortReplies && 
          (shortReplyRegex.test(fullText) || fullText.length < minMessageLength))) {
        const listing: Partial<Listing> = {
          id: `${groupName}-${listings.length + 1}`,
          date: currentMessage.date.toISOString(),
          sender: redactPhoneNumbers ? 
            currentMessage.sender.replace(/\+\d{2}\s\d{2,3}\s\d{3}\s\d{4}/g, '[PHONE_REDACTED]') : 
            currentMessage.sender,
          text: fullText,
          images: currentMessage.images.length > 0 ? [...currentMessage.images] : [],
          price: null,
          condition: null,
          size: null,
          location: null,
          category: null,
          isISO: fullText.toLowerCase().includes('iso') || 
                 fullText.toLowerCase().includes('in search of') || 
                 fullText.toLowerCase().includes('looking for')
        };
        
        listings.push(listing);
      }
    }
    
    // Write the listings to the output file
    const outputContent = `// Generated from WhatsApp chat export: ${path.basename(inputFilePath)}
// Group: ${groupName}
// Generated on: ${new Date().toISOString()}
// This file contains raw messages that might be listings
// You'll need to manually review and edit this file

import { Listing } from '../utils/sampleData.public';

export const ${groupName.replace(/[^a-zA-Z0-9]/g, '_')}Listings: Listing[] = ${JSON.stringify(listings, null, 2)};
`;
    
    await fs.promises.writeFile(outputFilePath, outputContent);
    console.log(`Processed ${listings.length} potential listings from WhatsApp chat`);
    console.log(`Output saved to: ${outputFilePath}`);
    
    return;
  } catch (error) {
    console.error('Error processing WhatsApp chat:', error);
    throw error;
  }
}

export default processWhatsAppChat; 