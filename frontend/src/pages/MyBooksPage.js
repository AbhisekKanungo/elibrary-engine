import { useEffect, useState } from "react";
import { transactionsAPI } from "../api";

export default function MyBooksPage({ user, onReturn }) {
  const [myBooks, setMyBooks] = useState([]);
  const [fines, setFines]     = useState(null);

  useEffect(() => {
    fetchMyBooks();
    fetchFines();
  }, []);

  const fetchMyBooks = async () => {
    try {
      const res = await transactionsAPI.getMyBooks(user.user_id);
      setMyBooks(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchFines = async () => {
    try {
      const res = await transactionsAPI.getFines(user.user_id);
      setFines(res.data);
    } catch (e) { console.error(e); }
  };

  const handleReturn = async (transactionId) => {
    await onReturn(transactionId);
    fetchMyBooks();
    fetchFines();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Borrowed Books</h1>

      {fines && fines.total_fine > 0 && (
        <div style={styles.fineAlert}>
          ⚠️ Outstanding fine: <strong>₹{fines.total_fine}</strong> for {fines.details.length} overdue book(s)
          <div style={{marginTop:"8px", fontSize:"13px"}}>
            {fines.details.map(f => (
              <div key={f.transaction_id}>
                Book #{f.book_id} — {f.days_overdue} days overdue — ₹{f.fine_amount}
              </div>
            ))}
          </div>
        </div>
      )}

      {myBooks.length === 0 ? (
        <p style={styles.muted}>You haven't borrowed any books yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Book ID</th>
                <th style={styles.th}>Borrowed On</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Fine</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBooks.map(t => {
                const due       = new Date(t.due_date);
                const now       = new Date();
                const isOverdue = t.status === "active" && due < now;
                const daysLeft  = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                const fine      = isOverdue ? Math.abs(daysLeft) : 0;
                return (
                  <tr key={t.transaction_id}>
                    <td style={styles.td}>#{t.book_id}</td>
                    <td style={styles.td}>{new Date(t.borrow_date).toLocaleDateString()}</td>
                    <td style={styles.td}>{due.toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: t.status === "returned" ? "#d1fae5" : isOverdue ? "#fee2e2" : "#fef3c7",
                        color: t.status === "returned" ? "#065f46" : isOverdue ? "#991b1b" : "#92400e"
                      }}>
                        {t.status === "returned" ? "Returned" : isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : `Due in ${daysLeft}d`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {fine > 0 ? <span style={{color:"#991b1b", fontWeight:"500"}}>₹{fine}</span> : "—"}
                    </td>
                    <td style={styles.td}>
                      {t.status === "active" && (
                        <button style={styles.btn} onClick={() => handleReturn(t.transaction_id)}>Return</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  heading: { fontSize: "1.8rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  fineAlert: { background: "#fee2e2", color: "#991b1b", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #fca5a5", marginBottom: "1.5rem", fontSize: "14px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "12px", overflow: "hidden" },
  th: { background: "#f8fafc", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  badge: { fontSize: "12px", padding: "4px 10px", borderRadius: "20px", fontWeight: "500", width: "fit-content" },
  btn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  muted: { color: "#94a3b8", fontSize: "14px" },
};