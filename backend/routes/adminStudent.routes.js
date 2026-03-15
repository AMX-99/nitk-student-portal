import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as validators from '../utils/validators.js';
import * as controller from '../controllers/adminStudent.controller.js';

const router = Router();

router.get('/', validate(validators.validateListStudents), controller.listStudents);
router.post('/', validate(validators.validateCreateStudent), controller.createStudent);
router.patch('/:id', validate(validators.validateUpdateStudent), controller.updateStudent);
router.delete('/:id', validate(validators.validateDeleteStudent), controller.deleteStudent);

export default router;