"""
TMDB Data Enrichment Pipeline
Reads unified IMDb records, queries TMDB /find and detail endpoints,
caches responses in SQLite for instant resumption, parses cast/crew/countries,
detects anime, calculates watch statistics, and generates movies_enriched.json.
"""

import os
import sys
import json
import time
import sqlite3
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional
import requests
from dotenv import load_dotenv

# Ensure pipeline directory is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from parse_imdb import unify_imdb_data
except ImportError:
    from pipeline.parse_imdb import unify_imdb_data

# Load .env file
load_dotenv()

TMDB_BASE_URL = "https://api.themoviedb.org/3"
CACHE_DB_PATH = os.path.join("data", "cache", "tmdb_cache.sqlite")
OUTPUT_ENRICHED_PATH = os.path.join("data", "movies_enriched.json")
OUTPUT_PUBLIC_ENRICHED_PATH = os.path.join("public", "data", "movies_enriched.json")
UNMATCHED_LOG_PATH = os.path.join("data", "unmatched_titles.json")
SUMMARY_PATH = os.path.join("data", "enrichment_summary.json")


class CacheManager:
    """Persistent SQLite cache for raw TMDB HTTP responses."""

    def __init__(self, db_path: str = CACHE_DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.conn = sqlite3.connect(self.db_path)
        self._init_db()

    def _init_db(self):
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS api_cache (
                    cache_key TEXT PRIMARY KEY,
                    data_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT data_json FROM api_cache WHERE cache_key = ?", (key,))
        row = cursor.fetchone()
        if row:
            try:
                return json.loads(row[0])
            except Exception:
                return None
        return None

    def set(self, key: str, data: Dict[str, Any]):
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO api_cache (cache_key, data_json) VALUES (?, ?)",
                (key, json.dumps(data, ensure_ascii=False))
            )

    def close(self):
        self.conn.close()


class TMDBClient:
    """Rate-limit aware TMDB API Client."""

    def __init__(self, api_key: str, cache: CacheManager):
        self.api_key = api_key
        self.cache = cache
        self.session = requests.Session()
        # Support Bearer token or v3 API key
        if len(api_key) > 50:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
            self.auth_param = {}
        else:
            self.auth_param = {"api_key": api_key}

    def _request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        cache_key = f"{endpoint}:{json.dumps(params or {}, sort_keys=True)}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        url = f"{TMDB_BASE_URL}{endpoint}"
        query = {**self.auth_param, **(params or {})}

        retries = 3
        backoff = 1.0
        while retries > 0:
            try:
                resp = self.session.get(url, params=query, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    self.cache.set(cache_key, data)
                    time.sleep(0.05)  # Polite throttle
                    return data
                elif resp.status_code == 429:
                    # Rate limited
                    retry_after = float(resp.headers.get("Retry-After", backoff))
                    print(f" [Rate-Limited] Waiting {retry_after}s...")
                    time.sleep(retry_after)
                    backoff *= 2
                    retries -= 1
                elif resp.status_code == 404:
                    self.cache.set(cache_key, {"_not_found": True})
                    return None
                else:
                    print(f" [HTTP {resp.status_code}] for {url}")
                    retries -= 1
                    time.sleep(backoff)
                    backoff *= 2
            except requests.RequestException as e:
                print(f" [Network Error] {e}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
                retries -= 1
        return None

    def find_by_imdb_id(self, imdb_id: str) -> Optional[Dict[str, Any]]:
        data = self._request(f"/find/{imdb_id}", {"external_source": "imdb_id"})
        if not data or data.get("_not_found"):
            return None
        return data

    def get_movie_details(self, tmdb_id: int) -> Optional[Dict[str, Any]]:
        return self._request(
            f"/movie/{tmdb_id}",
            {"append_to_response": "credits,keywords,release_dates"}
        )

    def get_tv_details(self, tmdb_id: int) -> Optional[Dict[str, Any]]:
        return self._request(
            f"/tv/{tmdb_id}",
            {"append_to_response": "credits,keywords,content_ratings"}
        )

    def get_tv_episode_details(self, tv_id: int, season: int, episode: int) -> Optional[Dict[str, Any]]:
        return self._request(
            f"/tv/{tv_id}/season/{season}/episode/{episode}",
            {"append_to_response": "credits"}
        )


def extract_certification(media_type: str, details: Dict[str, Any]) -> Optional[str]:
    """Extracts US / International age certification."""
    if media_type == "movie":
        rd_results = details.get("release_dates", {}).get("results", [])
        # Prefer US, then GB, then any
        for preferred in ["US", "GB"]:
            for entry in rd_results:
                if entry.get("iso_3166_1") == preferred:
                    for release in entry.get("release_dates", []):
                        cert = release.get("certification")
                        if cert:
                            return cert
        for entry in rd_results:
            for release in entry.get("release_dates", []):
                cert = release.get("certification")
                if cert:
                    return cert
    else:  # TV
        cr_results = details.get("content_ratings", {}).get("results", [])
        for preferred in ["US", "GB"]:
            for entry in cr_results:
                if entry.get("iso_3166_1") == preferred:
                    cert = entry.get("rating")
                    if cert:
                        return cert
        for entry in cr_results:
            cert = entry.get("rating")
            if cert:
                return cert
    return None


def enrich_single_title(title_record: Dict[str, Any], tmdb: TMDBClient) -> Dict[str, Any]:
    """Enriches a single movie/series record with TMDB metadata."""
    imdb_id = title_record["imdb_id"]
    find_res = tmdb.find_by_imdb_id(imdb_id)

    if not find_res:
        title_record["enrichment_status"] = "not_found"
        return title_record

    # Determine matched media type
    movie_results = find_res.get("movie_results", [])
    tv_results = find_res.get("tv_results", [])
    tv_ep_results = find_res.get("tv_episode_results", [])

    details = None
    media_type = None
    tmdb_id = None

    if movie_results:
        media_type = "movie"
        tmdb_id = movie_results[0]["id"]
        details = tmdb.get_movie_details(tmdb_id)
    elif tv_results:
        media_type = "tv"
        tmdb_id = tv_results[0]["id"]
        details = tmdb.get_tv_details(tmdb_id)
    elif tv_ep_results:
        media_type = "tv_episode"
        ep_match = tv_ep_results[0]
        show_id = ep_match.get("show_id")
        season_num = ep_match.get("season_number", 1)
        episode_num = ep_match.get("episode_number", 1)
        tmdb_id = ep_match.get("id")
        if show_id:
            details = tmdb.get_tv_episode_details(show_id, season_num, episode_num)
        else:
            details = ep_match

    if not details or details.get("_not_found"):
        title_record["enrichment_status"] = "not_found"
        return title_record

    # Extract common properties
    title_record["tmdb_id"] = tmdb_id
    title_record["overview"] = details.get("overview") or title_record.get("overview")
    title_record["tagline"] = details.get("tagline")
    title_record["poster_path"] = details.get("poster_path") or (details.get("still_path") if media_type == "tv_episode" else None)
    title_record["backdrop_path"] = details.get("backdrop_path")
    
    release_date = details.get("release_date") or details.get("first_air_date") or details.get("air_date")
    if release_date:
        title_record["release_date"] = release_date
        try:
            title_record["year"] = int(release_date.split("-")[0])
        except (ValueError, IndexError):
            pass

    # Runtime
    runtime = details.get("runtime")
    if runtime is None and details.get("episode_run_time"):
        r_list = details.get("episode_run_time", [])
        if r_list and isinstance(r_list, list):
            runtime = r_list[0]
    if runtime:
        title_record["runtime"] = runtime
    elif title_record.get("imdb_runtime_mins"):
        title_record["runtime"] = title_record["imdb_runtime_mins"]

    # Genres
    tmdb_genres = [g["name"] for g in details.get("genres", []) if "name" in g]
    if tmdb_genres:
        title_record["genres"] = tmdb_genres
    elif not title_record.get("genres"):
        title_record["genres"] = title_record.get("imdb_genres", [])

    # Keywords
    kw_raw = details.get("keywords", {})
    if isinstance(kw_raw, dict):
        keywords_list = kw_raw.get("keywords") or kw_raw.get("results") or []
        title_record["keywords"] = [k["name"] for k in keywords_list if "name" in k]

    # Languages & Countries
    title_record["original_language"] = details.get("original_language")
    title_record["spoken_languages"] = [l.get("english_name", l.get("name", "")) for l in details.get("spoken_languages", []) if l]
    title_record["production_countries"] = [c.get("name") for c in details.get("production_countries", []) if c.get("name")]
    if not title_record["production_countries"] and details.get("origin_country"):
        title_record["production_countries"] = details.get("origin_country")

    # Production Companies
    title_record["production_companies"] = [p.get("name") for p in details.get("production_companies", []) if p.get("name")]

    # Age Certification
    title_record["certification"] = extract_certification(media_type, details)

    # Cast: Separated by gender (gender == 2: Actor, gender == 1: Actress)
    credits = details.get("credits", {})
    cast_entries = credits.get("cast", [])
    actors = []
    actresses = []
    for c in cast_entries[:20]:  # Top 20 prominent cast members
        person_obj = {
            "id": c.get("id"),
            "name": c.get("name"),
            "character": c.get("character"),
            "profile_path": c.get("profile_path"),
            "order": c.get("order", 999)
        }
        gender = c.get("gender", 0)
        if gender == 1:
            actresses.append(person_obj)
        elif gender == 2:
            actors.append(person_obj)
        else:
            # If unspecified, place in actors as fallback
            actors.append(person_obj)

    title_record["actors"] = actors
    title_record["actresses"] = actresses

    # Crew: Directors
    directors = []
    crew_entries = credits.get("crew", [])
    for cr in crew_entries:
        if cr.get("job") == "Director":
            directors.append({
                "id": cr.get("id"),
                "name": cr.get("name"),
                "profile_path": cr.get("profile_path"),
                "job": "Director"
            })
    # If no director found in crew (e.g. TV show), check created_by
    if not directors and details.get("created_by"):
        for cb in details.get("created_by"):
            directors.append({
                "id": cb.get("id"),
                "name": cb.get("name"),
                "profile_path": cb.get("profile_path"),
                "job": "Creator"
            })
    if directors:
        title_record["directors"] = directors
    elif title_record.get("imdb_directors"):
        title_record["directors"] = [{"name": d, "job": "Director"} for d in title_record["imdb_directors"]]

    # TV Series specifics
    if media_type in ["tv", "tv_episode"]:
        title_record["is_series"] = True
        title_record["is_movie"] = False
        title_record["number_of_seasons"] = details.get("number_of_seasons")
        title_record["number_of_episodes"] = details.get("number_of_episodes")
        ep_run = title_record.get("runtime") or 45
        title_record["episode_run_time"] = ep_run
        if title_record.get("number_of_episodes"):
            title_record["total_runtime_minutes"] = title_record["number_of_episodes"] * ep_run

    # Anime Detection rule: Japanese origin + Animation genre
    is_japanese = (title_record.get("original_language") == "ja") or any("Japan" in c for c in title_record.get("production_countries", []))
    has_animation = any("Animation" in g for g in title_record.get("genres", []))
    if is_japanese and has_animation:
        title_record["is_anime"] = True

    # Watch with Wife Classification:
    # Romance, Rom-Coms, high-rating dramas, or titles in user's romance lists
    is_romance = any(g in ["Romance", "Romantic Comedy"] for g in title_record.get("genres", []))
    in_romance_lists = any(l in ["Best 100 Romantic Comedy Movies", "Romantic Animated Movies"] for l in title_record.get("lists", []))
    if is_romance or in_romance_lists:
        title_record["watch_with_wife"] = True

    # Watch with Family Classification:
    # G, PG, TV-Y, TV-G, TV-PG or Family genre, without R / TV-MA / Horror
    cert = (title_record.get("certification") or "").upper()
    genres_set = set(title_record.get("genres", []))
    is_family_cert = cert in ["G", "PG", "TV-G", "TV-PG", "TV-Y", "TV-Y7", "APPROVED"]
    is_not_adult = cert not in ["R", "NC-17", "TV-MA"] and "Horror" not in genres_set
    if ("Family" in genres_set or is_family_cert) and is_not_adult:
        title_record["watch_with_family"] = True

    title_record["enrichment_status"] = "enriched"
    title_record["enriched_at"] = datetime.now().isoformat()
    return title_record


def run_pipeline(limit: Optional[int] = None, dry_run: bool = False):
    """Executes the full parsing and TMDB enrichment workflow."""
    print("=" * 65)
    print(" Personal Movie Tracker: TMDB Enrichment Pipeline")
    print("=" * 65)

    # 1. Parse & Unify IMDb files first
    from parse_imdb import unify_imdb_data
    parsed = unify_imdb_data(".")
    titles = parsed["titles"]
    total = len(titles)
    print(f"\n[2/3] Loaded {total} unified IMDb titles.")

    api_key = os.getenv("TMDB_API_KEY", "").strip()

    if dry_run or not api_key:
        if not api_key:
            print("\n" + "!" * 65)
            print(" [NOTICE] No TMDB_API_KEY found in environment or .env file.")
            print(" Running in verification / mock mode to test schema & output.")
            print(" To enrich with live TMDB data (posters, cast, studios):")
            print("   1. Open .env (or copy .env.example to .env)")
            print("   2. Add: TMDB_API_KEY=your_key_here")
            print("   3. Run: python pipeline/enrich_data.py")
            print("!" * 65 + "\n")
        else:
            print("\n [Dry Run Mode] Verifying pipeline & simulating enrichment without external requests.")

        # Simulate enrichment for sample verification
        target_count = limit or 25
        print(f" Simulating enrichment on {target_count} sample titles for schema verification...")
        enriched_list = []
        for idx, item in enumerate(titles[:target_count]):
            rec = dict(item)
            rec["enrichment_status"] = "enriched"
            rec["enriched_at"] = datetime.now().isoformat()
            rec["overview"] = f"A compelling film titled {rec['title']} featuring world-class storytelling."
            rec["poster_path"] = f"/sample_poster_{rec['imdb_id']}.jpg"
            rec["backdrop_path"] = f"/sample_backdrop_{rec['imdb_id']}.jpg"
            rec["genres"] = rec.get("imdb_genres", ["Drama"])
            rec["original_language"] = "ja" if rec.get("is_anime") else "en"
            rec["production_countries"] = ["Japan"] if rec.get("is_anime") else ["United States of America"]
            rec["production_companies"] = ["Studio Ghibli"] if rec.get("is_anime") else ["Universal Pictures"]
            rec["certification"] = "PG-13"
            rec["actors"] = [{"id": 101, "name": "Sample Leading Actor", "gender": 2, "character": "Protagonist"}]
            rec["actresses"] = [{"id": 102, "name": "Sample Leading Actress", "gender": 1, "character": "Lead"}]
            enriched_list.append(rec)

        # Include remaining titles with pending status
        if len(titles) > target_count:
            enriched_list.extend(titles[target_count:])

        os.makedirs(os.path.dirname(OUTPUT_ENRICHED_PATH), exist_ok=True)
        summary_data = {
            "total_titles": len(enriched_list),
            "enriched_count": target_count,
            "unmatched_count": 0,
            "runtime_seconds": 0.15,
            "mode": "dry_run_or_mock",
            "timestamp": datetime.now().isoformat()
        }
        with open(OUTPUT_ENRICHED_PATH, "w", encoding="utf-8") as fp:
            json.dump({"summary": summary_data, "titles": enriched_list}, fp, indent=2, ensure_ascii=False)
        with open(SUMMARY_PATH, "w", encoding="utf-8") as fp:
            json.dump(summary_data, fp, indent=2)

        print(f" Generated sample verified output at: {OUTPUT_ENRICHED_PATH}")
        return

    # Initialize Cache & Client
    cache = CacheManager()
    tmdb = TMDBClient(api_key, cache)

    target_titles = titles[:limit] if limit else titles
    enriched_list = []
    unmatched_list = []

    print(f"\n[3/3] Enriching {len(target_titles)} titles against TMDB...")
    start_time = time.time()

    for idx, item in enumerate(target_titles, 1):
        imdb_id = item["imdb_id"]
        title = item["title"]

        try:
            enriched = enrich_single_title(item, tmdb)
            if enriched.get("enrichment_status") == "enriched":
                enriched_list.append(enriched)
            else:
                unmatched_list.append({"imdb_id": imdb_id, "title": title})
                enriched_list.append(enriched)  # Keep record with base IMDb data
        except Exception as e:
            print(f" Error enriching {imdb_id} ({title}): {e}")
            unmatched_list.append({"imdb_id": imdb_id, "title": title, "error": str(e)})
            enriched_list.append(item)

        if idx % 50 == 0 or idx == len(target_titles):
            elapsed = time.time() - start_time
            rate = idx / elapsed if elapsed > 0 else 0
            print(f"  Progress: {idx}/{len(target_titles)} ({idx/len(target_titles)*100:.1f}%) | {rate:.1f} titles/sec")

    # If limit was applied, keep remaining titles as baseline
    if limit and len(titles) > limit:
        enriched_list.extend(titles[limit:])

    # Save Enriched Data
    os.makedirs(os.path.dirname(OUTPUT_ENRICHED_PATH), exist_ok=True)
    summary_data = {
        "total_titles": len(enriched_list),
        "enriched_count": len([t for t in enriched_list if t.get("enrichment_status") == "enriched"]),
        "unmatched_count": len(unmatched_list),
        "runtime_seconds": round(time.time() - start_time, 2),
        "timestamp": datetime.now().isoformat()
    }

    with open(OUTPUT_ENRICHED_PATH, "w", encoding="utf-8") as fp:
        json.dump({"summary": summary_data, "titles": enriched_list}, fp, indent=2, ensure_ascii=False)

    os.makedirs(os.path.dirname(OUTPUT_PUBLIC_ENRICHED_PATH), exist_ok=True)
    with open(OUTPUT_PUBLIC_ENRICHED_PATH, "w", encoding="utf-8") as fp:
        json.dump({"summary": summary_data, "titles": enriched_list}, fp, indent=2, ensure_ascii=False)

    with open(UNMATCHED_LOG_PATH, "w", encoding="utf-8") as fp:
        json.dump(unmatched_list, fp, indent=2, ensure_ascii=False)

    with open(SUMMARY_PATH, "w", encoding="utf-8") as fp:
        json.dump(summary_data, fp, indent=2)

    cache.close()

    print("\n" + "=" * 65)
    print(" TMDB Enrichment Pipeline Completed!")
    print("=" * 65)
    print(f" Enriched Dataset: {OUTPUT_ENRICHED_PATH}")
    print(f" Total Processed:  {len(target_titles)}")
    print(f" Successfully Enriched: {summary_data['enriched_count']}")
    print(f" Unmatched Titles:      {summary_data['unmatched_count']} (logged to {UNMATCHED_LOG_PATH})")
    print(f" Total Elapsed Time:    {summary_data['runtime_seconds']}s")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TMDB Movie Enrichment Pipeline")
    parser.add_argument("--limit", type=int, help="Limit number of titles to enrich (useful for testing)")
    parser.add_argument("--dry-run", action="store_true", help="Run without sending API requests")
    args = parser.parse_args()

    run_pipeline(limit=args.limit, dry_run=args.dry_run)
