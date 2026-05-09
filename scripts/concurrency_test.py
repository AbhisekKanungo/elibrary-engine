import threading
import requests
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = "http://localhost:8000"
BOOK_ID  = 1
N_USERS  = 10

results = []
lock    = threading.Lock()

def try_borrow(user_id: int):
    try:
        r = requests.post(
            f"{BASE_URL}/transactions/borrow",
            json={"user_id": user_id, "book_id": BOOK_ID},
            timeout=15
        )
        with lock:
            results.append({
                "user_id":     user_id,
                "status_code": r.status_code,
                "detail":      r.json().get("detail", "Borrowed successfully")
            })
    except Exception as e:
        with lock:
            results.append({"user_id": user_id, "error": str(e)})

if __name__ == "__main__":
    # Step 1: Reset book to exactly 1 license
    print("Resetting book to 1 license...")
    conn   = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE books SET available_licenses=1, total_licenses=1 WHERE book_id=%s",
        (BOOK_ID,)
    )
    cursor.execute(
        "DELETE FROM transactions WHERE book_id=%s",
        (BOOK_ID,)
    )
    conn.commit()
    cursor.close()
    conn.close()
    print("Done. 1 license available.\n")

    # Step 2: Get 10 valid user IDs from DB
    conn   = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users LIMIT 10")
    user_ids = [r[0] for r in cursor.fetchall()]
    cursor.close()
    conn.close()

    # Step 3: Fire all 10 requests simultaneously
    print(f"Firing {N_USERS} simultaneous borrow requests for Book ID {BOOK_ID}...")
    print("Only 1 should succeed.\n")

    threads = [
        threading.Thread(target=try_borrow, args=(uid,))
        for uid in user_ids
    ]
    for t in threads: t.start()
    for t in threads: t.join()

    # Step 4: Analyze results
    successes = [r for r in results if r.get("status_code") == 200]
    failures  = [r for r in results if r.get("status_code") != 200]

    print(f"{'='*50}")
    print(f"Result: {'PASS ✅' if len(successes) == 1 else 'FAIL ❌'}")
    print(f"Successful borrows : {len(successes)} (expected 1)")
    print(f"Failed attempts    : {len(failures)}  (expected 9)")
    print(f"{'='*50}\n")

    for r in sorted(results, key=lambda x: x["user_id"]):
        icon = "✅" if r.get("status_code") == 200 else "❌"
        print(f"  User {r['user_id']:3d}: {icon}  {r.get('detail','')}")