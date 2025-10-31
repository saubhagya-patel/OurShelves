import axios from 'axios';
import conf from '../conf/conf';

const apiClient = axios.create({
  baseURL: conf.apiUrl || 'http://localhost:3000/api',
});

// =================================================================
// PUBLIC ROUTES (No Auth Needed)
// =================================================================

export const registerUser = (credentials) => {
  return apiClient.post('/auth/register', credentials);
};

export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const getLatestReviews = () => {
  return apiClient.get('/reviews/latest');
};

// =================================================================
// PROTECTED ROUTES (Auth Token Required)
// =================================================================

/**
 * Gets all books for the member homepage.
 */
export const getBooks = (token) => {
  return apiClient.get('/books', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Gets details for a single book.
 */
export const getBookDetails = (isbn, token) => {
  return apiClient.get(`/books/${isbn}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Searches the external Open Library API.
 */
export const searchExternalBooks = (query, token) => {
  return apiClient.get(`/books/search/external?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Adds a new book to our library.
 */
export const addBook = (bookData, token) => {
  return apiClient.post('/books', bookData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Submits or updates a review. Now includes the review text and is_public flag.
 */
export const submitReview = (isbn, reviewData, token) => {
  // reviewData should be { rating, review, is_public }
  return apiClient.post(`/books/${isbn}/reviews`, reviewData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Gets the logged-in user's reviews for their dashboard.
 */
export const getMyReviews = (visibility, token) => {
  // visibility should be 'public' or 'private'
  return apiClient.get(`/me/reviews?visibility=${visibility}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Gets the summary of public reviews.
 */
export const getAiSummary = (isbn, token) => {
  return apiClient.get(`/books/${isbn}/ai-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default apiClient;

