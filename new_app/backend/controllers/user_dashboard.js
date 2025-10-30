import { book_util } from '../util/index.js';

/**
 * Controller to get all reviews for the *currently logged-in user*,
 * filtered by visibility (public or private).
 * This is for the "My Reviews" dashboard.
 */
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const { visibility } = req.query; // 'public' or 'private'

        let is_public;
        if (visibility === 'public') {
            is_public = true;
        } else if (visibility === 'private') {
            is_public = false;
        } else {
            return res.status(400).json({ message: "A 'visibility' query parameter of 'public' or 'private' is required." });
        }

        const reviews = await book_util.dbGetUserReviewsByVisibility(userId, is_public);
        res.status(200).json(reviews);

    } catch (error) {
        console.error("Error in getMyReviews controller:", error);
        res.status(500).json({ message: "Failed to retrieve your reviews." });
    }
};
