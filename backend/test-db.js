const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'lms_db.sqlite');
const db = new Database(dbPath);

try {
    const users = db.prepare('SELECT * FROM users').all();
    console.log('Users in DB:', users);
} catch (e) {
    console.error('Error fetching users:', e.message);
}
db.close();
