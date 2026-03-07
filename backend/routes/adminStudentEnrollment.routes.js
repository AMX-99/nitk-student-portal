import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as validators from '../utils/validators.js';
import * as controller from '../controllers/adminStudentEnrollment.controller.js';

const router = Router();

router.get('/', controller.listEnrollments);
router.post('/', controller.createEnrollment);
router.get('/:id', controller.getEnrollmentById);
router.put('/:id', controller.updateEnrollment);
router.delete('/:id', controller.deleteEnrollment);

export default router;