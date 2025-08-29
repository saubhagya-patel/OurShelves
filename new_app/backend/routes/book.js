import express from 'express';
import { auth_middleware } from '../middleware/index.js';
import { book_controller } from '../controllers/index.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/', book_controller.getAllBooks);
router.get('/:isbn', book_controller.getBookDetails);

// --- PROTECTED ROUTES ---
// We use the 'protect' middleware as a gatekeeper for these routes.
router.get('/search/external', auth_middleware.protect, book_controller.searchOpenLibrary);
router.post('/', auth_middleware.protect, book_controller.addBook);
router.post('/:isbn/reviews', auth_middleware.protect, book_controller.addReview);

export default router;
