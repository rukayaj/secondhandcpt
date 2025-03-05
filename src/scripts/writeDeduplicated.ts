import { sampleListings } from '../utils/sampleData';
import { findDuplicates } from '../utils/parser';
import * as fs from 'fs';
import * as path from 'path';

const { uniqueListings } = findDuplicates(sampleListings);

const fileContent = `import { Listing } from './parser';

// Deduplicated version of sampleListings
export const sampleListings: Listing[] = ${JSON.stringify(uniqueListings, null, 2)};
`;

const outputPath = path.join(__dirname, '../utils/sampleData.new.ts');
fs.writeFileSync(outputPath, fileContent);
console.log(`Wrote ${uniqueListings.length} deduplicated listings to ${outputPath}`); 