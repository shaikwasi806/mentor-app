import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const createSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        const [result]: any = await pool.query('INSERT INTO subjects (title, description) VALUES (?, ?)', [title, description]);
        res.json({ id: result.insertId, title, description });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createSection = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const { title, orderIndex } = req.body;
        const [result]: any = await pool.query('INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)', [courseId, title, orderIndex]);
        res.json({ id: result.insertId, subject_id: courseId, title, order_index: orderIndex });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { sectionId } = req.params;
        const { title, videoUrl, durationSeconds, orderIndex } = req.body;
        const [result]: any = await pool.query(
            'INSERT INTO lessons (section_id, title, video_url, duration_seconds, order_index) VALUES (?, ?, ?, ?, ?)', 
            [sectionId, title, videoUrl, durationSeconds, orderIndex]
        );
        res.json({ id: result.insertId, section_id: sectionId, title, video_url: videoUrl, duration_seconds: durationSeconds, order_index: orderIndex });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        await pool.query('UPDATE subjects SET title = ?, description = ? WHERE id = ?', [title, description, id]);
        res.json({ id, title, description });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSection = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, orderIndex } = req.body;
        await pool.query('UPDATE sections SET title = ?, order_index = ? WHERE id = ?', [title, orderIndex, id]);
        res.json({ id, title, order_index: orderIndex });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSection = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM sections WHERE id = ?', [id]);
        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, videoUrl, durationSeconds, orderIndex } = req.body;
        await pool.query(
            'UPDATE lessons SET title = ?, video_url = ?, duration_seconds = ?, order_index = ? WHERE id = ?',
            [title, videoUrl, durationSeconds, orderIndex, id]
        );
        res.json({ id, title, video_url: videoUrl, duration_seconds: durationSeconds, order_index: orderIndex });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
