import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Brand/Logo */}
          <Link to="/" className="text-2xl font-bold text-white hover:text-teal-400 transition-colors">
            BookNotes
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              // Links for logged-in users
              <>
                <Link to="/search" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Add a Book
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 hidden sm:block">Welcome, {user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Links for logged-out users
              <>
                <Link to="/login" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

