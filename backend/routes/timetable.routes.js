import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { getMyTimetable } from '../controllers/timetable.controller.js';

const router = Router();
router.use(verifyJWT); 

router.get('/me', getMyTimetable);
export default router;