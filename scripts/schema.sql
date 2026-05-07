CREATE DATABASE elibrary;
\c elibrary

CREATE TYPE user_type AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE transaction_status AS ENUM ('active', 'returned', 'overdue');

CREATE TABLE users (
    user_id    SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    user_type  user_type DEFAULT 'student',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    book_id            SERIAL PRIMARY KEY,
    title              VARCHAR(300) NOT NULL,
    author             VARCHAR(200) NOT NULL,
    isbn               VARCHAR(20) UNIQUE,
    category           VARCHAR(100),
    total_licenses     INTEGER DEFAULT 5,
    available_licenses INTEGER DEFAULT 5,
    description        TEXT,
    cover_url          VARCHAR(500),
    created_at         TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_licenses CHECK (
        available_licenses >= 0 AND available_licenses <= total_licenses
    )
);

CREATE TABLE book_content (
    content_id      SERIAL PRIMARY KEY,
    book_id         INTEGER UNIQUE REFERENCES books(book_id) ON DELETE CASCADE,
    file_path       VARCHAR(500),
    file_url        VARCHAR(500),
    file_size_bytes INTEGER
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    book_id        INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    borrow_date    TIMESTAMP DEFAULT NOW(),
    due_date       TIMESTAMP,
    return_date    TIMESTAMP,
    status         transaction_status DEFAULT 'active'
);

-- Indexes
CREATE INDEX idx_users_email            ON users(email);
CREATE INDEX idx_books_title            ON books(title);
CREATE INDEX idx_books_author           ON books(author);
CREATE INDEX idx_books_category         ON books(category);
CREATE INDEX idx_transactions_user_id   ON transactions(user_id);
CREATE INDEX idx_transactions_book_id   ON transactions(book_id);
CREATE INDEX idx_transactions_status    ON transactions(status);
CREATE INDEX idx_transactions_user_stat ON transactions(user_id, status);