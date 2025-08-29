import { getDB } from '../db/db_instance.js';

/**
 * Retrieves all books from the database along with their average rating
 * and the total number of reviews.
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
            LEFT JOIN user_reviews ur ON b.isbn = ur.book_isbn
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
 * Finds a book by its ISBN. If it doesn't exist, it returns null.
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
 * This is separate from adding a review.
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
 * It uses ON CONFLICT to handle both INSERT and UPDATE in one query.
 * @param {number} userId - The ID of the user submitting the review.
 * @param {number} bookIsbn - The ISBN of the book being reviewed.
 * @param {number} rating - The user's rating (1-10).
 * @param {string} summary - The user's review text.
 * @returns {Promise<object>} The newly created or updated review.
 */
export async function dbAddOrUpdateReview(userId, bookIsbn, rating, summary) {
    const db = getDB();
    try {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            INSERT INTO user_reviews (user_id, book_isbn, rating, summary, date_modified)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, book_isbn) 
            DO UPDATE SET 
                rating = EXCLUDED.rating, 
                summary = EXCLUDED.summary, 
                date_modified = EXCLUDED.date_modified
            RETURNING *;
        `;
        const result = await db.query(query, [userId, bookIsbn, rating, summary, today]);
        return result.rows[0];
    } catch (error) {
        console.error("Error adding or updating review:", error);
        throw error;
    }
}

/**
 * Gets all reviews for a specific book.
 * @param {number} bookIsbn - The ISBN of the book.
 * @returns {Promise<Array>} A list of reviews for the book.
 */
export async function dbGetReviewsForBook(bookIsbn) {
    const db = getDB();
    try {
        const query = `
            SELECT ur.id, ur.rating, ur.summary, ur.date_modified, u.email as user_email
            FROM user_reviews ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.book_isbn = $1
            ORDER BY ur.date_modified DESC;
        `;
        const result = await db.query(query, [bookIsbn]);
        return result.rows;
    } catch (error) {
        console.error("Error getting reviews for book:", error);
        throw error;
    }
}

/**
 * Calculates the average rating and review count for a book.
 * @param {number|string} bookIsbn - The ISBN of the book.
 * @returns {Promise<object>} An object with average_rating and review_count.
 */
export async function dbGetAverageRating(bookIsbn) {
    const db = getDB();
    const query = `
        SELECT 
            COALESCE(AVG(rating), 0) as average_rating, 
            COUNT(id) as review_count
        FROM user_reviews 
        WHERE book_isbn = $1;
    `;
    const result = await db.query(query, [bookIsbn]);
    return result.rows[0];
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
