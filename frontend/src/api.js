import axios from "axios";

const API = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login:    (email, password) => axios.post(`${API}/auth/login`, { email, password }),
  register: (name, email, password) => axios.post(`${API}/auth/register`, { name, email, password, user_type: "student" }),
};

export const booksAPI = {
  getAll:          (skip, limit) => axios.get(`${API}/books/?skip=${skip}&limit=${limit}`),
  search:          (q, limit)    => axios.get(`${API}/books/search?q=${q}&limit=${limit}`),
  getRecommended:  (userId)      => axios.get(`${API}/books/recommendations/${userId}`),
  stream:          (bookId)      => `${API}/books/${bookId}/stream`,
};

export const transactionsAPI = {
  borrow:       (bookId)        => axios.post(`${API}/transactions/borrow`, { book_id: bookId }),
  return:       (transactionId) => axios.post(`${API}/transactions/return/${transactionId}`),
  getMyBooks:   (userId)        => axios.get(`${API}/transactions/user/${userId}`),
  getFines:     (userId)        => axios.get(`${API}/transactions/user/${userId}/fines`),
  getStats:     ()              => axios.get(`${API}/transactions/dashboard/stats`),
};