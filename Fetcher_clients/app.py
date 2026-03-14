import os
import time
import json
import requests
import csv
from typing import List, Dict, Any
from serpapi import GoogleSearch
from dotenv import load_dotenv

load_dotenv()

# ---------- API Configuration ----------
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-4o-mini"  # or any model from OpenRouter

YOUR_SITE_URL = "https://altivonholdings.github.io"  # optional
YOUR_APP_NAME = "LeadGen AI Agent"

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
# 1. Google Maps Search via SerpAPI (Corrected)
# ------------------------------------------------------------
def search_google_maps(location: str, category: str) -> List[Dict[str, Any]]:
    """Search for businesses on Google Maps using SerpAPI."""
    params = {
        "api_key": SERPAPI_KEY,
        "engine": "google_maps",
        "type": "search",
        "q": f"{category} in {location}",
        "google_domain": "google.co.in",  # or "google.com"
        "gl": "in",                        # country
        "hl": "en",                         # language
        "num": 20                            # max results
        # "ll" parameter removed – it was causing issues
    }

    print(f"🔍 Searching: {category} in {location}")
    search = GoogleSearch(params)
    try:
        results = search.get_dict()
        # Check for API errors
        if "error" in results:
            print(f"❌ SerpAPI error: {results['error']}")
            return []
    except Exception as e:
        print(f"❌ Exception during search: {e}")
        return []

    businesses = []
    if "local_results" in results:
        for place in results["local_results"]:
            # Basic fields – add more if needed
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
        print(f"⚠️ No 'local_results' in response. Full response keys: {list(results.keys())}")

    time.sleep(1)  # Respect rate limits
    return businesses

# ------------------------------------------------------------
# 2. LLM Analysis via OpenRouter
# ------------------------------------------------------------
def analyze_business(business: Dict[str, Any]) -> Dict[str, Any]:
    """Use OpenRouter API to evaluate business potential."""
    prompt = f"""
You are a professional B2B lead researcher. Analyze the following business and decide if it needs a new or improved website.

Business Details:
- Name: {business.get('name')}
- Category: {business.get('category')}
- Location: {business.get('location')}
- Has website? {'Yes' if business.get('website') else 'No'}
- Google Rating: {business.get('rating')}
- Number of Reviews: {business.get('reviews')}
- Phone available? {'Yes' if business.get('phone') else 'No'}

High‑Priority Criteria (businesses with strong growth potential):
- 50+ Google reviews
- Active customers (implied by reviews)
- Physical presence
- Legitimate business
- Website would generate real revenue or improve operations (booking, credibility, visibility)

Skip:
- Small kirana stores, paan shops, street vendors, very small rural shops with no digital presence, businesses with low customer traffic.

Also consider:
- If they have only an Instagram page or JustDial listing but no website → immediate opportunity.
- If they have a broken website or no booking form → immediate opportunity.

Return a JSON object with the following fields:
- "needs_website": true/false
- "priority": "High" / "Medium" / "Low"
- "reasoning": short explanation why they need (or don't need) a website
- "has_online_presence": "none" / "social_only" / "basic_website" / "good_website"

Only include businesses that need a website in the final output. If they don't need a website, set needs_website to false.
"""

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    if YOUR_SITE_URL:
        headers["HTTP-Referer"] = YOUR_SITE_URL
    if YOUR_APP_NAME:
        headers["X-Title"] = YOUR_APP_NAME

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        assistant_message = data["choices"][0]["message"]["content"]
        result = json.loads(assistant_message)
        business.update(result)
        return business
    except Exception as e:
        print(f"Error analyzing {business.get('name')}: {e}")
        business["needs_website"] = False
        business["priority"] = "Low"
        business["reasoning"] = "Analysis failed"
        business["has_online_presence"] = "unknown"
        return business

# ------------------------------------------------------------
# 3. Generate Outreach Message
# ------------------------------------------------------------
def generate_outreach(business: Dict[str, Any]) -> str:
    """Generate custom outreach message based on business category."""
    category = business.get('category', '').lower()
    name = business.get('name', 'the business')
    location = business.get('location', '')

    pitch_intro = f"Hello {name},\n\nI noticed that {name} in {location} is doing well"
    if business.get('reviews') and business['reviews'] > 50:
        pitch_intro += f" with {business['reviews']} great reviews"

    if 'school' in category or 'coaching' in category:
        pitch = f"{pitch_intro}. A professional website would help you attract more students, showcase your results, and even accept online admissions. Parents today search online before choosing an institute."
    elif 'hospital' in category or 'clinic' in category or 'diagnostic' in category:
        pitch = f"{pitch_intro}. A website with online appointment booking would make it easier for patients to reach you, and you can share health tips and services to build trust."
    elif 'restaurant' in category or 'cafe' in category or 'water park' in category or 'resort' in category or 'hotel' in category:
        pitch = f"{pitch_intro}. A website with menu, photo gallery, and online table/room booking can directly increase your reservations and walk‑ins."
    elif 'event' in category or 'banquet' in category:
        pitch = f"{pitch_intro}. A professional site showcasing your past events, packages, and an enquiry form would help you convert more clients."
    elif 'real estate' in category:
        pitch = f"{pitch_intro}. List your properties online with a website that includes property listings, virtual tours, and contact forms – serious buyers expect this."
    elif 'jewellery' in category:
        pitch = f"{pitch_intro}. An elegant website to display your collections, store hours, and contact information would build credibility and attract more customers."
    elif 'car showroom' in category:
        pitch = f"{pitch_intro}. A website with inventory, test drive booking, and special offers can generate high‑quality leads."
    elif 'gym' in category or 'fitness' in category:
        pitch = f"{pitch_intro}. A site with membership plans, class schedules, and online sign‑ups would help you grow your member base."
    else:
        pitch = f"{pitch_intro}. A modern website would help you establish a stronger online presence, attract more customers, and streamline operations."

    pitch += "\n\nI specialize in creating affordable, high‑performing websites for local businesses. Would you be open to a quick chat this week?\n\nBest regards,\nYour Web Agency"
    return pitch

