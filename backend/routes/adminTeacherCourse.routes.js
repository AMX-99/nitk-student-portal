import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import { validate } from '../middleware/validate.js';
import { body, param } from 'express-validator';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from '../controllers/adminTeacherCourse.controller.js';

const router = Router();
router.use(verifyJWT, checkRole('admin'));

router.post('/',
  validate([
    body('teacher_id').isUUID().withMessage('Valid teacher ID required'),
    body('course_id').isInt().withMessage('Valid course ID required'),
    body('section').isLength({ min: 1, max: 1 }).isAlpha().withMessage('Section must be a single letter'),
    body('academic_year').matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
  ]),
  createAssignment
);
router.get('/', getAllAssignments);
router.get('/:id',
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  getAssignmentById
);
router.put('/:id',
  validate([param('id').isInt()]),
  validate([
    body('teacher_id').optional().isUUID(),
    body('course_id').optional().isInt(),
    body('section').optional().isLength({ min: 1, max: 1 }).isAlpha(),
    body('academic_year').optional().matches(/^\d{4}-\d{4}$/),
    body('semester').optional().isInt({ min: 1, max: 8 })
  ]),
  updateAssignment
);
router.delete('/:id', validate([param('id').isInt()]), deleteAssignment);

export default router;