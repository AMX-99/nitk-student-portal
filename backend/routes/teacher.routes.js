import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import { getMe , 
  getMyCourses ,
  getCourseStudents ,
  markAttendance ,
  enterMarks ,
  getCourseResults ,
  getCourseDetails ,
  updateCourse ,
  changeTeacherPassword} from '../controllers/teacher.controller.js';
import { body, query } from 'express-validator';

const router = Router();
router.use(verifyJWT);
router.use(checkRole('teacher'));

router.get('/me', getMe);
router.get('/me/courses', getMyCourses);
router.get('/courses/:id/students', getCourseStudents);
router.post('/results/enter', enterMarks);
router.get('/results/course/:courseId', getCourseResults);
router.get('/courses/:id', getCourseDetails);
router.patch('/courses/:id', updateCourse);
router.post(
  '/attendance/mark',
  [
    body('course_id').isInt(),
    body('academic_year').matches(/^\d{4}-\d{2}$/),
    body('semester').isInt({ min: 1, max: 8 }),
    body('date').isISO8601(),
    body('records').isArray({ min: 1 }),
    body('records.*.student_id').isUUID(),
    body('records.*.status').isIn(['P', 'A']),
  ],
  markAttendance
);
router.get('/', verifyJWT, getAllTeachersPublic);
router.get('/:id/public', verifyJWT, getPublicTeacherProfile);
router.patch('/me/password', changeTeacherPassword);

export default router;