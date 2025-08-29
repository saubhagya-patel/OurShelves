import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// --- Authentication Endpoints ---
export const registerUser = (credentials) => {
  return apiClient.post('/auth/register', credentials);
};

export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

// --- Book Endpoints ---
export const getBooks = () => {
  return apiClient.get('/book');
};

export const getBookDetails = (isbn, token) => {
  // Pass token to check for user-specific review
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return apiClient.get(`/book/${isbn}`, { headers });
};

export const searchExternalBooks = (query, token) => {
  return apiClient.get(`/book/search/external?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addBook = (bookData, token) => {
  return apiClient.post('/book', bookData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// NEW: Function to add or update a review (requires auth)
export const submitReview = (isbn, reviewData, token) => {
    return apiClient.post(`/book/${isbn}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export default apiClient;

