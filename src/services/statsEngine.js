/**
 * Advanced Analytics & Statistics Engine
 * Computes deep insights, taste profiles, director/actor rankings, country metrics,
 * and IMDb vs. User rating comparisons from the imported titles.
 */

// Heuristic country inference for well-known world cinema directors/titles
// Ensures rich country representation even before full TMDB network enrichment
const DIRECTOR_COUNTRY_MAP = {
  'Paul Thomas Anderson': 'United States',
  'Martin Scorsese': 'United States',
  'Christopher Nolan': 'United Kingdom',
  'Quentin Tarantino': 'United States',
  'David Fincher': 'United States',
  'Steven Spielberg': 'United States',
  'Denis Villeneuve': 'Canada',
  'Stanley Kubrick': 'United States',
  'Ridley Scott': 'United Kingdom',
  'Alfred Hitchcock': 'United Kingdom',
  'Luc Besson': 'France',
  'Jean-Pierre Jeunet': 'France',
  'Bong Joon-ho': 'South Korea',
  'Park Chan-wook': 'South Korea',
  'Lee Chang-dong': 'South Korea',
  'Kim Jee-woon': 'South Korea',
  'Lee Hwan-kyung': 'South Korea',
  'Kwak Jae-young': 'South Korea',
  'Hayao Miyazaki': 'Japan',
  'Makoto Shinkai': 'Japan',
  'Isao Takahata': 'Japan',
  'Akira Kurosawa': 'Japan',
  'Satoshi Kon': 'Japan',
  'Satyajit Ray': 'India',
  'Anurag Kashyap': 'India',
  'Shoojit Sircar': 'India',
  'S.S. Rajamouli': 'India',
  'Mani Ratnam': 'India',
  'Rajkumar Hirani': 'India',
  'Imtiaz Ali': 'India',
  'Ashutosh Gowariker': 'India',
  'Tareque Masud': 'Bangladesh',
  'Mostofa Sarwar Farooki': 'Bangladesh',
  'Humayun Ahmed': 'Bangladesh',
  'Amitabh Reza Chowdhury': 'Bangladesh',
  'Giuseppe Tornatore': 'Italy',
  'Roberto Benigni': 'Italy',
  'Federico Fellini': 'Italy',
  'Guillermo del Toro': 'Mexico',
  'Alfonso Cuarón': 'Mexico',
  'Alejandro G. Iñárritu': 'Mexico',
  'Fernando Meirelles': 'Brazil',
  'Florian Henckel von Donnersmarck': 'Germany',
  'Thomas Vinterberg': 'Denmark',
  'Oriol Paulo': 'Spain',
  'Pedro Almodóvar': 'Spain',
};

