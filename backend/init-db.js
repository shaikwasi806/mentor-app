const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'lms_db.sqlite');
const db = new Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE (user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS video_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    progress_seconds INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE (user_id, lesson_id)
);
`;

console.log('Initializing SQLite database schema...');
db.exec(schema);
console.log('Schema initialized successfully.');

// Seed data
const seed = `
-- Passwords: password123 -> $2a$10$C8Y9oHw76K.u/9fBxH20U.8eZ1c8yL9F0g4r7O5k0Vp4A1y2z3aO2 (common bcrypt)
-- Using the hash from seed.sql if it matches bcrypt
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES 
(1, 'Admin User', 'admin@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDIHv5u.P7LwY8s6', 'admin'),
(2, 'Student User', 'student@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDIHv5u.P7LwY8s6', 'student');

INSERT OR IGNORE INTO subjects (id, title, description) VALUES
(1, 'Full-Stack Web Development', 'Learn to build professional web applications from scratch.'),
(2, 'Machine Learning Basics', 'An introduction to ML algorithms and Python integration.');

INSERT OR IGNORE INTO sections (id, subject_id, title, order_index) VALUES
(1, 1, 'Frontend Fundamentals', 1),
(2, 1, 'Backend with Node.js', 2),
(3, 2, 'Python Refresher', 1);

INSERT OR IGNORE INTO lessons (id, section_id, title, video_url, duration_seconds, order_index) VALUES
(1, 1, 'HTML & CSS Basics', 'qz0aGYrrlhU', 1800, 1),
(2, 1, 'Introduction to React', 'bMknfKXIFA8', 2400, 2),
(3, 2, 'Express Setup & Routing', 'L72fhGm1tfE', 2100, 1),
(4, 3, 'Python Syntax and Variables', 'kqtD5dpn9C8', 1200, 1);
`;

console.log('Seeding database...');
db.exec(seed);
console.log('Database seeded successfully.');
db.close();
