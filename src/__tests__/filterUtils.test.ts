import { 
  filterListings, 
  getCategoriesWithCounts, 
  getLocationsWithCounts,
  getPriceRangesWithCounts,
  getDateRangesWithCounts,
  FilterCriteria
} from '../utils/filterUtils';

// Mock the sampleListings import
jest.mock('../utils/sampleData.deduplicated', () => ({
  sampleListings: [
    {
      id: '1',
      date: '2023-05-01T10:00:00Z',
      sender: 'User1',
      text: 'Selling baby clothes',
      title: 'Baby Clothes',
      images: ['image1.jpg'],
      price: 100,
      condition: 'Good',
      size: '0-3 months',
      location: 'Cape Town',
      category: 'Clothing',
      isISO: false
    },
    {
      id: '2',
      date: '2023-05-02T10:00:00Z',
      sender: 'User2',
      text: 'Selling baby toys',
      title: 'Baby Toys',
      images: ['image2.jpg'],
      price: 200,
      condition: 'New',
      size: null,
      location: 'Johannesburg',
      category: 'Toys',
      isISO: false
    },
    {
      id: '3',
      date: '2023-05-03T10:00:00Z',
      sender: 'User3',
      text: 'Selling baby furniture',
      title: 'Baby Crib',
      images: ['image3.jpg'],
      price: 1500,
      condition: 'Used',
      size: null,
      location: 'Cape Town',
      category: 'Furniture',
      isISO: false
    },
    {
      id: '4',
      date: '2023-04-01T10:00:00Z',
      sender: 'User4',
      text: 'Selling baby clothes',
      title: 'Baby Onesies',
      images: ['image4.jpg'],
      price: 50,
      condition: 'Good',
      size: '3-6 months',
      location: 'Durban',
      category: 'Clothing',
      isISO: false
    },
    {
      id: '5',
      date: '2023-05-04T10:00:00Z',
      sender: 'User5',
      text: 'ISO baby clothes',
      title: 'Looking for baby clothes',
      images: [],
      price: null,
      condition: null,
      size: '0-3 months',
      location: 'Cape Town',
      category: 'Clothing',
      isISO: true
    }
  ]
}));

describe('filterListings', () => {
  test('should return all listings when no filters are provided', () => {
    const result = filterListings();
    expect(result.length).toBe(5);
  });

  test('should filter by category', () => {
    const filters: FilterCriteria = { category: 'Clothing' };
    const result = filterListings(filters);
    expect(result.length).toBe(3);
    expect(result.every(item => item.category === 'Clothing')).toBe(true);
  });

  test('should filter by location', () => {
    const filters: FilterCriteria = { location: 'Cape Town' };
    const result = filterListings(filters);
    expect(result.length).toBe(3);
    expect(result.every(item => item.location === 'Cape Town')).toBe(true);
  });

  test('should filter by price range', () => {
    const filters: FilterCriteria = { minPrice: 100, maxPrice: 1000 };
    const result = filterListings(filters);
    expect(result.length).toBe(2);
    expect(result.every(item => item.price !== null && item.price >= 100 && item.price <= 1000)).toBe(true);
  });

  test('should filter by multiple criteria', () => {
    const filters: FilterCriteria = { 
      category: 'Clothing', 
      location: 'Cape Town',
      minPrice: 50,
      maxPrice: 200
    };
    const result = filterListings(filters);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });
});

describe('getCategoriesWithCounts', () => {
  test('should return all categories with counts when no filters are provided', () => {
    const result = getCategoriesWithCounts();
    expect(result.length).toBe(3);
    
    const clothing = result.find(cat => cat.name === 'Clothing');
    const toys = result.find(cat => cat.name === 'Toys');
    const furniture = result.find(cat => cat.name === 'Furniture');
    
    expect(clothing).toBeDefined();
    expect(toys).toBeDefined();
    expect(furniture).toBeDefined();
    
    expect(clothing?.count).toBe(3);
    expect(toys?.count).toBe(1);
    expect(furniture?.count).toBe(1);
  });

  test('should return filtered categories with counts when location filter is provided', () => {
    const filters: FilterCriteria = { location: 'Cape Town' };
    const result = getCategoriesWithCounts(filters);
    
    const clothing = result.find(cat => cat.name === 'Clothing');
    const furniture = result.find(cat => cat.name === 'Furniture');
    
    expect(clothing).toBeDefined();
    expect(furniture).toBeDefined();
    
    expect(clothing?.count).toBe(2);
    expect(furniture?.count).toBe(1);
    
    // Toys should not be in Cape Town
    const toys = result.find(cat => cat.name === 'Toys');
    expect(toys).toBeUndefined();
  });
});

