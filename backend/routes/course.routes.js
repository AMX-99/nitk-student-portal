import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import {getAllCourses, getCourseById
} from '../controllers/course.controller.js';

const router = Router();
router.use(verifyJWT);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

export default router;