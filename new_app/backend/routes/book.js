import express from 'express';
import { book_controller } from '../controllers/index.js';
import { auth_middleware } from '../middleware/index.js';

const router = express.Router();

// --- PUBLIC ROUTES (No login required) ---

// GET /api/books - Get a list of all books in our library
router.get('/', book_controller.getAllBooks);

// GET /api/books/:isbn - Get details for a single book, including all reviews
router.get('/:isbn', book_controller.getBookDetails);


// --- PROTECTED ROUTES (Login required) ---

// GET /api/books/search - Search the external Open Library API
// We protect this to prevent unauthorized users from spamming the external API through our server.
router.get('/search/external', auth_middleware.protect, book_controller.searchOpenLibrary);

// POST /api/books - Add a new book to our central library
router.post('/', auth_middleware.protect, book_controller.addBook);

// POST /api/books/:isbn/reviews - Add or update a review for a book
// The user ID will be taken from the token.
router.post('/:isbn/reviews', auth_middleware.protect, book_controller.addReview);

export default router;
