import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';

import { revokeUserSessions } from '../controllers/admin.controller.js';
import { getStats, getDeptDistribution } from '../controllers/adminStats.controller.js';
import studentRoutes from './adminStudent.routes.js';
import teacherRoutes from './adminTeacher.routes.js';
import departmentRoutes from './adminDepartment.routes.js';
import teachercourseRoutes from './adminTeacherCourse.routes.js';
import timetableRoutes from './adminTimetable.routes.js';
import examRoutes from './adminExam.routes.js';

const router = Router();
router.use(verifyJWT);
router.use(checkRole('admin'));

router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teachercourse', teachercourseRoutes);
router.use('/department',departmentRoutes);
router.use('/timetable', timetableRoutes);
router.use('/exams', examRoutes);
router.get('/stats', getStats);
router.get('/dept-distribution', getDeptDistribution);
router.post('/users/:userId/revoke-sessions', revokeUserSessions);

export default router;