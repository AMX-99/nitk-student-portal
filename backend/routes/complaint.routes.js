import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  addComment,
  getComments
} from '../controllers/complaint.controller.js';

const router = Router();
router.use(verifyJWT);
router.post(
  '/',
  checkRole('student'),
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['academic', 'administrative', 'facility', 'other'])
  ]),
  createComplaint
);
router.get('/me', checkRole('student'), getMyComplaints);
router.get('/', checkRole('admin'), getAllComplaints);
router.patch('/:id', checkRole('admin'), updateComplaintStatus);
router.delete('/:id', checkRole('admin'), deleteComplaint);
router.get('/:id', getComplaintById);
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

export default router;