import { useState, useEffect } from "react";
import { authAPI, transactionsAPI } from "./api";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import BooksPage from "./pages/BooksPage";
import MyBooksPage from "./pages/MyBooksPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [user, setUser]       = useState(null);
  const [page, setPage]       = useState("home");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token     = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (e) { showMessage(`❌ ${e.response?.data?.detail || "Login failed"}`); }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const res = await authAPI.register(name, email, password);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (e) { showMessage(`❌ ${e.response?.data?.detail || "Signup failed"}`); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleBorrow = async (bookId) => {
    try {
      await transactionsAPI.borrow(bookId);
      showMessage("✅ Book borrowed successfully!");
    } catch (e) { showMessage(`❌ ${e.response?.data?.detail || "Error borrowing book"}`); }
  };

  const handleReturn = async (transactionId) => {
    try {
      await transactionsAPI.return(transactionId);
      showMessage("✅ Book returned successfully!");
    } catch (e) { showMessage(`❌ ${e.response?.data?.detail || "Error returning book"}`); }
  };

  if (!user) return <LoginPage onLogin={handleLogin} onSignup={handleSignup} message={message} />;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar
        user={user} page={page} setPage={setPage}
        logout={handleLogout}
      />
      <Toast message={message} />
      {page === "home"            && <BooksPage onBorrow={handleBorrow} showMessage={showMessage} />}
      {page === "mybooks"         && <MyBooksPage user={user} onReturn={handleReturn} />}
      {page === "recommendations" && <RecommendationsPage user={user} showMessage={showMessage} />}
      {page === "dashboard"       && <DashboardPage />}
    </div>
  );
}