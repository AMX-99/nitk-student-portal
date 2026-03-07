import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as validators from '../utils/validators.js';
import * as controller from '../controllers/adminExam.controller.js';

const router = Router();

router.get('/', validate(validators.validateListExams), controller.listExams);
router.post('/', validate(validators.validateCreateExam), controller.createExam);
router.get('/:id', validate(validators.validateDeleteExam), controller.getExam);
router.put('/:id', validate(validators.validateUpdateExam), controller.updateExam);
router.delete('/:id', validate(validators.validateDeleteExam), controller.deleteExam);

export default router;