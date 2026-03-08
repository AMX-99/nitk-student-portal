import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';

import { revokeUserSessions, updateProfile, uploadAvatar } from '../controllers/admin.controller.js';
import { getStats, getDeptDistribution } from '../controllers/adminStats.controller.js';
import studentRoutes from './adminStudent.routes.js';
import teacherRoutes from './adminTeacher.routes.js';
import departmentRoutes from './adminDepartment.routes.js';
import teachercourseRoutes from './adminTeacherCourse.routes.js';
import enrollmentRoutes from './adminStudentEnrollment.routes.js';
import timetableRoutes from './adminTimetable.routes.js';
import examRoutes from './adminExam.routes.js';

const router = Router();
router.use(verifyJWT);
router.use(checkRole('admin'));

router.patch('/me', updateProfile);
router.post('/me/avatar', uploadAvatar);

router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teacher-courses', teachercourseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/departments',departmentRoutes);
router.use('/timetable', timetableRoutes);
router.use('/exams', examRoutes);
router.get('/stats', getStats);
router.get('/dept-distribution', getDeptDistribution);
router.post('/users/:userId/revoke-sessions', revokeUserSessions);

export default router;
