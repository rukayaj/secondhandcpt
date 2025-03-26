/**
 * Location Hierarchy Mappings
 * 
 * Maps region names to their corresponding suburbs to enable hierarchical
 * filtering of locations.
 */

// Main region to suburb mapping
export const LOCATION_HIERARCHY: Record<string, string[]> = {
  "City Bowl": [
    "Cape Town City Centre", 
    "Gardens", 
    "Vredehoek", 
    "Oranjezicht", 
    "Tamboerskloof",
    "Bo-Kaap",
    "Devil's Peak",
    "Zonnebloem",
    "Woodstock",
    "Observatory"
  ],
  "Atlantic Seaboard": [
    "Green Point",
    "Sea Point",
    "Three Anchor Bay",
    "Mouille Point",
    "Bantry Bay",
    "Clifton",
    "Camps Bay",
    "Bakoven",
    "Llandudno"
  ],
  "Southern Suburbs": [
    "Rondebosch", 
    "Newlands", 
    "Claremont", 
    "Kenilworth", 
    "Pinelands",
    "Wynberg",
    "Mowbray",
    "Lansdowne",
    "Bishopscourt",
    "Constantia",
    "Tokai",
    "Bergvliet",
    "Diep River",
    "Plumstead",
    "Lakeside"
  ],
  "Northern Suburbs": [
    "Bellville",
    "Durbanville",
    "Parow",
    "Goodwood",
    "Plattekloof",
    "Brackenfell",
    "Kraaifontein",
    "Edgemead"
  ],
  "West Coast & Bloubergstrand Area": [
    "Milnerton",
    "Bloubergstrand",
    "Table View",
    "Parklands",
    "Sunningdale",
    "Big Bay"
  ],
  "Southern Peninsula": [
    "Muizenberg",
    "Marina da Gama",
    "St James",
    "Kalk Bay",
    "Fish Hoek",
    "Glencairn",
    "Simon's Town",
    "Noordhoek",
    "Hout Bay",
    "Scarborough",
    "Ocean View",
    "Kommetjie"
  ],
  "Cape Flats": [
    "Mitchells Plain",
    "Athlone"
  ]
};

// Create reverse mapping (suburb -> region)
export const SUBURB_TO_REGION: Record<string, string> = {};
Object.entries(LOCATION_HIERARCHY).forEach(([region, suburbs]) => {
  suburbs.forEach(suburb => {
    SUBURB_TO_REGION[suburb] = region;
  });
});

/**
 * Get all locations including regions
 * @returns Array of all regions and suburbs
 */
export function getAllLocations(): string[] {
  const regions = Object.keys(LOCATION_HIERARCHY);
  const suburbs = Object.values(LOCATION_HIERARCHY).flat();
  return [...regions, ...suburbs];
}

/**
 * Get all suburbs for a region
 * @param region The region name
 * @returns Array of suburbs in the region
 */
export function getSuburbsForRegion(region: string): string[] {
  return LOCATION_HIERARCHY[region] || [];
}

/**
 * Check if a location is a region
 * @param location The location name to check
 * @returns True if the location is a region
 */
export function isRegion(location: string): boolean {
  return location in LOCATION_HIERARCHY;
}

/**
 * Check if a location is a suburb in the hierarchy
 * @param location The location name to check
 * @returns True if the location is a suburb
 */
export function isSuburb(location: string): boolean {
  return location in SUBURB_TO_REGION;
}

/**
 * Get the region for a suburb
 * @param suburb The suburb name
 * @returns The region name or null if not found
 */
export function getRegionForSuburb(suburb: string): string | null {
  return SUBURB_TO_REGION[suburb] || null;
} 