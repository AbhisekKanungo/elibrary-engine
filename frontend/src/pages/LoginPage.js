import { useState } from "react";

export default function LoginPage({ onLogin, onSignup, message }) {
  const [authPage, setAuthPage]             = useState("login");
  const [loginEmail, setLoginEmail]         = useState("");
  const [loginPassword, setLoginPassword]   = useState("");
  const [signupName, setSignupName]         = useState("");
  const [signupEmail, setSignupEmail]       = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  return (
    <div style={styles.authWrap}>
      {message && <div style={styles.toast}>{message}</div>}
      <div style={styles.authCard}>
        <h1 style={styles.authLogo}>📚 E-Library Engine</h1>
        <div style={styles.authTabs}>
          <button style={authPage === "login" ? styles.authTabActive : styles.authTab}
            onClick={() => setAuthPage("login")}>Login</button>
          <button style={authPage === "signup" ? styles.authTabActive : styles.authTab}
            onClick={() => setAuthPage("signup")}>Sign Up</button>
        </div>
        {authPage === "login" ? (
          <div style={styles.authForm}>
            <input style={styles.authInput} placeholder="Email" value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)} />
            <input style={styles.authInput} placeholder="Password" type="password"
              value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onLogin(loginEmail, loginPassword)} />
            <button style={styles.authBtn} onClick={() => onLogin(loginEmail, loginPassword)}>Login</button>
          </div>
        ) : (
          <div style={styles.authForm}>
            <input style={styles.authInput} placeholder="Full Name" value={signupName}
              onChange={e => setSignupName(e.target.value)} />
            <input style={styles.authInput} placeholder="Email" value={signupEmail}
              onChange={e => setSignupEmail(e.target.value)} />
            <input style={styles.authInput} placeholder="Password" type="password"
              value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSignup(signupName, signupEmail, signupPassword)} />
            <button style={styles.authBtn} onClick={() => onSignup(signupName, signupEmail, signupPassword)}>Create Account</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  authWrap: { minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" },
  authCard: { background: "#fff", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0" },
  authLogo: { textAlign: "center", fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", marginBottom: "1.5rem" },
  authTabs: { display: "flex", marginBottom: "1.5rem", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" },
  authTab: { flex: 1, padding: "10px", background: "#f8fafc", border: "none", cursor: "pointer", fontSize: "14px", color: "#64748b" },
  authTabActive: { flex: 1, padding: "10px", background: "#3b82f6", border: "none", cursor: "pointer", fontSize: "14px", color: "#fff", fontWeight: "500" },
  authForm: { display: "flex", flexDirection: "column", gap: "12px" },
  authInput: { padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
  authBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500" },
  toast: { position: "fixed", top: "20px", right: "20px", background: "#1e293b", color: "#fff", padding: "12px 20px", borderRadius: "8px", fontSize: "14px", zIndex: 1000 },
};