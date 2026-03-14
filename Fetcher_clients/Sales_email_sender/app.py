import mysql.connector
from serpapi import GoogleSearch
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import os
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# ========== CONFIGURATION ==========
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")
OPENROUTER_MODEL = "openai/gpt-4"

# MySQL Config
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "1234"
MYSQL_DATABASE = "lead_generation"
MYSQL_CHARSET = "utf8mb4"  # Important for emojis

# Email SMTP Config
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "altivonholdings@gmail.com"
SENDER_PASSWORD = "issa jyqz vshr uvfj"  # Use App Password

# Categories and Locations – more added!
CATEGORIES = [
    "restaurant", "doctor", "coaching", "kirana", "construction",
    "salon", "gym", "jewelry", "bakery", "hotel"
]
LOCATIONS = ["Varanasi", "Chandauli", "Mirzapur", "Sonbhadra"]

# Timeouts & Delays
SCRAPE_TIMEOUT = 15
REQUEST_DELAY = 2
# ====================================

def create_database_and_table():
    """Ensure database and leads table exist with utf8mb4 support."""
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            charset=MYSQL_CHARSET
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET {MYSQL_CHARSET} COLLATE {MYSQL_CHARSET}_unicode_ci")
        cursor.execute(f"USE {MYSQL_DATABASE}")
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                business_name VARCHAR(255) CHARACTER SET {MYSQL_CHARSET} COLLATE {MYSQL_CHARSET}_unicode_ci,
                phone VARCHAR(50),
                email VARCHAR(255),
                website VARCHAR(255),
                address TEXT CHARACTER SET {MYSQL_CHARSET} COLLATE {MYSQL_CHARSET}_unicode_ci,
                category VARCHAR(100),
                location VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                email_sent BOOLEAN DEFAULT FALSE,
                email_content TEXT CHARACTER SET {MYSQL_CHARSET} COLLATE {MYSQL_CHARSET}_unicode_ci,
                sent_at DATETIME
            ) CHARACTER SET {MYSQL_CHARSET} COLLATE {MYSQL_CHARSET}_unicode_ci
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database and table are ready (utf8mb4 enabled).")
    except Exception as e:
        print(f"❌ Error creating database/table: {e}")
        exit(1)

