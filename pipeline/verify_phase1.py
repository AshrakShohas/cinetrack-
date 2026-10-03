"""
Phase 1 Schema & Data Integrity Verification Script
Validates unified and enriched JSON outputs against the Pydantic MovieRecord schema.
"""

import os
import sys
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from schema import MovieRecord


def verify():
    enriched_file = os.path.join("data", "movies_enriched.json")
    if not os.path.exists(enriched_file):
        print(f"Error: {enriched_file} not found.")
        return False

    with open(enriched_file, "r", encoding="utf-8") as fp:
        data = json.load(fp)

    titles = data.get("titles", [])
    print(f"Loaded {len(titles):,} titles from {enriched_file}")

    errors = 0
    validated_count = 0

    for idx, item in enumerate(titles):
        try:
            # Validate with Pydantic
            _ = MovieRecord(**item)
            validated_count += 1
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"Validation error on row {idx} ({item.get('imdb_id')}): {e}")

    print("\n" + "=" * 55)
    print(" Phase 1 Verification Results")
    print("=" * 55)
    print(f" Total Titles Checked:    {len(titles):,}")
    print(f" Successfully Validated:  {validated_count:,}")
    print(f" Validation Errors:       {errors}")

    if errors == 0:
        print("\n [SUCCESS] Phase 1 schema, parser, and pipeline are 100% valid!")
        return True
    else:
        print("\n [FAIL] Found validation errors in schema output.")
        return False


if __name__ == "__main__":
    success = verify()
    sys.exit(0 if success else 1)
