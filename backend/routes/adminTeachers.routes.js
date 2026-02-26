import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as validators from '../utils/validators.js';
import * as controller from '../controllers/adminTeacher.controller.js';

const router = Router();
router.get('/', validate(validators.validateListTeachers), controller.listTeachers);
router.post('/', validate(validators.validateCreateTeacher), controller.createTeacher);
router.patch('/:id', validate(validators.validateUpdateTeacher), controller.updateTeacher);
router.delete('/:id', validate(validators.validateDeleteTeacher), controller.deleteTeacher);

export default router;