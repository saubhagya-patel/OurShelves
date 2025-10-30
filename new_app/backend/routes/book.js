import express from 'express';
import { auth_middleware } from '../middleware/index.js';
import { book_controller } from '../controllers/index.js';

const router = express.Router();

// Keep all the routes protected here.
router.use(auth_middleware.protect);

router.get('/', book_controller.getAllBooks);
router.post('/', book_controller.addBook);

router.get('/:isbn', book_controller.getBookDetails);
router.post('/:isbn/reviews', book_controller.addOrUpdateReview);

router.get('/search/external', book_controller.searchOpenLibrary);


export default router;
