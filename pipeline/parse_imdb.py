"""
IMDb Export Parser & Unification Pipeline
Reads all IMDb CSV exports, handles encoding & dirty data, merges lists,
and creates a unified dataset ready for TMDB enrichment and React app consumption.
"""

import os
import glob
import csv
import json
import re
from datetime import datetime
from typing import Dict, Any, List

KNOWN_LIST_FILES = {
    "Your ratings.csv": "ratings",
    "ashraks's Watchlist.csv": "watchlist",
    "Movies You Can't Miss.csv": "Movies You Can't Miss",
    "Best 100 Romantic Comedy Movies.csv": "Best 100 Romantic Comedy Movies",
    "Anime Series List.csv": "Anime Series List",
    "Romantic Animated Movies.csv": "Romantic Animated Movies",
    "Best Tv Series I Watched So Far.csv": "Best Tv Series I Watched So Far",
}


def clean_str(val: Any) -> str:
    if val is None:
        return ""
    s = str(val).strip()
    return s


def parse_int(val: Any) -> Any:
    if val is None:
        return None
    s = clean_str(val)
    if not s:
        return None
    # Extract digits (handles cases like '2008' or '120 mins')
    m = re.search(r'\d+', s)
    return int(m.group(0)) if m else None


def parse_float(val: Any) -> Any:
    if val is None:
        return None
    s = clean_str(val)
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def parse_genres(val: Any) -> List[str]:
    if not val:
        return []
    s = clean_str(val)
    return [g.strip() for g in s.split(",") if g.strip()]


def parse_directors(val: Any) -> List[str]:
    if not val:
        return []
    s = clean_str(val)
    return [d.strip() for d in s.split(",") if d.strip()]


def read_csv_safely(filepath: str) -> List[Dict[str, str]]:
    """Reads CSV with robust encoding handling (UTF-8, UTF-8-SIG, Latin-1 fallback)."""
    encodings = ["utf-8-sig", "utf-8", "cp1252", "latin1"]
    for enc in encodings:
        try:
            with open(filepath, mode="r", encoding=enc, newline="") as fp:
                reader = csv.DictReader(fp)
                return list(reader)
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Warning reading {filepath} with {enc}: {e}")
            break
    # Fallback with replacement
    with open(filepath, mode="r", encoding="utf-8", errors="replace", newline="") as fp:
        return list(csv.DictReader(fp))


def normalize_title_type(raw_type: str) -> tuple[str, bool, bool, bool]:
    """
    Normalizes IMDb title type into standardized slug and category booleans.
    Returns: (title_type, is_movie, is_series, is_episode)
    """
    t = clean_str(raw_type).lower()
    if "episode" in t:
        return "tvEpisode", False, False, True
    elif "series" in t or "mini" in t:
        return "tvSeries" if "mini" not in t else "tvMiniSeries", False, True, False
    elif "movie" in t or "film" in t:
        return "tvMovie" if "tv" in t else "movie", True, False, False
    elif "short" in t:
        return "short", True, False, False
    elif "video" in t:
        return "video", True, False, False
    else:
        return "movie", True, False, False


