import { book_util } from '../util/index.js';

/**
 * Controller to get the 10 most recent *public* reviews.
 * This is for the public-facing guest homepage.
 */
export const getLatestPublicReviews = async (req, res) => {
    try {
        const reviews = await book_util.dbGetLatestPublicReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error in getLatestPublicReviews controller:", error);
        res.status(500).json({ message: "Failed to retrieve latest reviews." });
    }
};
