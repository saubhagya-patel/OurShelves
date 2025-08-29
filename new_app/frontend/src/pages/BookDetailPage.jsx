import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetails, submitReview } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';

// A simple star rating component for display
const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    stars.push(<span key={i} className={i <= roundedRating ? "text-yellow-400" : "text-gray-600"}>★</span>);
  }
  return <div className="flex">{stars}</div>;
};

function BookDetailPage() {
  const { isbn } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await getBookDetails(isbn, token);
      // DEBUG: Log the raw data from the API to the browser console
      console.log("Data received from API:", response.data);
      setBook(response.data);
    } catch (err) {
      setError('Failed to fetch book details. Please check the console for more information.');
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isbn, token]);

  useEffect(() => {
    setIsLoading(true);
    fetchBookDetails();
  }, [fetchBookDetails]);
  
  const handleReviewSubmit = async (reviewData) => {
    setIsSubmitting(true);
    setError(null); // Clear previous errors
    try {
      await submitReview(isbn, reviewData, token);
      fetchBookDetails(); 
    } catch (err) {
      console.error("Failed to submit review", err);
      setError("There was an error submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Defensive check for book details before trying to access properties
  const coverImageUrl = book?.details?.coverid
    ? `https://covers.openlibrary.org/b/id/${book.details.coverid}-L.jpg`
    : 'https://placehold.co/300x450/1a202c/edf2f7?text=No+Cover';

  if (isLoading) {
    return <div className="text-center mt-20">Loading book details...</div>;
  }

  // Show a more prominent error message if the fetch failed
  if (error && !book) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  if (!book || !book.details) {
    return <div className="text-center mt-20">Book not found.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Cover and Info */}
        <div className="md:col-span-1">
          <img src={coverImageUrl} alt={`Cover of ${book.details.title}`} className="rounded-lg shadow-lg w-full" />
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            {/* Using optional chaining (?) for safer rendering */}
            <h2 className="text-xl font-bold text-white mb-2">{book.details?.title || 'Title not available'}</h2>
            <p className="text-gray-400">by {book.details?.author || 'Author Unknown'}</p>
            <p className="text-gray-500 text-sm mt-1">Published in {book.details?.year || 'N/A'}</p>
            <div className="mt-4">
              <StarRating rating={book.average_rating || 0} />
              <p className="text-sm text-gray-500 mt-1">
                {(book.average_rating || 0).toFixed(1)} average from {book.review_count || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="md:col-span-2 space-y-8">
          {isAuthenticated && (
            <ReviewForm 
              initialData={book.userReview || { rating: 0, summary: '' }}
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmitting}
            />
          )}
           {error && <p className="text-center text-red-500 my-4">{error}</p>}
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Community Reviews</h2>
            <div className="space-y-4">
              {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-teal-400">{review.email?.split('@')[0] || 'Anonymous'}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-300">{review.summary}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.date_modified).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

