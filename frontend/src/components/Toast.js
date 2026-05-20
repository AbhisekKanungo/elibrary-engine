export default function Toast({ message }) {
    if (!message) return null;
    return <div style={styles.toast}>{message}</div>;
  }
  
  const styles = {
    toast: { position: "fixed", top: "80px", right: "20px", background: "#1e293b", color: "#fff", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", zIndex: 1000 }
  };