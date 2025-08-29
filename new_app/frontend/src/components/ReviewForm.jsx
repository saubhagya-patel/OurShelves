import React, { useState, useEffect } from 'react';

function ReviewForm({ initialData = { rating: 0, summary: '' }, onSubmit, isSubmitting }) {
  const [rating, setRating] = useState(initialData.rating);
  const [summary, setSummary] = useState(initialData.summary);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialData.rating);
    setSummary(initialData.summary);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, summary });
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
          <label htmlFor="summary" className="block text-gray-400 mb-2">
            Your Review
          </label>
          <textarea
            id="summary"
            rows="4"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What did you think of the book?"
            className="w-full px-3 py-2 text-gray-200 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-teal-500 rounded-md hover:bg-teal-600 disabled:bg-slate-600"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
