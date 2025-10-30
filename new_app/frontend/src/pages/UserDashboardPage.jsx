import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyReviews } from '../services/apiClient';
import { Link } from 'react-router-dom';

function MyReviewsPage() {
  const [view, setView] = useState('private'); // 'private' or 'public'
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoading: isAuthLoading } = useAuth();

  const fetchReviews = useCallback(async () => {
    if (isAuthLoading || !token) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyReviews(view, token);
      setReviews(response.data);
    } catch (err) {
      setError('Failed to fetch your reviews.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [view, token, isAuthLoading]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]); // This will re-fetch when 'view' or 'token' changes

  const TabButton = ({ tabName, title }) => {
    const isActive = view === tabName;
    return (
      <button
        onClick={() => setView(tabName)}
        className={`px-6 py-3 font-bold rounded-t-lg transition-colors
          ${isActive 
            ? 'bg-slate-800 text-teal-400' 
            : 'bg-slate-900 text-gray-400 hover:text-gray-200'
          }`}
      >
        {title}
      </button>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">My Reviews</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700 mb-6">
        <TabButton tabName="private" title="My Private Reviews" />
        <TabButton tabName="public" title="My Public Reviews" />
      </div>

      {/* Content Area */}
      <div>
        {isLoading ? (
          <div className="text-center text-gray-400">Loading reviews...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-500">
            {view === 'private'
              ? "You haven't written any private notes."
              : "You haven't written any public reviews."
            }
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-slate-800 p-4 rounded-lg shadow flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">For the book:</p>
                  <h3 className="text-xl font-semibold text-white mb-2">{review.book_title}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-600">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  <p className="text-gray-300 italic">"{review.review}"</p>
                </div>
                <Link 
                  to={`/books/${review.book_isbn}`}
                  className="mt-1 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors"
                >
                  View Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReviewsPage;
