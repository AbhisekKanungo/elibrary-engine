export default function Navbar({ user, page, setPage, logout }) {
    return (
      <nav style={styles.nav}>
        <span style={styles.logo}>📚 E-Library Engine</span>
        <div style={styles.navLinks}>
          <button style={page === "home" ? styles.navBtnActive : styles.navBtn}
            onClick={() => setPage("home")}>Books</button>
          <button style={page === "mybooks" ? styles.navBtnActive : styles.navBtn}
            onClick={() => setPage("mybooks")}>My Books</button>
          <button style={page === "recommendations" ? styles.navBtnActive : styles.navBtn}
            onClick={() => setPage("recommendations")}>Recommendations</button>
          {user.user_type === "admin" && (
            <button style={page === "dashboard" ? styles.navBtnActive : styles.navBtn}
              onClick={() => setPage("dashboard")}>Dashboard</button>
          )}
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user.name}</span>
          {user.user_type === "admin" && <span style={styles.adminBadge}>Admin</span>}
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>
    );
  }
  
  const styles = {
    nav: { background: "#1e293b", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" },
    logo: { color: "#fff", fontSize: "1.2rem", fontWeight: "600" },
    navLinks: { display: "flex", gap: "8px", flexWrap: "wrap" },
    navBtn: { background: "transparent", border: "1px solid #475569", color: "#94a3b8", padding: "6px 16px", borderRadius: "6px", cursor: "pointer" },
    navBtnActive: { background: "#3b82f6", border: "1px solid #3b82f6", color: "#fff", padding: "6px 16px", borderRadius: "6px", cursor: "pointer" },
    navRight: { display: "flex", alignItems: "center", gap: "8px" },
    navUser: { color: "#94a3b8", fontSize: "14px" },
    adminBadge: { background: "#7c3aed", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "20px" },
    logoutBtn: { background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  };