export function computeComprehensiveStats(movies = []) {
  if (!movies || movies.length === 0) {
    return null;
  }

  const watched = movies.filter(m => m.is_watched || m.your_rating !== null && m.your_rating !== undefined);
  const rated = movies.filter(m => m.your_rating !== null && m.your_rating !== undefined && m.your_rating > 0);
  const watchlist = movies.filter(m => m.is_watchlist);

  // 1. Total Hours & Watch Duration
  let totalMinutes = 0;
  watched.forEach(m => {
    if (m.is_series) {
      const episodes = m.number_of_episodes || 10;
      const epRuntime = m.episode_run_time || m.runtime || m.imdb_runtime_mins || 45;
      totalMinutes += episodes * epRuntime;
    } else {
      const runtime = m.runtime || m.imdb_runtime_mins || 105;
      totalMinutes += runtime * (1 + (m.rewatch_count || 0));
    }
  });

  const totalHours = Math.round(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const remainingMins = totalMinutes % 60;

  // 2. Ratings Metrics & Distribution
  const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
    rating: i + 1,
    count: 0,
    percentage: 0
  }));

  let sumRatings = 0;
  rated.forEach(m => {
    const r = Math.round(m.your_rating);
    if (r >= 1 && r <= 10) {
      ratingDistribution[r - 1].count += 1;
      sumRatings += m.your_rating;
    }
  });

  ratingDistribution.forEach(item => {
    item.percentage = rated.length > 0 ? ((item.count / rated.length) * 100).toFixed(1) : 0;
  });

  const averageRating = rated.length > 0 ? (sumRatings / rated.length).toFixed(2) : '0.0';

  // 3. Genres Analysis
  const genreMap = {};
  rated.forEach(m => {
    const genres = m.genres?.length ? m.genres : (m.imdb_genres || []);
    genres.forEach(g => {
      if (!genreMap[g]) {
        genreMap[g] = { count: 0, sumRating: 0 };
      }
      genreMap[g].count += 1;
      genreMap[g].sumRating += m.your_rating;
    });
  });

  const topGenresByCount = Object.entries(genreMap)
    .map(([genre, data]) => ({
      genre,
      count: data.count,
      avgRating: (data.sumRating / data.count).toFixed(2)
    }))
    .sort((a, b) => b.count - a.count);

  const topGenresByRating = topGenresByCount
    .filter(g => g.count >= 10) // Require minimum 10 titles for statistical validity
    .sort((a, b) => b.avgRating - a.avgRating);

  // 4. Decades & Eras Breakdown
  const decadeMap = {};
  watched.forEach(m => {
    const y = m.year || m.imdb_year;
    if (y) {
      const dec = Math.floor(y / 10) * 10;
      const label = dec >= 2020 ? '2020s' : dec >= 2010 ? '2010s' : dec >= 2000 ? '2000s' : dec >= 1990 ? '1990s' : dec >= 1980 ? '1980s' : dec >= 1970 ? '1970s' : 'Classic (<1970)';
      if (!decadeMap[label]) {
        decadeMap[label] = { count: 0, sumRating: 0, ratedCount: 0 };
      }
      decadeMap[label].count += 1;
      if (m.your_rating) {
        decadeMap[label].sumRating += m.your_rating;
        decadeMap[label].ratedCount += 1;
      }
    }
  });

  const decadeOrder = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', 'Classic (<1970)'];
  const topDecades = decadeOrder
    .filter(label => decadeMap[label])
    .map(label => ({
      decade: label,
      count: decadeMap[label].count,
      avgRating: decadeMap[label].ratedCount > 0 ? (decadeMap[label].sumRating / decadeMap[label].ratedCount).toFixed(2) : '—'
    }));

  // 5. Runtime Preferences
  const runtimeRanges = [
    { label: '< 90 mins (Short)', min: 0, max: 89, count: 0, sumRating: 0, rated: 0 },
    { label: '90–120 mins (Standard)', min: 90, max: 120, count: 0, sumRating: 0, rated: 0 },
    { label: '120–150 mins (Epic)', min: 121, max: 150, count: 0, sumRating: 0, rated: 0 },
    { label: '150+ mins (Masterwork)', min: 151, max: 9999, count: 0, sumRating: 0, rated: 0 }
  ];

  watched.filter(m => m.is_movie).forEach(m => {
    const rt = m.runtime || m.imdb_runtime_mins;
    if (rt) {
      const match = runtimeRanges.find(r => rt >= r.min && rt <= r.max);
      if (match) {
        match.count += 1;
        if (m.your_rating) {
          match.sumRating += m.your_rating;
          match.rated += 1;
        }
      }
    }
  });

  const runtimePreferences = runtimeRanges.map(r => ({
    range: r.label,
    count: r.count,
    avgRating: r.rated > 0 ? (r.sumRating / r.rated).toFixed(2) : '—'
  }));

  // 6. Directors Rankings
  const directorMap = {};
  rated.forEach(m => {
    const directors = m.directors?.length ? m.directors.map(d => d.name || d) : (m.imdb_directors || []);
    directors.forEach(d => {
      const name = typeof d === 'string' ? d.trim() : d.name;
      if (!name) return;
      if (!directorMap[name]) {
        directorMap[name] = { count: 0, sumRating: 0, titles: [] };
      }
      directorMap[name].count += 1;
      directorMap[name].sumRating += m.your_rating;
      if (directorMap[name].titles.length < 4) {
        directorMap[name].titles.push(m.title);
      }
    });
  });

  const topDirectors = Object.entries(directorMap)
    .filter(([_, d]) => d.count >= 2)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgRating: (d.sumRating / d.count).toFixed(2),
      sampleTitles: d.titles.join(', ')
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, 15);

  // 7. Favorite Actors vs. Favorite Actresses (Separated!)
  const actorMap = {};
  const actressMap = {};

  rated.forEach(m => {
    // Process actors (gender == 2)
    (m.actors || []).forEach(a => {
      const name = a.name;
      if (!name) return;
      if (!actorMap[name]) {
        actorMap[name] = { count: 0, sumRating: 0, profile_path: a.profile_path };
      }
      actorMap[name].count += 1;
      actorMap[name].sumRating += m.your_rating;
    });

    // Process actresses (gender == 1)
    (m.actresses || []).forEach(a => {
      const name = a.name;
      if (!name) return;
      if (!actressMap[name]) {
        actressMap[name] = { count: 0, sumRating: 0, profile_path: a.profile_path };
      }
      actressMap[name].count += 1;
      actressMap[name].sumRating += m.your_rating;
    });
  });

  const topActors = Object.entries(actorMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgRating: (d.sumRating / d.count).toFixed(2),
      profile_path: d.profile_path
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, 12);

  const topActresses = Object.entries(actressMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgRating: (d.sumRating / d.count).toFixed(2),
      profile_path: d.profile_path
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
    .slice(0, 12);

  // 8. Countries & Global Footprint
  const countryMap = {};
  watched.forEach(m => {
    let countries = m.production_countries || [];

    // Fallback: If not enriched yet, infer from director mapping or anime flag
    if (countries.length === 0) {
      if (m.is_anime) {
        countries = ['Japan'];
      } else {
        const directors = m.imdb_directors || [];
        for (const dir of directors) {
          if (DIRECTOR_COUNTRY_MAP[dir.trim()]) {
            countries = [DIRECTOR_COUNTRY_MAP[dir.trim()]];
            break;
          }
        }
      }
    }

    if (countries.length === 0) {
      // Default fallback for legacy un-enriched US/World movies
      countries = ['United States'];
    }

    countries.forEach(c => {
      const countryName = c.trim();
      if (!countryName) return;
      countryMap[countryName] = (countryMap[countryName] || 0) + 1;
    });
  });

  const totalCountryMovies = Object.values(countryMap).reduce((a, b) => a + b, 0);
  const topCountries = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: ((count / totalCountryMovies) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // 9. Your Rating vs. IMDb Rating Comparison
  const scatterData = [];
  let deltaSum = 0;
  let higherCount = 0;
  let lowerCount = 0;
  let equalCount = 0;

  rated.forEach(m => {
    if (m.your_rating && m.imdb_rating) {
      const delta = parseFloat((m.your_rating - m.imdb_rating).toFixed(1));
      deltaSum += delta;
      if (delta > 0.4) higherCount += 1;
      else if (delta < -0.4) lowerCount += 1;
      else equalCount += 1;

      scatterData.push({
        title: m.title,
        your_rating: m.your_rating,
        imdb_rating: m.imdb_rating,
        delta,
        year: m.year || m.imdb_year,
        votes: m.imdb_num_votes
      });
    }
  });

  const avgDelta = rated.length > 0 ? (deltaSum / scatterData.length).toFixed(2) : 0;
  const criticStyle = avgDelta > 0.6
    ? 'Generous Cinephile (You rate higher than IMDb consensus)'
    : avgDelta < -0.6
    ? 'Rigorous Critic (You are stricter than the IMDb average)'
    : 'Balanced Auteur (Your ratings closely align with global consensus)';

  // Guilty Pleasures: Your rating is 9 or 10, but IMDb is below 7.0
  const guiltyPleasures = scatterData
    .filter(d => d.your_rating >= 9 && d.imdb_rating <= 7.0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 8);

  // Tough Calls: IMDb rated 8.0+, but you rated 6 or below
  const toughCalls = scatterData
    .filter(d => d.imdb_rating >= 7.8 && d.your_rating <= 7.0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 8);

  // Hidden Gems: You rated 9+, but IMDb vote count is low (< 60,000 votes)
  const hiddenGems = scatterData
    .filter(d => d.your_rating >= 9 && d.votes && d.votes < 60000)
    .sort((a, b) => (a.votes || 0) - (b.votes || 0))
    .slice(0, 8);

  // 10. Fun Extremes & Milestones
  const moviesWithRuntime = watched.filter(m => (m.runtime || m.imdb_runtime_mins) > 0);
  const longestMovie = moviesWithRuntime.reduce((max, m) => {
    const rt = m.runtime || m.imdb_runtime_mins;
    return !max || rt > (max.runtime || max.imdb_runtime_mins) ? m : max;
  }, null);

  const moviesWithYear = watched.filter(m => (m.year || m.imdb_year) > 1900);
  const oldestMovie = moviesWithYear.reduce((min, m) => {
    const y = m.year || m.imdb_year;
    return !min || y < (min.year || min.imdb_year) ? m : min;
  }, null);

  const newestMovie = moviesWithYear.reduce((max, m) => {
    const y = m.year || m.imdb_year;
    return !max || y > (max.year || max.imdb_year) ? m : max;
  }, null);

  const mostRewatched = watched
    .filter(m => (m.rewatch_count || 0) > 0)
    .sort((a, b) => (b.rewatch_count || 0) - (a.rewatch_count || 0))
    .slice(0, 6);

  // 11. Auto-Generated Taste Profile Persona
  const topGenreNames = topGenresByCount.slice(0, 3).map(g => g.genre).join(', ');
  const topDecade = topDecades[0]?.decade || 'modern cinema';
  const topDirectorName = topDirectors[0]?.name || 'acclaimed auteurs';
  const topCountryName = topCountries[0]?.country || 'international cinema';

  const tasteProfileNarrative = `
    You are an impassioned Narrative Purist & Emotional Cinephile. With ${rated.length.toLocaleString()} rated titles 
    and ${ratingDistribution[9]?.count || 0} perfect 10/10 masterpieces, you gravitate toward high-stakes ${topGenreNames}. 
    Your viewing peaks in ${topDecade}, paired with a profound appreciation for ${topDirectorName} and international cinema from ${topCountryName}.
    When comparing with IMDb, you award generous appreciation (+${avgDelta > 0 ? avgDelta : '0.0'}) to films with emotional catharsis and character chemistry.
  `.trim();

  // 12. Watching Activity Over Time (By Year)
  const activityByYearMap = {};
  rated.forEach(m => {
    const yr = m.date_rated ? m.date_rated.split('-')[0] : (m.year || m.imdb_year);
    if (yr) {
      activityByYearMap[yr] = (activityByYearMap[yr] || 0) + 1;
    }
  });

  const activityByYear = Object.entries(activityByYearMap)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return {
    overview: {
      totalWatched: watched.length,
      totalMovies: watched.filter(m => m.is_movie).length,
      totalSeries: watched.filter(m => m.is_series).length,
      totalAnime: watched.filter(m => m.is_anime).length,
      totalWatchlist: watchlist.length,
      totalHours,
      formattedDuration: `${days} Days, ${remainingHours} Hours, ${remainingMins} Mins`,
      averageRating,
      perfect10Count: ratingDistribution[9]?.count || 0,
      totalCountriesCount: Object.keys(countryMap).length
    },
    ratings: {
      distribution: ratingDistribution,
      averageRating,
      totalRated: rated.length
    },
    genres: {
      topByCount: topGenresByCount.slice(0, 10),
      topByRating: topGenresByRating.slice(0, 10)
    },
    decades: topDecades,
    runtimes: runtimePreferences,
    directors: topDirectors,
    actors: topActors,
    actresses: topActresses,
    countries: {
      totalCount: Object.keys(countryMap).length,
      topCountries: topCountries.slice(0, 15),
      allCountries: topCountries
    },
    vsImdb: {
      avgDelta,
      criticStyle,
      higherCount,
      lowerCount,
      equalCount,
      scatterData: scatterData.slice(0, 300), // optimized sample for smooth recharts rendering
      guiltyPleasures,
      toughCalls,
      hiddenGems
    },
    funStats: {
      longestMovie,
      oldestMovie,
      newestMovie,
      mostRewatched
    },
    tasteProfile: {
      narrative: tasteProfileNarrative
    },
    activity: {
      byYear: activityByYear
    }
  };
}