def scrape_email_from_website(url):
    """Extract email from a website (first found)."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, timeout=SCRAPE_TIMEOUT, headers=headers)
        if response.status_code != 200:
            return None
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if emails:
            return emails[0]
        mailto_links = soup.select('a[href^="mailto:"]')
        if mailto_links:
            mailto = mailto_links[0]['href']
            email = mailto.replace('mailto:', '').split('?')[0]
            return email
        return None
    except Exception as e:
        print(f"⚠️ Error scraping {url}: {e}")
        return None

def search_email_via_google(business_name, location):
    """
    Use SerpAPI web search to find email for a business.
    Searches for "business name location email" or "business name location contact".
    """
    queries = [
        f"{business_name} {location} email",
        f"{business_name} {location} contact",
        f"{business_name} {location} info"
    ]
    for query in queries:
        params = {
            "api_key": SERPAPI_KEY,
            "engine": "google",
            "q": query,
            "num": 5
        }
        try:
            search = GoogleSearch(params)
            results = search.get_dict()
            if "organic_results" in results:
                for result in results["organic_results"]:
                    text = result.get("title", "") + " " + result.get("snippet", "")
                    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
                    if emails:
                        return emails[0]
            time.sleep(1)
        except Exception as e:
            print(f"⚠️ Google search error for {business_name}: {e}")
            continue
    return None

def fetch_leads_from_serpapi(category, location):
    """Fetch leads from Google Maps and try multiple methods to get email."""
    params = {
        "api_key": SERPAPI_KEY,
        "engine": "google_maps",
        "type": "search",
        "q": f"{category} in {location}",
    }
    search = GoogleSearch(params)
    results = search.get_dict()

    leads = []
    if "local_results" in results:
        for place in results["local_results"]:
            lead = {
                "business_name": place.get("title"),
                "phone": place.get("phone"),
                "email": None,
                "website": place.get("website"),
                "address": place.get("address"),
                "category": category,
                "location": location
            }
            print(f"   Processing: {lead['business_name']}")

            # Method 1: If website exists, scrape it
            if lead["website"]:
                print(f"      Website found: {lead['website']}. Scraping for email...")
                email = scrape_email_from_website(lead["website"])
                if email:
                    lead["email"] = email
                    print(f"         ✅ Email found via website: {email}")
                else:
                    print("         ❌ No email found on website.")
                time.sleep(REQUEST_DELAY)

            # Method 2: If still no email, try Google search
            if not lead["email"]:
                print(f"      Trying Google search for email...")
                email = search_email_via_google(lead["business_name"], location)
                if email:
                    lead["email"] = email
                    print(f"         ✅ Email found via Google search: {email}")
                else:
                    print("         ❌ No email found via Google search.")

            # Method 3: If still no email, we keep phone as primary contact
            if not lead["email"]:
                print("      ⚠️ No email found. Will use phone for WhatsApp outreach later.")

            leads.append(lead)
    return leads

def save_to_mysql(leads):
    """Insert leads into MySQL database with utf8mb4 charset."""
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset=MYSQL_CHARSET
    )
    cursor = conn.cursor()
    sql = """INSERT INTO leads 
             (business_name, phone, email, website, address, category, location)
             VALUES (%s, %s, %s, %s, %s, %s, %s)"""
    for lead in leads:
        cursor.execute(sql, (
            lead["business_name"],
            lead["phone"],
            lead["email"],
            lead["website"],
            lead["address"],
            lead["category"],
            lead["location"]
        ))
    conn.commit()
    cursor.close()
    conn.close()
    print(f"   ✅ {len(leads)} leads inserted into database.")

def generate_email_with_openrouter(business_name, category):
    """Generate personalized email using OpenRouter AI."""
    prompt = f"""You are a sales expert. Write a professional and persuasive email to {business_name}, a {category} business, offering web development and software services. Keep it concise, warm, and include a call to action. Use Hindi or Hinglish if appropriate for a local business in Uttar Pradesh. The email should be from Altivon Holdings, a Varanasi-based IT company. Mention we are offering 20% discount on first project and free consultation. Do not include placeholders like [Your Name] – use actual details. The email should be ready to send."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=data, headers=headers)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        print("OpenRouter API error:", response.text)
        return None

def send_email(recipient_email, subject, body):
    """Send email via SMTP."""
    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"   ✅ Email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"   ❌ Failed to send email to {recipient_email}: {e}")
        return False

def process_unsent_emails():
    """Send emails to leads that have an email address."""
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset=MYSQL_CHARSET
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM leads WHERE email_sent = FALSE AND email IS NOT NULL AND email != ''")
    leads = cursor.fetchall()
    for lead in leads:
        print(f"📧 Generating email for {lead['business_name']} ({lead['email']})...")
        email_body = generate_email_with_openrouter(lead["business_name"], lead["category"])
        if email_body:
            subject = f"Website & Software Services – Special Offer for {lead['business_name']}"
            success = send_email(lead["email"], subject, email_body)
            if success:
                cursor.execute("UPDATE leads SET email_sent = TRUE, email_content = %s, sent_at = NOW() WHERE id = %s",
                               (email_body, lead["id"]))
                conn.commit()
        time.sleep(2)
    cursor.close()
    conn.close()

if __name__ == "__main__":
    # Step 0: Ensure database and table exist
    create_database_and_table()

    # Step 1: Fetch leads with email from multiple sources
    for cat in CATEGORIES:
        for loc in LOCATIONS:
            print(f"\n🔍 Searching for {cat} in {loc}...")
            leads = fetch_leads_from_serpapi(cat, loc)
            if leads:
                save_to_mysql(leads)
            time.sleep(1)  # SerpAPI rate limit

    # Step 2: Send emails to those who have email
    print("\n📧 Starting email generation and sending...")
    process_unsent_emails()

    print("\n✅ All done!")