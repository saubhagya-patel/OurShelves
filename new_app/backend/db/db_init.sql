-- Drop existing tables in reverse order to avoid dependency conflicts
DROP TABLE IF EXISTS "user_reviews" CASCADE;
DROP TABLE IF EXISTS "books" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;


CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT current_timestamp
);


CREATE TABLE "books" (
    "isbn" BIGINT PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "year" INTEGER,
    "pages" INTEGER,
    "coverid" BIGINT
);


CREATE TABLE "user_reviews" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "book_isbn" BIGINT NOT NULL REFERENCES "books"("isbn") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    "review" TEXT,
    "date_modified" DATE NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    
    -- A user can only review a specific book once
    UNIQUE ("user_id", "book_isbn")
);
