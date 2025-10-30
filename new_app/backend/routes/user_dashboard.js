import express from 'express';
import { auth_middleware } from '../middleware/index.js';
import { user_dashboard_controller } from '../controllers/index.js';

const router = express.Router();

// Keep all the routes protected here.
router.use(auth_middleware.protect);

// GET /api/me/reviews?visibility=[public|private]
router.get('/reviews', user_dashboard_controller.getMyReviews);

export default router;
