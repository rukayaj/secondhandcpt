import fs from 'fs';
import path from 'path';

/**
 * Import a WhatsApp chat export and sanitize it by redacting phone numbers
 * @param inputFilePath Path to the WhatsApp chat export file
 * @param outputFilePath Path to save the sanitized chat export
 * @param groupName Name of the WhatsApp group
 */
function importAndSanitizeWhatsAppChat(
  inputFilePath: string,
  outputFilePath: string,
  groupName: string
) {
  try {
    // Read the input file
    const chatContent = fs.readFileSync(inputFilePath, 'utf8');
    
    // Save the original file with phone numbers (for private use)
    const originalOutputPath = outputFilePath.replace('.ts', '.original.ts');
    fs.writeFileSync(
      originalOutputPath,
      `// WhatsApp chat export from ${groupName}\n` +
      `// Original file with phone numbers - DO NOT COMMIT\n` +
      `export default \`\n${chatContent}\`;\n`
    );
    
    console.log(`Original chat export saved to ${originalOutputPath}`);
    
    // Sanitize the chat content by redacting phone numbers
    const sanitizedContent = chatContent.replace(/\+\d{2}\s\d{2,3}\s\d{3}\s\d{4}/g, '[PHONE NUMBER REDACTED]');
    
    // Save the sanitized file
    fs.writeFileSync(
      outputFilePath,
      `// WhatsApp chat export from ${groupName}\n` +
      `// Sanitized file with phone numbers redacted\n` +
      `export default \`\n${sanitizedContent}\`;\n`
    );
    
    console.log(`Sanitized chat export saved to ${outputFilePath}`);
    
    return {
      originalPath: originalOutputPath,
      sanitizedPath: outputFilePath
    };
  } catch (error) {
    console.error('Error importing WhatsApp chat:', error);
    throw error;
  }
}

// Example usage:
// importAndSanitizeWhatsAppChat(
//   'path/to/chat-export.txt',
//   'src/data/whatsapp-exports/group-name.ts',
//   'group-name'
// );

export default importAndSanitizeWhatsAppChat; 