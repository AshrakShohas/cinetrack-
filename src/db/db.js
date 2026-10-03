import Dexie from 'dexie';

/**
 * CineTrackDB - IndexedDB Database with Dexie
 * Enables ultra-fast offline access, reactive queries, and personal edits persistence.
 */
export const db = new Dexie('CineTrackDB');

db.version(1).stores({
  movies: 'imdb_id, tmdb_id, title, title_type, is_watched, is_watchlist, is_anime, your_rating, date_rated, year, *genres, *lists, *watched_with, watch_with_wife, watch_with_family, rewatch_count',
  userSettings: 'key',
  customLists: 'name'
});

/**
 * Seeds IndexedDB with the unified/enriched IMDb JSON on first app boot
 */
export async function initializeDatabase() {
  try {
    const count = await db.movies.count();
    if (count > 0) {
      console.log(`[CineTrackDB] IndexedDB already initialized with ${count} titles.`);
      return;
    }

    console.log('[CineTrackDB] Seeding initial database from local JSON...');
    // Attempt to load enriched file first, then unified file
    let data;
    try {
      const resp = await fetch('/data/movies_enriched.json');
      if (resp.ok) {
        data = await resp.json();
      }
    } catch (e) {
      console.warn('Could not fetch /data/movies_enriched.json, trying fallback...', e);
    }

    if (!data) {
      try {
        const resp2 = await fetch('/data/movies_unified.json');
        if (resp2.ok) {
          data = await resp2.json();
        }
      } catch (e2) {
        console.error('Failed to load initial dataset:', e2);
      }
    }

    if (data && data.titles && data.titles.length > 0) {
      await db.movies.bulkPut(data.titles);
      console.log(`[CineTrackDB] Successfully seeded ${data.titles.length} titles into IndexedDB.`);
    }
  } catch (error) {
    console.error('[CineTrackDB] Initialization error:', error);
  }
}

/**
 * Update a movie record (rating, tags, notes, rewatches, watch status)
 */
export async function updateMovieRecord(imdbId, updates) {
  const existing = await db.movies.get(imdbId);
  if (!existing) return null;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await db.movies.put(merged);
  return merged;
}

/**
 * Add a new movie or series to the database
 */
export async function addMovieRecord(movie) {
  const record = {
    ...movie,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.movies.put(record);
  return record;
}

/**
 * Export current database as JSON string
 */
export async function exportDatabaseJSON() {
  const allMovies = await db.movies.toArray();
  const exportPayload = {
    app: 'CineTrack',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalCount: allMovies.length,
    movies: allMovies
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Reset database to default seed
 */
export async function resetDatabase() {
  await db.movies.clear();
  await initializeDatabase();
}
