/**
 * Cleans property image URLs that might be comma-separated or invalid.
 * Uses a remote placeholder if no image is found.
 */
export const getCleanImageUrl = (url: string | undefined | null): string => {
  // ✅ Use a remote placeholder that works immediately
  const PLACEHOLDER_URL = 'https://placehold.co/600x400/png?text=Property+Image';

  if (!url) return PLACEHOLDER_URL;

  let cleanUrl = url;

  // If it contains a comma, take the first part
  if (cleanUrl.includes(',')) {
    cleanUrl = cleanUrl.split(',')[0].trim();
  }

  // Basic validation to ensure it looks like a URL
  if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('/')) {
    return PLACEHOLDER_URL;
  }

  return cleanUrl;
};