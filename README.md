# CineTrack • Personal Movie Tracker & Insights

A production-ready personal cinematic movie tracking and insights application built with **React, Vite, Tailwind CSS, Recharts, Framer Motion, and Dexie (IndexedDB)**. Pre-seeded with your complete personal IMDb watch history and custom curated lists.

---

## Features

* **Real Imported Data (2,914 titles):**
  * `Your ratings.csv`: 2,109 rated movies, series, and episodes
  * `ashraks's Watchlist.csv`: 791 queued titles
  * `Movies You Can't Miss.csv`: 154 top masterpieces
  * `Best 100 Romantic Comedy Movies.csv`: 98 romantic favorites
  * `Anime Series List.csv`: 39 curated anime series
  * `Romantic Animated Movies.csv`: 26 animated feature films
  * `Best Tv Series I Watched So Far.csv`: 21 prestige TV and web series
* **Cinematic UI:** Dynamic full-screen blurred/dimmed poster and backdrop collage, glassmorphism cards, dark/light theme toggle, mobile bottom navigation, and desktop sidebar.
* **Full Stats Dashboard:** 
  * Total hours spent (days/hours/minutes; series computed from episodes $\times$ runtime)
  * Rating distribution (1–10) with average score
  * Top genres by volume and by rating
  * Decades and eras breakdown (1970s–2020s)
  * Creative talents: **Directors**, **Leading Actors** (Male), and **Leading Actresses** (Female) separated!
  * World cinema footprint: total countries count, volume progress bars, and searchable country list
  * IMDb vs. Your Rating scatter matrix, delta score, Guilty Pleasures, and Hidden Gems
  * Fun milestones: longest film, oldest classic, newest release, and comfort rewatches
  * Spotify Wrapped-style **Year in Review** modal with year selector
* **Watch-with-Wife Section:** Curated date-night romance hub with interactive **Couples Swipe Matching Game** (2-player pass-the-phone mode with real-time match celebrations and confetti).
* **Watch-with-Family Section:** All-ages family hub strictly filtered by certification (`G`, `PG`, `TV-PG`) and animated feature films.
* **Discovery & Mood Engine:** 9 cinematic moods, format selectors (movies, series, anime), "Because You Liked X" similarity engine, "Tonight's Pick" random roll, and regional streaming badges for **Bangladesh (BD)**.
* **Offline-First PWA:** Installable on phone home screens (iOS & Android) with local IndexedDB persistence, offline service worker caching, and JSON backup export/import.
* **Report Downloader:** "Download Stats Report" button exporting your complete profile as a formatted Markdown or printable PDF report.

---

## Project Structure

```
G:\APPS\IMDB\
├── pipeline/                     # Python ETL & TMDB Enrichment Pipeline
│   ├── parse_imdb.py             # IMDb CSV parser & deduplication engine
│   ├── enrich_data.py            # Resumable SQLite-cached TMDB enrichment script
│   ├── schema.py                 # Pydantic data schemas
│   ├── verify_phase1.py          # Pipeline integrity verification suite
│   └── requirements.txt          # Python dependencies
│
├── data/                         # Local database & response cache
│   ├── cache/
│   │   └── tmdb_cache.sqlite     # Persistent response cache (0 repeated calls)
│   ├── movies_unified.json       # Clean unified pre-enrichment dataset (2,914 titles)
│   └── movies_enriched.json      # Production enriched dataset for the web app
│
├── public/                       # PWA assets & static files
│   ├── data/                     # Seed JSON datasets accessible to browser
│   ├── manifest.json             # Web App Manifest for mobile installation
│   ├── sw.js                     # Service Worker for offline viewing
│   ├── icon.svg                  # Vector brand icon
│   ├── icon-192.png              # Standard PWA icon
│   └── icon-512.png              # High-res PWA icon
│
├── src/                          # React Application
│   ├── components/               # UI components (Backdrop, Card, Modal, Search)
│   ├── components/stats/         # Analytics charts, scatter plots, Wrapped modal
│   ├── components/couples/       # Couples Swipe Matching game
│   ├── context/                  # Reactive AppContext with Dexie live queries
│   ├── db/                       # Dexie (IndexedDB) wrapper & JSON backup engine
│   ├── pages/                    # Views: Library, Dashboard, Wife, Family, Suggestions, Settings
│   ├── services/                 # Stats calculation, mood engine, report generator, TMDB proxy
│   └── types/                    # TypeScript interfaces
│
├── netlify/                      # Netlify Serverless Functions
│   └── functions/
│       └── tmdb-proxy.js         # Secure proxy protecting TMDB_API_KEY
├── netlify.toml                  # SPA routing, security headers & functions config
├── .env.example                  # Environment template
└── package.json                  # Dependencies & scripts
```

