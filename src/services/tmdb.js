/**
 * TMDB API Client Service
 * Calls Netlify Function proxy in production, or handles local fallback.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export function getLocalApiKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('cinetrack_tmdb_key') || import.meta.env.VITE_TMDB_API_KEY || '';
}

export function setLocalApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('cinetrack_tmdb_key', key.trim());
  } else {
    localStorage.removeItem('cinetrack_tmdb_key');
  }
}

export async function testTMDBConnection(customKey = null) {
  const key = customKey || getLocalApiKey();
  if (!key) {
    // Test the proxy
    try {
      const res = await fetch('/.netlify/functions/tmdb-proxy?endpoint=/authentication');
      if (res.ok) return { success: true, method: 'proxy' };
    } catch {
      // ignore
    }
    return { success: false, message: 'No API key provided and Netlify proxy not configured.' };
  }

  try {
    const res = await fetch(`${TMDB_API_BASE}/authentication?api_key=${key}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, method: 'direct' };
    }
    return { success: false, message: data.status_message || 'Invalid TMDB API key.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

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
 * Searches TMDB for movies/shows via Netlify Proxy or direct fallback
 */
export async function searchTMDB(query) {
  if (!query || query.trim().length < 2) return [];

  // Try 1: Netlify Function Proxy
  try {
    const proxyUrl = `/.netlify/functions/tmdb-proxy?endpoint=/search/multi&query=${encodeURIComponent(query)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    }
  } catch {
    // Fall through to direct fallback
  }

  // Try 2: Direct API request using local or env key
  const directKey = getLocalApiKey();
  if (directKey) {
    try {
      const directUrl = `${TMDB_API_BASE}/search/multi?api_key=${directKey}&query=${encodeURIComponent(query)}`;
      const response = await fetch(directUrl);
      if (response.ok) {
        const data = await response.json();
        return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      }
    } catch (err) {
      console.error('Direct TMDB search failed:', err);
    }
  }

  return [];
}

/**
 * Fetches full details for a TMDB item via Netlify Proxy or direct fallback
 */
export async function getTMDBDetails(mediaType, id) {
  const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
  const appendParams = 'append_to_response=credits,keywords,release_dates,content_ratings';

  // Try 1: Netlify Proxy
  try {
    const proxyUrl = `/.netlify/functions/tmdb-proxy?endpoint=${endpoint}&${appendParams}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through to direct fallback
  }

  // Try 2: Direct API
  const directKey = getLocalApiKey();
  if (directKey) {
    try {
      const directUrl = `${TMDB_API_BASE}${endpoint}?api_key=${directKey}&${appendParams}`;
      const response = await fetch(directUrl);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Direct TMDB details failed:', err);
    }
  }

  return null;
}
