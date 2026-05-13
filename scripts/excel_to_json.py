"""
Reads the Excel data file and writes it as JSON to web/public/data.json
so the React app can consume it at runtime.

Usage (from repo root with venv active):
  python scripts/excel_to_json.py
"""

import json
import math
import pathlib
import pandas as pd

REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
EXCEL_PATH = REPO_ROOT / "migraine_ui" / "Migraine Study_Table 4.xlsx"
OUT_PATH = REPO_ROOT / "web" / "public" / "data.json"


def extract_raw(value):
    """Return the integer before the first space/parenthesis, or None."""
    if not isinstance(value, str):
        return None
    raw = value.split("(")[0].strip().replace(",", "")
    try:
        return int(raw)
    except ValueError:
        return None


def sanitize(v):
    """Convert float NaN/Inf to None so json.dumps produces valid JSON."""
    if isinstance(v, float) and not math.isfinite(v):
        return None
    return v


# Mojibake in the source Excel — map to correct Unicode names
COUNTRY_NAME_FIXES = {
    "C√\xa5te d’Ivoire": "C\xf4te d’Ivoire",
    "T√\xbarkiye": "T\xfcrkiye",
    "Bolivia ": "Bolivia",
}


def main():
    df = pd.read_excel(EXCEL_PATH, engine="openpyxl")
    records = [{k: sanitize(v) for k, v in row.items()}
               for row in df.to_dict(orient="records")]

    for row in records:
        row["Country"] = COUNTRY_NAME_FIXES.get(row["Country"], row["Country"])
        row["Surgery Eligible Cases Raw"] = extract_raw(row.get("Surgery Eligible Cases"))
        row["DALYs Surgery Eligible Cases Raw"] = extract_raw(row.get("DALYs Surgery Eligible Cases"))
        cost = row.get("Total Cost USD")
        if cost is not None:
            row["Total Cost USD"] = int(round(cost))

    OUT_PATH.write_text(json.dumps(records, indent=2, default=str))
    print(f"Wrote {len(records)} rows → {OUT_PATH}")


if __name__ == "__main__":
    main()
