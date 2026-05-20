import { useEffect, useState } from "react";
import { transactionsAPI } from "../api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    transactionsAPI.getStats()
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <p style={styles.muted}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>System Dashboard</h1>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.total_books}</div><div style={styles.statLabel}>Total Books</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.total_users}</div><div style={styles.statLabel}>Total Users</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.active_borrows}</div><div style={styles.statLabel}>Active Borrows</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{stats.cache_stats?.hit_rate_percent}%</div><div style={styles.statLabel}>Cache Hit Rate</div></div>
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
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  heading: { fontSize: "1.8rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  subheading: { fontSize: "1.3rem", fontWeight: "600", color: "#1e293b", margin: "2rem 0 1rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0", textAlign: "center" },
  statNum: { fontSize: "2rem", fontWeight: "700", color: "#3b82f6" },
  statLabel: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  popularList: { display: "flex", flexDirection: "column", gap: "8px" },
  popularItem: { background: "#fff", borderRadius: "8px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" },
  popularRank: { fontSize: "1.1rem", fontWeight: "700", color: "#3b82f6", minWidth: "30px" },
  popularTitle: { flex: 1, fontSize: "14px", color: "#1e293b" },
  popularCount: { fontSize: "13px", color: "#64748b" },
  muted: { color: "#94a3b8", fontSize: "14px", padding: "2rem" },
};