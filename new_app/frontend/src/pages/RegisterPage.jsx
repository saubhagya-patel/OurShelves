import React, { useState } from 'react';
import { searchExternalBooks, addBook } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addSuccess, setAddSuccess] = useState('');
  // NEW: State to track ISBNs of successfully added books
  const [addedBooks, setAddedBooks] = useState(new Set());


  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setAddSuccess('');
    setResults([]); // Clear previous results immediately
    try {
      const response = await searchExternalBooks(query, token);
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch search results.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (book) => {
    // Reset messages for immediate feedback on click
    setError(null);
    setAddSuccess('');

    try {
      const bookData = {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        year: book.year,
        pages: book.pages,
        coverid: book.coverid,
      };
      await addBook(bookData, token);
      setAddSuccess(`'${book.title}' was added to the library!`);
      // NEW: Add the ISBN to our set of added books
      setAddedBooks(new Set(addedBooks).add(book.isbn));

    } catch (err) {
      if (err.response?.status === 409) {
        setError(`'${book.title}' is already in the library.`);
        // Also mark it as "added" in the UI
        setAddedBooks(new Set(addedBooks).add(book.isbn));
      } else {
        setError('Failed to add book.');
      }
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Add a New Book</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book by title or ISBN..."
          className="flex-grow px-4 py-2 text-gray-200 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 font-bold text-white bg-teal-500 rounded-md hover:bg-teal-600 disabled:bg-slate-600"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {addSuccess && <p className="text-center text-green-500 mb-4">{addSuccess}</p>}

      <div className="space-y-4">
        {results.map((book) => {
          const isAdded = addedBooks.has(book.isbn);
          return (
            <div key={book.isbn} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={book.coverid ? `https://covers.openlibrary.org/b/id/${book.coverid}-S.jpg` : 'https://placehold.co/50x75/2d3748/edf2f7?text=N/A'}
                  alt={book.title}
                  className="w-12 h-auto rounded"
                />
                <div>
                  <h3 className="font-bold text-white">{book.title}</h3>
                  <p className="text-sm text-gray-400">{book.author}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddBook(book)}
                disabled={isAdded} // Disable button if book is added
                className={`px-4 py-1 font-semibold text-sm text-white rounded-md transition-colors ${
                  isAdded
                    ? 'bg-green-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAdded ? 'Added ✔' : 'Add to Library'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchPage;

