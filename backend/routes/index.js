import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import attendanceRoutes from './attendance.routes.js';
import complaintRoutes from './complaint.routes.js';
import courseRoutes from './course.routes.js';
import directoryRoutes from './directory.routes.js';
import examRoutes from './exam.routes.js';
import feeRoutes from './fee.routes.js';
import noticeRoutes from './notice.routes.js';
import paymentRoutes from './payment.routes.js';
import resultRoutes from './result.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import TimetableRoutes from './timetable.routes.js';

const router = Router();
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/complaints', complaintRoutes);
router.use('/courses', courseRoutes);
router.use('/directory', directoryRoutes);
router.use('/exam', examRoutes);
router.use('/fee', feeRoutes);
router.use('/notices', noticeRoutes);
router.use('/payments', paymentRoutes);
router.use('/results', resultRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/timetable', TimetableRoutes);

export default router;
