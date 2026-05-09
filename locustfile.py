from locust import HttpUser, task, between
import random

class LibraryUser(HttpUser):
    wait_time = between(0.5, 2)

    @task(5)
    def browse_books(self):
        self.client.get("/books/?limit=20")

    @task(4)
    def get_book(self):
        self.client.get(f"/books/{random.randint(1, 100)}")

    @task(3)
    def search(self):
        q = random.choice(["physics", "algorithms", "maths", "systems", "code"])
        self.client.get(f"/books/search?q={q}")

    @task(2)
    def recommendations(self):
        self.client.get(f"/books/recommendations/{random.randint(1, 100)}")

    @task(1)
    def cache_stats(self):
        self.client.get("/books/cache/stats")

    @task(1)
    def dashboard(self):
        self.client.get("/transactions/dashboard/stats")