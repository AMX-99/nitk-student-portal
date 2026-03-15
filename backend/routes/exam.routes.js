import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { getMyExams } from '../controllers/exam.controller.js';

const router = Router();
router.use(verifyJWT);
router.get('/me', getMyExams);

export default router;