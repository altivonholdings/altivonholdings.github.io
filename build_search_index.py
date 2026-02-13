#!/usr/bin/env python3
"""
Build search-index.json for Altivon Holdings static site.
Scans all .html files, extracts title, meta description, and text content.
"""

import os
import json
import re
from bs4 import BeautifulSoup

SITE_URL = "https://altivonholdings.github.io"
EXCLUDE = ["privacy.html", "google*.html"]  # add any pages to skip

def should_include(filepath):
    filename = os.path.basename(filepath)
    if filename.startswith("google") or filename == "privacy.html":
        return False
    return filename.endswith(".html")

def extract_text(soup):
    # Remove script/style tags
    for script in soup(["script", "style", "nav", "footer", "header"]):
        script.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return re.sub(r'\s+', ' ', text)[:2000]  # limit length

def build_index():
    index = []
    for root, dirs, files in os.walk("."):
        for file in files:
            if not should_include(file):
                continue
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, "html.parser")

            # Title
            title_tag = soup.find("title")
            title = title_tag.string if title_tag else file

            # Meta description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            excerpt = meta_desc["content"] if meta_desc else ""

            # URL (relative → absolute)
            rel_url = path.lstrip("./").replace("\\", "/")
            if rel_url == "index.html":
                url = SITE_URL + "/"
            else:
                url = f"{SITE_URL}/{rel_url}"

            # Main text content (for searching)
            content = extract_text(soup)

            index.append({
                "title": title,
                "url": url,
                "excerpt": excerpt[:200],
                "content": content
            })
    return index

if __name__ == "__main__":
    data = build_index()
    os.makedirs("js", exist_ok=True)
    with open("js/search-index.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ search-index.json generated with {len(data)} entries.")