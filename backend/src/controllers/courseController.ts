import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export const getSubjects = async (req: Request, res: Response) => {
    try {
        const [subjects]: any = await pool.query('SELECT * FROM subjects');
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSubjectDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const [subjects]: any = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
        
        if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
        
        const subject = subjects[0];
        
        const [sections]: any = await pool.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [id]);
        
        for (let section of sections) {
            const [lessons]: any = await pool.query('SELECT * FROM lessons WHERE section_id = ? ORDER BY order_index ASC', [section.id]);
            
            // fetch progress if user authenticated
            if (req.user) {
                for (let lesson of lessons) {
                    const [progress]: any = await pool.query('SELECT * FROM video_progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, lesson.id]);
                    lesson.progress = progress.length > 0 ? progress[0] : null;
                }
            } else {
                for(let lesson of lessons) lesson.progress = null;
            }
            section.lessons = lessons;
        }

        subject.sections = sections;
        res.json(subject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const enrollSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        
        const [existing]: any = await pool.query('SELECT * FROM subject_enrollments WHERE user_id = ? AND subject_id = ?', [userId, id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Already enrolled' });

        await pool.query('INSERT INTO subject_enrollments (user_id, subject_id) VALUES (?, ?)', [userId, id]);
        res.json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const [enrollments]: any = await pool.query(`
            SELECT s.* FROM subjects s
            JOIN subject_enrollments se ON s.id = se.subject_id
            WHERE se.user_id = ?
        `, [userId]);
        
        // Add completion percentage logic here as needed
        res.json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
    const { lessonId } = req.params;
    const { progressSeconds, isCompleted } = req.body;
    const userId = req.user!.id;

    try {
        const [existing]: any = await pool.query('SELECT * FROM video_progress WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);
        
        if (existing.length > 0) {
            await pool.query(
                'UPDATE video_progress SET progress_seconds = GREATEST(progress_seconds, ?), is_completed = GREATEST(is_completed, ?) WHERE user_id = ? AND lesson_id = ?',
                [progressSeconds, isCompleted ? 1 : 0, userId, lessonId]
            );
        } else {
            await pool.query(
                'INSERT INTO video_progress (user_id, lesson_id, progress_seconds, is_completed) VALUES (?, ?, ?, ?)',
                [userId, lessonId, progressSeconds, isCompleted ? 1 : 0]
            );
        }

        res.json({ message: 'Progress updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
