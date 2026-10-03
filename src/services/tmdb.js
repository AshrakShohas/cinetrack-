/**
 * TMDB API Client Service
 * Calls Netlify Function proxy in production, or handles local fallback.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getPosterUrl(path, size = 'w500') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getBackdropUrl(path, size = 'original') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Searches TMDB for movies/shows via the Netlify Proxy
 */
export async function searchTMDB(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `/.netlify/functions/tmdb-proxy?endpoint=/search/multi&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('TMDB proxy returned non-200:', response.status);
      return [];
    }
    const data = await response.json();
    return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  } catch (err) {
    console.error('Error querying TMDB search:', err);
    return [];
  }
}

/**
 * Fetches full details for a TMDB item
 */
export async function getTMDBDetails(mediaType, id) {
  try {
    const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const url = `/.netlify/functions/tmdb-proxy?endpoint=${endpoint}&append_to_response=credits,keywords,release_dates,content_ratings`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Error fetching TMDB details:', err);
    return null;
  }
}
