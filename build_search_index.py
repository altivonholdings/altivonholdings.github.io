#!/usr/bin/env python3
"""
Advanced search index builder for Altivon Holdings.
Extracts title, description, text content, and a representative image from each HTML file.
"""

import os
import json
import re
from urllib.parse import urljoin
from bs4 import BeautifulSoup

SITE_URL = "https://altivonholdings.github.io"
EXCLUDE_PATTERNS = ["privacy.html", "google*.html", "search/"]  # files/folders to skip
BASE_DIR = "."  # current directory

def should_include(filepath):
    """Return True if file should be included in index."""
    filename = os.path.basename(filepath)
    # skip by pattern
    for pat in EXCLUDE_PATTERNS:
        if pat.endswith(".html") and filename == pat:
            return False
        if pat.endswith("/") and filepath.startswith(pat):
            return False
        if "*" in pat:
            # simple wildcard: only for filenames
            if pat.replace("*", "") in filename:
                return False
    return filename.endswith(".html") and not filename.startswith("google")

def get_page_type(filepath):
    """Categorize page based on folder structure."""
    if "blogs/" in filepath:
        return "blog"
    if "portfolio/" in filepath:
        return "portfolio"
    if "templates/" in filepath:
        return "template"
    if filepath.endswith("services.html"):
        return "services"
    if filepath.endswith("about.html"):
        return "about"
    if filepath.endswith("contact.html"):
        return "contact"
    return "page"

def extract_first_image(soup, base_url):
    """Extract best image URL: og:image > first img with absolute src."""
    # Try Open Graph image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        return urljoin(base_url, og_image["content"])

    # Try first <img> with src
    img = soup.find("img", src=True)
    if img:
        src = img["src"]
        if src.startswith("http"):
            return src
        # make absolute
        return urljoin(base_url, src)

    # Fallback to logo or empty
    return urljoin(base_url, "/assets/images/logo.jpg")

def extract_text(soup):
    """Clean text from page (exclude scripts, styles, nav, footer)."""
    for elem in soup(["script", "style", "nav", "footer", "header"]):
        elem.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return re.sub(r'\s+', ' ', text)[:3000]  # limit length

def build_index():
    index = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Skip hidden folders
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            filepath = os.path.join(root, file)
            if not should_include(filepath):
                continue

            with open(filepath, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, "html.parser")

            # Title
            title_tag = soup.find("title")
            title = title_tag.string if title_tag else file

            # Meta description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            excerpt = meta_desc["content"] if meta_desc else ""

            # URL (relative → absolute)
            rel_path = os.path.relpath(filepath, BASE_DIR).replace("\\", "/")
            if rel_path == "index.html":
                url = SITE_URL + "/"
            else:
                url = f"{SITE_URL}/{rel_path}"

            # Image
            image = extract_first_image(soup, url)

            # Content text
            content = extract_text(soup)

            # Page type
            page_type = get_page_type(filepath)

            index.append({
                "title": title,
                "url": url,
                "excerpt": excerpt[:250],
                "image": image,
                "type": page_type,
                "content": content
            })

    return index

if __name__ == "__main__":
    data = build_index()
    os.makedirs("js", exist_ok=True)
    with open("js/search-index.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Advanced search index generated with {len(data)} entries.")