import express from 'express';
import { guest_controller } from '../controllers/index.js';

const router = express.Router();

// --- PUBLIC ROUTE ---
// GET /api/reviews/latest (For the guest homepage)
router.get('/latest', guest_controller.getLatestPublicReviews);

export default router;
