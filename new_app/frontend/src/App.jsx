import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage, Navbar, SearchPage } from './components';
import { BookDetailPage, LoginPage, RegisterPage } from './pages';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Define routes for our pages here */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/books/:isbn" element={<BookDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
