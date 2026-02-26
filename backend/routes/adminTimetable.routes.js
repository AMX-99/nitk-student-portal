import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as validators from '../validators/admin.validators.js';
import * as controller from '../controllers/adminTimetable.controller.js';

const router = Router();

router.get('/', validate(validators.validateListTimetable), controller.listTimetableSlots);
router.post('/', validate(validators.validateCreateTimetableSlot), controller.createTimetableSlot);
router.get('/:id', validate(validators.validateDeleteTimetableSlot), controller.getTimetableSlot);
router.put('/:id', validate(validators.validateUpdateTimetableSlot), controller.updateTimetableSlot);
router.delete('/:id', validate(validators.validateDeleteTimetableSlot), controller.deleteTimetableSlot);

export default router;