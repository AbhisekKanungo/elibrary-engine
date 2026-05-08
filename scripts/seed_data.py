import requests
import psycopg2
from faker import Faker
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()
fake = Faker()

conn   = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

# ── Real books from Open Library ──────────────────────────────────────────────
print("Fetching books from Open Library...")
subjects = ["computer+science", "physics", "mathematics", "algorithms", "operating+systems"]
books_to_insert = []

for subject in subjects:
    try:
        url  = f"https://openlibrary.org/search.json?q={subject}&limit=100"
        data = requests.get(url, timeout=15).json()
        for doc in data.get("docs", []):
            title  = (doc.get("title") or "")[:290]
            author = ", ".join(doc.get("author_name") or ["Unknown"])[:190]
            isbns  = doc.get("isbn") or []
            isbn   = isbns[0][:18] if isbns else None
            cat    = subject.replace("+", " ").title()
            lic    = random.randint(1, 10)
            if title and author:
                books_to_insert.append((
                    title, author, isbn, cat, lic, lic,
                    f"A book about {cat}.", None
                ))
    except Exception as e:
        print(f"  Skipping {subject}: {e}")

cursor.executemany("""
    INSERT INTO books (title, author, isbn, category, total_licenses, available_licenses, description, cover_url)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (isbn) DO NOTHING
""", books_to_insert)
print(f"  Done — up to {len(books_to_insert)} books inserted.")

# ── Fake users ─────────────────────────────────────────────────────────────────
print("Generating 500 fake users...")
users = []
for _ in range(500):
    users.append((
        fake.name()[:98],
        fake.unique.email()[:98],
        random.choice(["student", "faculty"])
    ))
cursor.executemany("""
    INSERT INTO users (name, email, user_type)
    VALUES (%s, %s, %s) ON CONFLICT DO NOTHING
""", users)
print("  Done.")

# ── Fake transactions ──────────────────────────────────────────────────────────
print("Generating transactions...")
cursor.execute("SELECT user_id FROM users LIMIT 500")
user_ids = [r[0] for r in cursor.fetchall()]

cursor.execute("SELECT book_id FROM books LIMIT 300")
book_ids = [r[0] for r in cursor.fetchall()]

txns = []
seen = set()
for _ in range(5000):
    uid = random.choice(user_ids)
    bid = random.choice(book_ids)
    if (uid, bid) in seen:
        continue
    seen.add((uid, bid))
    borrow = fake.date_time_between(start_date="-6m", end_date="now")
    status = random.choice(["active", "returned"])
    ret    = borrow + timedelta(days=random.randint(3, 14)) if status == "returned" else None
    txns.append((uid, bid, borrow, borrow + timedelta(days=14), ret, status))

cursor.executemany("""
    INSERT INTO transactions (user_id, book_id, borrow_date, due_date, return_date, status)
    VALUES (%s, %s, %s, %s, %s, %s)
""", txns)
print(f"  Done — {len(txns)} transactions inserted.")

conn.commit()
cursor.close()
conn.close()
print("\nSeeding complete!")