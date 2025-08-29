import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check for a token in local storage on initial app load
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      // Check if the stored user is a valid, non-empty string before parsing
      if (storedToken && storedUser && storedUser !== 'undefined') {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If parsing fails, clear the corrupted storage
      console.error("Failed to parse auth user from localStorage", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false); // Finished loading auth status
    }
  }, []);

  const login = (userData, authToken) => {
    // Ensure we don't store undefined values
    if (userData && authToken) {
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // The value that will be available to all consuming components
  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token, // A handy boolean to check if logged in
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy consumption of the context
export const useAuth = () => {
  return useContext(AuthContext);
};