def unify_imdb_data(folder_path: str = ".") -> Dict[str, Any]:
    """
    Scans all CSV files in the folder, parses them, handles duplicates and cross-list memberships,
    and produces a clean unified dataset.
    """
    csv_files = glob.glob(os.path.join(folder_path, "*.csv"))
    print(f"[1/3] Found {len(csv_files)} CSV files in {os.path.abspath(folder_path)}:")
    for f in csv_files:
        print(f"  - {os.path.basename(f)}")

    unified: Dict[str, Dict[str, Any]] = {}
    stats = {
        "files_parsed": len(csv_files),
        "total_rows_read": 0,
        "unique_titles": 0,
        "ratings_count": 0,
        "watchlist_count": 0,
        "lists_breakdown": {},
    }

    for fpath in csv_files:
        fname = os.path.basename(fpath)
        rows = read_csv_safely(fpath)
        stats["total_rows_read"] += len(rows)

        list_role = KNOWN_LIST_FILES.get(fname)
        if not list_role:
            # If a new list was added by the user
            list_role = os.path.splitext(fname)[0]

        is_ratings_file = "ratings" in fname.lower()
        is_watchlist_file = "watchlist" in fname.lower()
        is_custom_list = not is_ratings_file and not is_watchlist_file

        if is_custom_list:
            stats["lists_breakdown"][list_role] = len(rows)

        print(f"  Parsing '{fname}' ({len(rows)} rows) -> Type: {list_role}")

        for row in rows:
            const = clean_str(row.get("Const") or row.get("const") or row.get("IMDb ID"))
            if not const or not const.startswith("tt"):
                continue

            raw_title = clean_str(row.get("Title"))
            original_title = clean_str(row.get("Original Title")) or raw_title
            title_type, is_movie, is_series, is_episode = normalize_title_type(row.get("Title Type", ""))
            imdb_rating = parse_float(row.get("IMDb Rating"))
            num_votes = parse_int(row.get("Num Votes"))
            runtime_mins = parse_int(row.get("Runtime (mins)"))
            year = parse_int(row.get("Year"))
            genres = parse_genres(row.get("Genres"))
            directors = parse_directors(row.get("Directors"))
            your_rating = parse_float(row.get("Your Rating"))
            date_rated = clean_str(row.get("Date Rated"))
            created_date = clean_str(row.get("Created"))

            # Determine anime flag
            is_anime = False
            if list_role == "Anime Series List" or "Anime" in genres or "Animation" in genres:
                if any(x in raw_title.lower() for x in ["death note", "naruto", "bleach", "jujutsu", "demon slayer", "ghibli"]):
                    is_anime = True
                elif list_role == "Anime Series List":
                    is_anime = True

            # If not yet seen, initialize record
            if const not in unified:
                unified[const] = {
                    "imdb_id": const,
                    "tmdb_id": None,
                    "title": raw_title,
                    "original_title": original_title,
                    "title_type": title_type,
                    "is_anime": is_anime,
                    "is_series": is_series,
                    "is_movie": is_movie,
                    "is_episode": is_episode,
                    "your_rating": your_rating,
                    "date_rated": date_rated if date_rated else None,
                    "is_watched": False,
                    "is_watchlist": False,
                    "date_added_to_watchlist": None,
                    "lists": [],
                    "rewatch_count": 0,
                    "user_review": None,
                    "user_tags": [],
                    "watched_with": [],
                    "imdb_rating": imdb_rating,
                    "imdb_num_votes": num_votes,
                    "imdb_year": year,
                    "imdb_runtime_mins": runtime_mins,
                    "imdb_directors": directors,
                    "imdb_genres": genres,
                    "watch_with_wife": False,
                    "watch_with_family": False,
                    "enrichment_status": "pending",
                }

            record = unified[const]

            # Merge lists
            if is_custom_list and list_role not in record["lists"]:
                record["lists"].append(list_role)

            # Watchlist flag
            if is_watchlist_file:
                record["is_watchlist"] = True
                if created_date:
                    record["date_added_to_watchlist"] = created_date

            # Rating & Watched status
            if your_rating is not None:
                record["your_rating"] = your_rating
                record["is_watched"] = True
                if date_rated:
                    record["date_rated"] = date_rated

            if is_ratings_file:
                record["is_watched"] = True

            # If it was added to custom lists of watched titles
            if list_role in ["Movies You Can't Miss", "Best Tv Series I Watched So Far", "Best 100 Romantic Comedy Movies"]:
                if record["your_rating"] is not None or not record["is_watchlist"]:
                    record["is_watched"] = True

            if is_anime:
                record["is_anime"] = True

            # Pre-classify candidates for watch-with
            if "Romance" in genres or "Best 100 Romantic Comedy Movies" in record["lists"] or "Romantic Animated Movies" in record["lists"]:
                record["watch_with_wife"] = True
            if "Family" in genres or "Animation" in genres:
                record["watch_with_family"] = True

    # Compute overall stats
    watched_count = sum(1 for r in unified.values() if r["is_watched"])
    watchlist_count = sum(1 for r in unified.values() if r["is_watchlist"])
    movies_count = sum(1 for r in unified.values() if r["is_movie"])
    series_count = sum(1 for r in unified.values() if r["is_series"])
    anime_count = sum(1 for r in unified.values() if r["is_anime"])
    episodes_count = sum(1 for r in unified.values() if r["is_episode"])

    stats["unique_titles"] = len(unified)
    stats["total_watched"] = watched_count
    stats["total_watchlist"] = watchlist_count
    stats["total_movies"] = movies_count
    stats["total_series"] = series_count
    stats["total_anime"] = anime_count
    stats["total_episodes"] = episodes_count
    stats["generated_at"] = datetime.now().isoformat()

    return {
        "stats": stats,
        "titles": list(unified.values()),
    }


def main():
    print("=" * 60)
    print(" IMDb Data Parser & Unification Pipeline")
    print("=" * 60)

    result = unify_imdb_data(".")
    stats = result["stats"]

    os.makedirs("data", exist_ok=True)
    unified_path = os.path.join("data", "movies_unified.json")
    with open(unified_path, "w", encoding="utf-8") as fp:
        json.dump(result, fp, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print(" Parsing & Unification Complete!")
    print("=" * 60)
    print(f" Output written to: {unified_path}")
    print(f" Total Unique IMDb Titles:  {stats['unique_titles']:,}")
    print(f"   Watched Titles:          {stats['total_watched']:,}")
    print(f"   Watchlist Titles:        {stats['total_watchlist']:,}")
    print(f"   Feature Movies:          {stats['total_movies']:,}")
    print(f"   TV / Web Series:         {stats['total_series']:,}")
    print(f"   Anime Series / Movies:   {stats['total_anime']:,}")
    print(f"   Individual TV Episodes:  {stats['total_episodes']:,}")
    print("\n Custom Lists Breakdown:")
    for list_name, count in stats["lists_breakdown"].items():
        print(f"   - {list_name}: {count} titles")


if __name__ == "__main__":
    main()
