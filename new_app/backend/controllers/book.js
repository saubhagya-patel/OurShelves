import axios from 'axios';
import { book_util, gemini_util } from '../util/index.js';

const API_URL = "https://openlibrary.org/search.json?q=";

/**
 * Controller to get all books from our local database.
 * Calls the util function that now only calculates ratings from *public* reviews.
 */
export const getAllBooks = async (req, res) => {
    try {
        const books = await book_util.dbGetAllBooks();
        res.status(200).json(books);
    } catch (error) {
        console.error("Error in getAllBooks controller:", error);
        res.status(500).json({ message: "Failed to retrieve books." });
    }
};

/**
 * Controller to get detailed information for a single book by its ISBN.
 * This now fetches *only public* reviews and checks for a *user-specific* review.
 */
export const getBookDetails = async (req, res) => {
    try {
        const { isbn } = req.params;
        const bookDetails = await book_util.dbGetBookByIsbn(isbn);

        if (!bookDetails) {
            return res.status(404).json({ message: "Book not found in our library." });
        }

        // Fetch all *public* reviews for the community section
        const publicReviews = await book_util.dbGetPublicReviewsForBook(isbn);
        
        // Fetch the book's public rating stats
        const { average_rating, review_count } = await book_util.dbGetPublicAverageRating(isbn);

        let userReview = null;
        // If a user is logged in, check if they have a review (public or private)
        if (req.user) {
            const foundUserReview = await book_util.dbGetUserReviewForBook(req.user.id, isbn);
            if (foundUserReview) {
                userReview = foundUserReview;
            }
        }

        // Send the final, nested object that the frontend expects
        res.status(200).json({
            details: bookDetails,
            reviews: publicReviews, // This is just the public list
            average_rating: parseFloat(average_rating) || 0,
            review_count,
            userReview, // This is the logged-in user's specific review
        });

    } catch (error) {
        console.error("Error in getBookDetails controller:", error);
        res.status(500).json({ message: "Server error while fetching book details." });
    }
};

/**
 * Controller for adding a new book to the database.
 * This is a protected action.
 */
export const addBook = async (req, res) => {
    const { isbn, title, author, year, pages, coverid } = req.body;
    if (!isbn || !title) {
        return res.status(400).json({ message: 'ISBN and Title are required.' });
    }

    try {
        const existingBook = await book_util.dbGetBookByIsbn(isbn);
        if (existingBook) {
            return res.status(409).json({ message: 'This book is already in the library.' });
        }
        const newBook = await book_util.dbAddBook({ isbn, title, author, year, pages, coverid });
        res.status(201).json(newBook);
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ message: "Failed to add book to the library." });
    }
};

/**
 * Controller for adding or updating a user's review for a book.
 * This is a protected action. The user's ID is retrieved from the token.
 * It now accepts the 'is_public' flag from the client.
 */
export const addOrUpdateReview = async (req, res) => {
    try {
        const { isbn } = req.params;
        const { rating, review, is_public } = req.body;
        const userId = req.user.id; // Comes from the 'protect' middleware

        if (rating === undefined || review === undefined || is_public === undefined) {
            return res.status(400).json({ message: "Rating, review, and is_public are required." });
        }
        
        // Ensure the book exists before we try to review it
        const bookExists = await book_util.dbGetBookByIsbn(isbn);
        if (!bookExists) {
            return res.status(404).json({ message: "Book not found." });
        }
        
        const reviewData = { userId, bookIsbn: isbn, rating, review, is_public };
        const newOrUpdatedReview = await book_util.dbAddOrUpdateReview(reviewData);
        
        res.status(201).json(newOrUpdatedReview);
    } catch (error) {
        console.error("Error in addOrUpdateReview controller:", error);
        res.status(500).json({ message: "Failed to add or update review." });
    }
};

/**
 * Controller to search the external Open Library API.
 * This is a protected action to prevent API abuse.
 */
export const searchOpenLibrary = async (req, res) => {
    const { query } = req.query; 

    if (!query) {
        return res.status(400).json({ message: "A search query is required." });
    }

    try {
        const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+');
        
        const fields = 'key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median';
        const searchUrl = `${API_URL}${encodedQuery}&fields=${fields}&limit=20`;

        const response = await axios.get(searchUrl);

        const formattedResults = response.data.docs.map(doc => ({
            isbn: doc.isbn ? doc.isbn[0] : null,
            title: doc.title,
            author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
            year: doc.first_publish_year,
            pages: doc.number_of_pages_median,
            coverid: doc.cover_i
        }))
        .filter(book => book.isbn); // Only include results that have an ISBN

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("Error searching Open Library:", error);
        res.status(500).json({ message: "Failed to search for books." });
    }
};

/**
 * Controller to get ai summary for reviews.
 * This is a protected action to prevent API abuse.
 */
export const getAiSummary = async (req, res) => {
  try {
    const { isbn } = req.params;
    
    const reviews = await book_util.dbGetPublicReviewsForBook(isbn);
    
    if (reviews.length < 10) {
      return res.status(400).json({ message: "Not enough reviews to generate a summary." });
    }

    const reviewTexts = reviews.map(r => r.review);
    const summary = await gemini_util.generateSummaryFromReviews(reviewTexts);
    
    res.status(200).json({ summary });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
