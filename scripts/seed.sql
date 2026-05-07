-- 1. Clear existing data (Optional, but keeps things clean)
TRUNCATE TABLE users, books, transactions, book_content RESTART IDENTITY CASCADE;

-- 2. Insert Users
INSERT INTO users (name, email, user_type) VALUES
('Abhisek Kanungo',  'kanungoabhi17@gmail.com', 'admin'),
('Arjun Sharma',     'arjun@college.edu',      'student'),
('Priya Patel',      'priya@college.edu',      'student'),
('Dr. Ramesh Kumar', 'ramesh@college.edu',     'faculty'),
('Sneha Nair',       'sneha@college.edu',      'student'),
('Vikram Singh',     'vikram@college.edu',     'student');

-- 3. Insert Books
INSERT INTO books (title, author, isbn, category, total_licenses, available_licenses, description) VALUES
('Introduction to Algorithms',  'Cormen, Leiserson, Rivest', '9780262033848', 'CS, Algorithms', 3, 3, 'The bible of algorithms.'),
('Concepts of Physics Vol 1',   'H.C. Verma',                '9788177091878', 'Physics',        5, 5, 'Classic physics textbook.'),
('Operating System Concepts',    'Galvin, Silberschatz',      '9781118063330', 'CS, Systems',    2, 2, 'Galvin OS book.'),
('Discrete Mathematics',         'Kenneth Rosen',             '9780073383095', 'Maths',          10, 10, 'Graph theory and combinatorics.'),
('Database System Concepts',     'Silberschatz, Korth',       '9780073523323', 'CS, DBMS',       4, 4, 'Standard DBMS textbook.'),
('Clean Code',                   'Robert C. Martin',          '9780132350884', 'CS, OOPs',       6, 6, 'Writing maintainable code.'),
('The C Programming Language',   'Kernighan, Ritchie',        '9780131103627', 'CS, Systems',    3, 3, 'Classic C book.'),
('Computer Organization',        'Carl Hamacher',             '9780070257537', 'CS, COA',        5, 5, 'COA fundamentals.');