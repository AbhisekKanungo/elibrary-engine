import { useState } from "react";
import BookCard from "../components/BookCard";
import { booksAPI } from "../api";

export default function BooksPage({ onBorrow, showMessage }) {
  const [books, setBooks]         = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip]           = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [initialized, setInit]    = useState(false);
  const LIMIT = 20;

  if (!initialized) {
    setInit(true);
    fetchBooks(0, "");
  }

  async function fetchBooks(skipVal = 0, q = "") {
    setLoading(true);
    try {
      const res = q
        ? await booksAPI.search(q, LIMIT)
        : await booksAPI.getAll(skipVal, LIMIT);
      setBooks(res.data);
      setSkip(skipVal);
      setHasMore(res.data.length === LIMIT);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const newSkip = skip + LIMIT;
      const res = await booksAPI.getAll(newSkip, LIMIT);
      setBooks(prev => [...prev, ...res.data]);
      setSkip(newSkip);
      setHasMore(res.data.length === LIMIT);
    } catch (e) { console.error(e); }
    setLoadingMore(false);
  }

  const handleBorrow = async (bookId) => {
    await onBorrow(bookId);
    fetchBooks(skip, search);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Browse Books</h1>
      <div style={styles.searchBar}>
        <input style={styles.input} placeholder="Search by title or author..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchBooks(0, search)} />
        <button style={styles.btn} onClick={() => fetchBooks(0, search)}>Search</button>
        <button style={styles.btnSecondary} onClick={() => { setSearch(""); fetchBooks(0, ""); }}>Clear</button>
      </div>
      {loading ? <p style={styles.muted}>Loading...</p> : (
        <>
          <div style={styles.grid}>
            {books.map(book => (
              <BookCard key={book.book_id} book={book}
                onBorrow={handleBorrow}
                onRead={book.pdf_url ? (b) => window.open(booksAPI.stream(b.book_id), "_blank") : null}
              />
            ))}
          </div>
          {hasMore && !search && (
            <div style={styles.loadMoreWrapper}>
              <button style={loadingMore ? styles.btnDisabled : styles.btnLoadMore}
                onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More Books"}
              </button>
            </div>
          )}
          {!hasMore && books.length > 0 && (
            <p style={{...styles.muted, textAlign:"center", marginTop:"2rem"}}>
              All {books.length} books loaded
            </p>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  heading: { fontSize: "1.8rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  searchBar: { display: "flex", gap: "8px", marginBottom: "1.5rem" },
  input: { flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
  btn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnSecondary: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnDisabled: { background: "#e2e8f0", color: "#94a3b8", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "not-allowed", fontSize: "14px" },
  btnLoadMore: { background: "#1e293b", color: "#fff", border: "none", padding: "12px 40px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  loadMoreWrapper: { display: "flex", justifyContent: "center", marginTop: "2rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  muted: { color: "#94a3b8", fontSize: "14px" },
};