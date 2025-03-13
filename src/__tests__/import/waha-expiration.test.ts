import axios from 'axios';
import { jest } from '@jest/globals';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the supabase client
const mockSupabaseDelete = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseStorage = jest.fn();
const mockGetAdminClient = jest.fn(() => ({
  from: () => ({
    select: mockSupabaseSelect,
    delete: mockSupabaseDelete
  }),
  storage: {
    from: () => ({
      remove: mockSupabaseStorage
    })
  }
}));

// Mock console to capture logs
const originalConsoleLog = global.console.log;
const originalConsoleError = global.console.error;
const originalConsoleWarn = global.console.warn;
let consoleOutput: string[] = [];

// Mock the modules
jest.mock('../../utils/dbUtils', () => ({
  getAdminClient: mockGetAdminClient,
  TABLES: {
    LISTINGS: 'listings'
  }
}));

// Import the functions to test (after mocking dependencies)
// Using require instead of import to ensure mocks are applied first
const {
  findOldestMessageTimestamp,
  deleteExpiredListings,
  syncExpiredListings
} = require('../../scripts/import/waha-gemini-import');

describe('WhatsApp Message Expiration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up console mocks to capture output
    consoleOutput = [];
    global.console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    global.console.error = jest.fn((...args) => {
      consoleOutput.push('ERROR: ' + args.join(' '));
    });
    global.console.warn = jest.fn((...args) => {
      consoleOutput.push('WARNING: ' + args.join(' '));
    });
  });

  afterEach(() => {
    // Restore console functions
    global.console.log = originalConsoleLog;
    global.console.error = originalConsoleError;
    global.console.warn = originalConsoleWarn;
  });

  describe('findOldestMessageTimestamp', () => {
    it('should return the timestamp of the oldest message', async () => {
      // Mock axios to return a successful response with a message
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'msg1',
            timestamp: 1625097600 // July 1, 2021
          }
        ]
      });

      const result = await findOldestMessageTimestamp('group-chat-id');
      
      // Assert
      expect(result).toBe(1625097600);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/messages'),
        expect.objectContaining({
          params: expect.objectContaining({
            chatId: 'group-chat-id',
            limit: 1,
            sort: 'asc'
          })
        })
      );
      expect(consoleOutput).toContain('Finding oldest message for chat ID: group-chat-id...');
      expect(consoleOutput).toContain('Oldest message found from 2021-07-01T00:00:00.000Z');
    });

    it('should return null when no messages are found', async () => {
      // Mock axios to return an empty array
      mockedAxios.get.mockResolvedValueOnce({
        data: []
      });

      const result = await findOldestMessageTimestamp('group-chat-id');
      
      // Assert
      expect(result).toBeNull();
      expect(consoleOutput).toContain('No messages found for chat ID: group-chat-id');
    });

    it('should handle API errors gracefully', async () => {
      // Mock axios to throw an error
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      const result = await findOldestMessageTimestamp('group-chat-id');
      
      // Assert
      expect(result).toBeNull();
      expect(consoleOutput).toContain('ERROR: Error finding oldest message: API error');
    });
  });

  describe('deleteExpiredListings', () => {
    it('should delete listings older than the provided timestamp', async () => {
      // Set up mocks for the database calls
      const expiredListings = [
        { 
          id: 'listing1', 
          title: 'Expired Listing 1', 
          date: '2021-06-15T00:00:00Z',
          images: ['image1.jpg', 'image2.jpg'] 
        },
        { 
          id: 'listing2', 
          title: 'Expired Listing 2', 
          date: '2021-06-20T00:00:00Z',
          images: [] 
        }
      ];
      
      mockSupabaseSelect.mockResolvedValueOnce({ data: expiredListings, error: null });
      mockSupabaseDelete.mockResolvedValueOnce({ error: null });
      mockSupabaseStorage.mockResolvedValue({ error: null });

      // Call the function (July 1, 2021 timestamp)
      const result = await deleteExpiredListings('Test Group', 1625097600);
      
      // Assert
      expect(result.deleted).toBe(2);
      expect(result.imagesRemoved).toBe(2);
      expect(result.error).toBeNull();
      
      // Verify database calls
      expect(mockSupabaseSelect).toHaveBeenCalledWith('id, title, date, images');
      expect(mockSupabaseSelect).toHaveBeenCalledWith(
        expect.any(Function)
          .and(expect.objectContaining({
            eq: expect.any(Function),
            lt: expect.any(Function)
          }))
      );
      
      expect(mockSupabaseDelete).toHaveBeenCalledWith(
        expect.any(Function)
          .and(expect.objectContaining({
            eq: expect.any(Function),
            lt: expect.any(Function)
          }))
      );
      
      expect(mockSupabaseStorage).toHaveBeenCalledWith(['image1.jpg']);
      expect(mockSupabaseStorage).toHaveBeenCalledWith(['image2.jpg']);
      
      // Verify logs
      expect(consoleOutput).toContain('Found 2 expired listings to delete for group "Test Group"');
      expect(consoleOutput).toContain('Deleted 2 expired listings and 2 associated images for group "Test Group"');
    });

    it('should handle case when no expired listings are found', async () => {
      // Set up mocks for the database calls
      mockSupabaseSelect.mockResolvedValueOnce({ data: [], error: null });

      // Call the function
      const result = await deleteExpiredListings('Test Group', 1625097600);
      
      // Assert
      expect(result.deleted).toBe(0);
      expect(result.error).toBeNull();
      
      // Verify no delete calls were made
      expect(mockSupabaseDelete).not.toHaveBeenCalled();
      expect(mockSupabaseStorage).not.toHaveBeenCalled();
      
      // Verify logs
      expect(consoleOutput).toContain('No expired listings found for group "Test Group"');
    });

    it('should handle database errors when finding expired listings', async () => {
      // Set up mocks for the database calls
      mockSupabaseSelect.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error finding listings' } 
      });

      // Call the function
      const result = await deleteExpiredListings('Test Group', 1625097600);
      
      // Assert
      expect(result.deleted).toBe(0);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Database error finding listings');
      
      // Verify no delete calls were made
      expect(mockSupabaseDelete).not.toHaveBeenCalled();
      expect(mockSupabaseStorage).not.toHaveBeenCalled();
      
      // Verify logs
      expect(consoleOutput).toContain('ERROR: Error finding expired listings: Database error finding listings');
    });

    it('should handle database errors when deleting listings', async () => {
      // Set up mocks for the database calls
      const expiredListings = [
        { id: 'listing1', title: 'Expired Listing', date: '2021-06-15T00:00:00Z', images: [] }
      ];
      
      mockSupabaseSelect.mockResolvedValueOnce({ data: expiredListings, error: null });
      mockSupabaseDelete.mockResolvedValueOnce({ 
        error: { message: 'Database error deleting listings' } 
      });

      // Call the function
      const result = await deleteExpiredListings('Test Group', 1625097600);
      
      // Assert
      expect(result.deleted).toBe(0);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Database error deleting listings');
      
      // Verify logs
      expect(consoleOutput).toContain('ERROR: Error deleting expired listings: Database error deleting listings');
    });

    it('should handle errors when deleting images from storage', async () => {
      // Set up mocks for the database calls
      const expiredListings = [
        { 
          id: 'listing1', 
          title: 'Listing with Image', 
          date: '2021-06-15T00:00:00Z',
          images: ['problematic-image.jpg'] 
        }
      ];
      
      mockSupabaseSelect.mockResolvedValueOnce({ data: expiredListings, error: null });
      mockSupabaseStorage.mockResolvedValueOnce({ 
        error: { message: 'Storage error' } 
      });
      mockSupabaseDelete.mockResolvedValueOnce({ error: null });

      // Call the function
      const result = await deleteExpiredListings('Test Group', 1625097600);
      
      // Assert
      expect(result.deleted).toBe(1); // Listing deletion succeeds
      expect(result.imagesRemoved).toBe(0); // Image removal failed
      
      // Verify logs
      expect(consoleOutput).toContain('WARNING: Warning: Failed to delete image problematic-image.jpg: Storage error');
    });
  });

  describe('syncExpiredListings', () => {
    const WHATSAPP_GROUPS = [
      { name: 'Group 1', chatId: 'group1-id' },
      { name: 'Group 2', chatId: 'group2-id' },
      { name: 'Group 3', chatId: null } // Group with no chatId
    ];

    beforeEach(() => {
      // Set up the WhatsApp groups for testing
      global.WHATSAPP_GROUPS = WHATSAPP_GROUPS;
    });

    it('should sync expired listings for all groups with chat IDs', async () => {
      // Mock the findOldestMessageTimestamp function
      mockedAxios.get
        .mockResolvedValueOnce({ data: [{ timestamp: 1625097600 }] }) // Group 1
        .mockResolvedValueOnce({ data: [{ timestamp: 1625184000 }] }); // Group 2
      
      // Mock the deleteExpiredListings results
      mockSupabaseSelect
        .mockResolvedValueOnce({ data: [{ id: 'listing1', title: 'Expired 1', date: '2021-06-15T00:00:00Z', images: [] }], error: null }) // Group 1
        .mockResolvedValueOnce({ data: [], error: null }); // Group 2
      
      mockSupabaseDelete
        .mockResolvedValueOnce({ error: null }); // Group 1
      
      // Call the function
      const result = await syncExpiredListings({ verbose: true });
      
      // Assert
      expect(result.groupsProcessed).toBe(2);
      expect(result.totalListingsDeleted).toBe(1);
      expect(result.errors).toBe(0);
      
      // Verify logs
      expect(consoleOutput).toContain('Found 1 expired listings to delete for group "Group 1"');
      expect(consoleOutput).toContain('No expired listings found for group "Group 2"');
      expect(consoleOutput).toContain('Skipping group "Group 3" - no chat ID configured');
    });

    it('should handle errors when finding the oldest message', async () => {
      // Mock the findOldestMessageTimestamp function to return an error
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      
      // Call the function
      const result = await syncExpiredListings();
      
      // Assert
      expect(result.groupsProcessed).toBe(0);
      expect(result.errors).toBe(1);
      
      // Verify logs
      expect(consoleOutput).toContain('ERROR: Error processing group "Group 1" for sync: Error finding oldest message: API error');
    });

    it('should handle case when oldest message timestamp cannot be determined', async () => {
      // Mock the findOldestMessageTimestamp function to return null
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      // Call the function
      const result = await syncExpiredListings();
      
      // Assert
      expect(result.groupsProcessed).toBe(0);
      expect(result.errors).toBe(0);
      
      // Verify logs
      expect(consoleOutput).toContain('Could not determine oldest message for "Group 1", skipping sync');
    });

    it('should handle errors during deletion of expired listings', async () => {
      // Mock finding oldest message successfully
      mockedAxios.get.mockResolvedValueOnce({ data: [{ timestamp: 1625097600 }] });
      
      // Mock error when finding expired listings
      mockSupabaseSelect.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error' } 
      });
      
      // Call the function
      const result = await syncExpiredListings();
      
      // Assert
      expect(result.groupsProcessed).toBe(1);
      expect(result.errors).toBe(1);
      
      // Verify logs
      expect(consoleOutput).toContain('ERROR: Error syncing expired listings for "Group 1": Database error');
    });

    it('should properly summarize sync statistics', async () => {
      // Mock successful responses for all groups
      mockedAxios.get
        .mockResolvedValueOnce({ data: [{ timestamp: 1625097600 }] }) // Group 1
        .mockResolvedValueOnce({ data: [{ timestamp: 1625184000 }] }); // Group 2
      
      // Mock varied responses for deleteExpiredListings
      mockSupabaseSelect
        .mockResolvedValueOnce({ data: [
          { id: 'listing1', title: 'Expired 1', date: '2021-06-15T00:00:00Z', images: ['img1.jpg'] }
        ], error: null }) // Group 1
        .mockResolvedValueOnce({ data: [
          { id: 'listing2', title: 'Expired 2', date: '2021-06-20T00:00:00Z', images: ['img2.jpg', 'img3.jpg'] }
        ], error: null }); // Group 2
      
      mockSupabaseDelete
        .mockResolvedValueOnce({ error: null }) // Group 1
        .mockResolvedValueOnce({ error: null }); // Group 2
      
      mockSupabaseStorage
        .mockResolvedValue({ error: null });
      
      // Call the function
      const result = await syncExpiredListings({ verbose: true });
      
      // Assert
      expect(result.groupsProcessed).toBe(2);
      expect(result.totalListingsDeleted).toBe(2);
      expect(result.totalImagesRemoved).toBe(3);
      expect(result.errors).toBe(0);
      
      // Verify the final summary includes totals
      expect(consoleOutput).toContain('Sync complete:');
      expect(consoleOutput).toContain('Groups processed: 2');
      expect(consoleOutput).toContain('Total listings deleted: 2');
      expect(consoleOutput).toContain('Total images removed: 3');
      expect(consoleOutput).toContain('Errors: 0');
    });
  });
}); 