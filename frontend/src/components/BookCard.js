export default function BookCard({ book, onBorrow, onRead }) {
    return (
      <div style={styles.card}>
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
              onClick={() => onBorrow(book.book_id)}>Borrow</button>
            {onRead && (
              <button
                style={book.pdf_url ? styles.btnSecondary : styles.btnDisabled}
                disabled={!book.pdf_url}
                onClick={() => onRead(book)}>
                {book.pdf_url ? "Read" : "No PDF"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  const styles = {
    card: { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" },
    cardCategory: { fontSize: "11px", color: "#3b82f6", fontWeight: "600", textTransform: "uppercase" },
    cardTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
    cardAuthor: { fontSize: "13px", color: "#64748b", margin: 0 },
    cardDesc: { fontSize: "13px", color: "#94a3b8", margin: 0, flexGrow: 1 },
    cardFooter: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" },
    cardBtns: { display: "flex", gap: "8px" },
    badge: { fontSize: "12px", padding: "4px 10px", borderRadius: "20px", fontWeight: "500", width: "fit-content" },
    btn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
    btnSecondary: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
    btnDisabled: { background: "#e2e8f0", color: "#94a3b8", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "not-allowed", fontSize: "14px" },
  };