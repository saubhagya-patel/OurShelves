import React from 'react';
import { Link } from 'react-router-dom';

// A simple star rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    } else if (i - 0.5 === roundedRating) {
      stars.push(<span key={i} className="text-yellow-400">★</span>); // Simplified for now, could use half-star icons
    } else {
      stars.push(<span key={i} className="text-gray-400">☆</span>);
    }
  }
  return <div className="flex">{stars}</div>;
};


function BookCard({ book }) {
  // Construct the cover image URL
  const coverImageUrl = book.coverid
    ? `https://covers.openlibrary.org/b/id/${book.coverid}-M.jpg`
    : 'https://via.placeholder.com/180x280.png?text=No+Cover';

  return (
    <Link to={`/books/${book.isbn}`} className="block group">
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl">
        <img
          src={coverImageUrl}
          alt={`Cover of ${book.title}`}
          className="w-full h-72 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-teal-400 transition-colors">{book.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{book.author}</p>
          <div className="mt-3 flex items-center justify-between">
            <StarRating rating={book.average_rating || 0} />
            <span className="text-xs text-gray-500">
              ({book.review_count || 0} reviews)
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
