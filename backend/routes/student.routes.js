import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import { validate } from '../middleware/validate.js';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getCourses,
  getCgpaTrend,
  getAttendance,
  getResults,
  getFees,
  getPayments,
  getStudentFullProfileForTeacher,
  getPublicStudentProfile,
  changeStudentPassword
} from '../controllers/student.controller.js';
import { updateStudentSchema , passwordValidation} from '../utils/validators.js';

const router = Router();
router.use(verifyJWT);
router.use(checkRole('student'));

router.get('/me', getProfile);
router.patch('/me', validate(updateStudentSchema), updateProfile);
router.post('/me/avatar', uploadAvatar);
router.get('/me/courses', getCourses);
router.get('/me/cgpa-trend', getCgpaTrend);
router.get('/me/attendance', getAttendance);
router.get('/me/results', getResults);
router.get('/me/fees', getFees);
router.get('/me/payments', getPayments);
router.get('/:id', getStudentFullProfileForTeacher);
router.get('/:id/public', getPublicStudentProfile);
router.patch('/me/password', validate(passwordValidation), changeStudentPassword);

export default router;