import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetails, submitReview } from '../services/apiClient';
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
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW STATE: To control showing the review form ---
  const [isEditing, setIsEditing] = useState(false);

  const fetchBookDetails = useCallback(async () => {
    // --- THIS IS THE FIX ---
    // Wait for the auth context to be ready before fetching
    if (isAuthLoading) {
      return;
    }
    
    if (!token) {
        setIsLoading(false);
        setError("You must be logged in to view this page.");
        return;
    }
    try {
      setIsLoading(true);
      const response = await getBookDetails(isbn, token);
      setBook(response.data);
    } catch (err) {
      setError('Failed to fetch book details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isbn, token, isAuthLoading]); 

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);
  
  const handleReviewSubmit = async (reviewData) => {
    setIsSubmitting(true);
    try {
      await submitReview(isbn, reviewData, token);
      fetchBookDetails(); 
      setIsEditing(false); // --- NEW: Hide form on successful submit ---
    } catch (err) {
      console.error("Failed to submit review", err);
      setError("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Handler for the Cancel button ---
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const coverImageUrl = book?.details?.coverid
    ? `https://covers.openlibrary.org/b/id/${book.details.coverid}-L.jpg`
    : 'https://placehold.co/300x450/1a202c/edf2f7?text=No+Cover';

  if (isLoading || isAuthLoading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  if (!book) {
    return <div className="text-center mt-20">Book not found.</div>;
  }

  const reviewInitialData = book.userReview 
    ? { rating: book.userReview.rating, review: book.userReview.review, is_public: book.userReview.is_public }
    : { rating: 0, review: '', is_public: false };

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Cover and Info */}
        <div className="md:col-span-1">
          <img src={coverImageUrl} alt={`Cover of ${book.details.title}`} className="rounded-lg shadow-lg w-full" />
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-2">{book.details.title}</h2>
            <p className="text-gray-400">by {book.details.author}</p>
            <p className="text-gray-500 text-sm mt-1">Published in {book.details.year}</p>
            <div className="mt-4">
              <StarRating rating={book.average_rating} />
              <p className="text-sm text-gray-500 mt-1">
                {book.average_rating.toFixed(1)} average from {book.review_count} public reviews
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="md:col-span-2 space-y-8">

          {/* --- NEW: User Review Section Logic --- */}
          {isAuthenticated && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
              {isEditing ? (
                // --- STATE 1: User is actively editing ---
                <ReviewForm 
                  initialData={reviewInitialData}
                  onSubmit={handleReviewSubmit}
                  isSubmitting={isSubmitting}
                  onCancel={handleCancelEdit} // Pass the cancel handler
                />
              ) : book.userReview ? (
                // --- STATE 2: User has a review, but is not editing ---
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Your Review</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600"
                    >
                      Edit Review
                    </button>
                  </div>
                  <StarRating rating={book.userReview.rating} />
                  <p className="text-gray-300 italic mt-4">"{book.userReview.review}"</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {book.userReview.is_public ? "(Public)" : "(Private Note)"}
                  </p>
                </div>
              ) : (
                // --- STATE 3: User has no review and is not editing ---
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">You haven't reviewed this book.</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 font-bold text-white bg-teal-500 rounded-md hover:bg-teal-600"
                  >
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          )}
          {/* --- END: User Review Section Logic --- */}
          
          {/* Community Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Community Reviews (Public)</h2>
            <div className="space-y-4">
              {book.reviews.length > 0 ? (
                book.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-teal-400">{review.email.split('@')[0]}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-300 italic">"{review.review}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.date_modified).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No public reviews for this book yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

