import axios from 'axios';
import { book_util } from '../util/index.js';


const API_URL = "https://openlibrary.org/search.json?q=";

/**
 * Controller to get all books from our local database.
 * Anyone can view the list of books.
 */
export const getAllBooks = async (req, res) => {
    try {
        const books = await book_util.dbGetAllBooks();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve books." });
    }
};

/**
 * Controller for adding a new book to the database.
 * This happens after a user searches for a book and decides to add it.
 * This is a protected action.
 */
export const addBook = async (req, res) => {
    try {
        // First, check if the book already exists to avoid duplicates
        let book = await book_util.dbGetBookByIsbn(req.body.isbn);

        if (!book) {
            // If it doesn't exist, add it to the main 'books' table
            book = await book_util.dbAddBook(req.body);
        }

        // Send back the book info (either existing or newly created)
        res.status(201).json(book);
    } catch (error) {
        // Handle potential database errors, e.g., unique constraint violation
        if (error.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({ error: "This book already exists in the library." });
        }
        res.status(500).json({ error: "Failed to add the book." });
    }
};

/**
 * Controller for adding or updating a user's review for a book.
 * This is a protected action. The user's ID is retrieved from the token.
 */
export const addReview = async (req, res) => {
    try {
        const { isbn } = req.params;
        const { rating, summary } = req.body;
        const userId = req.user.id; // Comes from the 'protect' middleware

        if (!rating) {
            return res.status(400).json({ error: "Rating is required." });
        }

        // First, ensure the book exists in our database
        const book = await book_util.dbGetBookByIsbn(isbn);
        if (!book) {
            return res.status(404).json({ error: "You must add the book to the library before reviewing it." });
        }

        const newReview = await book_util.dbAddOrUpdateReview(userId, isbn, rating, summary);
        res.status(201).json(newReview);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to add or update review." });
    }
};


/**
 * Controller to search the external Open Library API.
 * This is a protected action to prevent API abuse.
 */
export const searchOpenLibrary = async (req, res) => {
    const { query } = req.query; // e.g., /api/books/search/external?query=dune

    if (!query) {
        return res.status(400).json({ error: "A search query is required." });
    }

    try {
        const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+');
        
        const fields = 'key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median';
        const searchUrl = `${API_URL}${encodedQuery}&fields=${fields}&limit=20`;

        const response = await axios.get(searchUrl);

        // Filter and format the results to be more frontend-friendly
        const formattedResults = response.data.docs.map(doc => ({
            // The API returns isbn as an array, we take the first one.
            isbn: doc.isbn ? doc.isbn[0] : null,
            title: doc.title,
            author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
            year: doc.first_publish_year,
            pages: doc.number_of_pages_median,
            coverid: doc.cover_i
        }))
        .filter(book => book.isbn); // This filter now works because we requested the ISBN.

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("Error searching Open Library:", error);
        res.status(500).json({ error: "Failed to search for books." });
    }
};

/**
 * Controller to get detailed information for a single book by its ISBN.
 */
export const getBookDetails = async (req, res) => {
    try {
        const { isbn } = req.params;
        const bookDetails = await book_util.dbGetBookByIsbn(isbn);

        if (!bookDetails) {
            return res.status(404).json({ message: "Book not found in our library." });
        }

        const allReviews = await book_util.dbGetReviewsForBook(isbn);
        const { average_rating, review_count } = await book_util.dbGetAverageRating(isbn);

        let userReview = null;
        // Check if a user is logged in (req.user is added by our 'protect' middleware)
        if (req.user) {
            const foundUserReview = await book_util.dbGetUserReviewForBook(req.user.id, isbn);
            if (foundUserReview) {
                userReview = foundUserReview;
            }
        }

        // Filter the main reviews list to exclude the current user's review,
        // as we're sending it separately.
        const communityReviews = allReviews.filter(r => !userReview || r.id !== userReview.id);

        // Send the final, nested object that the frontend expects
        res.status(200).json({
            details: bookDetails,
            reviews: communityReviews,
            average_rating: parseFloat(average_rating) || 0,
            review_count,
            userReview,
        });

    } catch (error) {
        console.error("Error in getBookDetails controller:", error);
        res.status(500).json({ message: "Server error while fetching book details." });
    }
};

