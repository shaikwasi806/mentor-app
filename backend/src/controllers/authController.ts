import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [existingUsers]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result]: any = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        );

        // Store refresh token
        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, datetime(\'now\', \'+7 days\'))',
            [user.id, refreshToken]
        );

        res.json({
            token,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    // refresh logic here
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const [tokens]: any = await pool.query('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime(\'now\')', [token]);
        if (tokens.length === 0) return res.status(403).json({ message: 'Invalid refresh token' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as any;
        const [users]: any = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) return res.status(403).json({ message: 'User not found' });

        const user = users[0];
        const newToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({ token: newToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

export const me = async (req: any, res: Response) => {
    try {
        const [users]: any = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
