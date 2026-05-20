import { useEffect, useState } from "react";
import { booksAPI, transactionsAPI } from "../api";

export default function RecommendationsPage({ user, showMessage }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    booksAPI.getRecommended(user.user_id)
      .then(res => setRecs(res.data.recommendations || []))
      .catch(console.error);
  }, []);

  const borrow = async (bookId) => {
    try {
      await transactionsAPI.borrow(bookId);
      showMessage("✅ Book borrowed successfully!");
    } catch (e) {
      showMessage(`❌ ${e.response?.data?.detail || "Error borrowing book"}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Recommended For You</h1>
      <p style={styles.muted}>Users with similar reading history also borrowed these books</p>
      {recs.length === 0 ? (
        <p style={styles.muted}>No recommendations yet. Borrow some books first!</p>
      ) : (
        <div style={styles.grid}>
          {recs.map(book => (
            <div key={book.book_id} style={styles.card}>
              <div style={styles.cardCategory}>{book.category || "General"}</div>
              <h3 style={styles.cardTitle}>{book.title}</h3>
              <p style={styles.cardAuthor}>by {book.author}</p>
              <div style={styles.cardFooter}>
                <span style={styles.scoreBadge}>⭐ Score: {book.recommendation_score}</span>
                <p style={styles.reason}>{book.reason}</p>
                <button
                  style={book.available_licenses > 0 ? styles.btn : styles.btnDisabled}
                  disabled={book.available_licenses === 0}
                  onClick={() => borrow(book.book_id)}>
                  {book.available_licenses > 0 ? "Borrow" : "No copies left"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  heading: { fontSize: "1.8rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  muted: { color: "#94a3b8", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" },
  cardCategory: { fontSize: "11px", color: "#3b82f6", fontWeight: "600", textTransform: "uppercase" },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
  cardAuthor: { fontSize: "13px", color: "#64748b", margin: 0 },
  cardFooter: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" },
  scoreBadge: { fontSize: "12px", color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: "20px", width: "fit-content" },
  reason: { fontSize: "12px", color: "#64748b", margin: 0 },
  btn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnDisabled: { background: "#e2e8f0", color: "#94a3b8", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "not-allowed", fontSize: "14px" },
};