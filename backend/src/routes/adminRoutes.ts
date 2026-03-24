import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { 
    createSubject, createSection, createLesson, 
    updateSubject, deleteSubject, updateSection, deleteSection, updateLesson, deleteLesson 
} from '../controllers/adminController';

const router = Router();

router.post('/subjects', authenticateToken, requireAdmin, createSubject);
router.put('/subjects/:id', authenticateToken, requireAdmin, updateSubject);
router.delete('/subjects/:id', authenticateToken, requireAdmin, deleteSubject);

router.post('/subjects/:courseId/sections', authenticateToken, requireAdmin, createSection);
router.put('/sections/:id', authenticateToken, requireAdmin, updateSection);
router.delete('/sections/:id', authenticateToken, requireAdmin, deleteSection);

router.post('/sections/:sectionId/lessons', authenticateToken, requireAdmin, createLesson);
router.put('/lessons/:id', authenticateToken, requireAdmin, updateLesson);
router.delete('/lessons/:id', authenticateToken, requireAdmin, deleteLesson);

export default router;
