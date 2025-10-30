import React, { useState, useEffect } from 'react';
import { getBooks, getLatestReviews } from '../services/apiClient';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function HomePage() {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();
  const [books, setBooks] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated) {
          const response = await getBooks(token);
          setBooks(response.data);
        } else {
          const response = await getLatestReviews();
          setLatestReviews(response.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token, isAuthLoading]);

  if (isLoading || isAuthLoading) {
    return <div className="text-center mt-20">Loading...</div>;
  }
  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  // ==========================
  // Render Member Homepage
  // ==========================
  if (isAuthenticated) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">My Library</h1>
        {books.length === 0 ? (
          <p className="text-center text-gray-400">Your library is empty. Go to "Add a Book" to get started!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================
  // Render Guest Homepage
  // ==========================
  return (
    <div>
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-lg mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to BookNotes</h1>
        <p className="text-lg text-gray-300 mb-6">Discover and share reviews for the books you love.</p>
        <Link
          to="/register"
          className="bg-teal-500 text-white px-6 py-3 rounded-md font-bold text-lg hover:bg-teal-600 transition-colors"
        >
          Sign Up to Join the Community
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Latest Community Reviews</h2>
      <div className="space-y-4">
        {latestReviews.length > 0 ? (
          latestReviews.map((review) => {
            
            const rating = Math.round(review.rating || 0); 
            const grayStars = 5 - rating;
            
            return (
              <div key={review.id} className="bg-slate-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-400">{review.email.split('@')[0]}</span>
                  <span className="text-yellow-400">
                    {'★'.repeat(rating)}
                    <span className="text-gray-600">{'★'.repeat(grayStars)}</span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">reviewed <strong className="text-gray-300">{review.title}</strong></p>
                <p className="text-gray-200 italic">"{review.review}"</p>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No public reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;

