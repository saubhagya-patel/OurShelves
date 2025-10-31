import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  const activeClassName = "text-teal-400 font-medium";
  const inactiveClassName = "text-gray-300 hover:text-teal-400 transition-colors";

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? activeClassName : inactiveClassName;
  };

  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Brand/Logo can stay as a Link, or be a NavLink if you want it active on "/" */}
          <Link to="/" className="text-2xl font-bold text-white hover:text-teal-400 transition-colors">
            Our-Shelves
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              // Links for logged-in users
              <>
                <NavLink to="/search" className={getNavLinkClass}>
                  Add a Book
                </NavLink>
                <NavLink to="/me/reviews" className={getNavLinkClass}>
                  My Reviews
                </NavLink>
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
                <NavLink to="/login" className={getNavLinkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => 
                    isActive 
                      ? "bg-teal-600 text-white px-4 py-2 rounded-md ring-2 ring-teal-400" 
                      : "bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors"
                  }
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