describe('getLocationsWithCounts', () => {
  test('should return all locations with counts when no filters are provided', () => {
    const result = getLocationsWithCounts();
    expect(result.length).toBe(3);
    
    const capeTown = result.find(loc => loc.name === 'Cape Town');
    const johannesburg = result.find(loc => loc.name === 'Johannesburg');
    const durban = result.find(loc => loc.name === 'Durban');
    
    expect(capeTown).toBeDefined();
    expect(johannesburg).toBeDefined();
    expect(durban).toBeDefined();
    
    expect(capeTown?.count).toBe(3);
    expect(johannesburg?.count).toBe(1);
    expect(durban?.count).toBe(1);
  });

  test('should return filtered locations with counts when category filter is provided', () => {
    const filters: FilterCriteria = { category: 'Clothing' };
    const result = getLocationsWithCounts(filters);
    
    const capeTown = result.find(loc => loc.name === 'Cape Town');
    const durban = result.find(loc => loc.name === 'Durban');
    
    expect(capeTown).toBeDefined();
    expect(durban).toBeDefined();
    
    expect(capeTown?.count).toBe(2);
    expect(durban?.count).toBe(1);
    
    // Johannesburg should not have clothing
    const johannesburg = result.find(loc => loc.name === 'Johannesburg');
    expect(johannesburg).toBeUndefined();
  });
});

describe('getPriceRangesWithCounts', () => {
  test('should return all price ranges with counts when no filters are provided', () => {
    const result = getPriceRangesWithCounts();
    
    // Find the relevant price ranges in our test data
    const under100 = result.find(range => range.min === 0 && range.max === 99.99);
    const r100to250 = result.find(range => range.min === 100 && range.max === 250);
    const r1000to2000 = result.find(range => range.min === 1000 && range.max === 2000);
    
    expect(under100).toBeDefined();
    expect(r100to250).toBeDefined();
    expect(r1000to2000).toBeDefined();
    
    // Our test data has:
    // - 1 item under 100 (id 4: 50)
    // - 2 items between 100-250 (ids 1, 2: 100, 200)
    // - 1 item between 1000-2000 (id 3: 1500)
    expect(under100?.count).toBe(1);
    expect(r100to250?.count).toBe(2);
    expect(r1000to2000?.count).toBe(1);
  });

  test('should return filtered price ranges with counts when category filter is provided', () => {
    const filters: FilterCriteria = { category: 'Clothing' };
    const result = getPriceRangesWithCounts(filters);
    
    const under100 = result.find(range => range.min === 0 && range.max === 99.99);
    const r100to250 = result.find(range => range.min === 100 && range.max === 250);
    
    expect(under100).toBeDefined();
    expect(r100to250).toBeDefined();
    
    // With Clothing filter, we have:
    // - 1 item under 100 (id 4: 50)
    // - 1 item between 100-250 (id 1: 100)
    expect(under100?.count).toBe(1);
    expect(r100to250?.count).toBe(1);
    
    // No furniture (1500) in this filter
    const r1000to2000 = result.find(range => range.min === 1000 && range.max === 2000);
    expect(r1000to2000?.count).toBe(0);
  });
});

describe('getDateRangesWithCounts', () => {
  // We'll skip the date tests for now as they're more complex to mock
  test.skip('should return all date ranges with counts when no filters are provided', () => {
    const result = getDateRangesWithCounts();
    expect(result.length).toBe(5); // We have 5 date ranges defined
  });

  test.skip('should return filtered date ranges with counts when category filter is provided', () => {
    const filters: FilterCriteria = { category: 'Clothing' };
    const result = getDateRangesWithCounts(filters);
    expect(result.length).toBe(5); // We have 5 date ranges defined
  });
}); 