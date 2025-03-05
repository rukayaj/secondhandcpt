import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

/**
 * Run a command and return its output
 * @param command The command to run
 * @param args The arguments to pass to the command
 * @returns A promise that resolves with the command output
 */
function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['inherit', 'pipe', 'pipe'] });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Import a WhatsApp group chat export
 * @param groupName The name of the WhatsApp group
 * @param inputFilePath The path to the WhatsApp chat export file
 */
async function importWhatsAppGroup(
  groupName: string,
  inputFilePath: string
): Promise<void> {
  try {
    console.log(`Starting import process for group: ${groupName}`);
    
    // Ensure the data directory exists
    const dataDir = path.resolve(process.cwd(), 'src', 'data', 'whatsapp-exports');
    try {
      await access(dataDir);
    } catch (error) {
      console.log(`Creating directory: ${dataDir}`);
      await mkdir(dataDir, { recursive: true });
    }
    
    // Define file paths
    const rawFilePath = path.resolve(dataDir, `${groupName}-raw.ts`);
    const listingsFilePath = path.resolve(dataDir, `${groupName}-listings.ts`);
    const appFilePath = path.resolve(dataDir, `${groupName}-app.ts`);
    
    // Step 1: Extract raw messages
    console.log('\n--- Step 1: Extracting raw messages ---');
    await runCommand('npx', [
      'ts-node',
      'src/scripts/extractWhatsAppMessages.ts',
      inputFilePath,
      rawFilePath,
      groupName
    ]);
    
    // Step 2: Filter potential listings
    console.log('\n--- Step 2: Filtering potential listings ---');
    await runCommand('npx', [
      'ts-node',
      'src/scripts/filterListings.ts',
      rawFilePath,
      listingsFilePath
    ]);
    
    // Step 3: Convert filtered listings
    console.log('\n--- Step 3: Converting filtered listings ---');
    await runCommand('npx', [
      'ts-node',
      'src/scripts/convertListingsToAppFormat.ts',
      listingsFilePath,
      appFilePath
    ]);
    
    // Step 4: Integrate listings
    console.log('\n--- Step 4: Integrating listings ---');
    
    // Update the import in integrateNiftyThriftyListings.ts to use the correct file
    const integrationScriptPath = path.resolve(process.cwd(), 'src', 'scripts', 'integrateNiftyThriftyListings.ts');
    const integrationScriptContent = await fs.promises.readFile(integrationScriptPath, 'utf-8');
    
    const updatedImport = `import { niftyThrifty01YearsListings } from '../data/whatsapp-exports/${path.basename(appFilePath).replace('.ts', '')}';`;
    const updatedContent = integrationScriptContent.replace(
      /import \{ niftyThrifty01YearsListings \} from '\.\.\/data\/whatsapp-exports\/[^']+';/,
      updatedImport
    );
    
    await fs.promises.writeFile(integrationScriptPath, updatedContent);
    console.log(`Updated import in integration script to use: ${path.basename(appFilePath)}`);
    
    await runCommand('npx', [
      'ts-node',
      'src/scripts/integrateNiftyThriftyListings.ts'
    ]);
    
    console.log('\nImport process completed successfully!');
    console.log(`
Summary:
- Raw messages extracted to: ${rawFilePath}
- Potential listings filtered to: ${listingsFilePath}
- Listings converted to app format: ${appFilePath}
- Listings integrated into the application
    `);
    
    return;
  } catch (error) {
    console.error('Error importing WhatsApp group:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node importWhatsAppGroup.ts <groupName> <inputFilePath>');
    console.error('Example: ts-node importWhatsAppGroup.ts nifty-thrifty-0-1-years whatsapp-exports/nifty-thrifty-0-1-years.txt');
    process.exit(1);
  }
  
  const [groupName, inputFilePath] = args;
  importWhatsAppGroup(groupName, inputFilePath)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export default importWhatsAppGroup; 