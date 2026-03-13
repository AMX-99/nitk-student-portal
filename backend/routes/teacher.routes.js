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
  updateCourseProgress ,
  changeTeacherPassword,
  getAllTeachersPublic,
  getPublicTeacherProfile,
  createTeacherNotice,
  uploadAvatar,
  updateProfile } from '../controllers/teacher.controller.js';
import { body, query } from 'express-validator';

const router = Router();
router.use(verifyJWT);
router.use(checkRole('teacher'));

router.get('/me', getMe);
router.patch('/me', updateProfile);
router.post('/me/avatar', uploadAvatar);
router.get('/me/courses', getMyCourses);
router.get('/courses/:id/students', getCourseStudents);
router.post('/marks', enterMarks);
router.get('/courses/:courseId/results', getCourseResults);
router.get('/courses/:id', getCourseDetails);
router.patch('/courses/:id/progress', updateCourseProgress);
router.post(
  '/attendance',
  [
    body('academic_year').matches(/^\d{4}-\d{2}$/),
    body('semester').isInt({ min: 1, max: 8 }),
    body('date').isISO8601(),
    body('records').isArray({ min: 1 }),
    body('records.*.student_id').isUUID(),
    body('records.*.status').isIn(['P', 'A']),
  ],
  markAttendance
);
router.get('/', getAllTeachersPublic);
router.get('/:id/public', getPublicTeacherProfile);
router.post('/notices', createTeacherNotice);
router.patch('/me/password', changeTeacherPassword);

export default router;