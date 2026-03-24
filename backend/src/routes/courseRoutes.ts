import { Router } from 'express';
import { getSubjects, getSubjectDetails, enrollSubject, getMyEnrollments, updateProgress } from '../controllers/courseController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/', getSubjects);
router.get('/:id', authenticateToken, getSubjectDetails);
router.post('/:id/enroll', authenticateToken, enrollSubject);
router.get('/me/enrollments', authenticateToken, getMyEnrollments);
router.post('/progress/:lessonId', authenticateToken, updateProgress);

export default router;
