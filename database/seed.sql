USE lms_db;

-- Passwords are hashed versions of "password123" for simplicity of seed (using a pre-computed bcrypt hash)
-- $2a$10$C8Y9oHw76K.u/9fBxH20U.8eZ1c8yL9F0g4r7O5k0Vp4A1y2z3aO2 -> password123
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES 
(1, 'Admin User', 'admin@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDIHv5u.P7LwY8s6', 'admin'),
(2, 'Student User', 'student@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDIHv5u.P7LwY8s6', 'student');

INSERT IGNORE INTO subjects (id, title, description) VALUES
(1, 'Full-Stack Web Development', 'Learn to build professional web applications from scratch.'),
(2, 'Machine Learning Basics', 'An introduction to ML algorithms and Python integration.');

INSERT IGNORE INTO sections (id, subject_id, title, order_index) VALUES
(1, 1, 'Frontend Fundamentals', 1),
(2, 1, 'Backend with Node.js', 2),
(3, 2, 'Python Refresher', 1);

INSERT IGNORE INTO lessons (id, section_id, title, video_url, duration_seconds, order_index) VALUES
(1, 1, 'HTML & CSS Basics', 'qz0aGYrrlhU', 1800, 1), -- dummy youtube ids
(2, 1, 'Introduction to React', 'bMknfKXIFA8', 2400, 2),
(3, 2, 'Express Setup & Routing', 'L72fhGm1tfE', 2100, 1),
(4, 3, 'Python Syntax and Variables', 'kqtD5dpn9C8', 1200, 1);
