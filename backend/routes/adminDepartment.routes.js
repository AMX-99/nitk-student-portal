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
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.patch('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;