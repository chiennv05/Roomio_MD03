/**
 * Utility functions for handling image URLs
 */

const BASE_URL = 'http://125.212.229.71:4000';

/**
 * Convert relative image path to full URL
 * @param imagePath - The image path (can be relative or absolute)
 * @returns Full image URL
 */
export const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /api, prepend base URL
  if (imagePath.startsWith('/api')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // If relative path, prepend base URL with /api
  return `${BASE_URL}/api${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Get the first image from an array of image paths
 * @param images - Array of image paths
 * @returns Full URL of the first image or empty string
 */
export const getFirstImageUrl = (images: string[]): string => {
  if (!images || images.length === 0) return '';
  return getFullImageUrl(images[0]);
};

/**
 * Get placeholder image URL for fallback
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (): string => {
  return 'https://via.placeholder.com/300x200/f0f0f0/999999?text=No+Image';
};