# ------------------------------------------------------------
# 4. Print Table (without pandas)
# ------------------------------------------------------------
def print_table(leads: List[Dict[str, Any]]):
    """Print a formatted table of leads."""
    if not leads:
        print("No leads to display.")
        return

    # Define columns and their widths (approx)
    headers = ["Name", "Category", "Location", "Phone", "Website", "Rating", "Reviews", "Priority"]
    col_widths = [30, 20, 20, 15, 30, 8, 8, 10]

    # Function to truncate text
    def truncate(text, width):
        text = str(text) if text is not None else ""
        return text if len(text) <= width else text[:width-3] + "..."

    # Print header
    header_line = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
    print(header_line)
    print("-" * len(header_line))

    # Print rows
    for biz in leads:
        row = [
            truncate(biz.get("name", ""), col_widths[0]),
            truncate(biz.get("category", ""), col_widths[1]),
            truncate(biz.get("location", ""), col_widths[2]),
            truncate(biz.get("phone", ""), col_widths[3]),
            truncate(biz.get("website", ""), col_widths[4]),
            truncate(biz.get("rating", ""), col_widths[5]),
            truncate(biz.get("reviews", ""), col_widths[6]),
            truncate(biz.get("priority", ""), col_widths[7]),
        ]
        print(" | ".join(r.ljust(w) for r, w in zip(row, col_widths)))

# ------------------------------------------------------------
# 5. Save to CSV
# ------------------------------------------------------------
def save_to_csv(leads: List[Dict[str, Any]], filename: str = "leads.csv"):
    """Save leads to a CSV file."""
    if not leads:
        return

    fieldnames = ["name", "category", "location", "phone", "website", "rating", "reviews",
                  "priority", "reasoning", "has_online_presence", "outreach_message"]

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for lead in leads:
            row = {field: lead.get(field, "") for field in fieldnames}
            writer.writerow(row)

    print(f"\n✅ Leads saved to {filename}")

# ------------------------------------------------------------
# 6. Main Workflow
# ------------------------------------------------------------
def main():
    all_businesses = []

    print("Starting business search...")
    for loc in LOCATIONS:
        for cat in CATEGORIES:
            print(f"Searching {cat} in {loc}...")
            results = search_google_maps(loc, cat)
            all_businesses.extend(results)

    print(f"Total businesses found before filtering: {len(all_businesses)}")

    print("\nAnalyzing each business with AI...")
    analyzed = []
    for biz in all_businesses:
        analyzed_biz = analyze_business(biz)
        if analyzed_biz.get("needs_website"):
            if analyzed_biz.get("priority") in ["High", "Medium"]:
                analyzed_biz["outreach_message"] = generate_outreach(analyzed_biz)
            analyzed.append(analyzed_biz)
        time.sleep(0.5)  # Avoid rate limits on OpenRouter

    if not analyzed:
        print("No businesses found that need a website.")
        return

    # Print summary table
    print("\n" + "="*80)
    print("LEADS SUMMARY")
    print("="*80)
    print_table(analyzed)

    # Save to CSV
    save_to_csv(analyzed, "leads.csv")

    # Print outreach messages separately
    print("\n" + "="*80)
    print("OUTREACH MESSAGES")
    print("="*80)
    for biz in analyzed:
        if "outreach_message" in biz and biz["outreach_message"]:
            print(f"\n--- {biz.get('name')} ({biz.get('priority')}) ---")
            print(biz["outreach_message"])

if __name__ == "__main__":
    # Optional: print keys for verification
    print(f"SERPAPI_KEY: {SERPAPI_KEY[:5]}...{SERPAPI_KEY[-5:]}")
    print(f"OPENROUTER_API_KEY: {OPENROUTER_API_KEY[:5]}...{OPENROUTER_API_KEY[-5:]}")
    main()