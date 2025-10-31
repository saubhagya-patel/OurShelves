-- Drop existing tables in reverse order to avoid dependency conflicts



-- DROP TABLE IF EXISTS "user_reviews" CASCADE;
-- DROP TABLE IF EXISTS "books" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;

-- these should be run iff, you wanna delete the db data, or at initialization

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT current_timestamp
);


CREATE TABLE IF NOT EXISTS "books" (
    "isbn" BIGINT PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "year" INTEGER,
    "pages" INTEGER,
    "coverid" BIGINT
);


CREATE TABLE IF NOT EXISTS "user_reviews" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "book_isbn" BIGINT NOT NULL REFERENCES "books"("isbn") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "review" TEXT,
    "date_modified" DATE NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    
    -- A user can only review a specific book once
    UNIQUE ("user_id", "book_isbn")
);

-- =================================================================
-- INSERT SAMPLE DATA
-- =================================================================

-- -- 1. Create Users
-- -- Passwords are: alice123, bob123, charlie123, david123
-- INSERT INTO users (email, password_hash) VALUES
-- ('alice@example.com', '$2a$10$f/O.l2.8/s.sAx.A90i.eOplj.1.3yJt8.t.E9ZJtV9P.e.5.B.W6'), -- alice123
-- ('bob@example.com', '$2a$10$wT8a.g.E.I.I.i.q.e.g.u.G.m.y.D.E/I.A.h.k.X.B.Q.Z.Q.B.i'), -- bob123
-- ('charlie@example.com', '$2a$10$k.K.K.a.T.e.h.E.g.L.k.A.N.i.e.l.c.B.c.s.g.A.s.G.u.L.k'), -- charlie123
-- ('david@example.com', '$2a$10$Q.O.Z.Q.B.i.A.w.T.E.A.M.a.n.T.e.s.t.E.r.s.C.o.m/I.A.s'); -- david123

-- -- 2. Create Books (NEW LIST)
-- INSERT INTO books (isbn, title, author, year, pages, coverid) VALUES
-- (9798772338162, 'The Great Gatsby', 'F. Scott Fitzgerald', 1920, 186, 10590366),
-- (9780882339726, 'Nineteen Eighty-Four', 'George Orwell', 1949, 320, 9267242),
-- (9780575081505, 'Dune', 'Frank Herbert', 1965, 592, 11481354),
-- (9781417605231, 'Harry Potter and the Chamber of Secrets', 'J. K. Rowling', 1998, 341, 8392798),
-- (9788417247218, 'To Kill a Mockingbird', 'Harper Lee', 1960, 322, 12606502),
-- (9780140237504, 'The Catcher in the Rye', 'J. D. Salinger, SparkNotes', 1945, 240, 9273490),
-- (9780618129010, 'The Lord of the Rings', 'J.R.R. Tolkien', 1954, 1193, 14625765),
-- (9781973819677, 'Pride and Prejudice', 'Jane Austen', 1813, 351, 14348537),
-- (9780385121675, 'The Shining', 'Stephen King', 1977, 506, 12376585),
-- (9780008627843, 'The Hobbit', 'J.R.R. Tolkien', 1937, 310, 14627509);

-- -- 3. Create Reviews (Updated with new ISBNs)
-- -- (1=Alice, 2=Bob, 3=Charlie, 4=David)

-- -- === Alice's Reviews ===
-- -- Alice's Private Note for Dune
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (1, 9780575081505, 5, 'This is a private note. The world-building is incredible, but the politics are dense. I need to re-read the first half.', false, '2025-01-10');
-- -- Alice's Public Review for The Great Gatsby
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (1, 9798772338162, 4, 'A truly beautiful and tragic story. The prose is lyrical, and the critique of the American Dream is timeless. Highly recommend.', true, '2025-01-15');
-- -- Alice's Public Review for Harry Potter
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (1, 9781417605231, 5, 'My favorite of the series. The plot twist was amazing and it sets up the finale perfectly. A must-read for any fan.', true, '2025-02-01');

-- -- === Bob's Reviews ===
-- -- Bob's Public Review for 1984
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (2, 9780882339726, 5, 'Very thought-provoking and honestly a bit scary. It feels more relevant every year. This is a foundational book for modern society.', true, '2025-02-10');
-- -- Bob's Public Review for Harry Potter
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (2, 9781417605231, 5, 'My all-time favorite book. I reread it every year. The character development is just fantastic.', true, '2025-02-11');
-- -- Bob's Private Note for The Shining
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (2, 9780385121675, 4, 'Way scarier than the movie. The hotel itself is a character. I should re-watch the movie now to compare again.', false, '2025-03-01');

-- -- === Charlie's Reviews ===
-- -- Charlie's Public Review for The Great Gatsby
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (3, 9798772338162, 4, 'I had to read this in high school and hated it, but I appreciate it so much more as an adult. The symbolism is everywhere. Great novel.', true, '2025-03-05');
-- -- Charlie's Public Review for The Hobbit
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (3, 9780008627843, 5, 'A perfect adventure. It''s cozy, exciting, and just a joy to read from start to finish. Smaug is an all-time great villain.', true, '2025-03-10');
-- -- Charlie's Private Note for The Catcher in the Rye
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (3, 9780140237504, 2, 'I still don''t get the hype. Holden is just an annoying kid. I don''t think I''ll ever like this book.', false, '2025-03-11');
-- -- Charlie's Public Review for Dune
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (3, 9780575081505, 5, 'This is science fiction at its absolute peak. The scale is massive, but the story is so personal. A masterpiece.', true, '2025-04-01');

-- -- === David's Reviews ===
-- -- David's Public Review for The Lord of the Rings
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9780618129010, 5, 'The gold standard for all fantasy. The amount of detail in the world is unmatched. It''s a long read but worth every single page.', true, '2025-04-02');
-- -- David's Public Review for Pride and Prejudice
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9781973819677, 4, 'The humor is so sharp and witty. Elizabeth Bennet is a fantastic protagonist. I can see why it''s a classic.', true, '2025-04-05');
-- -- David's Public Review for To Kill a Mockingbird
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9788417247218, 5, 'An incredibly powerful and important book. Atticus Finch is a moral compass. Everyone should read this at least once in their life.', true, '2025-04-10');
-- -- David's Public Review for 1984
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9780882339726, 5, 'Reading this was a chilling experience. It''s a stark warning that everyone needs to heed. Orwell was a genius.', true, '2025-04-11');
-- -- David's Public Review for The Hobbit
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9780008627843, 4, 'A wonderful and charming adventure. It''s much lighter than Lord of the Rings, which I appreciated. A perfect book to read on a rainy day.', true, '2025-04-15');
-- -- David's Private Note for The Catcher in the Rye
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9780140237504, 3, 'My third time trying to read this. I still find Holden to be insufferable, but I think I''m starting to understand what Salinger was going for.', false, '2025-04-16');
-- -- David's Public Review for The Shining
-- INSERT INTO user_reviews (user_id, book_isbn, rating, review, is_public, date_modified) VALUES
-- (4, 9780385121675, 5, 'King''s best work, in my opinion. The slow burn of the hotel''s influence and Jack''s descent into madness is terrifying. The book is brilliant.', true, '2025-04-20');
