-- Drop tables in reverse order of creation to avoid foreign key constraint errors.
-- The CASCADE option will automatically remove any dependent objects.
DROP TABLE IF EXISTS user_reviews CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table to store login information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

-- Create the books table to store general book information.
-- This table is a central catalog of all books added to the system.
CREATE TABLE books (
    isbn BIGINT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    year INTEGER,
    pages INTEGER,
    coverid BIGINT
);

-- Create the user_reviews table.
-- This is a "join table" connecting a user to a book with their specific review.
CREATE TABLE user_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_isbn BIGINT NOT NULL REFERENCES books(isbn) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    summary TEXT,
    date_modified DATE NOT NULL,
    
    -- This constraint is crucial: it ensures a user can only review a book once.
    UNIQUE (user_id, book_isbn)
);
