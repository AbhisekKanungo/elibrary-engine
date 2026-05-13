import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function App() {
  const [page, setPage] = useState("home");
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, []);

  const fetchBooks = async (q = "") => {
    setLoading(true);
    try {
      const url = q
        ? `${API}/books/search?q=${q}`
        : `${API}/books/?limit=20`;
      const res = await axios.get(url);
      setBooks(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/transactions/dashboard/stats`);
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecommendations = async (userId) => {
    try {
      const res = await axios.get(`${API}/books/recommendations/${userId}`);
      setRecommendations(res.data.recommendations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const borrowBook = async (bookId) => {
    try {
      await axios.post(`${API}/transactions/borrow`, {
        user_id: 1,
        book_id: bookId,
      });
      setMessage("✅ Book borrowed successfully!");
      fetchBooks();
      fetchStats();
    } catch (e) {
      setMessage(`❌ ${e.response?.data?.detail || "Error borrowing book"}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div style={styles.app}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>📚 E-Library Engine</span>
        <div style={styles.navLinks}>
          <button style={page === "home" ? styles.navBtnActive : styles.navBtn} onClick={() => setPage("home")}>Books</button>
          <button style={page === "dashboard" ? styles.navBtnActive : styles.navBtn} onClick={() => { setPage("dashboard"); fetchStats(); }}>Dashboard</button>
          <button style={page === "recommendations" ? styles.navBtnActive : styles.navBtn} onClick={() => { setPage("recommendations"); fetchRecommendations(1); }}>Recommendations</button>
        </div>
      </nav>

      {/* Message Toast */}
      {message && <div style={styles.toast}>{message}</div>}

      {/* Home Page */}
      {page === "home" && (
        <div style={styles.container}>
          <h1 style={styles.heading}>Browse Books</h1>
          <div style={styles.searchBar}>
            <input
              style={styles.input}
              placeholder="Search by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchBooks(search)}
            />
            <button style={styles.btn} onClick={() => fetchBooks(search)}>Search</button>
            <button style={styles.btnSecondary} onClick={() => { setSearch(""); fetchBooks(); }}>Clear</button>
          </div>

          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : (
            <div style={styles.grid}>
              {books.map(book => (
                <div key={book.book_id} style={styles.card}>
                  <div style={styles.cardCategory}>{book.category || "General"}</div>
                  <h3 style={styles.cardTitle}>{book.title}</h3>
                  <p style={styles.cardAuthor}>by {book.author}</p>
                  <p style={styles.cardDesc}>{book.description || "No description available."}</p>
                  <div style={styles.cardFooter}>
                    <span style={{
                      ...styles.badge,
                      background: book.available_licenses > 0 ? "#d1fae5" : "#fee2e2",
                      color: book.available_licenses > 0 ? "#065f46" : "#991b1b"
                    }}>
                      {book.available_licenses > 0 ? `${book.available_licenses} available` : "No copies left"}
                    </span>
                    <div style={styles.cardBtns}>
                      <button
                        style={book.available_licenses > 0 ? styles.btn : styles.btnDisabled}
                        disabled={book.available_licenses === 0}
                        onClick={() => borrowBook(book.book_id)}
                      >
                        Borrow
                      </button>
                      <button style={styles.btnSecondary} onClick={() => window.open(`${API}/books/${book.book_id}/stream`, "_blank")}>
                        Read
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Page */}
      {page === "dashboard" && stats && (
        <div style={styles.container}>
          <h1 style={styles.heading}>System Dashboard</h1>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{stats.total_books}</div>
              <div style={styles.statLabel}>Total Books</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{stats.total_users}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{stats.active_borrows}</div>
              <div style={styles.statLabel}>Active Borrows</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{stats.cache_stats?.hit_rate_percent}%</div>
              <div style={styles.statLabel}>Cache Hit Rate</div>
            </div>
          </div>

          <h2 style={styles.subheading}>Most Popular Books</h2>
          <div style={styles.popularList}>
            {stats.popular_books?.map((book, i) => (
              <div key={i} style={styles.popularItem}>
                <span style={styles.popularRank}>#{i + 1}</span>
                <span style={styles.popularTitle}>{book.title}</span>
                <span style={styles.popularCount}>{book.borrow_count} borrows</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Page */}
      {page === "recommendations" && (
        <div style={styles.container}>
          <h1 style={styles.heading}>Recommended For You</h1>
          <p style={styles.muted}>Users with similar reading history also borrowed these books</p>
          {recommendations.length === 0 ? (
            <p style={styles.muted}>No recommendations yet. Borrow some books first!</p>
          ) : (
            <div style={styles.grid}>
              {recommendations.map(book => (
                <div key={book.book_id} style={styles.card}>
                  <div style={styles.cardCategory}>{book.category || "General"}</div>
                  <h3 style={styles.cardTitle}>{book.title}</h3>
                  <p style={styles.cardAuthor}>by {book.author}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.scoreBadge}>⭐ Score: {book.recommendation_score}</span>
                    <p style={styles.reason}>{book.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" },
  nav: { background: "#1e293b", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { color: "#fff", fontSize: "1.2rem", fontWeight: "600" },
  navLinks: { display: "flex", gap: "8px" },
  navBtn: { background: "transparent", border: "1px solid #475569", color: "#94a3b8", padding: "6px 16px", borderRadius: "6px", cursor: "pointer" },
  navBtnActive: { background: "#3b82f6", border: "1px solid #3b82f6", color: "#fff", padding: "6px 16px", borderRadius: "6px", cursor: "pointer" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  heading: { fontSize: "1.8rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  subheading: { fontSize: "1.3rem", fontWeight: "600", color: "#1e293b", margin: "2rem 0 1rem" },
  searchBar: { display: "flex", gap: "8px", marginBottom: "1.5rem" },
  input: { flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
  btn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnSecondary: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnDisabled: { background: "#e2e8f0", color: "#94a3b8", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "not-allowed", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" },
  cardCategory: { fontSize: "11px", color: "#3b82f6", fontWeight: "600", textTransform: "uppercase" },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
  cardAuthor: { fontSize: "13px", color: "#64748b", margin: 0 },
  cardDesc: { fontSize: "13px", color: "#94a3b8", margin: 0, flexGrow: 1 },
  cardFooter: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" },
  cardBtns: { display: "flex", gap: "8px" },
  badge: { fontSize: "12px", padding: "4px 10px", borderRadius: "20px", fontWeight: "500", width: "fit-content" },
  scoreBadge: { fontSize: "12px", color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: "20px", width: "fit-content" },
  reason: { fontSize: "12px", color: "#64748b", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0", textAlign: "center" },
  statNum: { fontSize: "2rem", fontWeight: "700", color: "#3b82f6" },
  statLabel: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  popularList: { display: "flex", flexDirection: "column", gap: "8px" },
  popularItem: { background: "#fff", borderRadius: "8px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" },
  popularRank: { fontSize: "1.1rem", fontWeight: "700", color: "#3b82f6", minWidth: "30px" },
  popularTitle: { flex: 1, fontSize: "14px", color: "#1e293b" },
  popularCount: { fontSize: "13px", color: "#64748b" },
  toast: { position: "fixed", top: "80px", right: "20px", background: "#1e293b", color: "#fff", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", zIndex: 1000 },
  muted: { color: "#94a3b8", fontSize: "14px" },
};