import React, { useState, useEffect } from 'react';

// NEW: Added onCancel prop
function ReviewForm({ initialData = { rating: 0, review: '', is_public: false }, onSubmit, isSubmitting, onCancel }) {
  const [rating, setRating] = useState(initialData.rating);
  const [review, setReview] = useState(initialData.review);
  const [isPublic, setIsPublic] = useState(initialData.is_public);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialData.rating);
    setReview(initialData.review);
    setIsPublic(initialData.is_public);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, review, is_public: isPublic });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        {initialData.rating > 0 ? 'Update Your Review' : 'Write a Review'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Your Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer text-4xl ${
                  (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="review-text" className="block text-gray-400 mb-2">
            Your Review
          </label>
          <textarea
            id="review-text"
            rows="4"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What did you think of the book?"
            className="w-full px-3 py-2 text-gray-200 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="is_public" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                id="is_public" 
                className="sr-only" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'translate-x-6 bg-teal-400' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-300">
              Make review public
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-1">
            {isPublic 
              ? "This review will be visible to the community." 
              : "This is a private note, only visible to you."
            }
          </p>
        </div>
        
        {/* --- NEW: Button Group --- */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 font-bold text-white bg-teal-500 rounded-md hover:bg-teal-600 disabled:bg-slate-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {/* NEW: Cancel Button */}
          <button
            type="button" // Important: type="button" to prevent form submission
            onClick={onCancel}
            className="flex-1 px-4 py-2 font-bold text-gray-300 bg-slate-600 rounded-md hover:bg-slate-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;

