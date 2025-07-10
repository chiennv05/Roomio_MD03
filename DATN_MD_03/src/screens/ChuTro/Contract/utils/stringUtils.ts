/**
 * Process co-tenants string into array
 * @param coTenantsString - String with comma-separated names
 * @returns Array of trimmed, non-empty tenant names
 */
export const processCoTenants = (coTenantsString: string): string[] => {
  if (!coTenantsString || coTenantsString.trim() === '') {
    return [];
  }
  
  return coTenantsString
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
};

/**
 * Convert array of co-tenants to display string
 * @param coTenants - Array of tenant names
 * @returns Comma-separated string
 */
export const coTenantsArrayToString = (coTenants: string[]): string => {
  return coTenants.join(', ');
};

/**
 * Capitalize first letter of each word
 * @param str - Input string
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Remove extra spaces and trim
 * @param str - Input string
 * @returns Cleaned string
 */
export const cleanString = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};