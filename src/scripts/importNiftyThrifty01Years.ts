import importAndSanitizeWhatsAppChat from './importWhatsAppChat';
import path from 'path';

// You'll need to update this path to point to your actual chat export file
const inputFilePath = path.resolve(process.cwd(), 'whatsapp-exports', 'nifty-thrifty-0-1-years.txt');
const outputFilePath = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports', 'nifty-thrifty-0-1-years.ts');
const groupName = 'nifty-thrifty-0-1-years';

// Run the import and sanitization
try {
  const result = importAndSanitizeWhatsAppChat(inputFilePath, outputFilePath, groupName);
  console.log('Import completed successfully!');
  console.log('Original file (with phone numbers):', result.originalPath);
  console.log('Sanitized file (for git):', result.sanitizedPath);
  
  console.log('\nIMPORTANT: Make sure to add the original file to .gitignore to prevent committing phone numbers!');
} catch (error) {
  console.error('Import failed:', error);
  process.exit(1);
} 