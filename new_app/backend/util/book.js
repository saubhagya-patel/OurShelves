import { getDB } from '../db/db_instance.js';

/**
 * Retrieves all books from the database along with their average rating
 * and the total number of reviews, calculated *only* from public reviews.
 * @returns {Promise<Array>} A list of all books.
 */
export async function dbGetAllBooks() {
    const db = getDB();
    try {
        const query = `
            SELECT 
                b.*, 
                COALESCE(AVG(ur.rating), 0) as average_rating, 
                COUNT(ur.id) as review_count
            FROM books b
            LEFT JOIN user_reviews ur ON b.isbn = ur.book_isbn AND ur.is_public = true -- Only count public reviews
            GROUP BY b.isbn
            ORDER BY b.title;
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error getting all books:", error);
        throw error;
    }
}

/**
 * Finds a book by its ISBN.
 * @param {number} isbn - The ISBN of the book.
 * @returns {Promise<object|null>} The book object or null.
 */
export async function dbGetBookByIsbn(isbn) {
    const db = getDB();
    try {
        const result = await db.query("SELECT * FROM books WHERE isbn = $1", [isbn]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error finding book by ISBN:", error);
        throw error;
    }
}

/**
 * Adds a new book to the 'books' table.
 * @param {object} bookInfo - Contains title, author, year, etc.
 * @returns {Promise<object>} The newly created book.
 */
export async function dbAddBook(bookInfo) {
    const db = getDB();
    const { isbn, title, author, year, pages, coverid } = bookInfo;
    try {
        const result = await db.query(
            "INSERT INTO books (isbn, title, author, year, pages, coverid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [isbn, title, author, year, pages, coverid]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error adding new book:", error);
        throw error;
    }
}

/**
 * Adds or updates a user's review for a specific book.
 * Now includes the 'is_public' flag.
 * @param {object} reviewData - Contains userId, bookIsbn, rating, review, is_public.
 * @returns {Promise<object>} The newly created or updated review.
 */
export async function dbAddOrUpdateReview(reviewData) {
    const db = getDB();
    const { userId, bookIsbn, rating, review, is_public } = reviewData;
    try {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            INSERT INTO user_reviews (user_id, book_isbn, rating, review, date_modified, is_public)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, book_isbn) 
            DO UPDATE SET 
                rating = EXCLUDED.rating, 
                review = EXCLUDED.review, 
                date_modified = EXCLUDED.date_modified,
                is_public = EXCLUDED.is_public
            RETURNING *;
        `;
        const result = await db.query(query, [userId, bookIsbn, rating, review, today, is_public]);
        return result.rows[0];
    } catch (error) {
        console.error("Error adding or updating review:", error);
        throw error;
    }
}

/**
 * Gets all *public* reviews for a specific book.
 * Includes user's email.
 * @param {number} bookIsbn - The ISBN of the book.
 * @returns {Promise<Array>} A list of public reviews for the book.
 */
export async function dbGetPublicReviewsForBook(bookIsbn) {
    const db = getDB();
    try {
        const query = `
            SELECT ur.id, ur.rating, ur.review, ur.date_modified, u.email
            FROM user_reviews ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.book_isbn = $1 AND ur.is_public = true
            ORDER BY ur.date_modified DESC;
        `;
        const result = await db.query(query, [bookIsbn]);
        return result.rows;
    } catch (error) {
        console.error("Error getting public reviews for book:", error);
        throw error;
    }
}

/**
 * Gets a specific user's review for a specific book.
 * @param {number} userId - The ID of the user.
 * @param {number|string} bookIsbn - The ISBN of the book.
 * @returns {Promise<object|null>} The user's review or null if not found.
 */
export async function dbGetUserReviewForBook(userId, bookIsbn) {
    const db = getDB();
    const query = "SELECT * FROM user_reviews WHERE user_id = $1 AND book_isbn = $2";
    const result = await db.query(query, [userId, bookIsbn]);
    return result.rows[0] || null;
}

/**
 * Calculates the average rating and review count for a book *only* from public reviews.
 * @param {number|string} bookIsbn - The ISBN of the book.
 * @returns {Promise<object>} An object with average_rating and review_count.
 */
export async function dbGetPublicAverageRating(bookIsbn) {
    const db = getDB();
    const query = `
        SELECT 
            COALESCE(AVG(rating), 0) as average_rating, 
            COUNT(id) as review_count
        FROM user_reviews 
        WHERE book_isbn = $1 AND is_public = true;
    `;
    const result = await db.query(query, [bookIsbn]);
    return result.rows[0];
}

// --- NEW FUNCTIONS FOR OUR NEW API ENDPOINTS ---

/**
 * Gets the 10 most recent public reviews from all users.
 * @returns {Promise<Array>} A list of the 10 latest public reviews.
 */
export async function dbGetLatestPublicReviews() {
    const db = getDB();
    const query = `
        SELECT ur.id, ur.rating, ur.review, ur.date_modified, u.email,
               b.isbn as book_isbn, b.title as book_title, b.coverid as book_coverid
        FROM user_reviews ur
        JOIN users u ON ur.user_id = u.id
        JOIN books b ON ur.book_isbn = b.isbn
        WHERE ur.is_public = true
        ORDER BY ur.date_modified DESC
        LIMIT 10;
    `;
    const result = await db.query(query);
    return result.rows;
}

/**
 * Gets all of a specific user's reviews, filtered by visibility.
 * @param {number} userId - The ID of the logged-in user.
 * @param {boolean} is_public - The visibility flag (true for public, false for private).
 * @returns {Promise<Array>} A list of the user's reviews.
 */
export async function dbGetUserReviewsByVisibility(userId, is_public) {
    const db = getDB();
    const query = `
        SELECT ur.id, ur.rating, ur.review, ur.date_modified, ur.is_public,
               b.isbn as book_isbn, b.title as book_title, b.coverid as book_coverid
        FROM user_reviews ur
        JOIN books b ON ur.book_isbn = b.isbn
        WHERE ur.user_id = $1 AND ur.is_public = $2
        ORDER BY ur.date_modified DESC;
    `;
    const result = await db.query(query, [userId, is_public]);
    return result.rows;
}
