# CineTrack Data Model & Analytics Calculation Guide

This document defines the underlying data schemas, field types, and the statistical formulas used throughout CineTrack.

---

## 1. Primary Data Entity (`MovieRecord`)

Every title across your library and watchlist is normalized into this canonical structure:

```typescript
export interface MovieRecord {
  // Identifiers
  imdb_id: string;              // Primary key (e.g. "tt0469494")
  tmdb_id?: number | null;      // Matched TMDB ID
  title: string;                // Canonical title
  original_title?: string;      // Native title (e.g. Japanese, Korean)

  // Media Classification
  title_type: string;           // "movie", "tvSeries", "tvMiniSeries", "tvMovie", "short", "video", "tvEpisode"
  is_anime: boolean;            // Detected via Japanese origin + Animation genre
  is_series: boolean;           // True for multi-episode series
  is_movie: boolean;            // True for feature films
  is_episode: boolean;          // True for single rated episodes

  // Personal Tracking (Persisted in IndexedDB)
  your_rating?: number | null;  // Personal score from 1 to 10
  date_rated?: string | null;   // YYYY-MM-DD
  is_watched: boolean;          // Rated or marked completed
  is_watchlist: boolean;        // In ashraks's Watchlist
  date_added_to_watchlist?: string | null;
  lists: string[];              // e.g. ["Movies You Can't Miss", "Best 100 Romantic Comedy Movies"]
  rewatch_count: number;        // Counter of repeat viewings
  user_review?: string | null;  // Personal notes
  user_tags: string[];          // Custom tags (e.g. "mind-bending", "comfort")
  watched_with: string[];       // ["wife", "family", "friends", "alone"]

  // Baseline IMDb Export Data
  imdb_rating?: number | null;  // Global score (e.g. 8.2)
  imdb_num_votes?: number | null;
  imdb_year?: number | null;
  imdb_runtime_mins?: number | null;
  imdb_directors: string[];
  imdb_genres: string[];

  // TMDB Enriched Metadata
  overview?: string | null;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  year?: number | null;
  runtime?: number | null;
  genres: string[];
  keywords: string[];
  original_language?: string | null;
  spoken_languages: string[];
  production_countries: string[];
  production_companies: string[];
  certification?: string | null;// Age classification (G, PG, PG-13, R, TV-MA)

  // Cast (Separated by Gender)
  directors: Array<{ id?: number; name: string; profile_path?: string | null }>;
  actors: Array<{ id?: number; name: string; character?: string; profile_path?: string | null }>;    // gender == 2
  actresses: Array<{ id?: number; name: string; character?: string; profile_path?: string | null }>; // gender == 1

  // Series Specifics
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  episode_run_time?: number | null;
  total_runtime_minutes?: number | null;

  // Section Routing Flags
  watch_with_wife: boolean;
  watch_with_family: boolean;
}
```

---

## 2. Statistical Formulas & Calculations

### A. Total Viewing Duration
Calculates your life-to-date viewing investment in minutes, converted to days, hours, and minutes:

* **For Feature Movies:**
  $$\text{Minutes} = (\text{runtime} \lor \text{imdb\_runtime\_mins} \lor 105) \times (1 + \text{rewatch\_count})$$

* **For TV & Anime Series:**
  $$\text{Minutes} = (\text{number\_of\_episodes} \lor 10) \times (\text{episode\_run\_time} \lor 45)$$

* **Total Duration Formatted:**
  $$\text{Total Hours} = \left\lfloor \frac{\sum \text{Minutes}}{60} \right\rfloor$$
  $$\text{Days} = \left\lfloor \frac{\text{Total Hours}}{24} \right\rfloor, \quad \text{Remaining Hours} = \text{Total Hours} \pmod{24}$$

---

### B. IMDb Delta & Critic Profiling
Measures how your personal ratings diverge from the global IMDb consensus:

$$\Delta = \text{Your Rating} - \text{IMDb Rating}$$
$$\text{Average Delta} = \frac{\sum_{i=1}^{N} \Delta_i}{N}$$

* **Critic Classification:**
  * $\text{Average Delta} \ge +0.5$: **"Generous Cinephile"** (You reward emotional depth and character chemistry higher than the public).
  * $\text{Average Delta} \le -0.5$: **"Rigorous Critic"** (You hold films to stricter standards than the global average).
  * $-0.5 < \text{Average Delta} < +0.5$: **"Balanced Cinephile"** (Your taste closely mirrors global critical consensus).

---

### C. Extreme Categorization
* **Guilty Pleasures:** Titles where $\text{Your Rating} \ge 9.0$ and $\text{IMDb Rating} \le 7.0$.
* **Tough Calls:** Acclaimed titles where $\text{IMDb Rating} \ge 7.8$ and $\text{Your Rating} \le 7.0$.
* **Hidden Gems:** Undiscovered favorites where $\text{Your Rating} \ge 9.0$ and $\text{IMDb Num Votes} < 60,000$.

---

### D. "Because You Liked X" Recommendation Scorer
Calculates similarity between a selected 10/10 masterpiece ($S$) and candidate titles ($C$):

$$\text{Score}(C, S) = (15 \times |G_S \cap G_C|) + (35 \times [D_S \cap D_C \neq \emptyset]) + (10 \times [\text{Decade}_S = \text{Decade}_C]) + 15_{[\text{In Watchlist}]}$$

Where:
* $G$: Set of Genres
* $D$: Set of Directors
* In Watchlist bonus prioritizes titles queued to watch that match your favorite's DNA.

---

### E. Cast Separation by Gender
TMDB returns a `gender` integer in `credits.cast`:
* `1`: Female $\rightarrow$ Populates `actresses` array.
* `2`: Male $\rightarrow$ Populates `actors` array.
* `0` / `3`: Non-binary / unspecified $\rightarrow$ Placed in general cast.
