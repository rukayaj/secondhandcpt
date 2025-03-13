import axios from 'axios';
import { jest } from '@jest/globals';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the supabase client
const mockSupabaseDelete = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockGetAdminClient = jest.fn(() => ({
  from: () => ({
    select: mockSupabaseSelect,
    delete: mockSupabaseDelete
  })
}));

// Mock console to capture logs
const originalConsoleLog = global.console.log;
let consoleOutput: string[] = [];

// Mock the modules
jest.mock('../../utils/dbUtils', () => ({
  getAdminClient: mockGetAdminClient,
  TABLES: {
    LISTINGS: 'listings'
  }
}));

// Import the functions to test
const {
  deleteExpiredListings,
  findOldestMessageTimestamp
} = require('../../scripts/import/waha-gemini-import');

describe('WhatsApp Message Date Handling', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up console mock to capture output
    consoleOutput = [];
    global.console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
  });

  afterEach(() => {
    // Restore console function
    global.console.log = originalConsoleLog;
  });

  describe('Future date handling', () => {
    it('should correctly handle future dates in messages', async () => {
      const FUTURE_TIMESTAMP = Math.floor(new Date('2025-03-12T19:18:15.000Z').getTime() / 1000);
      
      // Mock axios to return a future-dated message
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'msg1',
            timestamp: FUTURE_TIMESTAMP
          }
        ]
      });

      const result = await findOldestMessageTimestamp('group-chat-id');
      
      // Assert
      expect(result).toBe(FUTURE_TIMESTAMP);
      
      // Verify it logs the correct date string
      const expectedLogDate = new Date(FUTURE_TIMESTAMP * 1000).toISOString();
      expect(consoleOutput).toContain(`Oldest message found from ${expectedLogDate}`);
    });

    it('should correctly identify listings that are older than future-dated messages', async () => {
      const FUTURE_TIMESTAMP = Math.floor(new Date('2025-03-12T19:18:15.000Z').getTime() / 1000);
      const SLIGHTLY_OLDER_DATE = '2025-03-12T19:09:19.000Z';
      
      // Set up mock listings that have slightly older dates than our future reference
      const expiredListings = [
        { 
          id: 'listing1', 
          title: 'Baby Mack Fleece Onesie',
          date: SLIGHTLY_OLDER_DATE,
          images: [] 
        }
      ];
      
      mockSupabaseSelect.mockResolvedValueOnce({ data: expiredListings, error: null });
      mockSupabaseDelete.mockResolvedValueOnce({ error: null });
      
      // Call the function with our future timestamp
      const result = await deleteExpiredListings('Test Group', FUTURE_TIMESTAMP);
      
      // Assert that the listing was correctly identified as expired
      expect(result.deleted).toBe(1);
      
      // Verify the database query used the correct ISO date format
      const expectedIsoDate = new Date(FUTURE_TIMESTAMP * 1000).toISOString();
      expect(consoleOutput).toContain(`Deleting listings older than ${expectedIsoDate} for group "Test Group"...`);
    });

    it('should correctly compare current date with future dates', () => {
      // This test verifies the JavaScript Date comparison behavior
      const now = new Date();
      const futureDate = new Date('2025-03-12T19:18:15.000Z');
      
      // Assert that a future date is indeed greater than now
      expect(futureDate.getTime()).toBeGreaterThan(now.getTime());
      
      // Ensure that date comparisons work as expected
      const olderFutureDate = new Date('2025-03-12T19:09:19.000Z');
      expect(olderFutureDate.getTime()).toBeLessThan(futureDate.getTime());
      
      // Convert to Unix timestamps (seconds) and verify comparison still works
      const futureTimestamp = Math.floor(futureDate.getTime() / 1000);
      const olderFutureTimestamp = Math.floor(olderFutureDate.getTime() / 1000);
      expect(olderFutureTimestamp).toBeLessThan(futureTimestamp);
    });
  });

  describe('Unix timestamp conversion', () => {
    it('should correctly convert between Unix timestamps and ISO strings', () => {
      // Test timestamp from a specific date
      const originalDate = new Date('2023-05-15T10:30:00.000Z');
      const unixTimestamp = Math.floor(originalDate.getTime() / 1000);
      const convertedDate = new Date(unixTimestamp * 1000);
      
      // Assert the conversion back and forth maintains the same date
      // (within 1 second precision since Unix timestamps lose milliseconds)
      expect(convertedDate.toISOString().substring(0, 19))
        .toBe(originalDate.toISOString().substring(0, 19));
    });

    it('should handle timezone considerations', () => {
      // Create a date with a specific timezone offset
      const dateString = '2023-05-15T10:30:00+02:00'; // CEST timezone
      const originalDate = new Date(dateString);
      
      // Convert to Unix timestamp and back
      const unixTimestamp = Math.floor(originalDate.getTime() / 1000);
      const convertedDate = new Date(unixTimestamp * 1000);
      
      // The resulting date should be in UTC
      expect(convertedDate.toISOString()).not.toContain('+02:00');
      
      // But when formatted to the original timezone, they should represent the same moment
      const originalMoment = originalDate.getTime();
      const convertedMoment = convertedDate.getTime();
      expect(originalMoment).toBe(convertedMoment);
    });
  });

  describe('Real-world examples from logs', () => {
    // Test with actual timestamps from the output logs
    const realExamples = [
      { 
        description: 'Baby Mack Fleece Onesie', 
        timestamp: '2025-03-12T19:09:19+00:00',
        referenceTimestamp: '2025-03-12T19:18:15.000Z'
      },
      { 
        description: 'Adidas blue tracksuit', 
        timestamp: '2025-03-12T19:13:19+00:00',
        referenceTimestamp: '2025-03-12T19:18:15.000Z'
      }
    ];

    it.each(realExamples)('should correctly identify $description as expired', ({ timestamp, referenceTimestamp }) => {
      // Convert the timestamps to dates and Unix timestamps
      const itemDate = new Date(timestamp);
      const referenceDate = new Date(referenceTimestamp);
      
      const itemUnix = Math.floor(itemDate.getTime() / 1000);
      const referenceUnix = Math.floor(referenceDate.getTime() / 1000);
      
      // Assert that the item's date is indeed older
      expect(itemDate.getTime()).toBeLessThan(referenceDate.getTime());
      expect(itemUnix).toBeLessThan(referenceUnix);
      
      // Verify the ISO string comparison
      expect(itemDate.toISOString()).toBeLessThan(referenceDate.toISOString());
    });
  });
}); 