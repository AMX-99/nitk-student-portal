import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { getTeachers, searchDirectory} from '../controllers/directory.controller.js';

const router = Router();
router.use(verifyJWT);
router.get('/teachers', getTeachers);
router.get('/search', searchDirectory);

export default router;