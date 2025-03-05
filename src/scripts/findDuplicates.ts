import { sampleListings } from '../utils/sampleData';
import { findDuplicates } from '../utils/parser';

const { duplicates, uniqueListings } = findDuplicates(sampleListings);

console.log(`Found ${duplicates.length} sets of duplicates in ${sampleListings.length} total listings`);
console.log(`After removing duplicates: ${uniqueListings.length} unique listings\n`);

duplicates.forEach(({ original, duplicates }) => {
  console.log(`Original (ID: ${original.id}):`);
  console.log(`Sender: ${original.sender}`);
  console.log(`Text: ${original.text}`);
  console.log(`Date: ${original.date}`);
  console.log('\nDuplicates:');
  duplicates.forEach(dup => {
    console.log(`- ID ${dup.id} (${dup.date})`);
  });
  console.log('---\n');
}); 