---

## 1. Quickstart (Local Development)

### Prerequisites
* Node.js 18+ (`v24.x` confirmed)
* Python 3.10+ (`Python 3.13.x` confirmed)

### Run the App
```powershell
# 1. Install frontend packages (already installed in workspace)
npm install

# 2. Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser. All 2,914 titles will automatically seed into your browser's IndexedDB.

---

## 2. TMDB Enrichment Pipeline

The app already works out of the box with your unified IMDb files. To enrich all 2,914 titles with high-res posters, backdrops, actor/actress cast, and production companies:

1. Obtain a free API key at [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api).
2. Create a `.env` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_DEFAULT_REGION=BD
   ```
3. Run the enrichment script:
   ```powershell
   python pipeline/enrich_data.py
   ```
   * **Resumable:** Every network response is permanently cached in `data/cache/tmdb_cache.sqlite`. You can cancel (`Ctrl+C`) and re-run anytime; it will resume instantly with 0 duplicate requests.
   * **Test with a small batch:** Run `python pipeline/enrich_data.py --limit 50` to enrich the first 50 titles.
   * **Copy to public folder:** After full enrichment, copy the output so the frontend reads the fresh metadata:
     ```powershell
     Copy-Item data/movies_enriched.json public/data/movies_enriched.json -Force
     ```

---

## 3. Re-Importing Newer IMDb Exports

When you download fresh exports from IMDb in the future:
1. Drop the updated CSV files into `G:\APPS\IMDB`.
2. Run the parser:
   ```powershell
   python pipeline/parse_imdb.py
   ```
3. The parser detects any new titles, handles cross-list tags, and updates `data/movies_unified.json` without duplicates.
4. On the app's **Settings** page, click **"Reset to Default Import"** to reload the updated dataset into your browser IndexedDB.

---

## 4. Netlify Deployment Guide (Step-by-Step)

This application is fully pre-configured for Netlify deployment via `netlify.toml` and Netlify Functions.

### Option A: Deploy via GitHub (Recommended)
1. Initialize a git repository and push your project to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of CineTrack app"
   # Push to your private or public GitHub repo
   ```
2. Log in to [Netlify](https://app.netlify.com) and click **"Add new site" &rarr; "Import an existing project"**.
3. Select your repository. Netlify automatically detects settings from `netlify.toml`:
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
   * **Functions Directory:** `netlify/functions`
4. **Add Environment Variable:**
   * Go to **Site configuration &rarr; Environment variables**.
   * Add key: `TMDB_API_KEY` with your TMDB API key value.
5. Click **"Deploy site"**. Your app will be live with an HTTPS URL.

### Option B: Deploy via Netlify CLI
```powershell
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod
```

### Site Privacy & Password Gate
Because this contains your personal viewing history, if you deploy publicly and want privacy:
* On your Netlify Site dashboard, go to **Site configuration &rarr; Access control &rarr; Password protection**.
* Set a password so only you, your wife, and family can open the URL.

---

## 5. Installing on Mobile (PWA)

Once deployed to Netlify (or when accessing `http://<your-local-ip>:3000` on your home Wi-Fi):

* **Android (Chrome):**
  1. Open the site in Chrome.
  2. Tap the three dots (`⋮`) menu in the top right.
  3. Tap **"Install app"** or **"Add to Home screen"**.
  4. The CineTrack app icon appears on your home screen and launches full-screen with no browser address bar!
* **iPhone / iPad (Safari):**
  1. Open the site in Safari.
  2. Tap the **Share** button (`⎋` with arrow).
  3. Scroll down and tap **"Add to Home Screen"**.
  4. Tap **"Add"**. The app operates offline as a native web app.

---

## 6. How to Download Your Stats Report

* Open the app and navigate to **"Stats & Insights"**.
* Click the **"Download Report"** button in the header banner.
* A complete Markdown document (`CineTrack_Movie_Report_YYYY-MM-DD.md`) will download immediately, detailing your full viewing time, ratings distribution, top directors, favorite decades, and critic persona.
* To print or save as PDF, simply use your browser's Print shortcut (`Ctrl+P` / `Cmd+P`) and choose **"Save as PDF"**.
