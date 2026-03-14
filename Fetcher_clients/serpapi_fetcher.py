import os
import time
import csv
from typing import List, Dict, Any
from serpapi import GoogleSearch
from dotenv import load_dotenv

load_dotenv()

# ---------- API Configuration ----------
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# ---------- Target Configuration ----------
LOCATIONS = ["Chandauli, Uttar Pradesh", "Mirzapur, Uttar Pradesh",
             "Varanasi, Uttar Pradesh", "Sonbhadra, Uttar Pradesh"]

CATEGORIES = [
    "Private Schools", "Coaching Institutes", "Hospitals", "Private Clinics",
    "Diagnostic Centers", "Water Parks", "Resorts", "Hotels", "Restaurants",
    "Cafes", "Event Management Companies", "Banquet Halls", "Real Estate Agencies",
    "Jewellery Shops", "Car Showrooms", "Gyms", "Fitness Centers"
]

EXCLUDE_KEYWORDS = ["kirana", "paan", "street vendor", "small shop"]

# ------------------------------------------------------------
# Google Maps Search via SerpAPI
# ------------------------------------------------------------
def search_google_maps(location: str, category: str) -> List[Dict[str, Any]]:
    """Search for businesses on Google Maps using SerpAPI."""
    params = {
        "api_key": SERPAPI_KEY,
        "engine": "google_maps",
        "type": "search",
        "q": f"{category} in {location}",
        "google_domain": "google.co.in",
        "gl": "in",
        "hl": "en",
        "num": 20
    }

    print(f"  🔍 Searching: {category} in {location}")
    search = GoogleSearch(params)
    try:
        results = search.get_dict()
        if "error" in results:
            print(f"    ❌ SerpAPI error: {results['error']}")
            return []
    except Exception as e:
        print(f"    ❌ Exception during search: {e}")
        return []

    businesses = []
    if "local_results" in results:
        for place in results["local_results"]:
            biz = {
                "name": place.get("title"),
                "category": category,
                "location": location,
                "phone": place.get("phone"),
                "website": place.get("website"),
                "rating": place.get("rating"),
                "reviews": place.get("reviews"),
                "address": place.get("address"),
                "hours": place.get("hours"),
                "gps_coordinates": place.get("gps_coordinates"),
                "data_id": place.get("data_id")
            }
            # Skip unwanted keywords
            if biz["name"] and any(kw in biz["name"].lower() for kw in EXCLUDE_KEYWORDS):
                continue
            businesses.append(biz)
    else:
        print(f"    ⚠️ No 'local_results' in response. Keys: {list(results.keys())}")

    time.sleep(1)  # Respect rate limits
    return businesses

# ------------------------------------------------------------
# Save to CSV
# ------------------------------------------------------------
def save_to_csv(businesses: List[Dict[str, Any]], filename: str = "raw_businesses.csv"):
    """Save all fetched businesses to a CSV file."""
    if not businesses:
        print("No businesses to save.")
        return

    fieldnames = ["name", "category", "location", "phone", "website", "rating", "reviews",
                  "address", "hours", "gps_coordinates", "data_id"]

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for biz in businesses:
            row = {field: biz.get(field, "") for field in fieldnames}
            writer.writerow(row)

    print(f"\n✅ Saved {len(businesses)} businesses to {filename}")

# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
def main():
    all_businesses = []

    print("Starting business search...")
    total_searches = len(LOCATIONS) * len(CATEGORIES)
    search_count = 0

    for loc in LOCATIONS:
        for cat in CATEGORIES:
            search_count += 1
            print(f"[{search_count}/{total_searches}]")
            results = search_google_maps(loc, cat)
            all_businesses.extend(results)

    print(f"\nTotal businesses fetched: {len(all_businesses)}")

    # Save to CSV
    save_to_csv(all_businesses, "raw_businesses.csv")

    # Optional: print first few as sample
    if all_businesses:
        print("\n--- Sample of first 5 businesses ---")
        for i, biz in enumerate(all_businesses[:5], 1):
            print(f"{i}. {biz.get('name')} ({biz.get('category')}) - {biz.get('phone')}")

if __name__ == "__main__":
    print(f"SERPAPI_KEY: {SERPAPI_KEY[:5]}...{SERPAPI_KEY[-5:]}")
    main()