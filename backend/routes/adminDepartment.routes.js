import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/adminDepartment.controller.js';

const router = Router();
router.use(verifyJWT, checkRole('admin'));

router.get('/', getAllDepartments);
router.get('/:id', validate([
  param('id').isInt().withMessage('Department ID must be an integer')
]), getDepartmentById);

router.post('/',
  validate([
    body('name').notEmpty().withMessage('Department name is required')
      .isLength({ max: 150 }).withMessage('Name too long'),
    body('code').notEmpty().withMessage('Department code is required')
      .isLength({ max: 10 }).withMessage('Code too long')
      .matches(/^[A-Z]+$/).withMessage('Code must be uppercase letters only'),
    body('hod_name').optional().isLength({ max: 100 }),
    body('established').optional().isInt({ min: 1900, max: 2100 }).withMessage('Invalid year')
  ]),
  createDepartment
);

router.patch('/:id',
  validate([
    param('id').isInt().withMessage('Department ID must be an integer'),
    body('name').optional().isLength({ max: 150 }),
    body('code').optional().isLength({ max: 10 }).matches(/^[A-Z]+$/),
    body('hod_name').optional().isLength({ max: 100 }),
    body('established').optional().isInt({ min: 1900, max: 2100 })
  ]),
  updateDepartment
);

router.delete('/:id', validate([
  param('id').isInt().withMessage('Department ID must be an integer')
]), deleteDepartment);

export default router;