const axios = require('axios');
const queryMap = require('../utils/unsplashQueryMap');

/**
 * Fetch images from Unsplash Search Photos API.
 * @param {string} itemName - The uniform item name (e.g. "shirt", "pant")
 * @param {number} count - Number of images to fetch (default 4)
 * @returns {Array} Array of Unsplash photo objects with urls and attribution
 */
const fetchImagesFromUnsplash = async (itemName, count = 4) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('UNSPLASH_ACCESS_KEY is not set in environment variables');
    return [];
  }

  try {
    const itemKey = itemName.toLowerCase().trim();
    const query = queryMap[itemKey] || queryMap['default'];

    console.log(`[Unsplash] Searching: "${query}" for item: "${itemName}"`);

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: count,
        orientation: 'squarish',
        client_id: accessKey
      }
    });

    const photos = response.data.results;

    if (!photos || photos.length === 0) {
      console.log(`[Unsplash] No results for "${query}", trying fallback...`);
      // Try fallback query
      const fallback = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: queryMap['default'],
          per_page: count,
          orientation: 'squarish',
          client_id: accessKey
        }
      });
      return fallback.data.results || [];
    }

    return photos;

  } catch (error) {
    if (error.response?.status === 403) {
      console.error('[Unsplash] Rate limit exceeded. Wait before retrying.');
    } else {
      console.error('[Unsplash] Fetch error:', error.message);
    }
    return [];
  }
};

module.exports = { fetchImagesFromUnsplash };
