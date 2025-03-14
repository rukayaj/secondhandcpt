const { listingExists } = require('../src/utils/dbUtils.js');

async function test() {
  console.log('Testing duplicate detection for H&M Road Playmat...');
  
  const listing = {
    title: 'H&M Road Playmat',
    text: 'H&M Road Playmat 130x90cm good condition but has a few spots. Happy to send a video so you can see them!',
    sender: '27761128700@c.us',
    whatsappGroup: 'Nifty Thrifty 1-3 years',
    date: new Date().toISOString()
  };
  
  const isDuplicate = await listingExists(listing, true);
  console.log('Would be detected as duplicate:', isDuplicate);
}

test()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err)); 