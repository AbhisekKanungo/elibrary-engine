from collections import OrderedDict
import threading
import time
import logging

logger = logging.getLogger(__name__)

class LRUCache:
    """
    COA-inspired LRU Cache.
    Cache hit  = data found in RAM (fast)
    Cache miss = fetch from DB (slow)
    Eviction   = remove least recently used when full
    Thread-safe via threading.Lock
    """

    def __init__(self, capacity: int = 100, ttl_seconds: int = 300):
        self.capacity = capacity
        self.ttl      = ttl_seconds
        self.cache    = OrderedDict()
        self.lock     = threading.Lock()
        self.hits     = 0
        self.misses   = 0

    def get(self, key: str):
        with self.lock:
            if key not in self.cache:
                self.misses += 1
                return None
            value, ts = self.cache[key]
            if time.time() - ts > self.ttl:
                del self.cache[key]
                self.misses += 1
                return None
            self.cache.move_to_end(key)
            self.hits += 1
            return value

    def set(self, key: str, value):
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = (value, time.time())
            if len(self.cache) > self.capacity:
                evicted, _ = self.cache.popitem(last=False)
                logger.info(f"[CACHE EVICTION] {evicted} removed")

    def invalidate(self, key: str):
        with self.lock:
            self.cache.pop(key, None)

    def stats(self):
        with self.lock:
            total    = self.hits + self.misses
            hit_rate = round(self.hits / total * 100, 2) if total > 0 else 0
            return {
                "hits":             self.hits,
                "misses":           self.misses,
                "hit_rate_percent": hit_rate,
                "current_size":     len(self.cache),
                "capacity":         self.capacity
            }

book_cache = LRUCache(capacity=100, ttl_seconds=300)