import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../lms_db.sqlite');
const db = new Database(dbPath);

console.log(`Connected to SQLite at ${dbPath}`);

const pool = {
    query: async (sql: string, params: any[] = []) => {
        try {
            const stmt = db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const rows = stmt.all(...params);
                return [rows, null];
            } else {
                const info = stmt.run(...params);
                return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }, null];
            }
        } catch (error) {
            console.error('SQLite DB Error:', error);
            throw error;
        }
    }
};

export default pool;
