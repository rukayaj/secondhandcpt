import { parseWhatsAppChat } from '../utils/whatsAppParser';

describe('WhatsApp Parser', () => {
  const GROUP_NAME = 'test-group';
  
  describe('Basic parsing', () => {
    test('should parse a simple listing correctly', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME);
      
      expect(listings).toHaveLength(1);
      expect(listings[0]).toMatchObject({
        id: `${GROUP_NAME}-1`,
        sender: '+27 82 123 4567',
        price: 800,
        location: 'Claremont',
        category: 'Furniture',
        condition: 'Like New',
        isISO: false
      });
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
    
    test('should parse a listing with images', () => {
      const chatContent = `
[12/05/23, 10:30:15] +27 84 567 8901: Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.
IMG-20230512-WA0001.jpg
IMG-20230512-WA0002.jpg
Located in Sea Point.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME);
      
      expect(listings).toHaveLength(1);
      expect(listings[0]).toMatchObject({
        images: ['IMG-20230512-WA0001.jpg', 'IMG-20230512-WA0002.jpg'],
        price: 50, // It takes the first price it finds
        location: 'Sea Point',
        category: 'Clothing',
        size: '0-3 months'
      });
      expect(listings[0].text).toBe('Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.\nIMG-20230512-WA0001.jpg\nIMG-20230512-WA0002.jpg\nLocated in Sea Point.');
    });
    
    test('should parse an ISO post', () => {
      const chatContent = `
[12/05/23, 11:45:22] +27 85 678 9012: ISO baby bouncer, preferably Fisher Price. Anyone selling?
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME);
      
      expect(listings).toHaveLength(1);
      expect(listings[0]).toMatchObject({
        isISO: true,
        price: null
      });
      expect(listings[0].text).toBe('ISO baby bouncer, preferably Fisher Price. Anyone selling?');
    });
  });
  
  describe('Filtering', () => {
    test('should filter out short replies', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: Is it still available?
[12/05/23, 09:17:20] +27 82 123 4567: Yes it is!
[12/05/23, 09:18:05] +27 83 456 7890: Great, I'll DM you.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, {
        minMessageLength: 30
      });
      
      expect(listings).toHaveLength(1);
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
    
    test('should filter out messages that are not listings', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: Welcome to the group everyone! Please remember to include prices and locations in your posts.
[12/05/23, 09:17:20] +27 82 123 4567: Thanks for the reminder!
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME);
      
      expect(listings).toHaveLength(1);
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
  });
  
  describe('Options', () => {
    test('should require price when specified', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: I have some baby toys available. Let me know if interested.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, { requirePrice: true });
      
      expect(listings).toHaveLength(1);
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
    
    test('should exclude ISO posts when specified', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 11:45:22] +27 85 678 9012: ISO baby bouncer, preferably Fisher Price. Anyone selling?
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, { excludeISO: true });
      
      expect(listings).toHaveLength(1);
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
    
    test('should filter by minimum message length', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: Baby toys R50.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, { minMessageLength: 30 });
      
      expect(listings).toHaveLength(1);
      expect(listings[0].text).toBe('Selling a baby cot in excellent condition. R800. Located in Claremont.');
    });
  });
  
  describe('Complex scenarios', () => {
    test('should handle a conversation with multiple listings and replies', () => {
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: Is it still available?
[12/05/23, 09:17:20] +27 82 123 4567: Yes it is!
[12/05/23, 09:18:05] +27 83 456 7890: Great, I'll DM you.

[12/05/23, 10:30:15] +27 84 567 8901: Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.
IMG-20230512-WA0001.jpg
IMG-20230512-WA0002.jpg
Located in Sea Point.

[12/05/23, 11:45:22] +27 85 678 9012: ISO baby bouncer, preferably Fisher Price. Anyone selling?

[12/05/23, 12:20:10] +27 86 789 0123: I have a baby bath for sale. Used only a few times. Like new condition. R150.
IMG-20230512-WA0003.jpg
Can deliver in Cape Town CBD area.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, {
        minMessageLength: 30
      });
      
      expect(listings).toHaveLength(4);
      expect(listings[0].price).toBe(800);
      expect(listings[1].price).toBe(50);
      expect(listings[2].isISO).toBe(true);
      expect(listings[3].price).toBe(150);
    });
    
    test('should handle a real-world WhatsApp export sample', () => {
      // This is a more realistic test with the actual sample data
      const chatContent = `
[12/05/23, 09:15:32] +27 82 123 4567: Hi everyone! I'm selling a baby cot in excellent condition. R800. Located in Claremont.
[12/05/23, 09:16:45] +27 83 456 7890: Is it still available?
[12/05/23, 09:17:20] +27 82 123 4567: Yes it is!
[12/05/23, 09:18:05] +27 83 456 7890: Great, I'll DM you.

[12/05/23, 10:30:15] +27 84 567 8901: Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.
IMG-20230512-WA0001.jpg
IMG-20230512-WA0002.jpg
Located in Sea Point.

[12/05/23, 11:45:22] +27 85 678 9012: ISO baby bouncer, preferably Fisher Price. Anyone selling?

[12/05/23, 12:20:10] +27 86 789 0123: I have a baby bath for sale. Used only a few times. Like new condition. R150.
IMG-20230512-WA0003.jpg
Can deliver in Cape Town CBD area.

[12/05/23, 14:05:33] +27 87 890 1234: Selling a Chicco stroller. R600. Good condition with minor wear.
IMG-20230512-WA0004.jpg
IMG-20230512-WA0005.jpg
Located in Rondebosch.

[12/05/23, 15:30:45] +27 88 901 2345: Brand new baby bottles, never used. Still in original packaging. R80 for set of 3.
IMG-20230512-WA0006.jpg
Pickup in Woodstock.

[12/05/23, 16:45:12] +27 89 012 3456: ISO baby monitor with video. Budget around R500.

[12/05/23, 17:20:30] +27 82 345 6789: Selling baby toys suitable for 0-12 months. All in excellent condition. R30 each or R150 for all.
IMG-20230512-WA0007.jpg
IMG-20230512-WA0008.jpg
Located in Claremont.

[12/05/23, 18:10:25] +27 83 567 8901: Baby carrier for sale. Ergobaby original. Used but in good condition. R350.
IMG-20230512-WA0009.jpg
Pickup in Observatory.

[12/05/23, 19:05:40] +27 84 678 9012: Selling newborn clothes, never worn. Some still with tags. R40 each or R300 for all 10 items.
IMG-20230512-WA0010.jpg
IMG-20230512-WA0011.jpg
Located in Green Point.
`;
      
      const listings = parseWhatsAppChat(chatContent, GROUP_NAME, {
        minMessageLength: 30
      });
      
      // We expect 10 listings: 8 sales + 2 ISO posts
      expect(listings).toHaveLength(10);
      
      // Check specific listings
      const cot = listings.find(l => l.text.includes('baby cot'));
      expect(cot).toBeDefined();
      expect(cot?.price).toBe(800);
      
      const clothes = listings.find(l => l.text.includes('baby clothes'));
      expect(clothes).toBeDefined();
      expect(clothes?.price).toBe(50);
      
      const isoMonitor = listings.find(l => l.text.includes('baby monitor'));
      expect(isoMonitor).toBeDefined();
      expect(isoMonitor?.isISO).toBe(true);
    });
  });
}); 